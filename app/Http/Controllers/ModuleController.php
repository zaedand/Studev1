<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Material;
use App\Models\Enrichment;
use App\Models\Quiz;
use App\Models\Assignment;
use App\Models\UserProgress;
use App\Models\QuizAttempt;
use App\Models\AssignmentSubmission;
use App\Models\ModuleCpmk;
use App\Models\UserCpmk;
use App\Models\ModuleLearningObjective;
use App\Models\UserLearningObjective;

use App\Services\ProgressService;
use App\Models\UserEnrichment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

    // Load all related data
    $module->load([
        'materials',
        'enrichments',
        'quizzes.questions',
        'assignments'
    ]);

    // Hitung progres user pada modul ini
    $moduleProgress = $this->progressService->getModuleProgress($user, $module);

    // Bangun data dasar modul
    $moduleData = [
        'id' => $module->id,
        'title' => $module->title,
        'description' => $module->description,
        'color' => $this->getModuleColor($module->order_number),
        'progress' => $moduleProgress['percentage'],
        'totalLessons' => $moduleProgress['total'],
        'completedLessons' => $moduleProgress['completed'],
        'estimatedTime' => $this->getEstimatedTime($module->order_number),
        'difficulty' => $this->getDifficulty($module->order_number),
        'prerequisites' => $this->getPrerequisites($module->order_number),
    ];

    // Ambil ID modul
    $moduleId = $module->id;

    // Ambil daftar pengayaan (video & link)
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

    // Ambil progres pengayaan user
    $userEnrichment = UserEnrichment::where('user_id', $user->id)
        ->where('module_id', $moduleId)
        ->first();

    // ✅ PERBAIKAN: Pastikan selalu berupa array dan extract ID saja
    $watchedVideosRaw = [];
    $completedLinksRaw = [];

    if ($userEnrichment) {
        // Decode jika string JSON
        $watchedVideosData = is_string($userEnrichment->watched_videos)
            ? json_decode($userEnrichment->watched_videos, true)
            : ($userEnrichment->watched_videos ?? []);

        $completedLinksData = is_string($userEnrichment->completed_links)
            ? json_decode($userEnrichment->completed_links, true)
            : ($userEnrichment->completed_links ?? []);

        // Extract ID saja (support format lama & baru)
        foreach ($watchedVideosData as $video) {
            if (is_array($video) && isset($video['id'])) {
                $watchedVideosRaw[] = $video['id'];
            } elseif (is_numeric($video)) {
                $watchedVideosRaw[] = (int)$video;
            }
        }

        foreach ($completedLinksData as $link) {
            if (is_array($link) && isset($link['id'])) {
                $completedLinksRaw[] = $link['id'];
            } elseif (is_numeric($link)) {
                $completedLinksRaw[] = (int)$link;
            }
        }
    }

    // ✅ Sekarang hanya berisi ID integer
    $watchedVideos = array_values(array_unique($watchedVideosRaw));
    $completedLinks = array_values(array_unique($completedLinksRaw));

    // ✅ Hitung poin yang didapat (sekarang aman menggunakan whereIn)
    $completedEnrichmentIds = array_merge($watchedVideos, $completedLinks);

    $earnedPoints = 0;
    if (!empty($completedEnrichmentIds)) {
        $earnedPoints = Enrichment::whereIn('id', $completedEnrichmentIds)
            ->sum('point_reward');
    }

    // Total poin maksimum
    $totalPossiblePoints = Enrichment::where('module_id', $moduleId)
        ->where('is_active', 1)
        ->sum('point_reward');

    $allCompleted = $userEnrichment?->completed ?? false;

    // Bangun konten modul
    $moduleContent = [
        'cp' => $this->buildCPContent($module, $user),
        'atp' => $this->buildATPContent($module, $user),
        'materi' => $this->buildMaterialContent($module, $user),
        'quiz' => $this->buildQuizContent($module, $user),
        'praktikum' => $this->buildAssignmentContent($module, $user),
        'pengayaan' => [
            'id' => $moduleId,
            'title' => 'Materi Pengayaan',
            'description' => 'Video dan link tambahan untuk memperdalam pemahaman',
            'points' => $totalPossiblePoints,
            'totalPoints' => $totalPossiblePoints,
            'completed' => $allCompleted,
            'videos' => $enrichmentVideos->map(function ($video) use ($watchedVideos) {
                return [
                    'id' => $video->id,
                    'title' => $video->title,
                    'platform' => $this->extractPlatform($video->url),
                    'duration' => 'N/A',
                    'url' => $video->url,
                    'thumbnail' => $this->getYoutubeThumbnail($video->url),
                    'watched' => in_array($video->id, $watchedVideos),
                ];
            }),
            'links' => $enrichmentLinks->map(function ($link) use ($completedLinks) {
                return [
                    'id' => $link->id,
                    'title' => $link->title,
                    'url' => $link->url,
                    'type' => $this->getLinkType($link->url),
                    'description' => $link->description,
                    'completed' => in_array($link->id, $completedLinks),
                ];
            }),
        ],
    ];

    // Kirim ke Inertia
    return Inertia::render('module/detail', [
        'moduleData' => $moduleData,
        'moduleContent' => $moduleContent,
        'breadcrumbs' => [
            ['title' => 'Dashboard', 'href' => '/dashboard'],
            ['title' => 'Modul Pembelajaran', 'href' => '/dashboard'],
            ['title' => $module->title, 'href' => "/module/{$module->id}"],
        ],
    ]);
}
    private function extractPlatform($url)
    {
        if (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false) {
            return 'YouTube';
        }
        return 'Video';
    }

    private function getYoutubeThumbnail($url)
    {
        if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/', $url, $matches)) {
            $videoId = $matches[1];
            return "https://img.youtube.com/vi/{$videoId}/mqdefault.jpg";
        }
        return 'https://via.placeholder.com/320x240?text=Video';
    }

    private function getLinkType($url)
    {
        $domain = parse_url($url, PHP_URL_HOST);
        if (strpos($domain, 'geeksforgeeks') !== false) return 'Tutorial';
        if (strpos($domain, 'programiz') !== false) return 'Tutorial';
        if (strpos($domain, 'developer.mozilla.org') !== false) return 'Documentation';
        if (strpos($domain, 'tutorialspoint') !== false) return 'Tutorial';
        return 'Article';
    }


    private function buildCPContent($module, $user)
{
    // Cari CPMK untuk modul ini
    $moduleCpmk = ModuleCpmk::where('module_id', $module->id)->first();

    if (!$moduleCpmk) {
        // Jika belum ada, buat dari data hardcoded
        $content = $this->getCPContentByOrder($module->order_number);
        $moduleCpmk = ModuleCpmk::create([
            'module_id' => $module->id,
            'content' => $content,
            'point_reward' => 10,
        ]);
    }

    // Cek apakah user sudah menyelesaikan
    $userCpmk = UserCpmk::where('user_id', $user->id)
        ->where('module_cpmk_id', $moduleCpmk->id)
        ->first();

    return [
        'id' => $moduleCpmk->id,
        'title' => 'Capaian Pembelajaran Mata Kuliah (CPMK)',
        'description' => 'Tujuan pembelajaran yang akan dicapai dalam modul ini',
        'points' => $moduleCpmk->point_reward,
        'completed' => $userCpmk ? $userCpmk->is_completed : false,
        'content' => $moduleCpmk->content,
    ];
}

private function buildATPContent($module, $user)
{
    // Cari Tujuan Pembelajaran untuk modul ini
    $learningObjective = ModuleLearningObjective::where('module_id', $module->id)->first();

    if (!$learningObjective) {
        // Jika belum ada, buat dari data hardcoded
        $content = $this->getATPContentByOrder($module->order_number);
        $learningObjective = ModuleLearningObjective::create([
            'module_id' => $module->id,
            'content' => $content,
            'point_reward' => 10,
        ]);
    }

    // Cek apakah user sudah menyelesaikan
    $userLearningObj = UserLearningObjective::where('user_id', $user->id)
        ->where('module_learning_objective_id', $learningObjective->id)
        ->first();

    return [
        'id' => $learningObjective->id,
        'title' => 'Tujuan Pembelajaran',
        'description' => 'Langkah-langkah pembelajaran sistematis',
        'points' => $learningObjective->point_reward,
        'completed' => $userLearningObj ? $userLearningObj->is_completed : false,
        'content' => $learningObjective->content,
    ];
}

    private function buildMaterialContent($module, $user)
    {
        $materials = $module->materials;
        if ($materials->isEmpty()) {
            return [
                'title' => 'Materi PDF',
                'description' => 'Bahan bacaan utama dalam format PDF',
                'points' => 50,
                'completed' => false,
                'fileName' => '',
                'fileSize' => '0 MB',
                'readProgress' => 0,
                'canDownload' => false
            ];
        }

        $material = $materials->first(); // Get first material

        // Check if user has completed this material
        $progress = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Material::class)
            ->where('progressable_id', $material->id)
            ->first();

        return [
            'title' => 'Materi PDF',
            'description' => 'Bahan bacaan utama dalam format PDF',
            'points' => $material->point_reward,
            'completed' => $progress && $progress->is_completed,
            'fileName' => basename($material->file_path),
            'fileSize' => $this->getFileSize($material->file_path),
            'readProgress' => $progress ? 100 : 0,
            'canDownload' => $progress && $progress->is_completed,
            'material_id' => $material->id,
            'file_path' => $material->file_path
        ];
    }

    private function buildEnrichmentContent($module, $user)
    {
        $enrichments = $module->enrichments;

        $videos = [];
        $links = [];
        $completedCount = 0;

        foreach ($enrichments as $enrichment) {
            $progress = UserProgress::where('user_id', $user->id)
                ->where('progressable_type', Enrichment::class)
                ->where('progressable_id', $enrichment->id)
                ->first();

            $isCompleted = $progress && $progress->is_completed;
            if ($isCompleted) {
                $completedCount++;
            }

            if ($enrichment->type === 'video') {
                $videos[] = [
                    'id' => $enrichment->id,
                    'title' => $enrichment->title,
                    'platform' => $this->getVideoPlatform($enrichment->url),
                    'duration' => '0:00', // You can add duration field to enrichments table
                    'thumbnail' => $this->getVideoThumbnail($enrichment->url),
                    'watched' => $isCompleted,
                    'url' => $enrichment->url
                ];
            } else {
                $links[] = [
                    'id' => $enrichment->id,
                    'title' => $enrichment->title,
                    'url' => $enrichment->url,
                    'type' => 'External Link',
                    'completed' => $isCompleted
                ];
            }
        }

        return [
            'title' => 'Pengayaan & Sumber Lain',
            'description' => 'Video pembelajaran dan sumber tambahan',
            'points' => $enrichments->sum('point_reward'),
            'completed' => $completedCount === $enrichments->count() && $enrichments->count() > 0,
            'videos' => $videos,
            'links' => $links
        ];
    }

    private function buildQuizContent($module, $user)
    {
        $quiz = $module->quizzes->first();

        if (!$quiz) {
            return [
                'title' => 'Quiz',
                'description' => 'Kerjakan soal untuk menguji pemahaman',
                'points' => 100,
                'completed' => false,
                'totalQuestions' => 0,
                'timeLimit' => 30,
                'attempts' => 0,
                'maxAttempts' => 3,
                'bestScore' => null,
                'available' => false
            ];
        }

        // Get user's quiz attempts
        $attempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->get();

        $bestScore = $attempts->max('score');
        $totalQuestions = $quiz->total_questions;

        return [
            'title' => 'Quiz',
            'description' => $quiz->description ?: 'Kerjakan soal untuk menguji pemahaman',
            'points' => $totalQuestions * $quiz->point_per_question,
            'completed' => $attempts->count() > 0,
            'totalQuestions' => $totalQuestions,
            'timeLimit' => 30, // You can add time_limit field to quiz table
            'attempts' => $attempts->count(),
            'maxAttempts' => 3, // You can add max_attempts field
            'bestScore' => $bestScore ? round(($bestScore / $totalQuestions) * 100) : null,
            'available' => $quiz->is_active,
            'quiz_id' => $quiz->id
        ];
    }

    private function buildAssignmentContent($module, $user)
    {
        $assignment = $module->assignments->first();

        if (!$assignment) {
            return [
                'title' => 'Tugas Praktikum',
                'description' => 'Implementasi program praktis',
                'points' => 150,
                'completed' => false,
                'deadline' => null,
                'submitted' => false,
                'submissionFile' => null,
                'tasks' => [],
                'available' => false
            ];
        }

        // Check if user has submitted
        $submission = AssignmentSubmission::where('user_id', $user->id)
            ->where('assignment_id', $assignment->id)
            ->first();

        return [
            'title' => 'Tugas Praktikum',
            'description' => $assignment->description,
            'points' => $this->getAssignmentMaxPoints($assignment),
            'completed' => $submission !== null,
            'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
            'submitted' => $submission !== null,
            'submissionFile' => $submission ? basename($submission->file_path) : null,
            'tasks' => $this->getAssignmentTasks($module->order_number),
            'available' => $assignment->is_active,
            'assignment_id' => $assignment->id,
            'points_earned' => $submission ? $submission->points_earned : 0
        ];
    }

    private function getAssignmentMaxPoints($assignment)
    {
        return max($assignment->point_reward_early, $assignment->point_reward_ontime, $assignment->point_reward_late);
    }

    private function getModuleColor($orderNumber)
    {
        $colors = [
            1 => 'bg-blue-500',
            2 => 'bg-green-500',
            3 => 'bg-purple-500',
            4 => 'bg-orange-500',
            5 => 'bg-red-500',
            6 => 'bg-indigo-500',
            7 => 'bg-teal-500',
            8 => 'bg-yellow-500'
        ];

        return $colors[$orderNumber] ?? 'bg-gray-500';
    }

    private function getEstimatedTime($orderNumber)
    {
        $times = [
            1 => '3-4 jam',
            2 => '4-6 jam',
            3 => '5-7 jam',
            4 => '4-5 jam',
            5 => '6-8 jam',
            6 => '8-10 jam',
            7 => '3-4 jam',
            8 => '10-15 jam'
        ];

        return $times[$orderNumber] ?? '2-3 jam';
    }

    private function getDifficulty($orderNumber)
    {
        $difficulties = [
            1 => 'Beginner',
            2 => 'Intermediate',
            3 => 'Intermediate',
            4 => 'Intermediate',
            5 => 'Advanced',
            6 => 'Advanced',
            7 => 'Intermediate',
            8 => 'Expert'
        ];

        return $difficulties[$orderNumber] ?? 'Beginner';
    }

    private function getPrerequisites($orderNumber)
    {
        $prerequisites = [
            1 => [],
            2 => ['Pengenalan Pemrograman'],
            3 => ['Pengenalan Pemrograman', 'Variabel & Tipe Data'],
            4 => ['Struktur Kontrol', 'Looping'],
            5 => ['Array', 'Function'],
            6 => ['Pointer', 'Array'],
            7 => ['Struktur Data', 'Array'],
            8 => ['File Processing', 'Struktur Data', 'Pointer']
        ];

        return $prerequisites[$orderNumber] ?? [];
    }

    private function getCPContentByOrder($orderNumber)
    {
        $cpContents = [
            1 => [
                'Memahami konsep dasar pemrograman dan algoritma',
                'Mengenal berbagai paradigma pemrograman',
                'Mampu menulis pseudocode dan flowchart',
                'Memahami sintaks dasar bahasa pemrograman',
                'Dapat membuat program sederhana'
            ],
            2 => [
                'Memahami konsep dasar perulangan dalam pemrograman',
                'Mampu mengimplementasikan For Loop untuk iterasi terhitung',
                'Menguasai While dan Do-While loop untuk iterasi kondisional',
                'Dapat menyelesaikan masalah dengan nested loop',
                'Memahami kapan menggunakan jenis loop yang tepat'
            ],
            3 => [
                'Memahami konsep fungsi dan prosedur',
                'Mampu membuat dan memanggil fungsi',
                'Menguasai parameter passing by value dan reference',
                'Memahami scope variabel dan lifetime',
                'Dapat mengimplementasi recursive function'
            ],
            // Add more CP content for other modules
        ];

        return $cpContents[$orderNumber] ?? [
            'Mencapai tujuan pembelajaran sesuai dengan kurikulum yang ditetapkan'
        ];
    }

    private function getATPContentByOrder($orderNumber)
    {
        $atpContents = [
            1 => [
                'Pertemuan 1: Pengenalan konsep pemrograman',
                'Pertemuan 2: Algoritma dan flowchart',
                'Pertemuan 3: Sintaks dasar dan variabel',
                'Pertemuan 4: Input/Output dan operasi dasar',
                'Pertemuan 5: Praktik program pertama'
            ],
            2 => [
                'Pertemuan 1: Konsep dasar perulangan dan flowchart',
                'Pertemuan 2: Implementasi For Loop',
                'Pertemuan 3: While dan Do-While Loop',
                'Pertemuan 4: Nested Loop dan optimasi',
                'Pertemuan 5: Studi kasus dan problem solving'
            ],
            3 => [
                'Pertemuan 1: Konsep dasar fungsi dan prosedur',
                'Pertemuan 2: Parameter dan return value',
                'Pertemuan 3: Scope dan lifetime variabel',
                'Pertemuan 4: Recursive function',
                'Pertemuan 5: Function overloading dan best practices'
            ],
            // Add more ATP content for other modules
        ];

        return $atpContents[$orderNumber] ?? [
            'Mengikuti alur pembelajaran yang terstruktur sesuai dengan silabus'
        ];
    }

    private function getAssignmentTasks($orderNumber)
    {
        $tasks = [
            1 => [
                'Buat program "Hello World" pertama Anda',
                'Implementasi program kalkulator sederhana',
                'Buat flowchart untuk program yang dibuat'
            ],
            2 => [
                'Buat program untuk menampilkan pola segitiga dengan loop',
                'Implementasikan algoritma pencarian dengan iterasi',
                'Optimasi performa loop untuk data besar'
            ],
            3 => [
                'Buat library fungsi matematika dasar',
                'Implementasi recursive function untuk faktorial',
                'Optimasi fungsi dengan parameter passing'
            ],
            // Add more tasks for other modules
        ];

        return $tasks[$orderNumber] ?? [
            'Kerjakan tugas sesuai dengan petunjuk yang diberikan'
        ];
    }

    private function getFileSize($filePath)
    {
        // This should check actual file size in storage
        // For now, return dummy data
        return '2.4 MB';
    }

    private function getVideoPlatform($url)
    {
        if (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false) {
            return 'YouTube';
        }
        if (strpos($url, 'vimeo.com') !== false) {
            return 'Vimeo';
        }
        return 'Video';
    }

    private function getVideoThumbnail($url)
    {
        // Extract video ID and generate thumbnail URL
        // For now, return placeholder
        return 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';
    }
}
