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

    private function seedMaterials(): void
    {
        $materials = [
            1 => [
                'title'        => 'Pengenalan C++ — Konsep Dasar',
                'file_path'    => 'materials/Modul_01_Pengenalan_C++.pdf',
                'point_reward' => 50,
            ],
            2 => [
                'title'        => 'Operator — Panduan Lengkap',
                'file_path'    => 'materials/Modul_02_Operator.pdf',
                'point_reward' => 50,
            ],
            3 => [
                'title'        => 'Operasi Kondisi — If-Else dan Switch-Case',
                'file_path'    => 'materials/Modul_03_Operasi_Kondisi.pdf',
                'point_reward' => 50,
            ],
            4 => [
                'title'        => 'Perulangan — For, While, Do-While',
                'file_path'    => 'materials/Modul_04_Perulangan.pdf',
                'point_reward' => 50,
            ],
            5 => [
                'title'        => 'Array — Satu dan Multidimensi',
                'file_path'    => 'materials/Modul_05_Array.pdf',
                'point_reward' => 50,
            ],
            6 => [
                'title'        => 'Fungsi — Konsep dan Implementasi',
                'file_path'    => 'materials/Modul_06_Function.pdf',
                'point_reward' => 50,
            ],
            7 => [
                'title'        => 'Pointer — Manajemen Memori',
                'file_path'    => 'materials/Modul_07_Pointer.pdf',
                'point_reward' => 50,
            ],
            8 => [
                'title'        => 'Pengelolaan File — File Teks dan Biner',
                'file_path'    => 'materials/Modul_08_Pengelolaan_File.pdf',
                'point_reward' => 50,
            ],
        ];

        foreach ($materials as $moduleOrder => $data) {
            $module = Module::where('order_number', $moduleOrder)->first();
            if ($module) {
                Material::create([
                    'module_id'    => $module->id,
                    'title'        => $data['title'],
                    'file_path'    => $data['file_path'],
                    'point_reward' => $data['point_reward'],
                ]);
            }
        }
    }

    private function seedEnrichments(): void
    {
        $enrichments = [
            1 => [
                ['title' => 'Introduction to C++ Programming', 'description' => 'Video pengenalan bahasa C++ dan sejarahnya', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', 'point_reward' => 15],
                ['title' => 'C++ Tutorial for Beginners — Learn C++ in 1 Hour', 'description' => 'Tutorial komprehensif C++ untuk pemula', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=ZzaPdXTrSb8', 'point_reward' => 15],
                ['title' => 'C++ Documentation — cplusplus.com', 'description' => 'Dokumentasi lengkap bahasa C++', 'type' => 'link', 'url' => 'https://cplusplus.com/doc/tutorial/', 'point_reward' => 10],
            ],
            2 => [
                ['title' => 'C++ Operators Explained', 'description' => 'Video penjelasan lengkap tentang operator dalam C++', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=sTX0UEplF54', 'point_reward' => 15],
                ['title' => 'C++ Operators — GeeksforGeeks', 'description' => 'Artikel lengkap tentang berbagai jenis operator', 'type' => 'link', 'url' => 'https://www.geeksforgeeks.org/operators-in-cpp/', 'point_reward' => 10],
                ['title' => 'Bitwise Operators in C++', 'description' => 'Tutorial khusus operator bitwise', 'type' => 'link', 'url' => 'https://www.programiz.com/cpp-programming/bitwise-operators', 'point_reward' => 10],
            ],
            3 => [
                ['title' => 'C++ If-Else Statements', 'description' => 'Tutorial tentang penggunaan if-else dalam C++', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=1wsaV5nVC7g', 'point_reward' => 15],
                ['title' => 'Switch-Case in C++', 'description' => 'Penjelasan lengkap tentang switch-case', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=aQKd7S0vQlY', 'point_reward' => 15],
                ['title' => 'Decision Making in C++ — Tutorialspoint', 'description' => 'Panduan lengkap pengambilan keputusan', 'type' => 'link', 'url' => 'https://www.tutorialspoint.com/cplusplus/cpp_decision_making.htm', 'point_reward' => 10],
            ],
            4 => [
                ['title' => 'C++ Loops (for, while, do-while)', 'description' => 'Video tutorial lengkap tentang semua jenis perulangan', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=WgX8e_O7eG8', 'point_reward' => 15],
                ['title' => 'Nested Loops in C++', 'description' => 'Tutorial khusus tentang perulangan bersarang', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=H7frvcAHXps', 'point_reward' => 15],
                ['title' => 'C++ Loops — GeeksforGeeks', 'description' => 'Artikel lengkap tentang perulangan', 'type' => 'link', 'url' => 'https://www.geeksforgeeks.org/loops-in-cpp/', 'point_reward' => 10],
            ],
            5 => [
                ['title' => 'Arrays in C++', 'description' => 'Video komprehensif tentang array dan implementasinya', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=55l-aZ7_F24', 'point_reward' => 15],
                ['title' => 'Multidimensional Arrays in C++', 'description' => 'Tutorial tentang array multidimensi', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=_8S5EGyQNOY', 'point_reward' => 15],
                ['title' => 'C++ Arrays — Programiz', 'description' => 'Panduan lengkap array dalam C++', 'type' => 'link', 'url' => 'https://www.programiz.com/cpp-programming/arrays', 'point_reward' => 10],
            ],
            6 => [
                ['title' => 'Functions in C++', 'description' => 'Video tutorial lengkap tentang fungsi', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=qJgFF2pi4hI', 'point_reward' => 15],
                ['title' => 'Recursion in C++', 'description' => 'Penjelasan mendalam tentang fungsi rekursif', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=kepBmgvWNDw', 'point_reward' => 15],
                ['title' => 'C++ Functions — GeeksforGeeks', 'description' => 'Artikel lengkap tentang fungsi', 'type' => 'link', 'url' => 'https://www.geeksforgeeks.org/functions-in-cpp/', 'point_reward' => 10],
            ],
            7 => [
                ['title' => 'Pointers in C++', 'description' => 'Video penjelasan pointer yang mudah dipahami', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=Rxvv9krECNw', 'point_reward' => 15],
                ['title' => 'Pointer and Arrays in C++', 'description' => 'Hubungan antara pointer dan array', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=CSVRA4_xOkw', 'point_reward' => 15],
                ['title' => 'C++ Pointers — Programiz', 'description' => 'Tutorial lengkap pointer', 'type' => 'link', 'url' => 'https://www.programiz.com/cpp-programming/pointers', 'point_reward' => 10],
            ],
            8 => [
                ['title' => 'File Handling in C++', 'description' => 'Video tutorial tentang pengelolaan file', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=EaHFhms_Shw', 'point_reward' => 15],
                ['title' => 'Reading and Writing Files in C++', 'description' => 'Tutorial membaca dan menulis file', 'type' => 'video', 'url' => 'https://www.youtube.com/watch?v=TzKB3bhatyA', 'point_reward' => 15],
                ['title' => 'C++ Files and Streams — Tutorialspoint', 'description' => 'Dokumentasi lengkap penanganan file', 'type' => 'link', 'url' => 'https://www.tutorialspoint.com/cplusplus/cpp_files_streams.htm', 'point_reward' => 10],
            ],
        ];

        foreach ($enrichments as $moduleOrder => $items) {
            $module = Module::where('order_number', $moduleOrder)->first();
            if ($module) {
                foreach ($items as $item) {
                    Enrichment::create([
                        'module_id'    => $module->id,
                        'title'        => $item['title'],
                        'description'  => $item['description'],
                        'type'         => $item['type'],
                        'url'          => $item['url'],
                        'point_reward' => $item['point_reward'],
                    ]);
                }
            }
        }
    }

    private function seedAssignments(): void
    {
        /**
         * Deskripsi setiap praktikum mengacu langsung pada tugas praktikum
         * dan tugas rumah yang tercantum di modul materi masing-masing.
         *
         * Format deskripsi: kalimat pengantar + daftar tugas yang harus dikerjakan.
         * Kolom `tasks` berisi butir-butir tugas yang ditampilkan sebagai daftar
         * bernomor di halaman mahasiswa.
         */
        $assignments = [
            // ── Modul 1: Pengenalan C++ ──────────────────────────────────────
            1 => [
                'title'       => 'Laporan Praktikum 1 — Pengenalan Bahasa C++',
                'description' =>
                    'Kerjakan seluruh soal latihan dan tugas rumah pada Modul 1. '
                    . 'Dokumentasikan setiap langkah pengerjaan, tangkapan layar output program, '
                    . 'serta penjelasan kode sesuai format laporan yang telah disediakan.',
                'tasks' => [
                    'Latihan 1 — Tuliskan kembali kode program contoh A dan B, lalu identifikasi komponen-komponennya (header, variabel, assignment, dsb.).',
                    'Latihan 2 — Buat program sederhana untuk menghitung luas lingkaran.',
                    'Latihan 3 & 4 — Tuliskan kembali program yang diberikan, simpan dengan ekstensi .cpp dan .c, lalu jelaskan perbedaan output keduanya.',
                    'Tugas Praktikum 1 — Identifikasi kode program yang diberikan (komponen dan fungsinya).',
                    'Tugas Praktikum 2 — Temukan dan perbaiki kesalahan pada kode program yang diberikan, kemudian tuliskan kembali kode yang benar.',
                    'Tugas Rumah — Buat program konversi suhu dari Celcius ke Fahrenheit, Kelvin, dan Reamur sesuai tampilan yang telah ditentukan.',
                ],
                'point_reward_early'  => 100,
                'point_reward_ontime' => 80,
                'point_reward_late'   => 50,
                'deadline_days'       => 14,
            ],

            // ── Modul 2: Operator ────────────────────────────────────────────
            2 => [
                'title'       => 'Laporan Praktikum 2 — Operator',
                'description' =>
                    'Kerjakan seluruh soal latihan dan tugas rumah pada Modul 2. '
                    . 'Setiap latihan dikerjakan menggunakan MinGW Developer Studio, '
                    . 'dikompilasi, dan dieksekusi. Dokumentasikan hasil output beserta '
                    . 'penjelasan cara kerja program.',
                'tasks' => [
                    'Latihan 1 — Jalankan kode yang diberikan, jelaskan dan simpulkan hasilnya (operator aritmatika).',
                    'Latihan 2 — Jalankan kode yang diberikan, jelaskan dan simpulkan hasilnya (ekspresi aritmatika bertingkat).',
                    'Latihan 3 — Jalankan kode yang diberikan, jelaskan dan simpulkan hasilnya (operator increment & decrement).',
                    'Latihan 4 — Jalankan kode yang diberikan, jelaskan dan simpulkan hasilnya (operator relasi).',
                    'Latihan 5a & 5b — Jalankan kode yang diberikan, jelaskan dan simpulkan hasilnya (operator logika).',
                    'Latihan 6 — Jalankan kode yang diberikan, jelaskan dan simpulkan hasilnya (operator bitwise shift).',
                    'Latihan 7 — Jalankan kode yang diberikan, jelaskan dan simpulkan hasilnya (operator bitwise AND, OR, XOR).',
                    'Tugas Rumah — Buat program yang menghasilkan tampilan output sesuai contoh yang diberikan (mencakup operator aritmatika, shift bit, dan relasi).',
                ],
                'point_reward_early'  => 100,
                'point_reward_ontime' => 80,
                'point_reward_late'   => 50,
                'deadline_days'       => 14,
            ],

            // ── Modul 3: Operasi Kondisi ─────────────────────────────────────
            3 => [
                'title'       => 'Laporan Praktikum 3 — Operasi Kondisi',
                'description' =>
                    'Kerjakan seluruh soal latihan, tugas praktikum, dan tugas rumah pada Modul 3. '
                    . 'Setiap program dikompilasi dan dieksekusi; sertakan tangkapan layar output '
                    . 'serta penjelasan alur logika percabangan yang digunakan.',
                'tasks' => [
                    'Latihan 1 — Jalankan dan jelaskan program percabangan if sederhana.',
                    'Latihan 2 — Jalankan dan jelaskan program if-else (bilangan genap/ganjil berdasarkan NIM).',
                    'Latihan 3 — Jalankan dan jelaskan program nested if (rentang nilai angka).',
                    'Latihan 4 — Jalankan dan jelaskan program if-else if (dua bilangan positif).',
                    'Latihan 5 — Jalankan dan jelaskan program switch-case (nama bulan).',
                    'Latihan 6 — Jalankan dan jelaskan program switch-case (konversi nilai huruf).',
                    'Tugas Praktikum 1 — Buat program diskon harga toko "Berkah Sejahtera" menggunakan if-else bertingkat.',
                    'Tugas Praktikum 2 — Buat program komisi salesman "PT. Makmur Sukses Jaya" menggunakan if-else bertingkat.',
                    'Tugas Rumah 1 — Buat program nilai akhir mahasiswa (konversi angka ke huruf, bobot keaktifan 20%, tugas 30%, ujian 50%, dan motivasi).',
                    'Tugas Rumah 2 — Buat program kalkulator luas permukaan bangun ruang menggunakan switch-case beserta flowchartnya.',
                ],
                'point_reward_early'  => 100,
                'point_reward_ontime' => 80,
                'point_reward_late'   => 50,
                'deadline_days'       => 14,
            ],

            // ── Modul 4: Perulangan ──────────────────────────────────────────
            4 => [
                'title'       => 'Laporan Praktikum 4 — Perulangan (Looping)',
                'description' =>
                    'Kerjakan seluruh soal latihan, tugas praktikum, dan tugas rumah pada Modul 4. '
                    . 'Tunjukkan perbedaan penggunaan for, while, dan do-while melalui program '
                    . 'yang dieksekusi; sertakan tangkapan layar output dan penjelasan alur perulangan.',
                'tasks' => [
                    'Latihan 1 — Buat program menampilkan bilangan bulat 1 s.d. 10 menggunakan for.',
                    'Latihan 2 — Buat program menampilkan bilangan genap dari besar ke kecil menggunakan while.',
                    'Latihan 3 — Buat program menampilkan segitiga siku-siku menggunakan nested for sesuai contoh output.',
                    'Latihan 4 — Buat program simulasi menu pilihan menggunakan do-while.',
                    'Tugas Praktikum 1 — Buat program mencetak karakter kata secara berulang sesuai contoh output.',
                    'Tugas Praktikum 2 — Buat program tabel konversi suhu (Celcius → Fahrenheit, Reamur, Kelvin) untuk 10–100°C menggunakan perulangan.',
                    'Tugas Praktikum 3 — Buat program menampilkan pola bintang berlian sesuai contoh output.',
                    'Tugas Rumah 1 — Buat program menampilkan semua penyelesaian persamaan a + b = 20.',
                    'Tugas Rumah 2 — Buat program menghitung kombinasi nCr dengan memasukkan nilai n dan r.',
                    'Tugas Rumah 3 — Buat program simulasi transaksi bank (setor, ambil, cek saldo) dengan saldo minimum Rp50.000.',
                ],
                'point_reward_early'  => 120,
                'point_reward_ontime' => 100,
                'point_reward_late'   => 60,
                'deadline_days'       => 21,
            ],

            // ── Modul 5: Array ───────────────────────────────────────────────
            5 => [
                'title'       => 'Laporan Praktikum 5 — Array (Larik)',
                'description' =>
                    'Kerjakan seluruh soal latihan, tugas praktikum, dan tugas rumah pada Modul 5. '
                    . 'Tunjukkan penggunaan array satu dimensi dan multidimensi melalui program '
                    . 'yang dieksekusi; sertakan tangkapan layar output dan penjelasan kode.',
                'tasks' => [
                    'Latihan 1 — Jalankan dan jelaskan program input/output nilai 10 mahasiswa menggunakan array satu dimensi.',
                    'Latihan 2 — Jalankan dan jelaskan program input/output matriks 3×4 menggunakan array dua dimensi.',
                    'Latihan 3 — Jalankan dan jelaskan program menghitung jumlah karakter pada string menggunakan array of char.',
                    'Latihan 4 — Jalankan dan jelaskan program mencari skor terbaik dari array.',
                    'Tugas Praktikum 1 — Buat program membalik kata menggunakan array of char (sertakan kondisi jika kata tidak berubah).',
                    'Tugas Praktikum 2 — Buat tabel harga fotokopi 1–100 lembar (Rp80/lembar, diskon Rp60/lembar setiap kelipatan 20 lembar).',
                    'Tugas Rumah 1 — Buat program menganalisis kalimat: hitung jumlah vokal, konsonan, karakter lain, dan kata yang mengandung "ng".',
                    'Tugas Rumah 2 — Buat program menampilkan tabel kebenaran logika (P OR Q, P AND Q, NOT P, P XOR Q) menggunakan perulangan.',
                    'Tugas Rumah 3 — Buat program menampilkan bilangan Fibonacci ke-n beserta keterangan apakah bilangan tersebut prima.',
                ],
                'point_reward_early'  => 120,
                'point_reward_ontime' => 100,
                'point_reward_late'   => 60,
                'deadline_days'       => 21,
            ],

            // ── Modul 6: Fungsi ──────────────────────────────────────────────
            6 => [
                'title'       => 'Laporan Praktikum 6 — Fungsi (Function)',
                'description' =>
                    'Kerjakan seluruh soal latihan, tugas praktikum, dan tugas rumah pada Modul 6. '
                    . 'Demonstrasikan pembuatan dan pemanggilan fungsi, perbedaan call by value '
                    . 'dan call by reference, serta implementasi fungsi rekursif; sertakan '
                    . 'tangkapan layar output dan penjelasan kode.',
                'tasks' => [
                    'Latihan 1 — Jelaskan cara kerja program yang menggabungkan call by reference (Rtukar) dan call by value (Vtukar).',
                    'Latihan 2 — Jalankan dan jelaskan program mencari nilai terbesar menggunakan fungsi.',
                    'Latihan 3 — Jalankan dan jelaskan program menentukan pajak pembelian menggunakan fungsi.',
                    'Latihan 4 — Jalankan dan jelaskan program perbedaan call by reference dan call by value.',
                    'Latihan 5 — Jalankan dan jelaskan program menghitung faktorial dan Fibonacci menggunakan fungsi rekursif.',
                    'Tugas Praktikum 1 — Buat program menghitung kombinasi nCr menggunakan fungsi sesuai tampilan yang ditentukan.',
                    'Tugas Praktikum 2 — Buat program menghitung luas permukaan, selimut, dan volume tabung menggunakan fungsi.',
                    'Tugas Rumah 1 — Buat program mencari nilai terbesar dan terkecil dari data yang dimasukkan berulang.',
                    'Tugas Rumah 2 — Buat program menghitung rata-rata dan simpangan baku dari data yang dimasukkan.',
                    'Tugas Rumah 3 — Buat program menentukan data yang paling sering dimasukkan (modus).',
                ],
                'point_reward_early'  => 150,
                'point_reward_ontime' => 120,
                'point_reward_late'   => 70,
                'deadline_days'       => 28,
            ],

            // ── Modul 7: Pointer ─────────────────────────────────────────────
            7 => [
                'title'       => 'Laporan Praktikum 7 — Pointer',
                'description' =>
                    'Kerjakan seluruh soal latihan, tugas praktikum, dan tugas rumah pada Modul 7. '
                    . 'Tunjukkan pemahaman konsep pointer melalui program yang dieksekusi; '
                    . 'sertakan tangkapan layar output, alamat memori yang ditampilkan, '
                    . 'dan penjelasan penggunaan operator & serta *.',
                'tasks' => [
                    'Latihan 1 — Jalankan dan jelaskan program pointer dasar (pBil menunjuk bilX).',
                    'Latihan 2 — Jalankan dan jelaskan program pointer dengan operator & dan *.',
                    'Latihan 3 — Jalankan dan jelaskan program pointer sebagai parameter fungsi (ubah nilai via pointer).',
                    'Latihan 4 — Jalankan dan jelaskan program pointer void (menunjuk tipe data berbeda).',
                    'Latihan 5 — Jalankan dan jelaskan program pointer void (mengubah nilai variabel via casting).',
                    'Tugas Praktikum 1 — Buat program membalik kata dalam kalimat menggunakan pointer.',
                    'Tugas Praktikum 2 — Buat fungsi menampilkan nama hari berdasarkan angka (1–7) menggunakan pointer.',
                    'Tugas Praktikum 3 — Buat program menjawab nilai defa dan dewi sesuai contoh output menggunakan pointer.',
                    'Tugas Rumah 1 — Buat fungsi mengubah huruf pertama setiap kata menjadi huruf kapital menggunakan pointer.',
                    'Tugas Rumah 2 — Buat program pointer dengan 4 variabel (w, x, y, z) yang nilainya menjadi 3 kali lipat.',
                    'Tugas Rumah 3 — Buat fungsi menghitung jumlah kata dari string masukan menggunakan pointer.',
                    'Tugas Rumah 4 — Buat program menampilkan nama-nama bulan (Januari–Desember) menggunakan array pointer.',
                ],
                'point_reward_early'  => 150,
                'point_reward_ontime' => 120,
                'point_reward_late'   => 70,
                'deadline_days'       => 28,
            ],

            // ── Modul 8: Pengelolaan File ────────────────────────────────────
            8 => [
                'title'       => 'Laporan Praktikum 8 — Pengelolaan File',
                'description' =>
                    'Kerjakan seluruh soal latihan, tugas praktikum, dan tugas rumah pada Modul 8. '
                    . 'Demonstrasikan penggunaan fungsi fopen, fclose, fread, fwrite, fprintf, '
                    . 'dan fscanf melalui program yang dieksekusi; sertakan tangkapan layar output '
                    . 'dan penjelasan perbedaan file teks dengan file biner.',
                'tasks' => [
                    'Latihan 1 — Eksekusi dan jelaskan program menulis karakter ke file COBA.TXT menggunakan putc.',
                    'Latihan 2 — Eksekusi dan jelaskan program yang membuka file biner kuliah.dat (tanpa input data).',
                    'Latihan 3 — Eksekusi dan jelaskan program menulis satu record mahasiswa ke file biner kuliah.dat menggunakan fwrite.',
                    'Latihan 4 — Eksekusi dan jelaskan program menulis lalu membaca record mahasiswa dari file biner kuliah.dat.',
                    'Latihan 5 — Eksekusi dan jelaskan program menampilkan nasabah dengan saldo nol, saldo kredit, dan saldo debet dari file sekuensial klien.dat.',
                    'Tugas Praktikum 1 — Jelaskan perbedaan file teks dan file biner.',
                    'Tugas Praktikum 2 — Buat kesimpulan dari hasil eksekusi latihan 1 hingga 5.',
                    'Tugas Praktikum 3 — Buat program sorting string (masukan dan keluaran berupa array) yang disimpan dalam file.',
                    'Tugas Rumah — Buat aplikasi pengelolaan data yang terinspirasi dari latihan 5 untuk keperluan pembelajaran di sekolah; sertakan listing program dan dokumentasi.',
                ],
                'point_reward_early'  => 200,
                'point_reward_ontime' => 170,
                'point_reward_late'   => 100,
                'deadline_days'       => 35,
            ],
        ];

        foreach ($assignments as $moduleOrder => $data) {
            $module = Module::where('order_number', $moduleOrder)->first();
            if ($module) {
                $assignment = Assignment::create([
                    'module_id'           => $module->id,
                    'title'               => $data['title'],
                    'description'         => $data['description'],
                    'deadline'            => now()->addDays($data['deadline_days']),
                    'point_reward_early'  => $data['point_reward_early'],
                    'point_reward_ontime' => $data['point_reward_ontime'],
                    'point_reward_late'   => $data['point_reward_late'],
                    'is_active'           => true,
                ]);

                // Simpan daftar tugas ke kolom JSON (jika kolom tersedia),
                // atau gunakan sebagai referensi di controller saat membaca ke frontend.
                // Pastikan kolom `tasks` (JSON) sudah ada pada tabel assignments.
                if (isset($data['tasks'])) {
                    $assignment->update(['tasks' => $data['tasks']]);
                }
            }
        }
    }
}
