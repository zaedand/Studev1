<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi.
     * Tambahkan kolom `tasks` (JSON) ke tabel assignments.
     * Kolom ini menyimpan daftar tugas per praktikum sebagai array JSON.
     */
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->json('tasks')->nullable()->after('description');
        });
    }

    /**
     * Batalkan migrasi.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn('tasks');
        });
    }
};
