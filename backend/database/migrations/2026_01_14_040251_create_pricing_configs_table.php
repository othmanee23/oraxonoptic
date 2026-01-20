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
        Schema::create('pricing_configs', function (Blueprint $table) {
            $table->id();
            $table->decimal('monthly_price', 10, 2);
            $table->decimal('price_per_store', 10, 2);
            $table->string('currency', 10)->default('DH');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_configs');
    }
};
