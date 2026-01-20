<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->date('date');
            $table->string('prescriber')->nullable();
            $table->date('expiry_date')->nullable();
            $table->decimal('od_sphere', 6, 2)->nullable();
            $table->decimal('od_cylinder', 6, 2)->nullable();
            $table->unsignedSmallInteger('od_axis')->nullable();
            $table->decimal('od_addition', 6, 2)->nullable();
            $table->decimal('od_pd', 6, 2)->nullable();
            $table->decimal('og_sphere', 6, 2)->nullable();
            $table->decimal('og_cylinder', 6, 2)->nullable();
            $table->unsignedSmallInteger('og_axis')->nullable();
            $table->decimal('og_addition', 6, 2)->nullable();
            $table->decimal('og_pd', 6, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
