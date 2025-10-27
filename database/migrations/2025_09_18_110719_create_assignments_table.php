
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->timestamp('deadline');
            $table->integer('point_reward_early')->default(20); // poin jika submit lebih awal
            $table->integer('point_reward_ontime')->default(15); // poin jika submit tepat waktu
            $table->integer('point_reward_late')->default(5); // poin jika submit terlambat
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('assignments');
    }
};
