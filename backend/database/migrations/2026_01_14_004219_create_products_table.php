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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('reference');
            $table->string('name');
            $table->string('brand');
            $table->text('description')->nullable();
            $table->decimal('purchase_price', 10, 2);
            $table->decimal('selling_price', 10, 2);
            $table->integer('current_stock')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->string('lens_type')->nullable();
            $table->string('sphere')->nullable();
            $table->string('cylinder')->nullable();
            $table->string('axis')->nullable();
            $table->string('addition')->nullable();
            $table->string('base_curve')->nullable();
            $table->string('diameter')->nullable();
            $table->timestamps();

            $table->unique(['store_id', 'reference']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
