<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ModuleSeeder::class,
            ClassSeeder::class,
            QuizSeeder::class,
            ModuleContentSeeder::class,
        ]);
    }
}
