<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
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
    // =========================================================
    // INDEX
    // =========================================================
    public function index()
    {
        try {
            $quizzes = Quiz::with(['module', 'questions'])
                ->withCount('attempts')
                ->withAvg('attempts', 'score')
                ->get()
                ->map(fn($quiz) => [
                    'id'             => $quiz->id,
                    'title'          => $quiz->title,
                    'description'    => $quiz->description,
                    'moduleId'       => (int) $quiz->module_id,
                    'moduleName'     => $quiz->module->title ?? 'Modul tidak diketahui',
                    'totalQuestions' => $quiz->questions->count(),
                    'timeLimit'      => (int) ($quiz->time_limit ?? 30),
                    'attempts'       => $quiz->attempts_count ?? 0,
                    'averageScore'   => round($quiz->attempts_avg_score ?? 0, 1),
                    'status'         => $quiz->is_active ? 'active' : 'draft',
                    'createdAt'      => $quiz->created_at->format('Y-m-d'),
                    'hasAttempts'    => ($quiz->attempts_count ?? 0) > 0,
                ]);

            $modules = Module::where('is_active', true)
                ->orderBy('order_number')
                ->get(['id', 'title']);

            return Inertia::render('Instructor/Quiz/Quiz', [
                'quizzes' => $quizzes,
                'modules' => $modules,
            ]);
        } catch (\Exception $e) {
            Log::error('Kesalahan memuat daftar quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat data quiz.');
        }
    }

    // =========================================================
    // STORE
    // =========================================================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id'   => 'required|exists:modules,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit'  => 'required|integer|min:5|max:180',
            'questions'   => 'required|string',
        ], $this->validationMessages());

        try {
            $questions = json_decode($validated['questions'], true);
            if (!is_array($questions) || empty($questions)) {
                return redirect()->back()->with('error', 'Format soal tidak valid atau soal kosong.');
            }

            DB::transaction(function () use ($validated, $questions) {
                $quiz = Quiz::create([
                    'module_id'          => $validated['module_id'],
                    'title'              => $validated['title'],
                    'description'        => $validated['description'] ?? null,
                    'total_questions'    => count($questions),
                    'time_limit'         => (int) $validated['time_limit'],
                    'point_per_question' => (int) round(collect($questions)->avg('points') ?? 10),
                    'is_active'          => false,
                ]);

                foreach ($questions as $i => $q) {
                    QuizQuestion::create([
                        'quiz_id'        => $quiz->id,
                        'question'       => $q['question'],
                        'options'        => $q['options'] ?? [],
                        'correct_answer' => $q['correct_answer'],
                        'points'         => (int) ($q['points'] ?? 10),
                        'order_number'   => $i + 1,
                    ]);
                }
            });

            return redirect()->route('instructor.quiz.index')
                ->with('success', 'Quiz berhasil dibuat.');
        } catch (\Exception $e) {
            Log::error('Kesalahan membuat quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    // =========================================================
    // SHOW — JSON untuk fetch di frontend
    // =========================================================
    public function show(Quiz $quiz)
    {
        try {
            $quiz->load(['module', 'questions' => fn($q) => $q->orderBy('order_number')]);

            return response()->json([
                'quiz' => [
                    'id'          => $quiz->id,
                    'title'       => $quiz->title,
                    'description' => $quiz->description ?? '',
                    'module_id'   => $quiz->module_id,
                    'module_name' => $quiz->module->title ?? '',
                    'time_limit'  => (int) ($quiz->time_limit ?? 30),
                    'is_active'   => $quiz->is_active,
                    'questions'   => $quiz->questions->map(fn($q) => [
                        'id'             => $q->id,
                        'question'       => $q->question,
                        'type'           => 'multiple_choice',
                        'options'        => is_array($q->options) ? $q->options : [],
                        'correct_answer' => $q->correct_answer,
                        'points'         => (int) ($q->points ?? 10),
                        'order_number'   => $q->order_number,
                    ]),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Kesalahan memuat detail quiz: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan saat memuat detail quiz.'], 500);
        }
    }

    // =========================================================
    // UPDATE
    // =========================================================
    public function update(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'module_id'   => 'required|exists:modules,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit'  => 'required|integer|min:5|max:180',
            'questions'   => 'required|string',
        ], $this->validationMessages());

        try {
            $questions   = json_decode($validated['questions'], true);
            $hasAttempts = $quiz->attempts()->exists();

            if (!is_array($questions) || empty($questions)) {
                return redirect()->back()->with('error', 'Format soal tidak valid atau soal kosong.');
            }

            DB::transaction(function () use ($validated, $questions, $quiz, $hasAttempts) {
                $data = [
                    'module_id'   => $validated['module_id'],
                    'title'       => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'time_limit'  => (int) $validated['time_limit'],
                ];

                if (!$hasAttempts) {
                    $data['total_questions']    = count($questions);
                    $data['point_per_question'] = (int) round(collect($questions)->avg('points') ?? 10);
                    $quiz->questions()->delete();
                    foreach ($questions as $i => $q) {
                        QuizQuestion::create([
                            'quiz_id'        => $quiz->id,
                            'question'       => $q['question'],
                            'options'        => $q['options'] ?? [],
                            'correct_answer' => $q['correct_answer'],
                            'points'         => (int) ($q['points'] ?? 10),
                            'order_number'   => $i + 1,
                        ]);
                    }
                }

                $quiz->update($data);
            });

            $msg = $hasAttempts
                ? 'Quiz diperbarui. Soal tidak diubah karena sudah ada mahasiswa yang mengerjakan.'
                : 'Quiz berhasil diperbarui.';

            return redirect()->route('instructor.quiz.index')->with('success', $msg);
        } catch (\Exception $e) {
            Log::error('Kesalahan memperbarui quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    // =========================================================
    // DESTROY
    // =========================================================
    public function destroy(Quiz $quiz)
    {
        try {
            if ($quiz->attempts()->exists()) {
                return redirect()->back()
                    ->with('error', 'Quiz tidak dapat dihapus karena sudah ada mahasiswa yang mengerjakan.');
            }

            // Jangan hapus satu-satunya quiz aktif di modul
            if ($quiz->is_active) {
                $activeCount = Quiz::where('module_id', $quiz->module_id)
                    ->where('is_active', true)->count();
                if ($activeCount <= 1) {
                    return redirect()->back()
                        ->with('error', 'Quiz tidak dapat dihapus karena merupakan satu-satunya quiz aktif di modul ini. Aktifkan quiz lain terlebih dahulu.');
                }
            }

            DB::transaction(function () use ($quiz) {
                $quiz->questions()->delete();
                $quiz->delete();
            });

            return redirect()->route('instructor.quiz.index')
                ->with('success', 'Quiz berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Kesalahan menghapus quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus quiz.');
        }
    }

    // =========================================================
    // TOGGLE STATUS
    //
    // Aturan bisnis:
    // 1. Tepat 1 quiz aktif per modul setiap saat.
    // 2. AKTIVASI (draft → active):
    //    - Quiz aktif saat ini otomatis dijadikan draft.
    //    - Tampilkan notif "Quiz X dinonaktifkan otomatis".
    // 3. NONAKTIVASI (active → draft):
    //    - Hanya boleh jika ada draft lain di modul yang sama.
    //    - Draft tertua otomatis diaktifkan sebagai pengganti.
    //    - Jika tidak ada draft lain → tolak dengan pesan jelas.
    //
    // FIX: Kembalikan Inertia redirect (bukan JSON) karena
    // router.patch Inertia mengharapkan Inertia response.
    // Data perubahan dikembalikan via with() flash sebagai JSON
    // agar frontend bisa update state tanpa full reload.
    // =========================================================
    public function toggleStatus(Request $request, Quiz $quiz)
    {
        try {
            $moduleId     = $quiz->module_id;
            $isCurrentlyActive = $quiz->is_active;

            DB::transaction(function () use ($quiz, $moduleId, $isCurrentlyActive, &$autoActivated, &$autoDeactivated) {
                $autoActivated   = null;
                $autoDeactivated = null;

                if (!$isCurrentlyActive) {
                    // ── AKTIVASI: draft → active ──────────────────────────
                    // Nonaktifkan quiz aktif yang sedang jalan di modul ini
                    $currentActive = Quiz::where('module_id', $moduleId)
                        ->where('is_active', true)
                        ->where('id', '!=', $quiz->id)
                        ->first();

                    if ($currentActive) {
                        $currentActive->update(['is_active' => false]);
                        $autoDeactivated = $currentActive->title;
                    }

                    $quiz->update(['is_active' => true]);

                } else {
                    // ── NONAKTIVASI: active → draft ──────────────────────
                    // Cari draft lain di modul yang sama
                    $nextDraft = Quiz::where('module_id', $moduleId)
                        ->where('is_active', false)
                        ->where('id', '!=', $quiz->id)
                        ->oldest()
                        ->first();

                    if (!$nextDraft) {
                        // Tidak ada draft pengganti — batalkan transaksi
                        throw new \RuntimeException('NO_DRAFT');
                    }

                    // Nonaktifkan yang ini, aktifkan draft tertua sebagai pengganti
                    $quiz->update(['is_active' => false]);
                    $nextDraft->update(['is_active' => true]);
                    $autoActivated = $nextDraft->title;
                }
            });

            // Susun pesan flash
            if (!$isCurrentlyActive) {
                $msg = "Quiz \"{$quiz->title}\" berhasil diaktifkan.";
                if ($autoDeactivated) {
                    $msg .= " Quiz \"{$autoDeactivated}\" otomatis dijadikan draf.";
                }
            } else {
                $msg = "Quiz \"{$quiz->title}\" dijadikan draf.";
                if (isset($autoActivated) && $autoActivated) {
                    $msg .= " Quiz \"{$autoActivated}\" otomatis diaktifkan sebagai pengganti.";
                }
            }

            // FIX: Kembalikan Inertia redirect — BUKAN response()->json()
            // Inertia membutuhkan Inertia response, bukan plain JSON.
            return redirect()->route('instructor.quiz.index')
                ->with('success', $msg);

        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'NO_DRAFT') {
                return redirect()->back()
                    ->with('error', "Quiz \"{$quiz->title}\" tidak dapat dinonaktifkan karena tidak ada quiz draf lain di modul ini. Buat atau aktifkan quiz lain terlebih dahulu.");
            }
            Log::error('Kesalahan toggle status quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengubah status quiz.');
        } catch (\Exception $e) {
            Log::error('Kesalahan toggle status quiz: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengubah status quiz.');
        }
    }

    // =========================================================
    // RESULTS
    // =========================================================
    public function results(Request $request)
    {
        try {
            $query = QuizAttempt::with(['user', 'quiz.module'])
                ->orderBy('completed_at', 'desc');

            if ($request->filled('quiz_id')) {
                $query->where('quiz_id', $request->quiz_id);
            }

            $results = $query->get()->map(function ($a) {
                $pct = $a->quiz->total_questions > 0
                    ? round(($a->score / $a->quiz->total_questions) * 100) : 0;

                $totalAttempts = QuizAttempt::where('user_id', $a->user_id)
                    ->where('quiz_id', $a->quiz_id)->count();

                return [
                    'id'             => $a->id,
                    'studentName'    => $a->user->name           ?? 'Tidak diketahui',
                    'nim'            => $a->user->nim             ?? '—',
                    'quizId'         => $a->quiz_id,
                    'quizTitle'      => $a->quiz->title           ?? '—',
                    'moduleTitle'    => $a->quiz->module->title   ?? '—',
                    'score'          => $pct,
                    'rawScore'       => $a->score,
                    'totalQuestions' => $a->quiz->total_questions,
                    'pointsEarned'   => $a->points_earned         ?? 0,
                    'completedAt'    => $a->completed_at?->format('Y-m-d H:i:s'),
                    'attemptNumber'  => $a->attempt_number        ?? 1,
                    'attempts'       => $totalAttempts,
                ];
            });

            return response()->json(['results' => $results]);
        } catch (\Exception $e) {
            Log::error('Kesalahan memuat hasil quiz: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan saat memuat hasil quiz.'], 500);
        }
    }

    // =========================================================
    // RESULT DETAIL
    // =========================================================
    public function resultDetail(QuizAttempt $attempt)
    {
        try {
            $attempt->load(['user', 'quiz.questions']);
            $answers = is_array($attempt->answers) ? $attempt->answers : [];

            $review = collect($answers)->map(function ($userAnswer, $questionId) use ($attempt) {
                $q = $attempt->quiz->questions->find($questionId);
                return [
                    'question'       => $q->question       ?? 'Soal tidak ditemukan',
                    'user_answer'    => $userAnswer,
                    'correct_answer' => $q->correct_answer ?? '',
                    'is_correct'     => $userAnswer === ($q->correct_answer ?? ''),
                    'options'        => $q->options         ?? [],
                ];
            });

            $pct = $attempt->quiz->total_questions > 0
                ? round(($attempt->score / $attempt->quiz->total_questions) * 100) : 0;

            return response()->json([
                'attempt' => [
                    'student_name'    => $attempt->user->name         ?? 'Tidak diketahui',
                    'nim'             => $attempt->user->nim           ?? '—',
                    'quiz_title'      => $attempt->quiz->title         ?? '—',
                    'score'           => $attempt->score,
                    'total_questions' => $attempt->quiz->total_questions,
                    'percentage'      => $pct,
                    'points_earned'   => $attempt->points_earned       ?? 0,
                    'attempt_number'  => $attempt->attempt_number      ?? 1,
                    'completed_at'    => $attempt->completed_at?->format('Y-m-d H:i:s'),
                ],
                'questions_review' => $review,
            ]);
        } catch (\Exception $e) {
            Log::error('Kesalahan memuat detail hasil: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan saat memuat detail hasil.'], 500);
        }
    }

    // =========================================================
    // ANALYTICS
    // =========================================================
    public function analytics()
    {
        try {
            $totalAttempts = QuizAttempt::count();

            $avgScorePct = QuizAttempt::join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
                ->selectRaw('AVG(quiz_attempts.score / NULLIF(quizzes.total_questions, 0) * 100) as avg_pct')
                ->value('avg_pct');

            $passed = QuizAttempt::join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
                ->whereRaw('quiz_attempts.score / NULLIF(quizzes.total_questions, 0) >= 0.6')
                ->count();

            $quizAnalytics = Quiz::with(['attempts', 'module'])->get()->map(function ($quiz) {
                $attempts  = $quiz->attempts;
                $total     = $attempts->count();
                $avgRaw    = $total > 0 ? $attempts->avg('score') : 0;
                $avgPct    = $quiz->total_questions > 0
                    ? round(($avgRaw / $quiz->total_questions) * 100, 1) : 0;
                $passCount = $attempts->filter(fn($a) =>
                    $quiz->total_questions > 0 && ($a->score / $quiz->total_questions) >= 0.6
                )->count();

                return [
                    'quiz_title'        => $quiz->title,
                    'module_title'      => $quiz->module->title ?? '—',
                    'total_attempts'    => $total,
                    'average_score'     => $avgPct,
                    'pass_rate'         => $total > 0 ? round(($passCount / $total) * 100, 1) : 0,
                    'difficulty_rating' => $avgPct >= 80 ? 'Easy' : ($avgPct >= 60 ? 'Medium' : 'Hard'),
                ];
            });

            return response()->json([
                'overall_stats' => [
                    'total_attempts' => $totalAttempts,
                    'average_score'  => round($avgScorePct ?? 0, 1),
                    'pass_rate'      => $totalAttempts > 0
                        ? round(($passed / $totalAttempts) * 100, 1) : 0,
                    'average_time'   => 0,
                ],
                'quiz_analytics' => $quizAnalytics,
            ]);
        } catch (\Exception $e) {
            Log::error('Kesalahan memuat analitik quiz: ' . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan saat memuat analitik.'], 500);
        }
    }

    // =========================================================
    // Helpers
    // =========================================================
    private function validationMessages(): array
    {
        return [
            'module_id.required'  => 'Modul harus dipilih.',
            'module_id.exists'    => 'Modul tidak ditemukan.',
            'title.required'      => 'Judul quiz tidak boleh kosong.',
            'time_limit.required' => 'Waktu pengerjaan harus diisi.',
            'time_limit.min'      => 'Waktu pengerjaan minimal 5 menit.',
            'time_limit.max'      => 'Waktu pengerjaan maksimal 180 menit.',
            'questions.required'  => 'Minimal satu soal harus ditambahkan.',
        ];
    }
}
