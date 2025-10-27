<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Material;
use App\Models\Enrichment;
use App\Models\Assignment;
use Illuminate\Database\Seeder;

class ModuleContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedMaterials();
        $this->seedEnrichments();
        $this->seedAssignments();
    }

    private function seedMaterials()
    {
        $materials = [
            1 => [
                'title' => 'Pengenalan Pemrograman - Konsep Dasar',
                'file_path' => 'materials/Modul_01_Pengenalan_Pemrograman.pdf',
                'point_reward' => 50
            ],
            2 => [
                'title' => 'Variabel dan Tipe Data - Panduan Lengkap',
                'file_path' => 'materials/Modul_02_Variabel_Tipe_Data.pdf',
                'point_reward' => 50
            ],
            3 => [
                'title' => 'Struktur Kontrol - If Else dan Switch Case',
                'file_path' => 'materials/Modul_03_Struktur_Kontrol.pdf',
                'point_reward' => 50
            ],
            4 => [
                'title' => 'Looping - For, While, Do-While',
                'file_path' => 'materials/Modul_04_Looping.pdf',
                'point_reward' => 50
            ],
            5 => [
                'title' => 'Array - Satu dan Multidimensi',
                'file_path' => 'materials/Modul_05_Array.pdf',
                'point_reward' => 50
            ],
            6 => [
                'title' => 'Function - Konsep dan Implementasi',
                'file_path' => 'materials/Modul_06_Function.pdf',
                'point_reward' => 50
            ],
            7 => [
                'title' => 'Pointer - Memory Management',
                'file_path' => 'materials/Modul_07_Pointer.pdf',
                'point_reward' => 50
            ],
            8 => [
                'title' => 'Struktur Data - Struct dan Union',
                'file_path' => 'materials/Modul_08_Struktur_Data.pdf',
                'point_reward' => 50
            ]
        ];

        foreach ($materials as $moduleOrder => $materialData) {
            $module = Module::where('order_number', $moduleOrder)->first();
            if ($module) {
                Material::create([
                    'module_id' => $module->id,
                    'title' => $materialData['title'],
                    'file_path' => $materialData['file_path'],
                    'point_reward' => $materialData['point_reward']
                ]);
            }
        }
    }

    private function seedEnrichments()
    {
        $enrichments = [
            1 => [
                [
                    'title' => 'Introduction to Programming Concepts',
                    'description' => 'Video pengenalan konsep dasar pemrograman',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=zOjov-2OZ0E',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Programming Fundamentals - MDN Docs',
                    'description' => 'Dokumentasi lengkap tentang fundamental pemrograman',
                    'type' => 'link',
                    'url' => 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web',
                    'point_reward' => 10
                ],
                [
                    'title' => 'Algorithms and Data Structures',
                    'description' => 'Tutorial interaktif algoritma dan struktur data',
                    'type' => 'link',
                    'url' => 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
                    'point_reward' => 10
                ]
            ],
            2 => [
                [
                    'title' => 'Variables and Data Types Explained',
                    'description' => 'Video penjelasan mendalam tentang variabel dan tipe data',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=sTX0UEplF54',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Understanding Memory in Programming',
                    'description' => 'Artikel tentang bagaimana variabel disimpan dalam memory',
                    'type' => 'link',
                    'url' => 'https://www.programiz.com/c-programming/c-variables-constants',
                    'point_reward' => 10
                ]
            ],
            3 => [
                [
                    'title' => 'Control Structures Deep Dive',
                    'description' => 'Tutorial komprehensif tentang if-else dan switch-case',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=1wsaV5nVC7g',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Decision Making in C Programming',
                    'description' => 'Panduan lengkap pengambilan keputusan dalam program',
                    'type' => 'link',
                    'url' => 'https://www.tutorialspoint.com/cprogramming/c_decision_making.htm',
                    'point_reward' => 10
                ]
            ],
            4 => [
                [
                    'title' => 'Mastering Loops in Programming',
                    'description' => 'Video tutorial lengkap tentang semua jenis loop',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=WgX8e_O7eG8',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Loop Optimization Techniques',
                    'description' => 'Artikel tentang cara mengoptimalkan performa loop',
                    'type' => 'link',
                    'url' => 'https://www.geeksforgeeks.org/loops-in-c-and-cpp/',
                    'point_reward' => 10
                ],
                [
                    'title' => 'Nested Loops Explained',
                    'description' => 'Tutorial khusus tentang nested loop dan aplikasinya',
                    'type' => 'link',
                    'url' => 'https://www.programiz.com/c-programming/c-for-loop',
                    'point_reward' => 10
                ]
            ],
            5 => [
                [
                    'title' => 'Arrays in C Programming',
                    'description' => 'Video komprehensif tentang array dan implementasinya',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=55l-aZ7_F24',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Multidimensional Arrays',
                    'description' => 'Tutorial tentang array multidimensi dan penggunaannya',
                    'type' => 'link',
                    'url' => 'https://www.programiz.com/c-programming/c-multi-dimensional-arrays',
                    'point_reward' => 10
                ]
            ],
            6 => [
                [
                    'title' => 'Functions in C - Complete Guide',
                    'description' => 'Video tutorial lengkap tentang fungsi dalam pemrograman',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=qJgFF2pi4hI',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Recursion Made Easy',
                    'description' => 'Penjelasan mendalam tentang recursive function',
                    'type' => 'link',
                    'url' => 'https://www.geeksforgeeks.org/recursion/',
                    'point_reward' => 10
                ]
            ],
            7 => [
                [
                    'title' => 'Pointers Demystified',
                    'description' => 'Video penjelasan pointer yang mudah dipahami',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=Rxvv9krECNw',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Memory Management in C',
                    'description' => 'Artikel tentang dynamic memory allocation',
                    'type' => 'link',
                    'url' => 'https://www.programiz.com/c-programming/c-dynamic-memory-allocation',
                    'point_reward' => 10
                ]
            ],
            8 => [
                [
                    'title' => 'Structures and Unions in C',
                    'description' => 'Video tutorial tentang struct dan union',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=E4VjMy5Rvmc',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Advanced Data Structures',
                    'description' => 'Panduan lengkap struktur data lanjutan',
                    'type' => 'link',
                    'url' => 'https://www.geeksforgeeks.org/data-structures/',
                    'point_reward' => 10
                ]
            ]
        ];

        foreach ($enrichments as $moduleOrder => $moduleEnrichments) {
            $module = Module::where('order_number', $moduleOrder)->first();
            if ($module) {
                foreach ($moduleEnrichments as $enrichmentData) {
                    Enrichment::create([
                        'module_id' => $module->id,
                        'title' => $enrichmentData['title'],
                        'description' => $enrichmentData['description'],
                        'type' => $enrichmentData['type'],
                        'url' => $enrichmentData['url'],
                        'point_reward' => $enrichmentData['point_reward']
                    ]);
                }
            }
        }
    }

    private function seedAssignments()
    {
        $assignments = [
            1 => [
                'title' => 'Tugas Praktikum 1: Program Pertama',
                'description' => 'Buat program "Hello World" pertama Anda dan implementasi program kalkulator sederhana. Sertakan flowchart untuk program yang dibuat.',
                'point_reward_early' => 100,
                'point_reward_ontime' => 80,
                'point_reward_late' => 50,
                'deadline_days' => 14
            ],
            2 => [
                'title' => 'Tugas Praktikum 2: Implementasi Variabel dan Tipe Data',
                'description' => 'Buat program yang mendemonstrasikan penggunaan berbagai tipe data dan operasi variabel. Sertakan contoh konversi tipe data.',
                'point_reward_early' => 100,
                'point_reward_ontime' => 80,
                'point_reward_late' => 50,
                'deadline_days' => 14
            ],
            3 => [
                'title' => 'Tugas Praktikum 3: Struktur Kontrol',
                'description' => 'Implementasikan program dengan struktur kontrol if-else dan switch-case. Buat program yang mendemonstrasikan nested if.',
                'point_reward_early' => 100,
                'point_reward_ontime' => 80,
                'point_reward_late' => 50,
                'deadline_days' => 14
            ],
            4 => [
                'title' => 'Tugas Praktikum 4: Looping dan Perulangan',
                'description' => 'Buat program untuk menampilkan pola segitiga dengan loop. Implementasikan algoritma pencarian dengan iterasi dan optimasi performa loop.',
                'point_reward_early' => 120,
                'point_reward_ontime' => 100,
                'point_reward_late' => 60,
                'deadline_days' => 21
            ],
            5 => [
                'title' => 'Tugas Praktikum 5: Array dan Manipulasi Data',
                'description' => 'Implementasi berbagai algoritma sorting pada array. Buat program manipulasi array multidimensi dan optimasi pencarian dalam array.',
                'point_reward_early' => 120,
                'point_reward_ontime' => 100,
                'point_reward_late' => 60,
                'deadline_days' => 21
            ],
            6 => [
                'title' => 'Tugas Praktikum 6: Fungsi dan Prosedur',
                'description' => 'Buat library fungsi matematika dasar. Implementasi recursive function untuk faktorial dan fibonacci. Optimasi fungsi dengan parameter passing.',
                'point_reward_early' => 150,
                'point_reward_ontime' => 120,
                'point_reward_late' => 70,
                'deadline_days' => 28
            ],
            7 => [
                'title' => 'Tugas Praktikum 7: Pointer dan Memory Management',
                'description' => 'Implementasi dynamic array dengan pointer. Buat program dengan memory allocation dan debug memory leak issues.',
                'point_reward_early' => 150,
                'point_reward_ontime' => 120,
                'point_reward_late' => 70,
                'deadline_days' => 28
            ],
            8 => [
                'title' => 'Project Akhir: Aplikasi Komprehensif',
                'description' => 'Design dan implementasi aplikasi lengkap yang mengintegrasikan semua konsep yang telah dipelajari. Buat dokumentasi teknis yang komprehensif dan presentasi project.',
                'point_reward_early' => 200,
                'point_reward_ontime' => 170,
                'point_reward_late' => 100,
                'deadline_days' => 35
            ]
        ];

        foreach ($assignments as $moduleOrder => $assignmentData) {
            $module = Module::where('order_number', $moduleOrder)->first();
            if ($module) {
                Assignment::create([
                    'module_id' => $module->id,
                    'title' => $assignmentData['title'],
                    'description' => $assignmentData['description'],
                    'deadline' => now()->addDays($assignmentData['deadline_days']),
                    'point_reward_early' => $assignmentData['point_reward_early'],
                    'point_reward_ontime' => $assignmentData['point_reward_ontime'],
                    'point_reward_late' => $assignmentData['point_reward_late'],
                    'is_active' => true
                ]);
            }
        }
    }
}

// Update DatabaseSeeder.php
// database/seeders/DatabaseSeeder.php
