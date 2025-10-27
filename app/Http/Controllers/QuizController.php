<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Services\ProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuizController extends Controller
{
    protected $progressService;

    public function __construct(ProgressService $progressService)
    {
        $this->progressService = $progressService;
    }

    // GET /module/{moduleId}/quiz - Show quiz overview page
    public function show($moduleId)
    {
        $module = Module::with(['quizzes.questions'])->findOrFail($moduleId);
        $quiz = $module->quizzes->first(); // Assuming one quiz per module for now

        if (!$quiz) {
            return redirect()->route('student.modules.show', $moduleId)
                ->with('error', 'Quiz belum tersedia untuk modul ini.');
        }

        $userAttempts = $this->getUserAttempts($quiz->id);

        return Inertia::render('Quiz/Show', [
            'module' => [
                'id' => $module->id,
                'title' => $module->title,
                'color' => 'bg-blue-500' // You can add color field to modules table
            ],
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'total_questions' => $quiz->total_questions,
                'time_limit' => 10, // You can add this field to quizzes table
                'max_attempts' => 3, // You can add this field to quizzes table
                'points_per_question' => $quiz->point_per_question
            ],
            'userAttempts' => $userAttempts
        ]);
    }

    // POST /module/{moduleId}/quiz/start - Start quiz session
    public function start(Request $request, $moduleId)
    {
        $module = Module::findOrFail($moduleId);
        $quiz = $module->quizzes->first();

        if (!$quiz) {
            return redirect()->route('student.modules.show', $moduleId)
                ->with('error', 'Quiz belum tersedia untuk modul ini.');
        }

        // Check if user has already attempted this quiz
        $existingAttempt = QuizAttempt::where('user_id', Auth::id())
            ->where('quiz_id', $quiz->id)
            ->first();

        if ($existingAttempt) {
            return redirect()->route('quiz.result', $moduleId)
                ->with('info', 'Anda sudah menyelesaikan quiz ini.');
        }

        $questions = $quiz->questions()
            ->ordered()
            ->get()
            ->map(function ($question) {
                return [
                    'id' => $question->id,
                    'question' => $question->question,
                    'options' => $question->options,
                    // Don't include correct_answer for security
                ];
            });

        // Create quiz session
        $quizSession = [
            'session_id' => uniqid('quiz_'),
            'quiz_id' => $quiz->id,
            'module_id' => $moduleId,
            'started_at' => now(),
            'time_limit' => 30, // You can get this from quiz or module
            'total_questions' => $questions->count()
        ];

        session(['quiz_session' => $quizSession]);

        return Inertia::render('Quiz/Interface', [
            'module' => [
                'id' => $module->id,
                'title' => $module->title,
                'color' => 'bg-blue-500'
            ],
            'questions' => $questions,
            'quizConfig' => [
                'time_limit' => $quizSession['time_limit'],
                'total_questions' => $questions->count(),
                'session_id' => $quizSession['session_id']
            ]
        ]);
    }

    // POST /module/{moduleId}/quiz/submit - Submit answers
    public function submit(Request $request, $moduleId)
    {
        $request->validate([
            'session_id' => 'required|string',
            'answers' => 'required|array',
            'time_taken' => 'required|integer'
        ]);

        $quizSession = session('quiz_session');

        if (!$quizSession || $quizSession['session_id'] !== $request->session_id) {
            return redirect()->route('quiz.show', $moduleId)
                ->with('error', 'Session quiz tidak valid. Silakan mulai ulang.');
        }

        $quiz = Quiz::with('questions')->findOrFail($quizSession['quiz_id']);
        $answers = $request->input('answers');
        $timeTaken = $request->input('time_taken');

        // Check if user has already attempted this quiz
        $existingAttempt = QuizAttempt::where('user_id', Auth::id())
            ->where('quiz_id', $quiz->id)
            ->first();

        if ($existingAttempt) {
            return redirect()->route('quiz.result', $moduleId)
                ->with('info', 'Anda sudah menyelesaikan quiz ini.');
        }

        // Calculate score
        $result = $this->calculateScore($answers, $quiz->questions);
        $pointsEarned = $result['correct_count'] * $quiz->point_per_question;

        // Save to database
        DB::transaction(function () use ($quiz, $answers, $result, $pointsEarned, $timeTaken) {
            // Create quiz attempt
            $attempt = QuizAttempt::create([
                'user_id' => Auth::id(),
                'quiz_id' => $quiz->id,
                'answers' => $answers,
                'score' => $result['correct_count'],
                'points_earned' => $pointsEarned,
                'completed_at' => now(),
            ]);

            // Add points to user
            Auth::user()->addPoints($pointsEarned);
        });

        // Store result in session for display
        session([
            'quiz_submission' => [
                'quiz_id' => $quiz->id,
                'user_id' => Auth::id(),
                'answers' => $answers,
                'score' => $result['correct_count'],
                'correct_count' => $result['correct_count'],
                'total_questions' => $result['total_questions'],
                'time_taken' => $timeTaken,
                'points_earned' => $pointsEarned,
                'submitted_at' => now()
            ],
            'quiz_result' => array_merge($result, ['points_earned' => $pointsEarned]),
            'quiz_questions_review' => $this->getQuestionsWithAnswers($quiz, $answers)
        ]);

        // Remove quiz session
        session()->forget('quiz_session');

        return Inertia::location(route('quiz.result', $moduleId));
    }

    // GET /module/{moduleId}/quiz/result - Show result page
    public function result($moduleId)
    {
        $module = Module::findOrFail($moduleId);

        // Try to get from session first (for just completed quiz)
        $submission = session('quiz_submission');
        $result = session('quiz_result');
        $questionsReview = session('quiz_questions_review');

        // If not in session, get from database (for previous attempts)
        if (!$submission || !$result) {
            $quiz = $module->quizzes->first();
            if (!$quiz) {
                return redirect()->route('student.modules.show', $moduleId)
                    ->with('error', 'Quiz tidak ditemukan.');
            }

            $attempt = QuizAttempt::where('user_id', Auth::id())
                ->where('quiz_id', $quiz->id)
                ->latest()
                ->first();

            if (!$attempt) {
                return redirect()->route('quiz.show', $moduleId)
                    ->with('error', 'Belum ada hasil quiz. Silakan kerjakan terlebih dahulu.');
            }

            $submission = [
                'quiz_id' => $attempt->quiz_id,
                'user_id' => $attempt->user_id,
                'answers' => $attempt->answers,
                'score' => $attempt->score,
                'correct_count' => $attempt->score,
                'total_questions' => $quiz->total_questions,
                'points_earned' => $attempt->points_earned,
                'submitted_at' => $attempt->completed_at
            ];

            $result = [
                'score' => round(($attempt->score / $quiz->total_questions) * 100),
                'correct_count' => $attempt->score,
                'total_questions' => $quiz->total_questions,
                'percentage' => round(($attempt->score / $quiz->total_questions) * 100),
                'points_earned' => $attempt->points_earned,
                'grade' => $this->getGrade(round(($attempt->score / $quiz->total_questions) * 100))
            ];

            $questionsReview = $this->getQuestionsWithAnswers($quiz, $attempt->answers);
        }

        return Inertia::render('Quiz/Result', [
            'module' => [
                'id' => $module->id,
                'title' => $module->title,
                'color' => 'bg-blue-500'
            ],
            'result' => $result,
            'submission' => $submission,
            'questions_review' => $questionsReview,
        ]);
    }

    // Helper methods
    private function getUserAttempts($quizId)
    {
        $attempts = QuizAttempt::where('user_id', Auth::id())
            ->where('quiz_id', $quizId)
            ->get();

        $bestScore = $attempts->max('score');
        $lastAttempt = $attempts->sortByDesc('completed_at')->first();

        return [
            'attempts_used' => $attempts->count(),
            'max_attempts' => 3, // You can add this to quiz table
            'best_score' => $bestScore ? round(($bestScore / 10) * 100) : 0, // Assuming 10 questions
            'last_attempt_date' => $lastAttempt ? $lastAttempt->completed_at->format('Y-m-d H:i:s') : null
        ];
    }

    private function calculateScore($userAnswers, $questions)
    {
        $correctCount = 0;
        $totalQuestions = $questions->count();

        foreach ($questions as $question) {
            $questionId = (string) $question->id;
            if (isset($userAnswers[$questionId]) && $userAnswers[$questionId] === $question->correct_answer) {
                $correctCount++;
            }
        }

        $score = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100) : 0;

        return [
            'score' => $score,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'percentage' => $score,
            'grade' => $this->getGrade($score)
        ];
    }

    private function getGrade($score)
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }

    private function getQuestionsWithAnswers($quiz, $userAnswers)
    {
        return $quiz->questions->map(function ($question) use ($userAnswers) {
            $questionId = (string) $question->id;
            $userAnswer = $userAnswers[$questionId] ?? null;
            $isCorrect = $userAnswer === $question->correct_answer;

            return [
                'id' => $question->id,
                'question' => $question->question,
                'options' => $question->options,
                'correct_answer' => $question->correct_answer,
                'user_answer' => $userAnswer,
                'is_correct' => $isCorrect
            ];
        })->toArray();
    }
}
