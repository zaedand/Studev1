<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleController extends Controller
{
    public function show($id)
    {
        // Validasi ID modul
        if (!$this->isValidModuleId($id)) {
            abort(404, 'Module not found');
        }

        $moduleData = $this->getModuleDataById($id);
        $moduleContent = $this->getModuleContentById($id);

        return Inertia::render('module/detail', [
            'moduleData' => $moduleData,
            'moduleContent' => $moduleContent,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Modul Pembelajaran', 'href' => '/dashboard'],
                ['title' => $moduleData['title'], 'href' => "/module/{$id}"],
            ]
        ]);
    }

    private function isValidModuleId($id)
    {
        return is_numeric($id) && $id >= 1 && $id <= 8;
    }

    private function getModuleDataById($id)
    {
        $modules = [
            1 => [
                'id' => 1,
                'title' => 'Pengenalan Pemrograman',
                'description' => 'Pelajari konsep dasar pemrograman, sintaks, variabel, dan struktur kontrol untuk memulai perjalanan coding Anda.',
                'color' => 'bg-blue-500',
                'progress' => 100,
                'totalLessons' => 6,
                'completedLessons' => 6,
                'estimatedTime' => '3-4 jam',
                'difficulty' => 'Beginner',
                'prerequisites' => []
            ],
            2 => [
                'id' => 2,
                'title' => 'Looping & Perulangan',
                'description' => 'Pelajari konsep perulangan dalam pemrograman menggunakan For, While, dan Do-While loops dengan berbagai contoh implementasi praktis.',
                'color' => 'bg-green-500',
                'progress' => 60,
                'totalLessons' => 8,
                'completedLessons' => 5,
                'estimatedTime' => '4-6 jam',
                'difficulty' => 'Intermediate',
                'prerequisites' => ['Pengenalan Pemrograman', 'Variabel & Operator']
            ],
            3 => [
                'id' => 3,
                'title' => 'Fungsi & Prosedur',
                'description' => 'Memahami konsep modularitas dengan fungsi dan prosedur, parameter passing, dan return values untuk kode yang efisien.',
                'color' => 'bg-purple-500',
                'progress' => 25,
                'totalLessons' => 10,
                'completedLessons' => 3,
                'estimatedTime' => '5-7 jam',
                'difficulty' => 'Intermediate',
                'prerequisites' => ['Pengenalan Pemrograman', 'Looping & Perulangan']
            ],
            4 => [
                'id' => 4,
                'title' => 'Array & String',
                'description' => 'Pelajari struktur data array dan manipulasi string untuk mengelola kumpulan data secara efektif.',
                'color' => 'bg-orange-500',
                'progress' => 0,
                'totalLessons' => 9,
                'completedLessons' => 0,
                'estimatedTime' => '4-5 jam',
                'difficulty' => 'Intermediate',
                'prerequisites' => ['Looping & Perulangan', 'Fungsi & Prosedur']
            ],
            5 => [
                'id' => 5,
                'title' => 'Pointer & Memory',
                'description' => 'Memahami konsep pointer dan manajemen memori untuk optimasi performa dan akses data langsung.',
                'color' => 'bg-red-500',
                'progress' => 0,
                'totalLessons' => 12,
                'completedLessons' => 0,
                'estimatedTime' => '6-8 jam',
                'difficulty' => 'Advanced',
                'prerequisites' => ['Array & String', 'Fungsi & Prosedur']
            ],
            6 => [
                'id' => 6,
                'title' => 'Struktur Data',
                'description' => 'Pelajari berbagai struktur data seperti linked list, stack, queue, dan tree untuk organisasi data yang efisien.',
                'color' => 'bg-indigo-500',
                'progress' => 0,
                'totalLessons' => 15,
                'completedLessons' => 0,
                'estimatedTime' => '8-10 jam',
                'difficulty' => 'Advanced',
                'prerequisites' => ['Pointer & Memory', 'Array & String']
            ],
            7 => [
                'id' => 7,
                'title' => 'File Processing',
                'description' => 'Menguasai operasi file I/O, membaca dan menulis data ke file, serta manajemen file sistem.',
                'color' => 'bg-teal-500',
                'progress' => 0,
                'totalLessons' => 7,
                'completedLessons' => 0,
                'estimatedTime' => '3-4 jam',
                'difficulty' => 'Intermediate',
                'prerequisites' => ['Struktur Data', 'Array & String']
            ],
            8 => [
                'id' => 8,
                'title' => 'Project Akhir',
                'description' => 'Aplikasikan semua konsep yang telah dipelajari dalam project komprehensif sebagai capstone experience.',
                'color' => 'bg-yellow-500',
                'progress' => 0,
                'totalLessons' => 5,
                'completedLessons' => 0,
                'estimatedTime' => '10-15 jam',
                'difficulty' => 'Expert',
                'prerequisites' => ['File Processing', 'Struktur Data', 'Pointer & Memory']
            ]
        ];

        return $modules[$id];
    }

    private function getModuleContentById($id)
    {
        // Base template untuk semua modul
        $baseContent = [
            'cp' => [
                'title' => 'Capaian Pembelajaran (CP)',
                'description' => 'Tujuan pembelajaran yang akan dicapai dalam modul ini',
                'points' => 10,
                'completed' => false,
                'content' => []
            ],
            'atp' => [
                'title' => 'Alur Tujuan Pembelajaran (ATP)',
                'description' => 'Langkah-langkah pembelajaran sistematis',
                'points' => 10,
                'completed' => false,
                'content' => []
            ],
            'materi' => [
                'title' => 'Materi PDF',
                'description' => 'Bahan bacaan utama dalam format PDF',
                'points' => 50,
                'completed' => false,
                'fileName' => '',
                'fileSize' => '2.4 MB',
                'readProgress' => 0,
                'canDownload' => false
            ],
            'pengayaan' => [
                'title' => 'Pengayaan & Sumber Lain',
                'description' => 'Video pembelajaran dan sumber tambahan',
                'points' => 30,
                'completed' => false,
                'videos' => [],
                'links' => []
            ],
            'quiz' => [
                'title' => 'Quiz',
                'description' => 'Kerjakan 10 soal untuk menguji pemahaman',
                'points' => 100,
                'completed' => false,
                'totalQuestions' => 10,
                'timeLimit' => 30,
                'attempts' => 1,
                'maxAttempts' => 3,
                'bestScore' => null
            ],
            'praktikum' => [
                'title' => 'Tugas Praktikum',
                'description' => 'Implementasi program praktis',
                'points' => 150,
                'completed' => false,
                'deadline' => '2025-09-15 23:59:00',
                'submitted' => false,
                'submissionFile' => null,
                'tasks' => []
            ]
        ];

        // Konten spesifik untuk setiap modul
        $moduleSpecificContent = $this->getSpecificContentById($id);

        // Merge base content dengan specific content
        return array_merge_recursive($baseContent, $moduleSpecificContent);
    }

    private function getSpecificContentById($id)
    {
        $contents = [
            1 => [
                'cp' => [
                    'completed' => true,
                    'content' => [
                        'Memahami konsep dasar pemrograman dan algoritma',
                        'Mengenal berbagai paradigma pemrograman',
                        'Mampu menulis pseudocode dan flowchart',
                        'Memahami sintaks dasar bahasa pemrograman',
                        'Dapat membuat program sederhana'
                    ]
                ],
                'atp' => [
                    'completed' => true,
                    'content' => [
                        'Pertemuan 1: Pengenalan konsep pemrograman',
                        'Pertemuan 2: Algoritma dan flowchart',
                        'Pertemuan 3: Sintaks dasar dan variabel',
                        'Pertemuan 4: Input/Output dan operasi dasar',
                        'Pertemuan 5: Praktik program pertama'
                    ]
                ],
                'materi' => [
                    'completed' => true,
                    'fileName' => 'Modul_01.pdf',
                    'readProgress' => 100,
                    'canDownload' => true
                ],
                'pengayaan' => [
                    'completed' => true,
                    'videos' => [
                        [
                            'id' => 1,
                            'title' => 'Introduction to Programming',
                            'platform' => 'YouTube',
                            'duration' => '20:15',
                            'thumbnail' => 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                            'watched' => true
                        ]
                    ],
                    'links' => [
                        [
                            'title' => 'Programming Fundamentals - MDN',
                            'url' => 'https://developer.mozilla.org/en-US/docs/Learn',
                            'type' => 'Documentation'
                        ]
                    ]
                ],
                'quiz' => [
                    'completed' => true,
                    'bestScore' => 85
                ],
                'praktikum' => [
                    'completed' => true,
                    'submitted' => true,
                    'submissionFile' => 'program_hello_world.pdf',
                    'tasks' => [
                        'Buat program "Hello World" pertama Anda',
                        'Implementasi program kalkulator sederhana',
                        'Buat flowchart untuk program yang dibuat'
                    ]
                ]
            ],
            2 => [
                'cp' => [
                    'content' => [
                        'Memahami konsep dasar perulangan dalam pemrograman',
                        'Mampu mengimplementasikan For Loop untuk iterasi terhitung',
                        'Menguasai While dan Do-While loop untuk iterasi kondisional',
                        'Dapat menyelesaikan masalah dengan nested loop',
                        'Memahami kapan menggunakan jenis loop yang tepat'
                    ]
                ],
                'atp' => [
                    'completed' => true,
                    'content' => [
                        'Pertemuan 1: Konsep dasar perulangan dan flowchart',
                        'Pertemuan 2: Implementasi For Loop',
                        'Pertemuan 3: While dan Do-While Loop',
                        'Pertemuan 4: Nested Loop dan optimasi',
                        'Pertemuan 5: Studi kasus dan problem solving'
                    ]
                ],
                'materi' => [
                    'fileName' => 'Modul_02.pdf',
                    'readProgress' => 65
                ],
                'pengayaan' => [
                    'videos' => [
                        [
                            'id' => 1,
                            'title' => 'For Loop Fundamentals',
                            'platform' => 'YouTube',
                            'duration' => '15:30',
                            'thumbnail' => 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                            'watched' => true
                        ],
                        [
                            'id' => 2,
                            'title' => 'While Loop Deep Dive',
                            'platform' => 'YouTube',
                            'duration' => '22:45',
                            'thumbnail' => 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                            'watched' => false
                        ]
                    ],
                    'links' => [
                        [
                            'title' => 'MDN Web Docs - Loops and iteration',
                            'url' => 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration',
                            'type' => 'Documentation'
                        ],
                        [
                            'title' => 'GeeksforGeeks - Loop Control Statements',
                            'url' => 'https://www.geeksforgeeks.org/loops-in-c-and-cpp/',
                            'type' => 'Tutorial'
                        ]
                    ]
                ],
                'praktikum' => [
                    'tasks' => [
                        'Buat program untuk menampilkan pola segitiga dengan loop',
                        'Implementasikan algoritma pencarian dengan iterasi',
                        'Optimasi performa loop untuk data besar'
                    ]
                ]
            ],
            3 => [
                'cp' => [
                    'content' => [
                        'Memahami konsep fungsi dan prosedur',
                        'Mampu membuat dan memanggil fungsi',
                        'Menguasai parameter passing by value dan reference',
                        'Memahami scope variabel dan lifetime',
                        'Dapat mengimplementasi recursive function'
                    ]
                ],
                'atp' => [
                    'content' => [
                        'Pertemuan 1: Konsep dasar fungsi dan prosedur',
                        'Pertemuan 2: Parameter dan return value',
                        'Pertemuan 3: Scope dan lifetime variabel',
                        'Pertemuan 4: Recursive function',
                        'Pertemuan 5: Function overloading dan best practices'
                    ]
                ],
                'materi' => [
                    'fileName' => 'Modul_03.pdf',
                    'readProgress' => 30
                ],
                'praktikum' => [
                    'tasks' => [
                        'Buat library fungsi matematika dasar',
                        'Implementasi recursive function untuk faktorial',
                        'Optimasi fungsi dengan parameter passing'
                    ]
                ]
            ],
            4 => [
                'cp' => [
                    'content' => [
                        'Memahami konsep array dan string',
                        'Mampu menggunakan array multidimensi',
                        'Menguasai manipulasi string',
                        'Dapat mengimplementasi algoritma sorting',
                        'Memahami string pattern matching'
                    ]
                ],
                'atp' => [
                    'content' => [
                        'Pertemuan 1: Konsep dasar array',
                        'Pertemuan 2: Array multidimensi',
                        'Pertemuan 3: String dan manipulasinya',
                        'Pertemuan 4: Sorting algorithms',
                        'Pertemuan 5: String pattern matching'
                    ]
                ],
                'materi' => [
                    'fileName' => 'Modul_04.pdf'
                ],
                'praktikum' => [
                    'tasks' => [
                        'Implementasi berbagai algoritma sorting',
                        'Buat program manipulasi string',
                        'Optimasi pencarian dalam array'
                    ]
                ]
            ],
            5 => [
                'cp' => [
                    'content' => [
                        'Memahami konsep pointer dan alamat memori',
                        'Mampu menggunakan pointer dengan array',
                        'Menguasai dynamic memory allocation',
                        'Dapat mengimplementasi linked structures',
                        'Memahami memory leak dan debugging'
                    ]
                ],
                'atp' => [
                    'content' => [
                        'Pertemuan 1: Konsep dasar pointer',
                        'Pertemuan 2: Pointer dan array',
                        'Pertemuan 3: Dynamic memory allocation',
                        'Pertemuan 4: Pointer to pointer',
                        'Pertemuan 5: Memory management dan debugging'
                    ]
                ],
                'materi' => [
                    'fileName' => 'Modul_05.pdf'
                ],
                'praktikum' => [
                    'tasks' => [
                        'Implementasi dynamic array dengan pointer',
                        'Buat program dengan memory allocation',
                        'Debug dan fix memory leak issues'
                    ]
                ]
            ],
            6 => [
                'cp' => [
                    'content' => [
                        'Memahami berbagai struktur data',
                        'Mampu mengimplementasi linked list',
                        'Menguasai stack dan queue operations',
                        'Dapat menggunakan tree dan graph',
                        'Memahami kompleksitas algoritma'
                    ]
                ],
                'atp' => [
                    'content' => [
                        'Pertemuan 1: Pengenalan struktur data',
                        'Pertemuan 2: Linked List implementation',
                        'Pertemuan 3: Stack dan Queue',
                        'Pertemuan 4: Tree structures',
                        'Pertemuan 5: Graph dan aplikasinya'
                    ]
                ],
                'materi' => [
                    'fileName' => 'Modul_06.pdf'
                ],
                'praktikum' => [
                    'tasks' => [
                        'Implementasi complete binary tree',
                        'Buat program dengan stack dan queue',
                        'Analisis kompleksitas algoritma'
                    ]
                ]
            ],
            7 => [
                'cp' => [
                    'content' => [
                        'Memahami konsep file I/O operations',
                        'Mampu membaca dan menulis file',
                        'Menguasai binary dan text file handling',
                        'Dapat mengimplementasi file indexing',
                        'Memahami error handling untuk file operations'
                    ]
                ],
                'atp' => [
                    'content' => [
                        'Pertemuan 1: Konsep dasar file processing',
                        'Pertemuan 2: Text file operations',
                        'Pertemuan 3: Binary file handling',
                        'Pertemuan 4: File indexing dan searching',
                        'Pertemuan 5: Error handling dan recovery'
                    ]
                ],
                'materi' => [
                    'fileName' => 'Modul_07.pdf'
                ],
                'praktikum' => [
                    'tasks' => [
                        'Implementasi database sederhana dengan file',
                        'Buat program backup dan recovery',
                        'Optimasi file access performance'
                    ]
                ]
            ],
            8 => [
                'cp' => [
                    'content' => [
                        'Mengintegrasikan semua konsep pembelajaran',
                        'Mampu merancang aplikasi lengkap',
                        'Menguasai project management basics',
                        'Dapat melakukan testing dan debugging',
                        'Memahami documentation dan deployment'
                    ]
                ],
                'atp' => [
                    'content' => [
                        'Pertemuan 1: Project planning dan design',
                        'Pertemuan 2: Implementation phase 1',
                        'Pertemuan 3: Implementation phase 2',
                        'Pertemuan 4: Testing dan debugging',
                        'Pertemuan 5: Documentation dan presentation'
                    ]
                ],
                'materi' => [
                    'fileName' => 'Modul_08.pdf'
                ],
                'praktikum' => [
                    'tasks' => [
                        'Design dan implementasi aplikasi lengkap',
                        'Buat dokumentasi teknis yang komprehensif',
                        'Presentasi dan demo project kepada dosen'
                    ]
                ]
            ]
        ];

        return $contents[$id] ?? [];
    }

    private function getModuleTitleById($id)
    {
        $titles = [
            1 => 'Pengenalan Pemrograman',
            2 => 'Looping & Perulangan',
            3 => 'Fungsi & Prosedur',
            4 => 'Array & String',
            5 => 'Pointer & Memory',
            6 => 'Struktur Data',
            7 => 'File Processing',
            8 => 'Project Akhir'
        ];

        return $titles[$id] ?? 'Module Not Found';
    }
}
