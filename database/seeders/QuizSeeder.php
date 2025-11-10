<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $quizData = [
            1 => [ // Pengenalan C++
                'title' => 'Quiz Pengenalan C++',
                'description' => 'Uji pemahaman Anda tentang dasar-dasar C++ dan algoritma pemrograman',
                'questions' => [
                    [
                        'question' => 'Siapa yang mengembangkan bahasa pemrograman C++?',
                        'options' => [
                            'A' => 'Dennis Ritchie',
                            'B' => 'Bjarne Stroustrup',
                            'C' => 'James Gosling',
                            'D' => 'Guido van Rossum'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
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
                        'question' => 'Header file yang benar untuk input/output dalam C++ adalah?',
                        'options' => [
                            'A' => '#include <stdio.h>',
                            'B' => '#include <iostream.h>',
                            'C' => '#include <conio.h>',
                            'D' => '#include <stdlib.h>'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Fungsi utama dalam program C++ adalah?',
                        'options' => [
                            'A' => 'start()',
                            'B' => 'begin()',
                            'C' => 'main()',
                            'D' => 'program()'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
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
                        'question' => 'Manakah yang bukan termasuk reserved word dalam C++?',
                        'options' => [
                            'A' => 'int',
                            'B' => 'float',
                            'C' => 'cout',
                            'D' => 'myVariable'
                        ],
                        'correct_answer' => 'D'
                    ],
                    [
                        'question' => 'Tanda "//" dalam C++ digunakan untuk?',
                        'options' => [
                            'A' => 'Pembagian',
                            'B' => 'Komentar satu baris',
                            'C' => 'Perkalian',
                            'D' => 'Operator logika'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            2 => [ // Operator
                'title' => 'Quiz Operator',
                'description' => 'Uji pemahaman Anda tentang berbagai jenis operator dalam C++',
                'questions' => [
                    [
                        'question' => 'Operator % digunakan untuk operasi?',
                        'options' => [
                            'A' => 'Perkalian',
                            'B' => 'Pembagian',
                            'C' => 'Sisa pembagian (modulus)',
                            'D' => 'Pangkat'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Hasil dari 10 % 3 adalah?',
                        'options' => [
                            'A' => '3',
                            'B' => '1',
                            'C' => '0',
                            'D' => '10'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Operator ++ disebut?',
                        'options' => [
                            'A' => 'Decrement',
                            'B' => 'Increment',
                            'C' => 'Assignment',
                            'D' => 'Comparison'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Apa perbedaan antara ++a dan a++?',
                        'options' => [
                            'A' => 'Tidak ada perbedaan',
                            'B' => '++a menambah sebelum digunakan, a++ menambah setelah digunakan',
                            'C' => '++a lebih cepat',
                            'D' => 'a++ tidak valid'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Operator == digunakan untuk?',
                        'options' => [
                            'A' => 'Memberikan nilai',
                            'B' => 'Membandingkan kesamaan',
                            'C' => 'Perkalian',
                            'D' => 'Pembagian'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Operator logika && berarti?',
                        'options' => [
                            'A' => 'OR',
                            'B' => 'AND',
                            'C' => 'NOT',
                            'D' => 'XOR'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Operator logika || berarti?',
                        'options' => [
                            'A' => 'AND',
                            'B' => 'OR',
                            'C' => 'NOT',
                            'D' => 'XOR'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Operator bitwise << digunakan untuk?',
                        'options' => [
                            'A' => 'Shift right',
                            'B' => 'Shift left',
                            'C' => 'AND',
                            'D' => 'OR'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Hierarki operator tertinggi adalah?',
                        'options' => [
                            'A' => 'Penjumlahan (+)',
                            'B' => 'Perkalian (*)',
                            'C' => 'Kurung ()',
                            'D' => 'Pembagian (/)'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Operator bitwise & (AND) akan bernilai 1 jika?',
                        'options' => [
                            'A' => 'Salah satu operand bernilai 1',
                            'B' => 'Semua operand bernilai 1',
                            'C' => 'Semua operand bernilai 0',
                            'D' => 'Tidak ada yang bernilai 1'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            3 => [ // Operasi Kondisi
                'title' => 'Quiz Operasi Kondisi',
                'description' => 'Uji pemahaman Anda tentang percabangan dan pengambilan keputusan',
                'questions' => [
                    [
                        'question' => 'Struktur kontrol if digunakan untuk?',
                        'options' => [
                            'A' => 'Perulangan',
                            'B' => 'Pengambilan keputusan',
                            'C' => 'Deklarasi variabel',
                            'D' => 'Input output'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Kapan blok else akan dieksekusi?',
                        'options' => [
                            'A' => 'Ketika kondisi if true',
                            'B' => 'Ketika kondisi if false',
                            'C' => 'Selalu dieksekusi',
                            'D' => 'Tidak pernah dieksekusi'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Nested if adalah?',
                        'options' => [
                            'A' => 'If yang error',
                            'B' => 'If di dalam if',
                            'C' => 'If yang sangat cepat',
                            'D' => 'If tanpa kondisi'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Switch-case digunakan sebagai alternatif dari?',
                        'options' => [
                            'A' => 'For loop',
                            'B' => 'While loop',
                            'C' => 'Multiple if-else',
                            'D' => 'Function'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Statement break dalam switch berfungsi untuk?',
                        'options' => [
                            'A' => 'Melanjutkan ke case berikutnya',
                            'B' => 'Keluar dari switch',
                            'C' => 'Mengulang switch',
                            'D' => 'Tidak ada fungsi'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Default case dalam switch dieksekusi ketika?',
                        'options' => [
                            'A' => 'Semua case cocok',
                            'B' => 'Case pertama cocok',
                            'C' => 'Tidak ada case yang cocok',
                            'D' => 'Selalu dieksekusi'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Ternary operator (?:) adalah bentuk singkat dari?',
                        'options' => [
                            'A' => 'Switch-case',
                            'B' => 'For loop',
                            'C' => 'If-else',
                            'D' => 'While loop'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Operator ! dalam kondisi berarti?',
                        'options' => [
                            'A' => 'AND',
                            'B' => 'OR',
                            'C' => 'NOT',
                            'D' => 'EQUAL'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Kondisi if dapat menggunakan tipe data?',
                        'options' => [
                            'A' => 'Hanya boolean',
                            'B' => 'Hanya integer',
                            'C' => 'Boolean atau ekspresi yang menghasilkan boolean',
                            'D' => 'Hanya string'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Switch-case dapat bekerja dengan tipe data?',
                        'options' => [
                            'A' => 'Hanya integer',
                            'B' => 'Integer dan karakter',
                            'C' => 'Hanya string',
                            'D' => 'Hanya float'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            4 => [ // Perulangan
                'title' => 'Quiz Perulangan (Looping)',
                'description' => 'Uji pemahaman Anda tentang struktur perulangan',
                'questions' => [
                    [
                        'question' => 'Manakah yang merupakan jenis loop dalam C++?',
                        'options' => [
                            'A' => 'for, while, do-while',
                            'B' => 'if, else, switch',
                            'C' => 'int, char, float',
                            'D' => 'class, object, method'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
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
                        'question' => 'Bagian mana dari for loop yang berisi kondisi?',
                        'options' => [
                            'A' => 'for(kondisi; increment; inisialisasi)',
                            'B' => 'for(inisialisasi; kondisi; increment)',
                            'C' => 'for(increment; inisialisasi; kondisi)',
                            'D' => 'for(inisialisasi; increment; kondisi)'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
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
            ],
            5 => [ // Array
                'title' => 'Quiz Array (Larik)',
                'description' => 'Uji pemahaman Anda tentang array dan manipulasi data',
                'questions' => [
                    [
                        'question' => 'Array adalah?',
                        'options' => [
                            'A' => 'Kumpulan data dengan tipe yang sama',
                            'B' => 'Satu variabel satu nilai',
                            'C' => 'Fungsi matematika',
                            'D' => 'Tipe data boolean'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Index array dimulai dari?',
                        'options' => [
                            'A' => '1',
                            'B' => '0',
                            'C' => '-1',
                            'D' => '10'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Untuk mengakses elemen ke-3 array, digunakan index?',
                        'options' => [
                            'A' => '3',
                            'B' => '2',
                            'C' => '4',
                            'D' => '1'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Array multidimensi adalah?',
                        'options' => [
                            'A' => 'Array yang rusak',
                            'B' => 'Array di dalam array',
                            'C' => 'Array yang sangat besar',
                            'D' => 'Array dengan tipe data campuran'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Cara mendeklarasikan array integer dengan 5 elemen?',
                        'options' => [
                            'A' => 'int arr(5)',
                            'B' => 'int arr[5]',
                            'C' => 'array int arr = 5',
                            'D' => 'int[5] arr'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Array dua dimensi dapat digunakan untuk merepresentasikan?',
                        'options' => [
                            'A' => 'Satu baris data',
                            'B' => 'Matrix atau tabel',
                            'C' => 'Satu nilai saja',
                            'D' => 'Boolean'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Array bounds error terjadi ketika?',
                        'options' => [
                            'A' => 'Array terlalu besar',
                            'B' => 'Mengakses index yang tidak valid',
                            'C' => 'Array kosong',
                            'D' => 'Array penuh'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Sorting array berarti?',
                        'options' => [
                            'A' => 'Menghapus elemen array',
                            'B' => 'Mengurutkan elemen array',
                            'C' => 'Mencari elemen array',
                            'D' => 'Menambah elemen array'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Untuk mengakses elemen array 2D arr[2][3], angka 2 menunjukkan?',
                        'options' => [
                            'A' => 'Kolom ke-2',
                            'B' => 'Baris ke-2',
                            'C' => 'Total elemen',
                            'D' => 'Tipe data'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Ukuran array harus ditentukan pada saat?',
                        'options' => [
                            'A' => 'Kompilasi',
                            'B' => 'Runtime',
                            'C' => 'Setelah program selesai',
                            'D' => 'Tidak perlu ditentukan'
                        ],
                        'correct_answer' => 'A'
                    ]
                ]
            ],
            6 => [ // Function
                'title' => 'Quiz Function (Fungsi)',
                'description' => 'Uji pemahaman Anda tentang fungsi dalam pemrograman',
                'questions' => [
                    [
                        'question' => 'Function adalah?',
                        'options' => [
                            'A' => 'Kumpulan statement yang dapat dipanggil',
                            'B' => 'Variabel global',
                            'C' => 'Syntax error',
                            'D' => 'Hardware komputer'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Parameter function adalah?',
                        'options' => [
                            'A' => 'Nilai yang dikembalikan function',
                            'B' => 'Input yang diberikan ke function',
                            'C' => 'Nama function',
                            'D' => 'Error function'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Return value adalah?',
                        'options' => [
                            'A' => 'Input function',
                            'B' => 'Nama function',
                            'C' => 'Nilai yang dikembalikan function',
                            'D' => 'Parameter function'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Void function berarti?',
                        'options' => [
                            'A' => 'Function yang mengembalikan nilai',
                            'B' => 'Function yang tidak mengembalikan nilai',
                            'C' => 'Function yang rusak',
                            'D' => 'Function yang lambat'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Recursion adalah?',
                        'options' => [
                            'A' => 'Function yang memanggil dirinya sendiri',
                            'B' => 'Function yang tidak ada parameter',
                            'C' => 'Function yang tidak ada return',
                            'D' => 'Function yang error'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Prototype function digunakan untuk?',
                        'options' => [
                            'A' => 'Menghapus function',
                            'B' => 'Mendeklarasikan function sebelum didefinisikan',
                            'C' => 'Memanggil function',
                            'D' => 'Menjalankan function'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Pass by value berarti?',
                        'options' => [
                            'A' => 'Mengirim alamat variabel',
                            'B' => 'Mengirim nilai variabel',
                            'C' => 'Mengirim nama variabel',
                            'D' => 'Tidak mengirim apa-apa'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Pass by reference berarti?',
                        'options' => [
                            'A' => 'Mengirim nilai variabel',
                            'B' => 'Mengirim alamat variabel',
                            'C' => 'Mengirim nama variabel',
                            'D' => 'Tidak mengirim apa-apa'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Local variable dalam function?',
                        'options' => [
                            'A' => 'Dapat diakses dari mana saja',
                            'B' => 'Hanya dapat diakses dalam function tersebut',
                            'C' => 'Tidak dapat digunakan',
                            'D' => 'Selalu bernilai 0'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Keuntungan menggunakan function adalah?',
                        'options' => [
                            'A' => 'Program lebih lambat',
                            'B' => 'Program lebih terstruktur dan mengurangi duplikasi kode',
                            'C' => 'Program lebih besar',
                            'D' => 'Program lebih sulit dibaca'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            7 => [ // Pointer
                'title' => 'Quiz Pointer',
                'description' => 'Uji pemahaman Anda tentang pointer dan memory management',
                'questions' => [
                    [
                        'question' => 'Pointer adalah?',
                        'options' => [
                            'A' => 'Variabel yang menyimpan alamat memori',
                            'B' => 'Variabel yang menyimpan nilai',
                            'C' => 'Fungsi matematika',
                            'D' => 'Tipe data boolean'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Operator & digunakan untuk?',
                        'options' => [
                            'A' => 'Mendapatkan nilai dari pointer',
                            'B' => 'Mendapatkan alamat variabel',
                            'C' => 'Penjumlahan',
                            'D' => 'Pengurangan'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Operator * pada pointer digunakan untuk?',
                        'options' => [
                            'A' => 'Mendapatkan alamat',
                            'B' => 'Mendapatkan nilai yang ditunjuk pointer',
                            'C' => 'Perkalian',
                            'D' => 'Deklarasi variabel biasa'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'NULL pointer adalah?',
                        'options' => [
                            'A' => 'Pointer yang menunjuk ke alamat 0',
                            'B' => 'Pointer yang error',
                            'C' => 'Pointer yang cepat',
                            'D' => 'Pointer yang besar'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Pointer void adalah?',
                        'options' => [
                            'A' => 'Pointer yang rusak',
                            'B' => 'Pointer yang dapat menunjuk ke sembarang tipe data',
                            'C' => 'Pointer yang kosong',
                            'D' => 'Pointer yang tidak bisa digunakan'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Dangling pointer adalah?',
                        'options' => [
                            'A' => 'Pointer yang menunjuk ke memori yang sudah dibebaskan',
                            'B' => 'Pointer yang NULL',
                            'C' => 'Pointer yang valid',
                            'D' => 'Pointer yang baru'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Pointer dan array memiliki hubungan?',
                        'options' => [
                            'A' => 'Tidak ada hubungan',
                            'B' => 'Nama array adalah pointer ke elemen pertama',
                            'C' => 'Array lebih cepat dari pointer',
                            'D' => 'Pointer tidak bisa digunakan dengan array'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Double pointer (**) adalah?',
                        'options' => [
                            'A' => 'Pointer ke pointer',
                            'B' => 'Pointer yang error',
                            'C' => 'Pointer yang ganda nilainya',
                            'D' => 'Pointer yang lambat'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Pointer arithmetic memungkinkan?',
                        'options' => [
                            'A' => 'Operasi matematika pada alamat',
                            'B' => 'Operasi logika',
                            'C' => 'Operasi string',
                            'D' => 'Operasi boolean'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Keuntungan menggunakan pointer adalah?',
                        'options' => [
                            'A' => 'Program lebih lambat',
                            'B' => 'Efisiensi memori dan akses langsung ke hardware',
                            'C' => 'Program lebih sulit',
                            'D' => 'Tidak ada keuntungan'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            8 => [ // Pengelolaan File
                'title' => 'Quiz Pengelolaan File',
                'description' => 'Uji pemahaman Anda tentang operasi file dalam C++',
                'questions' => [
                    [
                        'question' => 'Fungsi untuk membuka file dalam C++ adalah?',
                        'options' => [
                            'A' => 'openfile()',
                            'B' => 'fopen()',
                            'C' => 'file_open()',
                            'D' => 'open()'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Fungsi untuk menutup file adalah?',
                        'options' => [
                            'A' => 'closefile()',
                            'B' => 'file_close()',
                            'C' => 'fclose()',
                            'D' => 'close()'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Mode "r" dalam fopen() digunakan untuk?',
                        'options' => [
                            'A' => 'Menulis file',
                            'B' => 'Membaca file',
                            'C' => 'Menambah data',
                            'D' => 'Menghapus file'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Mode "w" dalam fopen() akan?',
                        'options' => [
                            'A' => 'Membaca file yang ada',
                            'B' => 'Membuat file baru atau menimpa file yang ada',
                            'C' => 'Menambah data ke akhir file',
                            'D' => 'Error jika file tidak ada'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Mode "a" dalam fopen() digunakan untuk?',
                        'options' => [
                            'A' => 'Membaca file',
                            'B' => 'Menulis file dari awal',
                            'C' => 'Menambah data ke akhir file',
                            'D' => 'Menghapus file'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Fungsi putc() digunakan untuk?',
                        'options' => [
                            'A' => 'Membaca karakter dari file',
                            'B' => 'Menulis karakter ke file',
                            'C' => 'Menghapus karakter',
                            'D' => 'Mencari karakter'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Fungsi getc() digunakan untuk?',
                        'options' => [
                            'A' => 'Menulis karakter ke file',
                            'B' => 'Membaca karakter dari file',
                            'C' => 'Menghapus karakter',
                            'D' => 'Menghitung karakter'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Perbedaan file teks dan file biner adalah?',
                        'options' => [
                            'A' => 'Tidak ada perbedaan',
                            'B' => 'File teks menyimpan dalam bentuk karakter, file biner dalam bentuk biner',
                            'C' => 'File teks lebih cepat',
                            'D' => 'File biner hanya untuk angka'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Fungsi feof() digunakan untuk?',
                        'options' => [
                            'A' => 'Membuka file',
                            'B' => 'Menutup file',
                            'C' => 'Mendeteksi akhir file',
                            'D' => 'Menulis ke file'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Fungsi fprintf() digunakan untuk?',
                        'options' => [
                            'A' => 'Membaca data terformat dari file',
                            'B' => 'Menulis data terformat ke file',
                            'C' => 'Menutup file',
                            'D' => 'Membuka file'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ]
        ];

        foreach ($quizData as $moduleOrder => $data) {
            $module = Module::where('order_number', $moduleOrder)->first();

            if ($module) {
                $quiz = Quiz::create([
                    'module_id' => $module->id,
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'total_questions' => count($data['questions']),
                    'point_per_question' => 10,
                    'is_active' => true,
                ]);

                foreach ($data['questions'] as $index => $questionData) {
                    QuizQuestion::create([
                        'quiz_id' => $quiz->id,
                        'question' => $questionData['question'],
                        'options' => $questionData['options'],
                        'correct_answer' => $questionData['correct_answer'],
                        'order_number' => $index + 1,
                    ]);
                }
            }
        }
    }
}
