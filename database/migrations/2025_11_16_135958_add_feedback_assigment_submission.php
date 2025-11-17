<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignment_submissions', function (Blueprint $table) {
            // Add feedback column if not exists
            if (!Schema::hasColumn('assignment_submissions', 'feedback')) {
                $table->text('feedback')->nullable()->after('status');
            }

            // Add score column if not exists
            if (!Schema::hasColumn('assignment_submissions', 'score')) {
                $table->integer('score')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('assignment_submissions', function (Blueprint $table) {
            $table->dropColumn(['feedback', 'score']);
        });
    }
};
