<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Table untuk menyimpan CPMK per module
        Schema::create('module_cpmks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->text('content'); // JSON array of CPMK items
            $table->integer('point_reward')->default(10);
            $table->timestamps();
        });

        // Table untuk menyimpan Tujuan Pembelajaran per module
        Schema::create('module_learning_objectives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->text('content'); // JSON array of learning objectives
            $table->integer('point_reward')->default(10);
            $table->timestamps();
        });

        // Track user completion untuk CPMK
        Schema::create('user_cpmks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_cpmk_id')->constrained()->onDelete('cascade');
            $table->boolean('is_completed')->default(false);
            $table->integer('points_earned')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'module_cpmk_id']);
        });

        // Track user completion untuk Tujuan Pembelajaran
        Schema::create('user_learning_objectives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_learning_objective_id')->constrained()->onDelete('cascade');
            $table->boolean('is_completed')->default(false);
            $table->integer('points_earned')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'module_learning_objective_id'], 'user_learning_obj_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_learning_objectives');
        Schema::dropIfExists('user_cpmks');
        Schema::dropIfExists('module_learning_objectives');
        Schema::dropIfExists('module_cpmks');
    }
};
