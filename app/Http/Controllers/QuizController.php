<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizController extends Controller
{
    // GET /module/{moduleId}/quiz - Show quiz interface
    public function show($moduleId)
    {
        $module = $this->getModuleData($moduleId);

        if (!$module) {
            return redirect()->back()->with('error', 'Module not found');
        }

        $quiz = $this->getQuizData($moduleId);
        $userAttempts = $this->getUserAttempts($moduleId);

        // Fixed: Use correct component path - match your file structure
        return Inertia::render('Quiz/Show', [
            'module' => $module,
            'quiz' => $quiz,
            'userAttempts' => $userAttempts,
        ]);
    }

    // POST /module/{moduleId}/quiz/start - Start quiz session
    public function start(Request $request, $moduleId)
    {
        $module = $this->getModuleData($moduleId);

        if (!$module) {
            return redirect()->back()->with('error', 'Module not found');
        }

        $questions = $this->getQuizQuestions($moduleId);

        // Create quiz session
        $quizSession = [
            'session_id' => uniqid('quiz_'),
            'module_id' => $moduleId,
            'started_at' => now()->toDateTimeString(),
            'time_limit' => $questions['time_limit'],
            'total_questions' => count($questions['questions'])
        ];

        // Store session
        $request->session()->put('quiz_session', $quizSession);

        // Fixed: Return Inertia response instead of mixed response
        return Inertia::render('Quiz/Interface', [
            'module' => $module,
            'questions' => $questions['questions'],
            'quizConfig' => [
                'time_limit' => $questions['time_limit'],
                'total_questions' => count($questions['questions']),
                'session_id' => $quizSession['session_id']
            ]
        ]);
    }

    // POST /module/{moduleId}/quiz/submit - Submit quiz answers
    public function submit(Request $request, $moduleId)
    {
        try {
            $request->validate([
                'session_id' => 'required|string',
                'answers' => 'required|array',
                'time_taken' => 'required|integer'
            ]);

            // Check if quiz session exists
            $quizSession = $request->session()->get('quiz_session');
            if (!$quizSession || $quizSession['session_id'] !== $request->input('session_id')) {
                return redirect()->back()->with('error', 'Invalid quiz session');
            }

            $module = $this->getModuleData($moduleId);
            if (!$module) {
                return redirect()->back()->with('error', 'Module not found');
            }

            $answers = $request->input('answers');
            $timeTaken = $request->input('time_taken');

            // Get correct answers
            $questions = $this->getQuizQuestions($moduleId);
            $correctAnswers = collect($questions['questions'])->pluck('correct_answer', 'id')->toArray();

            // Calculate score
            $result = $this->calculateScore($answers, $correctAnswers);

            // Save result
            $submission = [
                'module_id' => $moduleId,
                'user_id' => auth()->id(),
                'answers' => $answers,
                'score' => $result['score'],
                'correct_count' => $result['correct_count'],
                'total_questions' => $result['total_questions'],
                'time_taken' => $timeTaken,
                'submitted_at' => now()->toDateTimeString()
            ];

            // Clear quiz session
            $request->session()->forget('quiz_session');

            // Fixed: Return Inertia response for result page
            return Inertia::render('Quiz/Result', [
                'module' => $module,
                'result' => $result,
                'submission' => $submission,
                'questions_review' => $this->getQuestionsWithAnswers($moduleId, $answers)
            ]);

        } catch (\Exception $e) {
            \Log::error('Quiz submission error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Something went wrong while submitting quiz');
        }
    }

    // Private methods untuk data dummy
    private function getModuleData($moduleId)
    {
        $modules = [
            1 => ['id' => 1, 'title' => 'Pengenalan Pemrograman', 'color' => 'bg-blue-500'],
            2 => ['id' => 2, 'title' => 'Looping & Perulangan', 'color' => 'bg-green-500'],
            3 => ['id' => 3, 'title' => 'Fungsi & Prosedur', 'color' => 'bg-purple-500'],
            4 => ['id' => 4, 'title' => 'Array & String', 'color' => 'bg-orange-500'],
            5 => ['id' => 5, 'title' => 'Pointer & Memory', 'color' => 'bg-red-500'],
            6 => ['id' => 6, 'title' => 'Struktur Data', 'color' => 'bg-indigo-500'],
            7 => ['id' => 7, 'title' => 'File Processing', 'color' => 'bg-pink-500'],
            8 => ['id' => 8, 'title' => 'Project Akhir', 'color' => 'bg-yellow-500']
        ];

        return $modules[$moduleId] ?? null;
    }

    private function getQuizData($moduleId)
    {
        $module = $this->getModuleData($moduleId);

        return [
            'title' => "Quiz " . ($module['title'] ?? 'Unknown Module'),
            'description' => 'Uji pemahaman Anda dengan 10 soal pilihan ganda',
            'total_questions' => 10,
            'time_limit' => 30, // minutes
            'max_attempts' => 3,
            'points_per_question' => 10
        ];
    }

    private function getUserAttempts($moduleId)
    {
        // Dummy data - nanti dari database
        return [
            'attempts_used' => 1,
            'max_attempts' => 3,
            'best_score' => 80,
            'last_attempt_date' => '2025-09-10 14:30:00'
        ];
    }

    private function getQuizQuestions($moduleId)
    {
        // Data soal berbeda per modul
        $questionsData = [
            1 => [ // Pengenalan Pemrograman
                'time_limit' => 30,
                'questions' => [
                    [
                        'id' => 1,
                        'question' => 'Apa yang dimaksud dengan algoritma dalam pemrograman?',
                        'options' => [
                            'A' => 'Bahasa pemrograman yang digunakan',
                            'B' => 'Langkah-langkah sistematis untuk menyelesaikan masalah',
                            'C' => 'Software untuk membuat program',
                            'D' => 'Hardware komputer yang digunakan'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 2,
                        'question' => 'Manakah yang merupakan struktur data dasar?',
                        'options' => [
                            'A' => 'HTML',
                            'B' => 'CSS',
                            'C' => 'Array',
                            'D' => 'JavaScript'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'id' => 3,
                        'question' => 'Apa fungsi dari compiler?',
                        'options' => [
                            'A' => 'Menjalankan program',
                            'B' => 'Menerjemahkan kode sumber ke kode mesin',
                            'C' => 'Mendesain interface',
                            'D' => 'Menyimpan data'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 4,
                        'question' => 'Variabel dalam pemrograman digunakan untuk?',
                        'options' => [
                            'A' => 'Menyimpan nilai atau data',
                            'B' => 'Menjalankan program',
                            'C' => 'Membuat tampilan',
                            'D' => 'Mengatur hardware'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'id' => 5,
                        'question' => 'Apa yang dimaksud dengan syntax error?',
                        'options' => [
                            'A' => 'Error dalam logic program',
                            'B' => 'Error karena salah penulisan kode',
                            'C' => 'Error karena hardware rusak',
                            'D' => 'Error karena internet lambat'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 6,
                        'question' => 'Flowchart digunakan untuk?',
                        'options' => [
                            'A' => 'Membuat database',
                            'B' => 'Menggambar alur program',
                            'C' => 'Mendesain tampilan',
                            'D' => 'Mengatur network'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 7,
                        'question' => 'Pseudocode adalah?',
                        'options' => [
                            'A' => 'Bahasa pemrograman baru',
                            'B' => 'Kode palsu atau virus',
                            'C' => 'Penulisan algoritma dengan bahasa manusia',
                            'D' => 'Software development tool'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'id' => 8,
                        'question' => 'IDE singkatan dari?',
                        'options' => [
                            'A' => 'Internet Development Environment',
                            'B' => 'Integrated Development Environment',
                            'C' => 'Internal Database Engine',
                            'D' => 'Interactive Design Editor'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 9,
                        'question' => 'Manakah yang bukan termasuk tipe data dasar?',
                        'options' => [
                            'A' => 'Integer',
                            'B' => 'String',
                            'C' => 'Boolean',
                            'D' => 'HTML'
                        ],
                        'correct_answer' => 'D'
                    ],
                    [
                        'id' => 10,
                        'question' => 'Debugging adalah proses untuk?',
                        'options' => [
                            'A' => 'Membuat program baru',
                            'B' => 'Mencari dan memperbaiki error',
                            'C' => 'Menginstall software',
                            'D' => 'Mendesain interface'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            2 => [ // Looping & Perulangan
                'time_limit' => 30,
                'questions' => [
                    [
                        'id' => 1,
                        'question' => 'Manakah yang merupakan jenis loop dalam pemrograman?',
                        'options' => [
                            'A' => 'for, while, do-while',
                            'B' => 'if, else, switch',
                            'C' => 'int, char, float',
                            'D' => 'class, object, method'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'id' => 2,
                        'question' => 'Kapan while loop akan berhenti?',
                        'options' => [
                            'A' => 'Ketika kondisi true',
                            'B' => 'Ketika kondisi false',
                            'C' => 'Setelah 10 kali iterasi',
                            'D' => 'Tidak pernah berhenti'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 3,
                        'question' => 'Perbedaan utama while dan do-while loop?',
                        'options' => [
                            'A' => 'Tidak ada perbedaan',
                            'B' => 'do-while lebih cepat',
                            'C' => 'do-while minimal dieksekusi sekali',
                            'D' => 'while untuk angka, do-while untuk string'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'id' => 4,
                        'question' => 'For loop biasanya digunakan untuk?',
                        'options' => [
                            'A' => 'Iterasi dengan jumlah yang sudah diketahui',
                            'B' => 'Kondisi yang tidak pasti',
                            'C' => 'Input dari user',
                            'D' => 'Koneksi database'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'id' => 5,
                        'question' => 'Apa fungsi statement "break" dalam loop?',
                        'options' => [
                            'A' => 'Melanjutkan iterasi berikutnya',
                            'B' => 'Menghentikan loop sepenuhnya',
                            'C' => 'Mengulang dari awal',
                            'D' => 'Tidak ada fungsi'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 6,
                        'question' => 'Apa fungsi statement "continue" dalam loop?',
                        'options' => [
                            'A' => 'Menghentikan loop',
                            'B' => 'Mengulang dari awal',
                            'C' => 'Melompat ke iterasi berikutnya',
                            'D' => 'Keluar dari program'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'id' => 7,
                        'question' => 'Nested loop adalah?',
                        'options' => [
                            'A' => 'Loop yang error',
                            'B' => 'Loop di dalam loop',
                            'C' => 'Loop yang sangat cepat',
                            'D' => 'Loop tanpa kondisi'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 8,
                        'question' => 'Infinite loop terjadi ketika?',
                        'options' => [
                            'A' => 'Kondisi loop selalu true',
                            'B' => 'Kondisi loop selalu false',
                            'C' => 'Loop terlalu cepat',
                            'D' => 'Komputer terlalu lambat'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'id' => 9,
                        'question' => 'Manakah syntax for loop yang benar dalam C++?',
                        'options' => [
                            'A' => 'for i = 1 to 10',
                            'B' => 'for (int i=1; i<=10; i++)',
                            'C' => 'for i in range(10)',
                            'D' => 'for each i in array'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'id' => 10,
                        'question' => 'Loop counter adalah?',
                        'options' => [
                            'A' => 'Variabel yang menghitung iterasi',
                            'B' => 'Fungsi untuk menghentikan loop',
                            'C' => 'Error dalam loop',
                            'D' => 'Hardware komputer'
                        ],
                        'correct_answer' => 'A'
                    ]
                ]
            ]
        ];

        return $questionsData[$moduleId] ?? [
            'time_limit' => 30,
            'questions' => [
                [
                    'id' => 1,
                    'question' => 'Soal untuk modul ' . $moduleId . ' belum tersedia. Ini adalah soal dummy.',
                    'options' => [
                        'A' => 'Opsi A',
                        'B' => 'Opsi B',
                        'C' => 'Opsi C',
                        'D' => 'Opsi D'
                    ],
                    'correct_answer' => 'A'
                ]
            ]
        ];
    }

    private function calculateScore($userAnswers, $correctAnswers)
    {
        $correctCount = 0;
        $totalQuestions = count($correctAnswers);

        foreach ($correctAnswers as $questionId => $correctAnswer) {
            if (isset($userAnswers[$questionId]) && $userAnswers[$questionId] === $correctAnswer) {
                $correctCount++;
            }
        }

        $score = round(($correctCount / $totalQuestions) * 100);

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

    private function getQuestionsWithAnswers($moduleId, $userAnswers)
    {
        $questions = $this->getQuizQuestions($moduleId)['questions'];

        return collect($questions)->map(function ($question) use ($userAnswers) {
            return [
                'id' => $question['id'],
                'question' => $question['question'],
                'options' => $question['options'],
                'correct_answer' => $question['correct_answer'],
                'user_answer' => $userAnswers[$question['id']] ?? null,
                'is_correct' => ($userAnswers[$question['id']] ?? null) === $question['correct_answer']
            ];
        });
    }
}
