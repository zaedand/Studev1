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
                'title' => 'Pengenalan C++ - Konsep Dasar',
                'file_path' => 'materials/Modul_01_Pengenalan_C++.pdf',
                'point_reward' => 50
            ],
            2 => [
                'title' => 'Operator - Panduan Lengkap',
                'file_path' => 'materials/Modul_02_Operator.pdf',
                'point_reward' => 50
            ],
            3 => [
                'title' => 'Operasi Kondisi - If Else dan Switch Case',
                'file_path' => 'materials/Modul_03_Operasi_Kondisi.pdf',
                'point_reward' => 50
            ],
            4 => [
                'title' => 'Perulangan - For, While, Do-While',
                'file_path' => 'materials/Modul_04_Perulangan.pdf',
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
                'title' => 'Pengelolaan File - File Teks dan Biner',
                'file_path' => 'materials/Modul_08_Pengelolaan_File.pdf',
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
            1 => [ // Pengenalan C++
                [
                    'title' => 'Introduction to C++ Programming',
                    'description' => 'Video pengenalan bahasa C++ dan sejarahnya',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
                    'point_reward' => 15
                ],
                [
                    'title' => 'C++ Tutorial for Beginners - Learn C++ in 1 Hour',
                    'description' => 'Tutorial komprehensif C++ untuk pemula',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=ZzaPdXTrSb8',
                    'point_reward' => 15
                ],
                [
                    'title' => 'C++ Documentation - cplusplus.com',
                    'description' => 'Dokumentasi lengkap bahasa C++',
                    'type' => 'link',
                    'url' => 'https://cplusplus.com/doc/tutorial/',
                    'point_reward' => 10
                ]
            ],
            2 => [ // Operator
                [
                    'title' => 'C++ Operators Explained',
                    'description' => 'Video penjelasan lengkap tentang operator dalam C++',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=sTX0UEplF54',
                    'point_reward' => 15
                ],
                [
                    'title' => 'C++ Operators - GeeksforGeeks',
                    'description' => 'Artikel lengkap tentang berbagai jenis operator',
                    'type' => 'link',
                    'url' => 'https://www.geeksforgeeks.org/operators-in-cpp/',
                    'point_reward' => 10
                ],
                [
                    'title' => 'Bitwise Operators in C++',
                    'description' => 'Tutorial khusus operator bitwise',
                    'type' => 'link',
                    'url' => 'https://www.programiz.com/cpp-programming/bitwise-operators',
                    'point_reward' => 10
                ]
            ],
            3 => [ // Operasi Kondisi
                [
                    'title' => 'C++ If Else Statements',
                    'description' => 'Tutorial tentang penggunaan if-else dalam C++',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=1wsaV5nVC7g',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Switch Case in C++',
                    'description' => 'Penjelasan lengkap tentang switch-case',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=aQKd7S0vQlY',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Decision Making in C++ - Tutorialspoint',
                    'description' => 'Panduan lengkap pengambilan keputusan',
                    'type' => 'link',
                    'url' => 'https://www.tutorialspoint.com/cplusplus/cpp_decision_making.htm',
                    'point_reward' => 10
                ]
            ],
            4 => [ // Perulangan
                [
                    'title' => 'C++ Loops (for, while, do-while)',
                    'description' => 'Video tutorial lengkap tentang semua jenis loop',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=WgX8e_O7eG8',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Nested Loops in C++',
                    'description' => 'Tutorial khusus tentang nested loop',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=H7frvcAHXps',
                    'point_reward' => 15
                ],
                [
                    'title' => 'C++ Loops - GeeksforGeeks',
                    'description' => 'Artikel lengkap tentang perulangan',
                    'type' => 'link',
                    'url' => 'https://www.geeksforgeeks.org/loops-in-cpp/',
                    'point_reward' => 10
                ]
            ],
            5 => [ // Array
                [
                    'title' => 'Arrays in C++',
                    'description' => 'Video komprehensif tentang array dan implementasinya',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=55l-aZ7_F24',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Multidimensional Arrays in C++',
                    'description' => 'Tutorial tentang array multidimensi',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=_8S5EGyQNOY',
                    'point_reward' => 15
                ],
                [
                    'title' => 'C++ Arrays - Programiz',
                    'description' => 'Panduan lengkap array dalam C++',
                    'type' => 'link',
                    'url' => 'https://www.programiz.com/cpp-programming/arrays',
                    'point_reward' => 10
                ]
            ],
            6 => [ // Function
                [
                    'title' => 'Functions in C++',
                    'description' => 'Video tutorial lengkap tentang fungsi',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=qJgFF2pi4hI',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Recursion in C++',
                    'description' => 'Penjelasan mendalam tentang recursive function',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=kepBmgvWNDw',
                    'point_reward' => 15
                ],
                [
                    'title' => 'C++ Functions - GeeksforGeeks',
                    'description' => 'Artikel lengkap tentang fungsi',
                    'type' => 'link',
                    'url' => 'https://www.geeksforgeeks.org/functions-in-cpp/',
                    'point_reward' => 10
                ]
            ],
            7 => [ // Pointer
                [
                    'title' => 'Pointers in C++',
                    'description' => 'Video penjelasan pointer yang mudah dipahami',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=Rxvv9krECNw',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Pointer and Arrays in C++',
                    'description' => 'Hubungan antara pointer dan array',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=CSVRA4_xOkw',
                    'point_reward' => 15
                ],
                [
                    'title' => 'C++ Pointers - Programiz',
                    'description' => 'Tutorial lengkap pointer',
                    'type' => 'link',
                    'url' => 'https://www.programiz.com/cpp-programming/pointers',
                    'point_reward' => 10
                ]
            ],
            8 => [ // Pengelolaan File
                [
                    'title' => 'File Handling in C++',
                    'description' => 'Video tutorial tentang pengelolaan file',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=EaHFhms_Shw',
                    'point_reward' => 15
                ],
                [
                    'title' => 'Reading and Writing Files in C++',
                    'description' => 'Tutorial membaca dan menulis file',
                    'type' => 'video',
                    'url' => 'https://www.youtube.com/watch?v=TzKB3bhatyA',
                    'point_reward' => 15
                ],
                [
                    'title' => 'C++ Files and Streams',
                    'description' => 'Dokumentasi lengkap file handling',
                    'type' => 'link',
                    'url' => 'https://www.tutorialspoint.com/cplusplus/cpp_files_streams.htm',
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
                'title' => 'Tugas Praktikum 1: Program Pertama dengan C++',
                'description' => 'Buat program "Hello World" pertama Anda dan implementasi program konversi suhu sederhana dari Celcius ke Fahrenheit, Kelvin dan Reamur. Sertakan flowchart untuk program yang dibuat.',
                'point_reward_early' => 100,
                'point_reward_ontime' => 80,
                'point_reward_late' => 50,
                'deadline_days' => 14
            ],
            2 => [
                'title' => 'Tugas Praktikum 2: Implementasi Operator',
                'description' => 'Buat program yang mendemonstrasikan penggunaan berbagai operator (aritmatika, relasi, logika, dan bitwise). Implementasikan program dengan hierarki operator yang benar.',
                'point_reward_early' => 100,
                'point_reward_ontime' => 80,
                'point_reward_late' => 50,
                'deadline_days' => 14
            ],
            3 => [
                'title' => 'Tugas Praktikum 3: Percabangan dan Pengambilan Keputusan',
                'description' => 'Implementasikan program dengan struktur kontrol if-else dan switch-case. Buat program untuk menghitung nilai akhir mahasiswa dengan konversi nilai huruf dan motivasi.',
                'point_reward_early' => 100,
                'point_reward_ontime' => 80,
                'point_reward_late' => 50,
                'deadline_days' => 14
            ],
            4 => [
                'title' => 'Tugas Praktikum 4: Perulangan dan Pattern',
                'description' => 'Buat program untuk menampilkan pola segitiga dan kombinasi nCr dengan menggunakan perulangan. Implementasikan program untuk menampilkan konversi suhu dalam bentuk tabel menggunakan loop.',
                'point_reward_early' => 120,
                'point_reward_ontime' => 100,
                'point_reward_late' => 60,
                'deadline_days' => 21
            ],
            5 => [
                'title' => 'Tugas Praktikum 5: Array dan Manipulasi Data',
                'description' => 'Implementasi program untuk membalik kata, menganalisa kalimat (vokal, konsonan), dan menampilkan bilangan Fibonacci. Gunakan array satu dan multidimensi.',
                'point_reward_early' => 120,
                'point_reward_ontime' => 100,
                'point_reward_late' => 60,
                'deadline_days' => 21
            ],
            6 => [
                'title' => 'Tugas Praktikum 6: Fungsi dan Rekursi',
                'description' => 'Buat library fungsi matematika untuk kombinasi dan permutasi. Implementasi recursive function untuk faktorial dan fibonacci. Buat fungsi untuk menghitung rata-rata dan standar deviasi.',
                'point_reward_early' => 150,
                'point_reward_ontime' => 120,
                'point_reward_late' => 70,
                'deadline_days' => 28
            ],
            7 => [
                'title' => 'Tugas Praktikum 7: Pointer dan Memory Management',
                'description' => 'Implementasi pointer untuk membalik kata dalam kalimat. Buat function dengan pointer sebagai parameter. Demonstrasikan perbedaan pass by value dan pass by reference menggunakan pointer.',
                'point_reward_early' => 150,
                'point_reward_ontime' => 120,
                'point_reward_late' => 70,
                'deadline_days' => 28
            ],
            8 => [
                'title' => 'Tugas Praktikum 8: Aplikasi Pengelolaan File',
                'description' => 'Design dan implementasi aplikasi lengkap yang mengintegrasikan file handling dengan semua konsep yang telah dipelajari (operator, kondisi, loop, array, function, pointer). Buat program untuk mengelola data mahasiswa dengan file sebagai database. Sertakan dokumentasi teknis yang komprehensif.',
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
