<?php

namespace Database\Seeders;

use App\Models\ClassModel;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::where('role', 'instructor')->first();

        if ($instructor) {
            $classes = [
                ['name' => 'Kelas A', 'description' => 'Kelas pagi untuk mahasiswa Teknik Informatika'],
                ['name' => 'Kelas B', 'description' => 'Kelas siang untuk mahasiswa Teknik Informatika'],
                ['name' => 'Kelas C', 'description' => 'Kelas malam untuk mahasiswa Teknik Informatika'],
            ];

            foreach ($classes as $classData) {
                ClassModel::create([
                    'name' => $classData['name'],
                    'description' => $classData['description'],
                    'instructor_id' => $instructor->id,
                ]);
            }

            // Assign students to classes
            $students = User::where('role', 'student')->get();
            $classModels = ClassModel::all();

            foreach ($students as $index => $student) {
                $classModel = $classModels[$index % $classModels->count()];
                $classModel->students()->attach($student->id);
            }
        }
    }
}
