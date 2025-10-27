<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            ['title' => 'Pengenalan Pemrograman', 'description' => 'Dasar-dasar pemrograman', 'order_number' => 1],
            ['title' => 'Variabel dan Tipe Data', 'description' => 'Memahami variabel dan tipe data', 'order_number' => 2],
            ['title' => 'Struktur Kontrol', 'description' => 'If-else, switch-case', 'order_number' => 3],
            ['title' => 'Looping', 'description' => 'For, while, do-while', 'order_number' => 4],
            ['title' => 'Array', 'description' => 'Array satu dan multidimensi', 'order_number' => 5],
            ['title' => 'Function', 'description' => 'Membuat dan menggunakan fungsi', 'order_number' => 6],
            ['title' => 'Pointer', 'description' => 'Konsep dan penggunaan pointer', 'order_number' => 7],
            ['title' => 'Struktur Data', 'description' => 'Struct dan union', 'order_number' => 8],
        ];

        foreach ($modules as $module) {
            Module::create($module);
        }
    }
}
