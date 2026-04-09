<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\ProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuizController extends Controller
{
    protected $progressService;

    private const MAX_ATTEMPTS = 3;

    /** Bonus fire points untuk skor 100% berdasarkan percobaan ke-N */
    private const PERFECT_BONUS = [1 => 20, 2 => 10, 3 => 0];

    public function __construct(ProgressService $progressService)
    {
        $this->progressService = $progressService;
    }

    // =========================================================
    // SHOW
    // =========================================================
    public function show($moduleId)
    {
        $module = Module::with(['quizzes' => function ($q) {
            $q->with(['questions' => function ($q2) {
                $q2->select('id', 'quiz_id', 'order_number')->ordered();
            }]);
        }])->findOrFail($moduleId);

        $quiz = $module->quizzes->first();
        if (!$quiz) {
            return redirect()->route('student.modules.show', $moduleId)
                ->with('error', 'Quiz belum tersedia untuk modul ini.');
        }

        return Inertia::render('Quiz/Show', [
            'module'       => $this->formatModule($module),
            'quiz'         => $this->formatQuizOverview($quiz),
            'userAttempts' => $this->getUserAttempts($quiz->id, $quiz->total_questions),
        ]);
    }

    // =========================================================
    // START
    // =========================================================
    public function start(Request $request, $moduleId)
    {
        $user   = Auth::user();
        $module = Module::with(['quizzes.questions' => fn($q) => $q->ordered()])
            ->findOrFail($moduleId);

        $quiz = $module->quizzes->first();
        if (!$quiz) {
            return redirect()->route('student.modules.show', $moduleId)
                ->with('error', 'Quiz belum tersedia untuk modul ini.');
        }

        $maxAttempts  = $quiz->max_attempts ?? self::MAX_ATTEMPTS;
        $attemptsUsed = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)->count();

        if ($attemptsUsed >= $maxAttempts) {
            return redirect()->route('quiz.result', $moduleId)
                ->with('info', 'Anda sudah menggunakan semua percobaan quiz.');
        }

        $questions = $quiz->questions->map(fn($q) => [
            'id'       => $q->id,
            'question' => $q->question,
            'options'  => $q->options,
        ])->values();

        $attemptNumber = $attemptsUsed + 1;

        session(['quiz_session' => [
            'session_id'     => $this->generateSessionId(),
            'quiz_id'        => $quiz->id,
            'module_id'      => $moduleId,
            'started_at'     => now()->toIso8601String(),
            'time_limit'     => $quiz->time_limit ?? 30,
            'attempt_number' => $attemptNumber,
            'expires_at'     => now()->addMinutes(($quiz->time_limit ?? 30) + 2)->toIso8601String(),
        ]]);

        return Inertia::render('Quiz/Interface', [
            'module'     => $this->formatModule($module),
            'questions'  => $questions,
            'quizConfig' => [
                'time_limit'      => $quiz->time_limit ?? 30,
                'total_questions' => $questions->count(),
                'session_id'      => session('quiz_session.session_id'),
                'attempt_number'  => $attemptNumber,
                'max_attempts'    => $maxAttempts,
            ],
        ]);
    }

    // =========================================================
    // SUBMIT
    // FIX: Accept both JSON body (dari fetch) dan form data
    // =========================================================
    public function submit(Request $request, $moduleId)
    {
        // Support JSON body (dari fetch di Interface.tsx) maupun form POST
        if ($request->isJson() || $request->expectsJson()) {
            $data = $request->json()->all();
            $request->merge($data);
        }

        $validated = $request->validate([
            'session_id' => 'required|string|max:100',
            'answers'    => 'required|array|max:100',
            'answers.*'  => 'nullable|string|in:A,B,C,D',
            'time_taken' => 'required|integer|min:0|max:7200',
        ]);

        $quizSession = session('quiz_session');

        if (!$this->isValidSession($quizSession, $validated['session_id'])) {
            if ($request->expectsJson() || $request->isJson()) {
                return response()->json(['error' => 'Session tidak valid'], 422);
            }
            return redirect()->route('quiz.show', $moduleId)
                ->with('error', 'Session quiz tidak valid. Silakan mulai ulang.');
        }

        $user = Auth::user();
        $quiz = Quiz::with('questions')->findOrFail($quizSession['quiz_id']);

        $maxAttempts  = $quiz->max_attempts ?? self::MAX_ATTEMPTS;
        $attemptsUsed = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)->count();

        if ($attemptsUsed >= $maxAttempts) {
            session()->forget('quiz_session');
            if ($request->expectsJson() || $request->isJson()) {
                return response()->json(['redirect' => route('quiz.result', $moduleId)]);
            }
            return redirect()->route('quiz.result', $moduleId)
                ->with('info', 'Semua percobaan telah digunakan.');
        }

        $attemptNumber = $quizSession['attempt_number'] ?? ($attemptsUsed + 1);
        $result        = $this->calculateScore($validated['answers'], $quiz->questions);
        $basePoints    = $result['correct_count'] * $quiz->point_per_question;
        $pointsEarned  = $this->calculateFirePoints(
            $result['percentage'], $attemptNumber, $basePoints,
            $user->id, $quiz->id, $quiz->total_questions
        );

        $attempt = DB::transaction(function () use ($quiz, $validated, $result, $pointsEarned, $user, $attemptNumber) {
            $attempt = QuizAttempt::create([
                'user_id'        => $user->id,
                'quiz_id'        => $quiz->id,
                'answers'        => $validated['answers'],
                'score'          => $result['correct_count'],
                'points_earned'  => $pointsEarned,
                'attempt_number' => $attemptNumber,
                'completed_at'   => now(),
            ]);

            if ($pointsEarned > 0) {
                $user->addPoints($pointsEarned);
            }

            Cache::forget("quiz_attempts_{$user->id}_{$quiz->id}");
            return $attempt;
        });

        session()->forget('quiz_session');

        // Simpan flash untuk halaman result
        session(['quiz_result_flash' => [
            'attempt_id'      => $attempt->id,
            'quiz_id'         => $quiz->id,
            'score'           => $result['score'],
            'correct_count'   => $result['correct_count'],
            'total_questions' => $result['total_questions'],
            'percentage'      => $result['percentage'],
            'grade'           => $result['grade'],
            'points_earned'   => $pointsEarned,
            'base_points'     => $basePoints,
            'attempt_number'  => $attemptNumber,
            'time_taken'      => $validated['time_taken'],
            'submitted_at'    => $attempt->completed_at->toIso8601String(),
        ]]);

        // FIX: Untuk request JSON dari fetch, kembalikan JSON dengan URL redirect
        // Frontend (Interface.tsx) akan navigasi via window.location.href
        if ($request->isJson() || $request->header('Content-Type') === 'application/json') {
            return response()->json([
                'success'  => true,
                'redirect' => route('quiz.result', $moduleId),
            ]);
        }

        return redirect()->route('quiz.result', $moduleId);
    }

    // =========================================================
    // RESULT
    // =========================================================
    public function result($moduleId)
    {
        $module = Module::findOrFail($moduleId);
        $user   = Auth::user();

        $quiz = $module->quizzes()->with('questions')->first();
        if (!$quiz) {
            return redirect()->route('student.modules.show', $moduleId)
                ->with('error', 'Quiz tidak ditemukan.');
        }

        $flash = session('quiz_result_flash');
        session()->forget('quiz_result_flash');

        if ($flash && isset($flash['quiz_id']) && (int)$flash['quiz_id'] === (int)$quiz->id) {
            $attempt = QuizAttempt::find($flash['attempt_id'])
                ?? QuizAttempt::where('user_id', $user->id)
                    ->where('quiz_id', $quiz->id)->latest()->first();

            $resultData = [
                'quiz_id'         => $quiz->id,
                'score'           => $flash['score'],
                'correct_count'   => $flash['correct_count'],
                'total_questions' => $flash['total_questions'],
                'percentage'      => $flash['percentage'],
                'grade'           => $flash['grade'],
                'points_earned'   => $flash['points_earned'],
                'base_points'     => $flash['base_points'],
                'attempt_number'  => $flash['attempt_number'],
            ];

            $submissionData = [
                'quiz_id'         => $quiz->id,
                'module_id'       => (int)$moduleId,
                'user_id'         => $user->id,
                'answers'         => $attempt?->answers ?? [],
                'score'           => $flash['correct_count'],
                'correct_count'   => $flash['correct_count'],
                'total_questions' => $flash['total_questions'],
                'time_taken'      => $flash['time_taken'],
                'submitted_at'    => $flash['submitted_at'],
                'points_earned'   => $flash['points_earned'],
                'attempt_number'  => $flash['attempt_number'],
            ];
        } else {
            $attempt = QuizAttempt::where('user_id', $user->id)
                ->where('quiz_id', $quiz->id)->latest()->first();

            if (!$attempt) {
                return redirect()->route('quiz.show', $moduleId)
                    ->with('error', 'Belum ada hasil quiz.');
            }

            $pct = $quiz->total_questions > 0
                ? round(($attempt->score / $quiz->total_questions) * 100) : 0;

            $resultData = [
                'quiz_id'         => $quiz->id,
                'score'           => $pct,
                'correct_count'   => $attempt->score,
                'total_questions' => $quiz->total_questions,
                'percentage'      => $pct,
                'grade'           => $this->getGrade($pct),
                'points_earned'   => $attempt->points_earned,
                'base_points'     => $attempt->score * $quiz->point_per_question,
                'attempt_number'  => $attempt->attempt_number ?? 1,
            ];

            $submissionData = [
                'quiz_id'         => $quiz->id,
                'module_id'       => (int)$moduleId,
                'user_id'         => $attempt->user_id,
                'answers'         => $attempt->answers ?? [],
                'score'           => $attempt->score,
                'correct_count'   => $attempt->score,
                'total_questions' => $quiz->total_questions,
                'time_taken'      => 0,
                'submitted_at'    => $attempt->completed_at->toIso8601String(),
                'points_earned'   => $attempt->points_earned,
                'attempt_number'  => $attempt->attempt_number ?? 1,
            ];
        }

        $allAttempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->orderBy('attempt_number')
            ->get()
            ->map(fn($a) => [
                'attempt_number' => $a->attempt_number ?? 1,
                'score'          => $quiz->total_questions > 0
                    ? round(($a->score / $quiz->total_questions) * 100) : 0,
                'correct_count'  => $a->score,
                'points_earned'  => $a->points_earned,
                'completed_at'   => $a->completed_at?->toIso8601String(),
            ])
            ->values()->toArray();

        $attemptsUsed = count($allAttempts);
        $maxAttempts  = $quiz->max_attempts ?? self::MAX_ATTEMPTS;
        $bestScore    = $allAttempts ? max(array_column($allAttempts, 'score')) : 0;

        return Inertia::render('Quiz/Result', [
            'module'           => $this->formatModule($module),
            'result'           => $resultData,
            'submission'       => $submissionData,
            'questions_review' => $attempt
                ? $this->getQuestionsWithAnswers($quiz, $attempt->answers ?? [])
                : [],
            'attempts_summary' => [
                'all_attempts'  => $allAttempts,
                'attempts_used' => $attemptsUsed,
                'max_attempts'  => $maxAttempts,
                'best_score'    => $bestScore,
                'can_retry'     => $attemptsUsed < $maxAttempts,
                'had_perfect'   => $bestScore === 100,
            ],
        ]);
    }

    // =========================================================
    // Helpers
    // =========================================================

    /**
     * Aturan fire points:
     * - Sudah pernah dapat 100% sebelumnya → 0 (memaksa retry tidak dihargai)
     * - Skor 100% percobaan ke-1 → basePoints + 20
     * - Skor 100% percobaan ke-2 → basePoints + 10
     * - Skor 100% percobaan ke-3 → basePoints + 0
     * - Skor < 100% → basePoints saja
     */
    private function calculateFirePoints(
        int $percentage, int $attemptNumber, int $basePoints,
        int $userId, int $quizId, int $totalQuestions
    ): int {
        if ($totalQuestions <= 0) return 0;

        // Cek apakah sebelumnya sudah pernah dapat 100%
        $hadPerfect = QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->get()
            ->contains(fn($a) => round(($a->score / $totalQuestions) * 100) === 100);

        if ($hadPerfect) return 0;

        if ($percentage === 100) {
            return $basePoints + (self::PERFECT_BONUS[$attemptNumber] ?? 0);
        }

        return $basePoints;
    }

    private function getUserAttempts(int $quizId, int $totalQuestions): array
    {
        $userId   = Auth::id();
        $attempts = QuizAttempt::where('user_id', $userId)->where('quiz_id', $quizId)
            ->select('score', 'completed_at', 'points_earned', 'attempt_number')->get();

        $best        = $attempts->max('score');
        $lastAttempt = $attempts->sortByDesc('completed_at')->first();
        $bestPct     = $best !== null && $totalQuestions > 0
            ? round(($best / $totalQuestions) * 100) : null;

        return [
            'attempts_used'     => $attempts->count(),
            'max_attempts'      => self::MAX_ATTEMPTS,
            'best_score'        => $bestPct,
            'last_attempt_date' => $lastAttempt?->completed_at?->format('Y-m-d H:i:s'),
            'had_perfect_score' => $bestPct === 100,
        ];
    }

    private function calculateScore(array $userAnswers, $questions): array
    {
        $correct = 0;
        $total   = $questions->count();
        foreach ($questions as $q) {
            if (($userAnswers[$q->id] ?? null) === $q->correct_answer) $correct++;
        }
        $pct = $total > 0 ? round(($correct / $total) * 100) : 0;
        return ['score' => $pct, 'correct_count' => $correct, 'total_questions' => $total, 'percentage' => $pct, 'grade' => $this->getGrade($pct)];
    }

    private function getGrade(int $score): string
    {
        return match(true) {
            $score >= 90 => 'A', $score >= 80 => 'B',
            $score >= 70 => 'C', $score >= 60 => 'D', default => 'F',
        };
    }

    private function getQuestionsWithAnswers($quiz, array $userAnswers): array
    {
        return $quiz->questions->map(function ($q) use ($userAnswers) {
            $ua = $userAnswers[$q->id] ?? null;
            return [
                'id'             => $q->id,
                'question'       => $q->question,
                'options'        => $q->options,
                'correct_answer' => $q->correct_answer,
                'user_answer'    => $ua,
                'is_correct'     => $ua !== null && $ua === $q->correct_answer,
            ];
        })->values()->toArray();
    }

    private function formatModule($module): array
    {
        return ['id' => $module->id, 'title' => $module->title, 'color' => $module->color ?? 'bg-blue-500'];
    }

    private function formatQuizOverview($quiz): array
    {
        return [
            'id'                  => $quiz->id,
            'title'               => $quiz->title,
            'description'         => $quiz->description,
            'total_questions'     => $quiz->total_questions,
            'time_limit'          => $quiz->time_limit ?? 30,
            'max_attempts'        => $quiz->max_attempts ?? self::MAX_ATTEMPTS,
            'points_per_question' => $quiz->point_per_question,
        ];
    }

    private function generateSessionId(): string
    {
        return 'quiz_' . uniqid() . '_' . bin2hex(random_bytes(8));
    }

    private function isValidSession(?array $session, string $sessionId): bool
    {
        return $session
            && isset($session['session_id'], $session['started_at'])
            && $session['session_id'] === $sessionId;
    }
}
