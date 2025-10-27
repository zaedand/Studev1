<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('enrichments', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->unsignedBigInteger('module_id'); // Foreign key to modules table
            $table->text('content')->nullable(); // Enrichment content
            $table->string('type')->nullable(); // Type of enrichment (video, article, etc.)
            $table->string('url')->nullable(); // External URL if applicable
            $table->integer('order_number')->default(1); // Order within module
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('module_id')->references('id')->on('modules')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('enrichments');
    }
};
