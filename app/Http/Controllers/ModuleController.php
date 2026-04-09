<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Module;
use App\Models\Material;
use App\Models\Enrichment;
use App\Models\Quiz;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AssignmentClassDeadline;
use App\Models\UserProgress;
use App\Models\QuizAttempt;
use App\Models\ModuleCpmk;
use App\Models\UserCpmk;
use App\Models\ModuleLearningObjective;
use App\Models\UserLearningObjective;
use App\Services\ProgressService;
use App\Models\UserEnrichment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ModuleController extends Controller
{
    protected $progressService;

    public function __construct(ProgressService $progressService)
    {
        $this->progressService = $progressService;
    }

    public function show(Module $module)
    {
        $user = Auth::user();

        // Muat semua relasi yang diperlukan sekaligus
        $module->load([
            'materials',
            'enrichments',
            'quizzes.questions',
            'assignments.classDeadlines',
            'assignments.submissions',
        ]);

        // Hitung progres user pada modul ini menggunakan ProgressService
        $moduleProgress = $this->progressService->getModuleProgress($user, $module);

        // ── Data Modul ────────────────────────────────────────────────────────
        $moduleData = [
            'id'               => $module->id,
            'title'            => $module->title,
            'description'      => $module->description,
            'color'            => $this->getModuleColor($module->order_number),
            'progress'         => $moduleProgress['percentage'],
            'totalLessons'     => $moduleProgress['total'],
            'completedLessons' => $moduleProgress['completed'],
            'estimatedTime'    => $this->getEstimatedTime($module->order_number),
            'difficulty'       => $this->getDifficulty($module->order_number),
            'prerequisites'    => $this->getPrerequisites($module->order_number),
        ];

        $moduleId = $module->id;

        // ── Pengayaan: video & link dari database ─────────────────────────────
        $enrichmentVideos = Enrichment::where('module_id', $moduleId)
            ->where('type', 'video')
            ->where('is_active', 1)
            ->orderBy('order_number')
            ->get();

        $enrichmentLinks = Enrichment::where('module_id', $moduleId)
            ->where('type', 'link')
            ->where('is_active', 1)
            ->orderBy('order_number')
            ->get();

        // Progres pengayaan user (model UserEnrichment khusus untuk video & link)
        $userEnrichment = UserEnrichment::where('user_id', $user->id)
            ->where('module_id', $moduleId)
            ->first();

        $watchedVideosRaw  = [];
        $completedLinksRaw = [];

        if ($userEnrichment) {
            $watchedVideosData = is_string($userEnrichment->watched_videos)
                ? json_decode($userEnrichment->watched_videos, true)
                : ($userEnrichment->watched_videos ?? []);

            $completedLinksData = is_string($userEnrichment->completed_links)
                ? json_decode($userEnrichment->completed_links, true)
                : ($userEnrichment->completed_links ?? []);

            foreach ((array) $watchedVideosData as $video) {
                if (is_array($video) && isset($video['id'])) {
                    $watchedVideosRaw[] = $video['id'];
                } elseif (is_numeric($video)) {
                    $watchedVideosRaw[] = (int) $video;
                }
            }

            foreach ((array) $completedLinksData as $link) {
                if (is_array($link) && isset($link['id'])) {
                    $completedLinksRaw[] = $link['id'];
                } elseif (is_numeric($link)) {
                    $completedLinksRaw[] = (int) $link;
                }
            }
        }

        $watchedVideos  = array_values(array_unique($watchedVideosRaw));
        $completedLinks = array_values(array_unique($completedLinksRaw));

        $completedEnrichmentIds = array_merge($watchedVideos, $completedLinks);
        $totalPossiblePoints    = Enrichment::where('module_id', $moduleId)
            ->where('is_active', 1)
            ->sum('point_reward');

        $allCompleted = $userEnrichment?->completed ?? false;

        // ── Konten Modul ──────────────────────────────────────────────────────
        $moduleContent = [
            'cp'      => $this->buildCPContent($module, $user),
            'atp'     => $this->buildATPContent($module, $user),
            'materi'  => $this->buildMaterialContent($module, $user),
            'quiz'    => $this->buildQuizContent($module, $user),
            'praktikum' => $this->buildAssignmentContent($module, $user),
            'pengayaan' => [
                'id'          => $moduleId,
                'title'       => 'Materi Pengayaan',
                'description' => 'Video dan tautan tambahan untuk memperdalam pemahaman',
                'points'      => $totalPossiblePoints,
                'totalPoints' => $totalPossiblePoints,
                'completed'   => $allCompleted,
                'videos'      => $enrichmentVideos->map(function ($video) use ($watchedVideos) {
                    return [
                        'id'        => $video->id,
                        'title'     => $video->title,
                        'platform'  => $this->extractPlatform($video->url),
                        'duration'  => $video->duration ?? 'N/A',
                        'url'       => $video->url,
                        'thumbnail' => $this->getYoutubeThumbnail($video->url),
                        'watched'   => in_array($video->id, $watchedVideos),
                    ];
                }),
                'links' => $enrichmentLinks->map(function ($link) use ($completedLinks) {
                    return [
                        'id'          => $link->id,
                        'title'       => $link->title,
                        'url'         => $link->url,
                        'type'        => $this->getLinkType($link->url),
                        'description' => $link->description,
                        'completed'   => in_array($link->id, $completedLinks),
                    ];
                }),
            ],
        ];

        return Inertia::render('module/detail', [
            'moduleData'    => $moduleData,
            'moduleContent' => $moduleContent,
            'breadcrumbs'   => [
                ['title' => 'Dasbor',              'href' => '/dashboard'],
                ['title' => 'Modul Pembelajaran',  'href' => '/dashboard'],
                ['title' => $module->title,        'href' => "/module/{$module->id}"],
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Preview Materi
    // ─────────────────────────────────────────────────────────────────────────

    public function preview($id)
    {
        $material = Material::findOrFail($id);

        // Coba dari Storage disk 'public' terlebih dahulu (path relatif)
        $disk = Storage::disk('public');
        if ($material->file_path && $disk->exists($material->file_path)) {
            return response()->file($disk->path($material->file_path), [
                'Content-Type' => 'application/pdf',
            ]);
        }

        // Fallback ke path absolut (legacy)
        $absolutePath = storage_path('app/public/' . ltrim($material->file_path, '/'));
        if (file_exists($absolutePath)) {
            return response()->file($absolutePath, ['Content-Type' => 'application/pdf']);
        }

        abort(404, 'File materi tidak ditemukan.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CP — Capaian Pembelajaran (ModuleCpmk)
    //
    // Perubahan: jika belum ada CPMK di database, tidak lagi membuat data dummy.
    // Kini hanya menampilkan array kosong — dosen harus mengisi via manajemen modul.
    // ─────────────────────────────────────────────────────────────────────────

    private function buildCPContent($module, $user): array
    {
        $moduleCpmk = ModuleCpmk::where('module_id', $module->id)->first();

        // Tidak buat data dummy — kembalikan struktur kosong jika belum ada
        if (!$moduleCpmk) {
            return [
                'id'          => null,
                'title'       => 'Capaian Pembelajaran Mata Kuliah (CPMK)',
                'description' => 'Dosen belum mengisi data CPMK untuk modul ini.',
                'points'      => 0,
                'completed'   => false,
                'content'     => [],
            ];
        }

        $userCpmk = UserCpmk::where('user_id', $user->id)
            ->where('module_cpmk_id', $moduleCpmk->id)
            ->first();

        return [
            'id'          => $moduleCpmk->id,
            'title'       => 'Capaian Pembelajaran Mata Kuliah (CPMK)',
            'description' => 'Tujuan pembelajaran yang akan dicapai dalam modul ini',
            'points'      => $moduleCpmk->point_reward,
            'completed'   => $userCpmk?->is_completed ?? false,
            'content'     => is_array($moduleCpmk->content)
                ? $moduleCpmk->content
                : (json_decode($moduleCpmk->content, true) ?? []),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ATP — Alur Tujuan Pembelajaran (ModuleLearningObjective)
    //
    // Perubahan: sama dengan CP — tidak membuat dummy, tampilkan kosong.
    // ─────────────────────────────────────────────────────────────────────────

    private function buildATPContent($module, $user): array
    {
        $learningObjective = ModuleLearningObjective::where('module_id', $module->id)->first();

        if (!$learningObjective) {
            return [
                'id'          => null,
                'title'       => 'Alur Tujuan Pembelajaran (ATP)',
                'description' => 'Dosen belum mengisi data ATP untuk modul ini.',
                'points'      => 0,
                'completed'   => false,
                'content'     => [],
            ];
        }

        $userLearningObj = UserLearningObjective::where('user_id', $user->id)
            ->where('module_learning_objective_id', $learningObjective->id)
            ->first();

        return [
            'id'          => $learningObjective->id,
            'title'       => 'Alur Tujuan Pembelajaran (ATP)',
            'description' => 'Langkah-langkah pembelajaran yang harus ditempuh secara sistematis',
            'points'      => $learningObjective->point_reward,
            'completed'   => $userLearningObj?->is_completed ?? false,
            'content'     => is_array($learningObjective->content)
                ? $learningObjective->content
                : (json_decode($learningObjective->content, true) ?? []),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Materi PDF
    //
    // Perubahan:
    // - getFileSize() sekarang membaca ukuran file nyata dari Storage
    // - readProgress diambil dari kolom di user_progresses (jika ada)
    // ─────────────────────────────────────────────────────────────────────────

    private function buildMaterialContent($module, $user): array
    {
        $materials = $module->materials;

        if ($materials->isEmpty()) {
            return [
                'title'        => 'Materi PDF',
                'description'  => 'Bahan bacaan utama dalam format PDF',
                'points'       => 50,
                'completed'    => false,
                'fileName'     => '',
                'fileSize'     => '0 MB',
                'readProgress' => 0,
                'canDownload'  => false,
                'file_path'    => '',
                'material_id'  => 0,
            ];
        }

        $material = $materials->first();

        $progress = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Material::class)
            ->where('progressable_id', $material->id)
            ->first();

        $isCompleted  = $progress?->is_completed ?? false;

        // Baca readProgress dari database (kolom progress atau 0/100 sesuai selesai)
        // Jika model UserProgress punya kolom 'read_progress', gunakan itu.
        // Jika tidak, gunakan 0 atau 100 berdasarkan is_completed.
        $readProgress = 0;
        if ($progress) {
            $readProgress = isset($progress->read_progress)
                ? (int) $progress->read_progress
                : ($isCompleted ? 100 : 0);
        }

        return [
            'title'        => 'Materi PDF',
            'description'  => 'Bahan bacaan utama dalam format PDF',
            'points'       => $material->point_reward,
            'completed'    => $isCompleted,
            'fileName'     => basename($material->file_path),
            'fileSize'     => $this->getFileSize($material->file_path),   // ← nyata dari Storage
            'readProgress' => $readProgress,
            'canDownload'  => $isCompleted,
            'material_id'  => $material->id,
            'file_path'    => $material->file_path,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Kuis
    //
    // Perubahan:
    // - Ambil kuis aktif (is_active = true), bukan sekadar first()
    // - timeLimit dan maxAttempts dibaca dari kolom database jika ada
    // ─────────────────────────────────────────────────────────────────────────

    private function buildQuizContent($module, $user): array
    {
        // Ambil kuis yang aktif untuk modul ini
        $quiz = $module->quizzes->where('is_active', true)->first()
            ?? $module->quizzes->first();    // fallback ke first jika belum ada yang aktif

        if (!$quiz) {
            return [
                'title'          => 'Kuis',
                'description'    => 'Kerjakan soal untuk menguji pemahaman',
                'points'         => 100,
                'completed'      => false,
                'totalQuestions' => 0,
                'timeLimit'      => 30,
                'attempts'       => 0,
                'maxAttempts'    => 3,
                'bestScore'      => null,
                'available'      => false,
            ];
        }

        $attempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->get();

        $bestRaw        = $attempts->max('score');
        $totalQuestions = $quiz->total_questions ?? $quiz->questions->count();

        // Hitung skor terbaik dalam skala 0–100
        $bestScore = null;
        if ($bestRaw !== null && $totalQuestions > 0) {
            $bestScore = round(($bestRaw / $totalQuestions) * 100);
        }

        return [
            'title'          => 'Kuis',
            'description'    => $quiz->description ?: 'Kerjakan soal untuk menguji pemahaman',
            'points'         => $totalQuestions * ($quiz->point_per_question ?? 10),
            'completed'      => $attempts->count() > 0,
            'totalQuestions' => $totalQuestions,
            'timeLimit'      => $quiz->time_limit   ?? 30,    // ← dari DB jika ada
            'attempts'       => $attempts->count(),
            'maxAttempts'    => $quiz->max_attempts ?? 3,      // ← dari DB jika ada
            'bestScore'      => $bestScore,
            'available'      => $quiz->is_active ?? false,
            'quiz_id'        => $quiz->id,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Praktikum (Assignment)
    //
    // Perubahan UTAMA:
    // - Kolom `tasks` dibaca langsung dari database (JSON cast di model Assignment)
    //   TIDAK lagi menggunakan getAssignmentTasks() yang hardcoded
    // - Submission mahasiswa dibaca dari tabel assignment_submissions
    // - Deadline per kelas dibaca dari tabel assignment_class_deadlines
    // - Semua field yang dibutuhkan PraktikumSection dikirim lengkap
    // ─────────────────────────────────────────────────────────────────────────

    private function buildAssignmentContent(Module $module, User $user): array
    {
        // Ambil praktikum yang aktif untuk modul ini
        $assignment = $module->assignments->where('is_active', true)->first()
            ?? $module->assignments->first();   // fallback ke first jika belum ada yang aktif

        if (!$assignment) {
            return [
                'title'               => 'Praktikum',
                'description'         => 'Tugas praktikum untuk modul ini belum tersedia.',
                'tasks'               => [],
                'deadline'            => now()->addDays(14)->toISOString(),
                'deadline_formatted'  => now()->addDays(14)->format('d M Y H:i'),
                'has_custom_deadline' => false,
                'submitted'           => false,
                'submissionFile'      => null,
                'submission'          => null,
                'completed'           => false,
                'points'              => 0,
                'assignment_id'       => 0,
            ];
        }

        // ── Deadline: prioritaskan deadline kelas mahasiswa ────────────────
        $deadline            = $assignment->getDeadlineForStudent($user->id);
        $userClass           = $user->classes()->first();
        $hasCustomDeadline   = false;

        if ($userClass) {
            $classDeadline = $assignment->classDeadlines
                ->where('class_id', $userClass->id)
                ->first();

            if ($classDeadline) {
                $deadline          = $classDeadline->deadline;
                $hasCustomDeadline = true;
            }
        }

        // Fallback deadline jika null
        if (!$deadline) {
            $deadline = now()->addDays(14);
        }

        // ── Pengumpulan mahasiswa ──────────────────────────────────────────
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        $submitted = $submission !== null;

        // ── Progres mahasiswa ─────────────────────────────────────────────
        $progress  = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Assignment::class)
            ->where('progressable_id', $assignment->id)
            ->first();

        $completed = $progress?->is_completed ?? false;

        // ── Format data submission ─────────────────────────────────────────
        $submissionData = null;
        if ($submission) {
            $submissionData = [
                'id'                   => $submission->id,
                'file_name'            => $submission->file_name
                    ?? basename($submission->file_path ?? ''),
                'submitted_at'         => $submission->submitted_at
                    ? $submission->submitted_at->format('d M Y H:i')
                    : '-',
                'status'               => $submission->status ?? 'submitted',
                'points_earned'        => $submission->points_earned ?? 0,
                'score'                => $submission->score,
                'feedback'             => $submission->feedback,
                'is_graded'            => $submission->is_graded,
                'submission_time_info' => $this->getSubmissionTimeInfo($submission, $deadline),
            ];
        }

        // ── Kolom `tasks` — dibaca dari database (JSON cast di model) ──────
        //
        // Model Assignment sudah memiliki cast:
        //   'tasks' => 'array'
        //
        // Sehingga $assignment->tasks langsung berupa PHP array.
        // Tidak perlu json_decode() manual; tidak menggunakan data hardcoded.
        //
        $tasks = $assignment->tasks ?? [];
        if (!is_array($tasks)) {
            // Failsafe jika cast belum berjalan (misal belum migrasi kolom)
            $tasks = is_string($tasks) ? (json_decode($tasks, true) ?? []) : [];
        }

        // ── Poin: gunakan point_reward_ontime sebagai nilai acuan ──────────
        $points = $assignment->point_reward_ontime
            ?? $assignment->point_reward_early
            ?? $assignment->point_reward_late
            ?? 50;

        return [
            'title'               => $assignment->title,
            'description'         => $assignment->description ?? '',
            'tasks'               => $tasks,               // ← dari kolom JSON di database
            'deadline'            => $deadline->toISOString(),
            'deadline_formatted'  => $deadline->format('d M Y H:i'),
            'has_custom_deadline' => $hasCustomDeadline,
            'submitted'           => $submitted,
            'submissionFile'      => $submission?->file_path,
            'submission'          => $submissionData,
            'completed'           => $completed,
            'points'              => $points,
            'assignment_id'       => $assignment->id,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Info Waktu Pengumpulan
    // ─────────────────────────────────────────────────────────────────────────

    private function getSubmissionTimeInfo(AssignmentSubmission $submission, $deadline): array
    {
        $submittedAt   = $submission->submitted_at;
        $days          = abs((int) $submittedAt->diffInDays($deadline, false));
        $earlyDeadline = $deadline->copy()->subDays(2);

        if ($submittedAt->isAfter($deadline)) {
            return ['status' => 'late',   'message' => "Terlambat {$days} hari",          'color' => 'red'];
        }
        if ($submittedAt->lte($earlyDeadline)) {
            return ['status' => 'early',  'message' => "{$days} hari lebih awal",           'color' => 'green'];
        }
        if ($days > 0) {
            return ['status' => 'ontime', 'message' => "{$days} hari sebelum batas waktu",  'color' => 'blue'];
        }
        return ['status' => 'ontime', 'message' => 'Tepat waktu', 'color' => 'blue'];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Warna Modul (tetap seperti asli)
    // ─────────────────────────────────────────────────────────────────────────

    private function getModuleColor($orderNumber): string
    {
        $colors = [
            1 => 'bg-blue-500',
            2 => 'bg-green-500',
            3 => 'bg-purple-500',
            4 => 'bg-orange-500',
            5 => 'bg-red-500',
            6 => 'bg-indigo-500',
            7 => 'bg-teal-500',
            8 => 'bg-yellow-500',
        ];
        return $colors[$orderNumber] ?? 'bg-gray-500';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Estimasi Waktu (tetap seperti asli)
    // ─────────────────────────────────────────────────────────────────────────

    private function getEstimatedTime($orderNumber): string
    {
        $times = [
            1 => '3–4 jam',
            2 => '4–6 jam',
            3 => '5–7 jam',
            4 => '4–5 jam',
            5 => '6–8 jam',
            6 => '8–10 jam',
            7 => '3–4 jam',
            8 => '10–15 jam',
        ];
        return $times[$orderNumber] ?? '2–3 jam';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Tingkat Kesulitan (tetap seperti asli)
    // ─────────────────────────────────────────────────────────────────────────

    private function getDifficulty($orderNumber): string
    {
        $difficulties = [
            1 => 'Pemula',
            2 => 'Menengah',
            3 => 'Menengah',
            4 => 'Menengah',
            5 => 'Lanjutan',
            6 => 'Lanjutan',
            7 => 'Menengah',
            8 => 'Ahli',
        ];
        return $difficulties[$orderNumber] ?? 'Pemula';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Prasyarat (tetap seperti asli)
    // ─────────────────────────────────────────────────────────────────────────

    private function getPrerequisites($orderNumber): array
    {
        $prerequisites = [
            1 => [],
            2 => ['Pengenalan Pemrograman'],
            3 => ['Pengenalan Pemrograman', 'Variabel & Tipe Data'],
            4 => ['Struktur Kontrol', 'Perulangan'],
            5 => ['Array', 'Fungsi'],
            6 => ['Pointer', 'Array'],
            7 => ['Struktur Data', 'Array'],
            8 => ['Pengelolaan File', 'Struktur Data', 'Pointer'],
        ];
        return $prerequisites[$orderNumber] ?? [];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Platform Video
    // ─────────────────────────────────────────────────────────────────────────

    private function extractPlatform($url): string
    {
        if (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false) {
            return 'YouTube';
        }
        return 'Video';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Thumbnail YouTube
    // ─────────────────────────────────────────────────────────────────────────

    private function getYoutubeThumbnail($url): string
    {
        if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/', $url, $matches)) {
            return "https://img.youtube.com/vi/{$matches[1]}/mqdefault.jpg";
        }
        return 'https://via.placeholder.com/320x240?text=Video';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Tipe Tautan Berdasarkan Domain
    // ─────────────────────────────────────────────────────────────────────────

    private function getLinkType($url): string
    {
        $domain = parse_url($url, PHP_URL_HOST) ?? '';
        if (str_contains($domain, 'geeksforgeeks'))       return 'Tutorial';
        if (str_contains($domain, 'programiz'))           return 'Tutorial';
        if (str_contains($domain, 'developer.mozilla'))   return 'Dokumentasi';
        if (str_contains($domain, 'tutorialspoint'))      return 'Tutorial';
        if (str_contains($domain, 'cplusplus'))           return 'Dokumentasi';
        return 'Artikel';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pembantu: Ukuran File — membaca dari Storage (bukan dummy)
    //
    // Perubahan: sebelumnya mengembalikan '2.4 MB' hardcoded.
    // Sekarang membaca ukuran nyata dari Storage::disk('public').
    // ─────────────────────────────────────────────────────────────────────────

    private function getFileSize(?string $filePath): string
    {
        if (!$filePath) return '0 KB';

        try {
            $disk = Storage::disk('public');
            if ($disk->exists($filePath)) {
                $bytes = $disk->size($filePath);
                if ($bytes >= 1_048_576) return number_format($bytes / 1_048_576, 1) . ' MB';
                if ($bytes >= 1_024)     return number_format($bytes / 1_024, 1) . ' KB';
                return $bytes . ' byte';
            }
        } catch (\Exception $e) {
            // Jika file tidak ditemukan, kembalikan placeholder
        }

        return '– MB';
    }
}
