<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan kolom attempt_number ke tabel quiz_attempts.
     * Kolom ini mencatat urutan percobaan ke-berapa (1, 2, 3).
     */
    public function up(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            // Tambah setelah kolom quiz_id
            $table->unsignedTinyInteger('attempt_number')
                  ->default(1)
                  ->after('quiz_id')
                  ->comment('Urutan percobaan ke-1, 2, atau 3');
        });

        // Backfill data yang sudah ada: hitung ulang attempt_number per user per quiz
        DB::statement("
            UPDATE quiz_attempts qa
            JOIN (
                SELECT id,
                       ROW_NUMBER() OVER (
                           PARTITION BY user_id, quiz_id
                           ORDER BY created_at ASC
                       ) AS rn
                FROM quiz_attempts
            ) ranked ON qa.id = ranked.id
            SET qa.attempt_number = ranked.rn
        ");
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn('attempt_number');
        });
    }
};
