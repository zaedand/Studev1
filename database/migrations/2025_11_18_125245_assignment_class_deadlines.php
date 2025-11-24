<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignment_class_deadlines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
            $table->dateTime('deadline');
            $table->timestamps();

            // Unique constraint: one deadline per assignment-class combination
            $table->unique(['assignment_id', 'class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_class_deadlines');
    }
};
