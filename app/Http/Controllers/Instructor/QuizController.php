<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuizRequest;
use App\Http\Requests\UpdateQuizRequest;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index()
    {
        try {
            $quizzes = Quiz::with(['module', 'questions'])
                ->withCount('attempts')
                ->withAvg('attempts', 'score')
                ->get()
                ->map(function ($quiz) {
                    return [
                        'id'             => $quiz->id,
                        'title'          => $quiz->title,
                        'description'    => $quiz->description,
                        'moduleId'       => $quiz->module_id,
                        'moduleName'     => $quiz->module->title ?? 'Unknown Module',
                        'totalQuestions' => $quiz->questions->count(),
                        'timeLimit'      => $quiz->time_limit ?? 30,
                        'attempts'       => $quiz->attempts_count ?? 0,
                        'averageScore'   => round($quiz->attempts_avg_score ?? 0, 1),
                        'status'         => $quiz->is_active ? 'active' : 'draft',
                        'createdAt'      => $quiz->created_at->format('Y-m-d'),
                        'deadline'       => $quiz->created_at->addMonth()->format('Y-m-d'),
                    ];
                });

            $modules = Module::where('is_active', true)
                ->orderBy('order_number')
                ->get(['id', 'title']);

            return Inertia::render('Instructor/Quiz', [
                'quizzes' => $quizzes,
                'modules' => $modules,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading quiz index: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat data quiz.');
        }
    }

    public function store(StoreQuizRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $quiz = Quiz::create([
                    'module_id'         => $request->module_id,
                    'title'             => $request->title,
                    'description'       => $request->description,
                    'total_questions'   => count($request->questions),
                    'time_limit'        => $request->time_limit ?? 30,
                    'point_per_question'=> collect($request->questions)->avg('points') ?? 10,
                    'is_active'         => false,
                ]);

                foreach ($request->questions as $index => $questionData) {
                    QuizQuestion::create([
                        'quiz_id'       => $quiz->id,
                        'question'      => $questionData['question'],
                        'options'       => $questionData['options'] ?? [],
                        'correct_answer'=> $questionData['correct_answer'],
                        'points'        => $questionData['points'] ?? 10,
                        'order_number'  => $index + 1,
                    ]);
                }
            });

            return redirect()->route('instructor.quiz-manage')->with('success', 'Quiz berhasil dibuat.');
        } catch (\Exception $e) {
            Log::error('Error creating quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat membuat quiz.');
        }
    }

    public function show(Quiz $quiz)
    {
        try {
            $quiz->load(['module', 'questions' => fn ($q) => $q->orderBy('order_number')]);

            $quizData = [
                'id'          => $quiz->id,
                'title'       => $quiz->title,
                'description' => $quiz->description,
                'module_id'   => $quiz->module_id,
                'module_name' => $quiz->module->title ?? 'Unknown Module',
                'time_limit'  => $quiz->time_limit ?? 30,
                'is_active'   => $quiz->is_active,
                'questions'   => $quiz->questions->map(fn ($q) => [
                    'id'             => $q->id,
                    'question'       => $q->question,
                    'type'           => $this->inferQuestionType($q),
                    'options'        => $q->options ?? [],
                    'correct_answer' => $q->correct_answer,
                    'points'         => $q->points ?? 10,
                    'order_number'   => $q->order_number,
                ]),
            ];

            return response()->json(['quiz' => $quizData]);
        } catch (\Exception $e) {
            Log::error('Error loading quiz detail: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan saat memuat detail quiz.'], 500);
        }
    }

    public function update(UpdateQuizRequest $request, Quiz $quiz)
    {
        try {
            // Check if quiz has been attempted
            if ($quiz->attempts()->exists() && $request->has('questions')) {
                return redirect()->back()->with('error', 'Quiz tidak dapat diubah karena sudah ada mahasiswa yang mengerjakan.');
            }

            DB::transaction(function () use ($request, $quiz) {
                $quiz->update([
                    'module_id'         => $request->module_id,
                    'title'             => $request->title,
                    'description'       => $request->description,
                    'time_limit'        => $request->time_limit ?? 30,
                    'total_questions'   => count($request->questions),
                    'point_per_question'=> collect($request->questions)->avg('points') ?? 10,
                ]);

                // Only update questions if provided
                if ($request->has('questions')) {
                    // Delete existing questions
                    $quiz->questions()->delete();

                    // Create new questions
                    foreach ($request->questions as $index => $questionData) {
                        QuizQuestion::create([
                            'quiz_id'       => $quiz->id,
                            'question'      => $questionData['question'],
                            'options'       => $questionData['options'] ?? [],
                            'correct_answer'=> $questionData['correct_answer'],
                            'points'        => $questionData['points'] ?? 10,
                            'order_number'  => $index + 1,
                        ]);
                    }
                }
            });

            return redirect()->route('instructor.quiz-manage')->with('success', 'Quiz berhasil diupdate.');
        } catch (\Exception $e) {
            Log::error('Error updating quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengupdate quiz.');
        }
    }

    public function destroy(Quiz $quiz)
    {
        try {
            if ($quiz->attempts()->exists()) {
                return redirect()->back()->with('error', 'Quiz tidak dapat dihapus karena sudah ada mahasiswa yang mengerjakan.');
            }

            DB::transaction(function () use ($quiz) {
                $quiz->questions()->delete();
                $quiz->delete();
            });

            return redirect()->route('instructor.quiz-manage')->with('success', 'Quiz berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus quiz.');
        }
    }

    public function toggleStatus(Quiz $quiz)
    {
        try {
            $quiz->update(['is_active' => !$quiz->is_active]);
            $status = $quiz->is_active ? 'diaktifkan' : 'dinonaktifkan';

            return redirect()->route('instructor.quiz-manage')->with('success', "Quiz berhasil {$status}.");
        } catch (\Exception $e) {
            Log::error('Error toggling quiz status: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengubah status quiz.');
        }
    }

    public function results()
    {
        try {
            $results = QuizAttempt::with(['user', 'quiz.module'])
                ->orderBy('completed_at', 'desc')
                ->get()
                ->map(fn ($a) => [
                    'id'             => $a->id,
                    'studentName'    => $a->user->name ?? 'Unknown',
                    'nim'            => $a->user->nim ?? 'Unknown',
                    'quizTitle'      => $a->quiz->title ?? 'Unknown Quiz',
                    'moduleTitle'    => $a->quiz->module->title ?? 'Unknown Module',
                    'score'          => $a->quiz->total_questions > 0
                                        ? round(($a->score / $a->quiz->total_questions) * 100)
                                        : 0,
                    'rawScore'       => $a->score,
                    'totalQuestions' => $a->quiz->total_questions,
                    'pointsEarned'   => $a->points_earned ?? 0,
                    'completedAt'    => $a->completed_at ? $a->completed_at->format('Y-m-d H:i:s') : null,
                    'timeSpent'      => $this->calculateTimeSpent($a),
                    'attempts'       => QuizAttempt::where('user_id', $a->user_id)
                                                  ->where('quiz_id', $a->quiz_id)
                                                  ->count(),
                ]);

            return response()->json(['results' => $results]);
        } catch (\Exception $e) {
            Log::error('Error loading quiz results: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan saat memuat hasil quiz.'], 500);
        }
    }

    public function resultDetail(QuizAttempt $attempt)
    {
        try {
            $attempt->load(['user', 'quiz.questions']);

            $questionReviews = collect($attempt->answers)->map(function ($userAnswer, $questionId) use ($attempt) {
                $question = $attempt->quiz->questions->find($questionId);
                return [
                    'question'       => $question->question ?? 'Question not found',
                    'user_answer'    => $userAnswer,
                    'correct_answer' => $question->correct_answer ?? '',
                    'is_correct'     => $userAnswer === ($question->correct_answer ?? ''),
                    'options'        => $question->options ?? [],
                ];
            });

            return response()->json([
                'attempt' => [
                    'student_name'    => $attempt->user->name ?? 'Unknown',
                    'nim'             => $attempt->user->nim ?? 'Unknown',
                    'quiz_title'      => $attempt->quiz->title ?? 'Unknown Quiz',
                    'score'           => $attempt->score,
                    'total_questions' => $attempt->quiz->total_questions,
                    'percentage'      => $attempt->quiz->total_questions > 0
                                         ? round(($attempt->score / $attempt->quiz->total_questions) * 100)
                                         : 0,
                    'points_earned'   => $attempt->points_earned ?? 0,
                    'completed_at'    => $attempt->completed_at ? $attempt->completed_at->format('Y-m-d H:i:s') : null,
                ],
                'questions_review' => $questionReviews,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading quiz result detail: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan saat memuat detail hasil quiz.'], 500);
        }
    }

    public function analytics()
    {
        try {
            $quizzes = Quiz::with(['attempts', 'module'])->get();

            $totalAttempts = QuizAttempt::count();
            $averageScore  = QuizAttempt::avg('score');
            $passRate      = QuizAttempt::whereRaw('score / (SELECT total_questions FROM quizzes WHERE id = quiz_attempts.quiz_id) >= 0.6')->count();
            $averageTime   = 24.5; // You can implement actual time calculation

            $quizAnalytics = $quizzes->map(function ($quiz) {
                $attempts = $quiz->attempts;
                return [
                    'quiz_title'     => $quiz->title,
                    'module_title'   => $quiz->module->title ?? 'Unknown',
                    'total_attempts' => $attempts->count(),
                    'average_score'  => $attempts->count() > 0 ? round($attempts->avg('score'), 1) : 0,
                    'pass_rate'      => $attempts->count() > 0 && $quiz->total_questions > 0
                                        ? round(($attempts->where('score', '>=', $quiz->total_questions * 0.6)->count() / $attempts->count()) * 100, 1)
                                        : 0,
                    'difficulty_rating' => $this->calculateDifficultyRating($attempts, $quiz->total_questions),
                ];
            });

            return response()->json([
                'overall_stats' => [
                    'total_attempts' => $totalAttempts,
                    'average_score'  => round($averageScore ?? 0, 1),
                    'pass_rate'      => $totalAttempts > 0 ? round(($passRate / $totalAttempts) * 100, 1) : 0,
                    'average_time'   => $averageTime,
                ],
                'quiz_analytics' => $quizAnalytics,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading quiz analytics: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan saat memuat analisis quiz.'], 500);
        }
    }

    private function inferQuestionType($question)
    {
        $optionsCount = is_array($question->options) ? count($question->options) : 0;

        if ($optionsCount === 2) return 'true_false';
        if ($optionsCount > 2)  return 'multiple_choice';
        return 'essay';
    }

    private function calculateTimeSpent($attempt)
    {
        // Implement actual time calculation based on started_at and completed_at
        if ($attempt->started_at && $attempt->completed_at) {
            $diff = $attempt->completed_at->diffInMinutes($attempt->started_at);
            return $diff;
        }
        return rand(15, 30); // placeholder
    }

    private function calculateDifficultyRating($attempts, $totalQuestions)
    {
        if ($attempts->isEmpty() || $totalQuestions === 0) return 'Unknown';

        $averageScore = $attempts->avg('score');
        $percentage   = ($averageScore / $totalQuestions) * 100;

        if ($percentage >= 80) return 'Easy';
        if ($percentage >= 60) return 'Medium';
        return 'Hard';
    }
}
