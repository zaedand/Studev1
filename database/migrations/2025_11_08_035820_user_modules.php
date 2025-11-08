<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->integer('progress')->default(0); // 0-100
            $table->integer('completed_lessons')->default(0);
            $table->integer('total_lessons')->default(6); // CP, ATP, Materi, Pengayaan, Quiz, Praktikum
            $table->boolean('completed')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'module_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_modules');
    }
};
