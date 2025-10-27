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
            1 => [ // Pengenalan Pemrograman
                'title' => 'Quiz Pengenalan Pemrograman',
                'description' => 'Uji pemahaman Anda tentang konsep dasar pemrograman',
                'questions' => [
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
            2 => [ // Variabel dan Tipe Data (Update dari Looping)
                'title' => 'Quiz Variabel dan Tipe Data',
                'description' => 'Uji pemahaman Anda tentang variabel dan tipe data',
                'questions' => [
                    [
                        'question' => 'Apa yang dimaksud dengan variabel dalam pemrograman?',
                        'options' => [
                            'A' => 'Nilai yang selalu tetap',
                            'B' => 'Tempat penyimpanan data yang dapat berubah',
                            'C' => 'Fungsi matematika',
                            'D' => 'Program kecil'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Manakah yang merupakan tipe data numerik?',
                        'options' => [
                            'A' => 'String',
                            'B' => 'Boolean',
                            'C' => 'Integer',
                            'D' => 'Char'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Tipe data boolean dapat menyimpan nilai?',
                        'options' => [
                            'A' => 'Angka bulat',
                            'B' => 'Huruf',
                            'C' => 'True atau False',
                            'D' => 'Desimal'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'String digunakan untuk menyimpan?',
                        'options' => [
                            'A' => 'Angka',
                            'B' => 'Karakter atau teks',
                            'C' => 'True/False',
                            'D' => 'Gambar'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Apa perbedaan int dan float?',
                        'options' => [
                            'A' => 'Tidak ada perbedaan',
                            'B' => 'Int untuk bilangan bulat, float untuk desimal',
                            'C' => 'Float lebih cepat',
                            'D' => 'Int hanya untuk angka positif'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Konstanta adalah?',
                        'options' => [
                            'A' => 'Variabel yang dapat berubah',
                            'B' => 'Nilai yang tetap tidak berubah',
                            'C' => 'Fungsi matematika',
                            'D' => 'Tipe data khusus'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Scope variabel menentukan?',
                        'options' => [
                            'A' => 'Tipe data variabel',
                            'B' => 'Nilai variabel',
                            'C' => 'Area dimana variabel dapat diakses',
                            'D' => 'Kecepatan akses variabel'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Deklarasi variabel adalah?',
                        'options' => [
                            'A' => 'Menghapus variabel',
                            'B' => 'Memberikan nilai pada variabel',
                            'C' => 'Mendefinisikan nama dan tipe variabel',
                            'D' => 'Mencetak variabel'
                        ],
                        'correct_answer' => 'C'
                    ],
                    [
                        'question' => 'Inisialisasi variabel adalah?',
                        'options' => [
                            'A' => 'Mendeklarasikan variabel',
                            'B' => 'Memberikan nilai awal pada variabel',
                            'C' => 'Menghapus variabel',
                            'D' => 'Mengubah tipe variabel'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Array adalah?',
                        'options' => [
                            'A' => 'Satu variabel untuk satu nilai',
                            'B' => 'Kumpulan variabel dengan tipe yang sama',
                            'C' => 'Fungsi matematika',
                            'D' => 'Tipe data boolean'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            3 => [ // Struktur Kontrol
                'title' => 'Quiz Struktur Kontrol',
                'description' => 'Uji pemahaman Anda tentang if-else dan switch-case',
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
                        'question' => 'Operator perbandingan == digunakan untuk?',
                        'options' => [
                            'A' => 'Memberikan nilai',
                            'B' => 'Membandingkan kesamaan',
                            'C' => 'Penjumlahan',
                            'D' => 'Pengurangan'
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
                        'question' => 'Ternary operator (?:) adalah bentuk singkat dari?',
                        'options' => [
                            'A' => 'Switch-case',
                            'B' => 'For loop',
                            'C' => 'If-else',
                            'D' => 'While loop'
                        ],
                        'correct_answer' => 'C'
                    ]
                ]
            ],
            4 => [ // Looping
                'title' => 'Quiz Looping & Perulangan',
                'description' => 'Uji pemahaman Anda tentang perulangan dalam pemrograman',
                'questions' => [
                    [
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
                'title' => 'Quiz Array',
                'description' => 'Uji pemahaman Anda tentang array',
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
                            'D' => 'Tergantung bahasa'
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
                        'question' => 'Length atau size array menunjukkan?',
                        'options' => [
                            'A' => 'Jumlah elemen dalam array',
                            'B' => 'Nilai maksimal array',
                            'C' => 'Index terakhir array',
                            'D' => 'Tipe data array'
                        ],
                        'correct_answer' => 'A'
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
                        'question' => 'Linear search pada array adalah?',
                        'options' => [
                            'A' => 'Pencarian secara berurutan',
                            'B' => 'Pencarian secara acak',
                            'C' => 'Pencarian dengan sorting',
                            'D' => 'Pencarian terbalik'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Matrix adalah contoh dari?',
                        'options' => [
                            'A' => 'Array 1 dimensi',
                            'B' => 'Array 2 dimensi',
                            'C' => 'Array 3 dimensi',
                            'D' => 'Bukan array'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            6 => [ // Function
                'title' => 'Quiz Function',
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
                        'question' => 'Function overloading adalah?',
                        'options' => [
                            'A' => 'Function yang error',
                            'B' => 'Function dengan nama sama tapi parameter berbeda',
                            'C' => 'Function yang terlalu panjang',
                            'D' => 'Function tanpa parameter'
                        ],
                        'correct_answer' => 'B'
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
                        'question' => 'Function prototype adalah?',
                        'options' => [
                            'A' => 'Deklarasi function tanpa implementasi',
                            'B' => 'Function yang sudah jadi',
                            'C' => 'Function yang error',
                            'D' => 'Function yang lambat'
                        ],
                        'correct_answer' => 'A'
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
                    ]
                ]
            ],
            7 => [ // Pointer
                'title' => 'Quiz Pointer',
                'description' => 'Uji pemahaman Anda tentang pointer',
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
                        'question' => 'Operator * digunakan untuk?',
                        'options' => [
                            'A' => 'Mendapatkan alamat',
                            'B' => 'Mendapatkan nilai yang ditunjuk pointer',
                            'C' => 'Perkalian',
                            'D' => 'Deklarasi pointer'
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
                        'question' => 'Memory leak terjadi ketika?',
                        'options' => [
                            'A' => 'Menggunakan pointer',
                            'B' => 'Tidak membebaskan memori yang dialokasi',
                            'C' => 'Pointer terlalu banyak',
                            'D' => 'Komputer lambat'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'malloc() digunakan untuk?',
                        'options' => [
                            'A' => 'Membebaskan memori',
                            'B' => 'Mengalokasikan memori dinamis',
                            'C' => 'Mendeklarasikan pointer',
                            'D' => 'Menghitung ukuran pointer'
                        ],
                        'correct_answer' => 'B'
                    ]
                ]
            ],
            8 => [ // Struktur Data
                'title' => 'Quiz Struktur Data',
                'description' => 'Uji pemahaman Anda tentang struct dan union',
                'questions' => [
                    [
                        'question' => 'Struct adalah?',
                        'options' => [
                            'A' => 'Kumpulan variabel dengan tipe yang sama',
                            'B' => 'Kumpulan variabel dengan tipe berbeda',
                            'C' => 'Fungsi khusus',
                            'D' => 'Array multidimensi'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Member struct diakses dengan operator?',
                        'options' => [
                            'A' => '->',
                            'B' => '.',
                            'C' => '*',
                            'D' => '&'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Union berbeda dengan struct karena?',
                        'options' => [
                            'A' => 'Union lebih cepat',
                            'B' => 'Union menggunakan memori yang sama untuk semua member',
                            'C' => 'Union tidak bisa memiliki member',
                            'D' => 'Tidak ada perbedaan'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Typedef digunakan untuk?',
                        'options' => [
                            'A' => 'Membuat tipe data baru',
                            'B' => 'Menghapus tipe data',
                            'C' => 'Mengubah nilai variabel',
                            'D' => 'Mendeklarasikan fungsi'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Self-referential structure adalah?',
                        'options' => [
                            'A' => 'Struct yang error',
                            'B' => 'Struct yang memiliki pointer ke struct yang sama',
                            'C' => 'Struct yang kosong',
                            'D' => 'Struct yang besar'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Linked list menggunakan konsep?',
                        'options' => [
                            'A' => 'Array',
                            'B' => 'Self-referential structure',
                            'C' => 'Union',
                            'D' => 'Pointer arithmetic'
                        ],
                        'correct_answer' => 'B'
                    ],
                    [
                        'question' => 'Enum adalah?',
                        'options' => [
                            'A' => 'Kumpulan konstanta bernama',
                            'B' => 'Tipe data numerik',
                            'C' => 'Fungsi khusus',
                            'D' => 'Array karakter'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Bit field dalam struct digunakan untuk?',
                        'options' => [
                            'A' => 'Menghemat memori',
                            'B' => 'Mempercepat akses',
                            'C' => 'Memperbesar ukuran',
                            'D' => 'Tidak ada fungsi khusus'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Nested structure adalah?',
                        'options' => [
                            'A' => 'Struct di dalam struct',
                            'B' => 'Struct yang error',
                            'C' => 'Struct yang kosong',
                            'D' => 'Struct yang besar'
                        ],
                        'correct_answer' => 'A'
                    ],
                    [
                        'question' => 'Array of structures berarti?',
                        'options' => [
                            'A' => 'Struct yang berisi array',
                            'B' => 'Array yang elemennya berupa struct',
                            'C' => 'Array multidimensi',
                            'D' => 'Struct multidimensi'
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
