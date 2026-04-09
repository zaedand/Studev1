<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Module;
use App\Models\AssignmentSubmission;
use App\Models\QuizAttempt;
use App\Models\UserProgress;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Tampilkan halaman pengaturan profil pengguna.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load(['classes', 'quizAttempts', 'assignmentSubmissions', 'progress']);

        $stats   = $this->buildStats($user);
        $badges  = $this->buildBadges($user, $stats);
        $title   = $this->getTitle($user->points ?? 0);

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
            'stats'           => $stats,
            'badges'          => $badges,
            'title'           => $title,
        ]);
    }

    /**
     * Perbarui informasi profil pengguna.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $rules = [
            'name'  => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'lowercase', 'email', 'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
        ];

        if ($user->role === 'student') {
            $rules['nim'] = [
                'nullable', 'string', 'max:20',
                Rule::unique(User::class)->ignore($user->id),
            ];
        }

        $validated = $request->validate($rules);

        $user->fill([
            'name'  => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($user->role === 'student' && isset($validated['nim'])) {
            $user->nim = $validated['nim'];
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('status', 'profile-updated');
    }

    /**
     * Kirim tautan verifikasi email.
     */
    public function sendVerification(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return back()->with('status', 'already-verified');
        }

        $user->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }

    // =========================================================
    // Metode Privat
    // =========================================================

    /**
     * Hitung statistik pengguna.
     */
    private function buildStats(User $user): array
    {
        if ($user->role !== 'student') {
            return [];
        }

        $totalModules     = Module::active()->count();
        $completedModules = $user->progress()
            ->where('progressable_type', \App\Models\Material::class)
            ->where('is_completed', true)
            ->count();

        $quizAttempts     = $user->quizAttempts()->orderBy('created_at')->get();
        $totalQuizzes     = $quizAttempts->count();
        $firstAttemptWins = $quizAttempts
            ->groupBy('quiz_id')
            ->filter(fn($group) => $group->first()->score !== null && $group->count() === 1)
            ->count();

        $submissions      = $user->assignmentSubmissions()->with('assignment')->get();
        $totalSubmissions = $submissions->count();
        $lateSubmissions  = $submissions->filter(fn($s) => $s->is_late)->count();
        $onTimeCount      = $totalSubmissions - $lateSubmissions;

        $topPoints        = User::students()->max('points') ?? 0;
        $isTopStudent     = $user->points > 0 && $user->points >= $topPoints;

        $rank             = User::students()
            ->where('points', '>', $user->points)
            ->count() + 1;

        return [
            'total_modules'      => $totalModules,
            'completed_modules'  => $completedModules,
            'total_quizzes'      => $totalQuizzes,
            'first_attempt_wins' => $firstAttemptWins,
            'total_submissions'  => $totalSubmissions,
            'late_submissions'   => $lateSubmissions,
            'on_time_count'      => $onTimeCount,
            'is_top_student'     => $isTopStudent,
            'rank'               => $rank,
            'points'             => $user->points ?? 0,
        ];
    }

    /**
     * Tentukan lencana yang diraih pengguna.
     */
    private function buildBadges(User $user, array $stats): array
    {
        if ($user->role !== 'student' || empty($stats)) {
            return [];
        }

        $badges = [];

        // 1. Penyelesaian semua modul
        if ($stats['total_modules'] > 0 && $stats['completed_modules'] >= $stats['total_modules']) {
            $badges[] = [
                'id'          => 'all_modules',
                'name'        => 'Penguasa Modul',
                'description' => 'Menyelesaikan seluruh modul yang tersedia',
                'icon'        => '🎓',
                'color'       => 'gold',
                'earned'      => true,
            ];
        }

        // 2. Lulus kuis dalam 1 percobaan (minimal 3 kuis)
        if ($stats['first_attempt_wins'] >= 3) {
            $badges[] = [
                'id'          => 'quiz_ace',
                'name'        => 'Juara Kuis',
                'description' => 'Lulus kuis dalam satu kali percobaan sebanyak 3 kali atau lebih',
                'icon'        => '⚡',
                'color'       => 'yellow',
                'earned'      => true,
            ];
        }

        // 3. Tidak pernah terlambat mengumpulkan (minimal 1 tugas)
        if ($stats['total_submissions'] >= 1 && $stats['late_submissions'] === 0) {
            $badges[] = [
                'id'          => 'always_on_time',
                'name'        => 'Tepat Waktu',
                'description' => 'Selalu mengumpulkan tugas sebelum batas waktu',
                'icon'        => '⏰',
                'color'       => 'green',
                'earned'      => true,
            ];
        }

        // 4. Poin tertinggi di kelas
        if ($stats['is_top_student']) {
            $badges[] = [
                'id'          => 'top_points',
                'name'        => 'Bintang Kelas',
                'description' => 'Meraih poin tertinggi di antara seluruh mahasiswa',
                'icon'        => '👑',
                'color'       => 'purple',
                'earned'      => true,
            ];
        }

        // 5. Mahasiswa aktif (pernah kumpulkan tugas DAN ikut kuis)
        if ($stats['total_submissions'] >= 1 && $stats['total_quizzes'] >= 1) {
            $badges[] = [
                'id'          => 'active_student',
                'name'        => 'Mahasiswa Aktif',
                'description' => 'Aktif mengerjakan tugas dan kuis',
                'icon'        => '🔥',
                'color'       => 'orange',
                'earned'      => true,
            ];
        }

        // 6. Setengah modul selesai
        if (
            $stats['total_modules'] > 0
            && $stats['completed_modules'] >= ceil($stats['total_modules'] / 2)
            && $stats['completed_modules'] < $stats['total_modules']
        ) {
            $badges[] = [
                'id'          => 'halfway',
                'name'        => 'Setengah Jalan',
                'description' => 'Menyelesaikan lebih dari setengah modul',
                'icon'        => '🚀',
                'color'       => 'blue',
                'earned'      => true,
            ];
        }

        // 7. Pengumpulan perdana
        if ($stats['total_submissions'] >= 1) {
            $badges[] = [
                'id'          => 'first_submit',
                'name'        => 'Langkah Pertama',
                'description' => 'Berhasil mengumpulkan tugas untuk pertama kali',
                'icon'        => '📝',
                'color'       => 'teal',
                'earned'      => true,
            ];
        }

        // 8. Kuis perdana
        if ($stats['total_quizzes'] >= 1) {
            $badges[] = [
                'id'          => 'first_quiz',
                'name'        => 'Pencoba Kuis',
                'description' => 'Mengikuti kuis untuk pertama kali',
                'icon'        => '🧠',
                'color'       => 'indigo',
                'earned'      => true,
            ];
        }

        return $badges;
    }

    /**
     * Tentukan gelar berdasarkan poin pengguna.
     */
    private function getTitle(int $points): array
    {
        return match (true) {
            $points >= 2000 => ['label' => 'Mahaguru', 'color' => 'gold',   'icon' => '🏆'],
            $points >= 1000 => ['label' => 'Ahli',     'color' => 'purple', 'icon' => '💎'],
            $points >= 500  => ['label' => 'Mahir',    'color' => 'blue',   'icon' => '⭐'],
            $points >= 200  => ['label' => 'Terampil', 'color' => 'green',  'icon' => '🌱'],
            $points >= 50   => ['label' => 'Pemula',   'color' => 'gray',   'icon' => '🔰'],
            default         => ['label' => 'Baru',     'color' => 'slate',  'icon' => '🌟'],
        };
    }
}
