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

    // Constants untuk configurasi
    private const DEFAULT_TIME_LIMIT = 30;
    private const MAX_ATTEMPTS = 3;
    private const CACHE_TTL = 3600; // 1 jam

    public function __construct(ProgressService $progressService)
    {
        $this->progressService = $progressService;
    }

    public function show($moduleId)
    {
        // Eager loading yang lebih efisien
        $module = Module::with(['quizzes' => function ($query) {
            $query->with(['questions' => function ($q) {
                $q->select('id', 'quiz_id')->ordered();
            }]);
        }])->findOrFail($moduleId);

        $quiz = $module->quizzes->first();

        if (!$quiz) {
            return redirect()
                ->route('student.modules.show', $moduleId)
                ->with('error', 'Quiz belum tersedia untuk modul ini.');
        }

        return Inertia::render('Quiz/Show', [
            'module' => $this->formatModule($module),
            'quiz' => $this->formatQuizOverview($quiz),
            'userAttempts' => $this->getUserAttempts($quiz->id, $quiz->total_questions)
        ]);
    }

    public function start(Request $request, $moduleId)
    {
        $user = Auth::user();

        // Gunakan single query dengan eager loading
        $module = Module::with(['quizzes.questions' => function ($query) {
            $query->ordered();
        }])->findOrFail($moduleId);

        $quiz = $module->quizzes->first();

        if (!$quiz) {
            return redirect()
                ->route('student.modules.show', $moduleId)
                ->with('error', 'Quiz belum tersedia untuk modul ini.');
        }

        // Check existing attempt lebih efisien
        if ($this->hasCompletedQuiz($user->id, $quiz->id)) {
            return redirect()
                ->route('quiz.result', $moduleId)
                ->with('info', 'Anda sudah menyelesaikan quiz ini.');
        }

        // Format questions tanpa correct_answer untuk keamanan
        $questions = $quiz->questions->map(fn($q) => [
            'id' => $q->id,
            'question' => $q->question,
            'options' => $q->options,
        ])->values();

        // Create quiz session dengan data minimal
        $sessionData = [
            'session_id' => $this->generateSessionId(),
            'quiz_id' => $quiz->id,
            'module_id' => $moduleId,
            'started_at' => now()->toIso8601String(),
            'time_limit' => self::DEFAULT_TIME_LIMIT,
        ];

        session(['quiz_session' => $sessionData]);

        return Inertia::render('Quiz/Interface', [
            'module' => $this->formatModule($module),
            'questions' => $questions,
            'quizConfig' => [
                'time_limit' => $sessionData['time_limit'],
                'total_questions' => $questions->count(),
                'session_id' => $sessionData['session_id']
            ]
        ]);
    }

    public function submit(Request $request, $moduleId)
    {
        $validated = $request->validate([
            'session_id' => 'required|string|max:50',
            'answers' => 'required|array|max:100',
            'answers.*' => 'string|in:A,B,C,D',
            'time_taken' => 'required|integer|min:0|max:7200'
        ]);

        $quizSession = session('quiz_session');

        // Validasi session
        if (!$this->isValidSession($quizSession, $validated['session_id'])) {
            return redirect()
                ->route('quiz.show', $moduleId)
                ->with('error', 'Session quiz tidak valid. Silakan mulai ulang.');
        }

        $user = Auth::user();

        // Cegah duplicate submission
        if ($this->hasCompletedQuiz($user->id, $quizSession['quiz_id'])) {
            return redirect()
                ->route('quiz.result', $moduleId)
                ->with('info', 'Anda sudah menyelesaikan quiz ini.');
        }

        // Load quiz dengan questions
        $quiz = Quiz::with('questions')->findOrFail($quizSession['quiz_id']);

        // Hitung score
        $result = $this->calculateScore($validated['answers'], $quiz->questions);
        $pointsEarned = $result['correct_count'] * $quiz->point_per_question;

        // Simpan dengan transaction
        $attempt = DB::transaction(function () use ($quiz, $validated, $result, $pointsEarned, $user) {
            $attempt = QuizAttempt::create([
                'user_id' => $user->id,
                'quiz_id' => $quiz->id,
                'answers' => $validated['answers'],
                'score' => $result['correct_count'],
                'points_earned' => $pointsEarned,
                'completed_at' => now(),
            ]);

            $user->addPoints($pointsEarned);

            // Invalidate cache
            Cache::forget("quiz_attempts_{$user->id}_{$quiz->id}");
            Cache::forget("quiz_completed_{$user->id}_{$quiz->id}");

            return $attempt;
        });

        session()->forget('quiz_session');

        // Langsung render halaman result tanpa redirect
        return $this->renderResult($moduleId, $quiz, $attempt, $result, $pointsEarned, $validated['time_taken']);
    }

    private function renderResult($moduleId, $quiz, $attempt, $result, $pointsEarned, $timeTaken)
    {
        $module = Module::findOrFail($moduleId);

        $resultData = [
            'quiz_id' => $quiz->id,
            'score' => $result['score'],
            'correct_count' => $result['correct_count'],
            'total_questions' => $result['total_questions'],
            'percentage' => $result['percentage'],
            'grade' => $result['grade'],
            'points_earned' => $pointsEarned,
        ];

        $submissionData = [
            'quiz_id' => $quiz->id,
            'user_id' => $attempt->user_id,
            'answers' => $attempt->answers,
            'score' => $attempt->score,
            'correct_count' => $attempt->score,
            'total_questions' => $quiz->total_questions,
            'time_taken' => $timeTaken,
            'submitted_at' => $attempt->completed_at->toIso8601String(),
            'points_earned' => $pointsEarned,
        ];

        return Inertia::render('Quiz/Result', [
            'module' => $this->formatModule($module),
            'result' => $resultData,
            'submission' => $submissionData,
            'questions_review' => $this->getQuestionsWithAnswers($quiz, $attempt->answers),
        ]);
    }

    public function result($moduleId)
    {
        $module = Module::findOrFail($moduleId);
        $user = Auth::user();

        // Coba ambil dari session dulu (fresh submission)
        $cachedResult = session('quiz_result');

        if ($cachedResult) {
            $quiz = Quiz::with('questions')->findOrFail($cachedResult['quiz_id']);
            $attempt = QuizAttempt::where('user_id', $user->id)
                ->where('quiz_id', $quiz->id)
                ->latest()
                ->first();
        } else {
            // Load from database
            $quiz = $module->quizzes()->with('questions')->first();

            if (!$quiz) {
                return redirect()
                    ->route('student.modules.show', $moduleId)
                    ->with('error', 'Quiz tidak ditemukan.');
            }

            $attempt = QuizAttempt::where('user_id', $user->id)
                ->where('quiz_id', $quiz->id)
                ->latest()
                ->first();

            if (!$attempt) {
                return redirect()
                    ->route('quiz.show', $moduleId)
                    ->with('error', 'Belum ada hasil quiz.');
            }

            $cachedResult = $this->formatResultFromAttempt($attempt, $quiz);
        }

        return Inertia::render('Quiz/Result', [
            'module' => $this->formatModule($module),
            'result' => $cachedResult,
            'questions_review' => $this->getQuestionsWithAnswers($quiz, $attempt->answers),
        ]);
    }

    // ===== Helper Methods =====

    private function hasCompletedQuiz(int $userId, int $quizId): bool
    {
        return Cache::remember(
            "quiz_completed_{$userId}_{$quizId}",
            self::CACHE_TTL,
            fn() => QuizAttempt::where('user_id', $userId)
                ->where('quiz_id', $quizId)
                ->exists()
        );
    }

    private function getUserAttempts(int $quizId, int $totalQuestions): array
    {
        $attempts = Cache::remember(
            "quiz_attempts_" . Auth::id() . "_{$quizId}",
            self::CACHE_TTL,
            fn() => QuizAttempt::where('user_id', Auth::id())
                ->where('quiz_id', $quizId)
                ->select('score', 'completed_at')
                ->get()
        );

        $bestScore = $attempts->max('score');
        $lastAttempt = $attempts->sortByDesc('completed_at')->first();

        return [
            'attempts_used' => $attempts->count(),
            'max_attempts' => self::MAX_ATTEMPTS,
            'best_score' => $bestScore ? round(($bestScore / $totalQuestions) * 100) : 0,
            'last_attempt_date' => $lastAttempt?->completed_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function calculateScore(array $userAnswers, $questions): array
    {
        $correctCount = 0;
        $totalQuestions = $questions->count();

        foreach ($questions as $question) {
            if (($userAnswers[$question->id] ?? null) === $question->correct_answer) {
                $correctCount++;
            }
        }

        $percentage = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100) : 0;

        return [
            'score' => $percentage,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'percentage' => $percentage,
            'grade' => $this->getGrade($percentage)
        ];
    }

    private function getGrade(int $score): string
    {
        return match(true) {
            $score >= 90 => 'A',
            $score >= 80 => 'B',
            $score >= 70 => 'C',
            $score >= 60 => 'D',
            default => 'F'
        };
    }

    private function getQuestionsWithAnswers($quiz, array $userAnswers): array
    {
        return $quiz->questions->map(function ($question) use ($userAnswers) {
            $userAnswer = $userAnswers[$question->id] ?? null;

            return [
                'id' => $question->id,
                'question' => $question->question,
                'options' => $question->options,
                'correct_answer' => $question->correct_answer,
                'user_answer' => $userAnswer,
                'is_correct' => $userAnswer === $question->correct_answer
            ];
        })->values()->toArray();
    }

    private function formatModule($module): array
    {
        return [
            'id' => $module->id,
            'title' => $module->title,
            'color' => $module->color ?? 'bg-blue-500'
        ];
    }

    private function formatQuizOverview($quiz): array
    {
        return [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'total_questions' => $quiz->total_questions,
            'time_limit' => $quiz->time_limit ?? 10,
            'max_attempts' => $quiz->max_attempts ?? self::MAX_ATTEMPTS,
            'points_per_question' => $quiz->point_per_question
        ];
    }

    private function formatResultFromAttempt($attempt, $quiz): array
    {
        $percentage = round(($attempt->score / $quiz->total_questions) * 100);

        return [
            'quiz_id' => $attempt->quiz_id,
            'score' => $percentage,
            'correct_count' => $attempt->score,
            'total_questions' => $quiz->total_questions,
            'percentage' => $percentage,
            'grade' => $this->getGrade($percentage),
            'points_earned' => $attempt->points_earned,
            'time_taken' => 0, // Bisa ditambahkan field ini di database
        ];
    }

    private function generateSessionId(): string
    {
        return 'quiz_' . uniqid() . '_' . bin2hex(random_bytes(8));
    }

    private function isValidSession(?array $session, string $sessionId): bool
    {
        return $session
            && isset($session['session_id'])
            && $session['session_id'] === $sessionId
            && isset($session['started_at']);
    }
}
