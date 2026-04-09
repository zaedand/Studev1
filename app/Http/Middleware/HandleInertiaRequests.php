<?php

namespace App\Http\Middleware;

use App\Models\Module;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * Berkas root template yang dimuat pada kunjungan pertama halaman.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Tentukan versi aset saat ini.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Tentukan props bersama yang tersedia di semua komponen Inertia.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Hitung data mahasiswa hanya sekali per request, hanya jika sudah login
        $studentData = ($user && $user->role === 'student')
            ? $this->buildStudentData($user)
            : null;

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    // Pastikan point_fire tersedia di frontend
                    'point_fire' => $user->points ?? 0,
                ]) : null,
            ],

            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],

            // ── Data mahasiswa (stats, badges, title) ────────────────
            // Selalu tersedia di SEMUA halaman (profil, kata sandi, tampilan, dll.)
            'stats'  => $studentData['stats']  ?? null,
            'badges' => $studentData['badges'] ?? null,
            'title'  => $studentData['title']  ?? null,
        ];
    }

    // =========================================================
    // Metode privat
    // =========================================================

    /**
     * Bangun seluruh data statistik, lencana, dan gelar mahasiswa.
     */
    private function buildStudentData(User $user): array
    {
        $stats  = $this->buildStats($user);
        $badges = $this->buildBadges($user, $stats);
        $title  = $this->getTitle($user->points ?? 0);

        return compact('stats', 'badges', 'title');
    }

    /**
     * Hitung statistik mahasiswa.
     *
     * completedModules menggunakan logika yang SAMA dengan DashboardController:
     * modul dianggap selesai apabila progress-nya mencapai 100% dari semua
     * komponen (CPMK, ATP, material, pengayaan, kuis, tugas).
     */
    private function buildStats(User $user): array
    {
        $userId = $user->id;

        // ── Total & modul selesai ────────────────────────────────────────
        // PENTING: Gunakan Module::orderBy() TANPA filter active(),
        // sama persis dengan DashboardController::getUserStats() dan
        // LeaderboardController yang menggunakan Module::count() / Module::all().
        $allModules   = Module::orderBy('order_number')->get();
        $totalModules = $allModules->count();

        $completedModules = $allModules->filter(function ($module) use ($userId) {
            $progress = $this->calculateModuleProgress($userId, $module->id);
            return $progress['percentage'] >= 100;
        })->count();

        // ── Kuis ────────────────────────────────────────────────────────
        $quizAttempts     = $user->quizAttempts()->orderBy('created_at')->get();
        $totalQuizzes     = $quizAttempts->count();
        $firstAttemptWins = $quizAttempts
            ->groupBy('quiz_id')
            ->filter(fn ($g) => $g->count() === 1 && $g->first()->score !== null)
            ->count();

        // ── Tugas ────────────────────────────────────────────────────────
        $submissions      = $user->assignmentSubmissions()->with('assignment')->get();
        $totalSubmissions = $submissions->count();
        $lateSubmissions  = $submissions->filter(fn ($s) => $s->is_late)->count();
        $onTimeCount      = $totalSubmissions - $lateSubmissions;

        // ── Peringkat ────────────────────────────────────────────────────
        $topPoints    = User::students()->max('points') ?? 0;
        $isTopStudent = $user->points > 0 && $user->points >= $topPoints;
        $rank         = User::students()->where('points', '>', $user->points)->count() + 1;

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
     * Hitung progress satu modul untuk satu pengguna.
     * Logika identik dengan DashboardController::calculateModuleProgress().
     */
    private function calculateModuleProgress(int $userId, int $moduleId): array
    {
        $total     = 0;
        $completed = 0;

        // 1. CPMK
        $cpmkIds = DB::table('module_cpmks')->where('module_id', $moduleId)->pluck('id');
        if ($cpmkIds->isNotEmpty()) {
            $total     += $cpmkIds->count();
            $completed += DB::table('user_cpmks')
                ->where('user_id', $userId)
                ->where('module_id', $moduleId)
                ->where('is_completed', true)
                ->count();
        }

        // 2. Tujuan pembelajaran (ATP)
        $atpIds = DB::table('module_learning_objectives')->where('module_id', $moduleId)->pluck('id');
        if ($atpIds->isNotEmpty()) {
            $total     += $atpIds->count();
            $completed += DB::table('user_learning_objectives')
                ->where('user_id', $userId)
                ->where('module_id', $moduleId)
                ->where('is_completed', true)
                ->count();
        }

        // 3. Materi
        $materialIds = DB::table('materials')->where('module_id', $moduleId)->pluck('id');
        if ($materialIds->isNotEmpty()) {
            $total     += $materialIds->count();
            $completed += DB::table('user_progress')
                ->where('user_id', $userId)
                ->where('progressable_type', 'App\\Models\\Material')
                ->where('is_completed', true)
                ->whereIn('progressable_id', $materialIds)
                ->count();
        }

        // 4. Pengayaan
        $enrichmentIds = DB::table('enrichments')
            ->where('module_id', $moduleId)
            ->where('is_active', 1)
            ->pluck('id');
        if ($enrichmentIds->isNotEmpty()) {
            $total     += $enrichmentIds->count();
            $completed += DB::table('user_progress')
                ->where('user_id', $userId)
                ->where('progressable_type', 'App\\Models\\Enrichment')
                ->where('is_completed', true)
                ->whereIn('progressable_id', $enrichmentIds)
                ->count();
        }

        // 5. Kuis
        $quizIds = DB::table('quizzes')->where('module_id', $moduleId)->pluck('id');
        if ($quizIds->isNotEmpty()) {
            $total     += $quizIds->count();
            $completed += DB::table('quiz_attempts')
                ->where('user_id', $userId)
                ->whereNotNull('completed_at')
                ->whereIn('quiz_id', $quizIds)
                ->distinct('quiz_id')
                ->count();
        }

        // 6. Tugas
        $assignmentIds = DB::table('assignments')->where('module_id', $moduleId)->pluck('id');
        if ($assignmentIds->isNotEmpty()) {
            $total     += $assignmentIds->count();
            $completed += DB::table('assignment_submissions')
                ->where('user_id', $userId)
                ->whereNotNull('submitted_at')
                ->whereIn('assignment_id', $assignmentIds)
                ->count();
        }

        $percentage = $total > 0 ? round(($completed / $total) * 100) : 0;

        return [
            'percentage' => $percentage,
            'completed'  => $completed,
            'total'      => $total,
        ];
    }

    /**
     * Tentukan lencana yang diraih mahasiswa.
     */
    private function buildBadges(User $user, array $stats): array
    {
        $badges = [];

        // 1. Semua modul selesai
        if ($stats['total_modules'] > 0 && $stats['completed_modules'] >= $stats['total_modules']) {
            $badges[] = [
                'id'          => 'all_modules',
                'name'        => 'Penguasa Modul',
                'description' => 'Menyelesaikan seluruh modul yang tersedia',
                'icon'        => '🎓',
                'color'       => 'gold',
            ];
        }

        // 2. Lulus kuis 1 percobaan (minimal 3 kuis)
        if ($stats['first_attempt_wins'] >= 3) {
            $badges[] = [
                'id'          => 'quiz_ace',
                'name'        => 'Juara Kuis',
                'description' => 'Lulus kuis dalam satu percobaan sebanyak 3 kali atau lebih',
                'icon'        => '⚡',
                'color'       => 'yellow',
            ];
        }

        // 3. Tidak pernah terlambat (minimal 1 tugas)
        if ($stats['total_submissions'] >= 1 && $stats['late_submissions'] === 0) {
            $badges[] = [
                'id'          => 'always_on_time',
                'name'        => 'Tepat Waktu',
                'description' => 'Selalu mengumpulkan tugas sebelum batas waktu',
                'icon'        => '⏰',
                'color'       => 'green',
            ];
        }

        // 4. Poin tertinggi
        if ($stats['is_top_student']) {
            $badges[] = [
                'id'          => 'top_points',
                'name'        => 'Bintang Kelas',
                'description' => 'Meraih poin tertinggi di antara seluruh mahasiswa',
                'icon'        => '👑',
                'color'       => 'purple',
            ];
        }

        // 5. Mahasiswa aktif
        if ($stats['total_submissions'] >= 1 && $stats['total_quizzes'] >= 1) {
            $badges[] = [
                'id'          => 'active_student',
                'name'        => 'Mahasiswa Aktif',
                'description' => 'Aktif mengerjakan tugas dan kuis',
                'icon'        => '🔥',
                'color'       => 'orange',
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
            ];
        }

        return $badges;
    }

    /**
     * Tentukan gelar berdasarkan jumlah poin.
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
