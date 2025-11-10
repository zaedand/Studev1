<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            [
                'title' => 'Pengenalan C++',
                'description' => 'Sejarah C++, algoritma pemrograman, flowchart, IDE MinGW Developer Studio, identifier, tipe data, variabel, assignment, konstanta, dan komentar',
                'order_number' => 1
            ],
            [
                'title' => 'Operator',
                'description' => 'Operator aritmatika, penugasan, increment & decrement, relasi, logika, dan bitwise. Hierarki operator dan penggunaannya dalam program',
                'order_number' => 2
            ],
            [
                'title' => 'Operasi Kondisi',
                'description' => 'Percabangan dengan if, if-else, if-else bertingkat (nested if, if-else if), dan switch-case untuk pengambilan keputusan',
                'order_number' => 3
            ],
            [
                'title' => 'Perulangan (Looping)',
                'description' => 'Statement perulangan for, while, dan do-while. Break, continue, nested loop, dan infinite loop',
                'order_number' => 4
            ],
            [
                'title' => 'Array (Larik)',
                'description' => 'Array dimensi satu, dua, dan tiga. Pengaksesan elemen array, manipulasi data array, dan penggunaan array dalam program',
                'order_number' => 5
            ],
            [
                'title' => 'Function (Fungsi)',
                'description' => 'Deklarasi dan definisi fungsi, prototype function, parameter, return value, call by value, call by reference, dan fungsi rekursif',
                'order_number' => 6
            ],
            [
                'title' => 'Pointer',
                'description' => 'Konsep pointer, operator & dan *, pointer void, pointer dan array, pointer dan string, pointer menunjuk pointer, pointer dan fungsi',
                'order_number' => 7
            ],
            [
                'title' => 'Pengelolaan File',
                'description' => 'File teks dan file biner, operasi file (membuka, menutup, membaca, menulis), fungsi fopen, fclose, putc, getc, fgets, fputs, fread, fwrite, fprintf, fscanf',
                'order_number' => 8
            ],
        ];

        foreach ($modules as $module) {
            Module::create($module);
        }
    }
}
