<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        // Instructor
        User::create([
            'name' => 'Dr. John Smith',
            'email' => 'instructor@example.com',
            'role' => 'instructor',
            'password' => Hash::make('password'),
        ]);

        // Students
        User::create([
            'name' => 'Alice Johnson',
            'email' => 'alice@example.com',
            'nim' => '2024001',
            'role' => 'student',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Bob Wilson',
            'email' => 'bob@example.com',
            'nim' => '2024002',
            'role' => 'student',
            'password' => Hash::make('password'),
        ]);
    }
}
