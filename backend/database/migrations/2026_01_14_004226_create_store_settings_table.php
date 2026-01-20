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
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('name');
            $table->string('subtitle')->nullable();
            $table->longText('logo')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('ice')->nullable();
            $table->string('rc')->nullable();
            $table->string('patente')->nullable();
            $table->string('cnss')->nullable();
            $table->string('rib')->nullable();
            $table->string('footer_text')->nullable();
            $table->string('primary_color')->nullable();
            $table->string('currency')->nullable();
            $table->timestamps();

            $table->unique('store_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
