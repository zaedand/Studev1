<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModuleCpmk;
use App\Models\ModuleLearningObjective;
use Illuminate\Database\Seeder;

class ModuleCpmkAndLearningObjectiveSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedCpmk();
        $this->seedLearningObjectives();
    }

    private function seedCpmk()
    {
        $cpmkData = [
            1 => [
                'content' => [
                    'Mahasiswa dapat memahami dan mendefinisikan tipe data',
                    'Mahasiswa dapat memahami dan mendefinisikan variable'
                ],
                'point_reward' => 10
            ],
            2 => [
                'content' => [
                    'Mahasiswa dapat memahami dan mendefinisikan serta menggunakan Konstanta dan Operator'
                ],
                'point_reward' => 10
            ],
            3 => [
                'content' => [
                    'Mahasiswa dapat memahami dan mendefinisikan serta mengimplementasikan konsep percabangan'
                ],
                'point_reward' => 10
            ],
            4 => [
                'content' => [
                    'Mahasiswa dapat memahami dan mendefinisikan serta mengimplementasikan konsep perulangan'
                ],
                'point_reward' => 10
            ],
            5 => [
                'content' => [
                    'Mahasiswa dapat memahami dan mendefinisikan serta mengimplementasikan Array'
                ],
                'point_reward' => 10
            ],
            6 => [
                'content' => [
                    'Mahasiswa dapat memahami dan mendefinisikan serta mengimplementasikan Function'
                ],
                'point_reward' => 10
            ],
            7 => [
                'content' => [
                    'Mahasiswa dapat memahami dan mendefinisikan serta mengimplementasikan Pointer dan Rekursif'
                ],
                'point_reward' => 10
            ],
            8 => [
                'content' => [
                    'Mahasiswa dapat memahami dan mendefinisikan serta mengimplementasikan Pengelolaan File'
                ],
                'point_reward' => 10
            ]
        ];

        foreach ($cpmkData as $moduleOrder => $data) {
            $module = Module::where('order_number', $moduleOrder)->first();
            if ($module) {
                ModuleCpmk::create([
                    'module_id' => $module->id,
                    'content' => $data['content'],
                    'point_reward' => $data['point_reward']
                ]);
            }
        }
    }

    private function seedLearningObjectives()
    {
        $learningObjectives = [
            1 => [ // Modul 1 - Pengenalan C++
                'content' => [
                    'Memahami sejarah perkembangan bahasa C++',
                    'Mengenal dan memahami algoritma program dengan flowchart',
                    'Mengenal dan menggunakan IDE C++ dengan baik',
                    'Mengenal dan memahami penggunaan Identifier, tipe data, variable, assignment, komentar, dan konstanta',
                    'Membuat program sederhana menggunakan bahasa C++'
                ],
                'point_reward' => 10
            ],
            2 => [ // Modul 2 - Operator
                'content' => [
                    'Menjelaskan tentang jenis-jenis operator',
                    'Menjelaskan masing-masing fungsi operator',
                    'Memahami cara penggunaan masing-masing operator',
                    'Membuat program dengan mengaplikasikan operator',
                    'Mengevaluasi kesalahan pada program'
                ],
                'point_reward' => 10
            ],
            3 => [ // Modul 3 - Operasi Kondisi
                'content' => [
                    'Menjelaskan tentang fungsi operasi kondisi',
                    'Menjelaskan tentang fungsi if, if else, if else bertingkat, dan switch case'
                ],
                'point_reward' => 10
            ],
            4 => [ // Modul 4 - Perulangan
                'content' => [
                    'Mengenal dan memahami penggunaan statement perulangan',
                    'Membuat program sederhana dengan menerapkan konsep perulangan'
                ],
                'point_reward' => 10
            ],
            5 => [ // Modul 5 - Array
                'content' => [
                    'Mengenal dan memahami penggunaan array dalam listing program',
                    'Membuat program sederhana dengan menerapkan konsep array'
                ],
                'point_reward' => 10
            ],
            6 => [ // Modul 6 - Function
                'content' => [
                    'Memahami Fungsi',
                    'Mendeklarasikan dan mendefinisikan fungsi',
                    'Menyelesaikan masalah menggunakan fungsi',
                    'Memahami metode pemanggilan fungsi',
                    'Membuat fungsi rekursif'
                ],
                'point_reward' => 10
            ],
            7 => [ // Modul 7 - Pointer
                'content' => [
                    'Mengetahui arti dan fungsi pointer dalam pemrograman',
                    'Memahami penggunaan pointer dalam listing program',
                    'Mengetahui keunggulan pointer pada suatu program',
                    'Membuat program sederhana dengan menerapkan konsep pointer'
                ],
                'point_reward' => 10
            ],
            8 => [ // Modul 8 - Pengelolaan File
                'content' => [
                    'Mengetahui jenis file teks maupun file biner',
                    'Membedakan jenis file teks maupun file biner',
                    'Menangani file teks maupun file biner dalam Bahasa C',
                    'Membuat aplikasi yang melibatkan pengelolaan file teks maupun file biner dalam Bahasa C'
                ],
                'point_reward' => 10
            ]
        ];

        foreach ($learningObjectives as $moduleOrder => $data) {
            $module = Module::where('order_number', $moduleOrder)->first();
            if ($module) {
                ModuleLearningObjective::create([
                    'module_id' => $module->id,
                    'content' => $data['content'],
                    'point_reward' => $data['point_reward']
                ]);
            }
        }
    }
}
