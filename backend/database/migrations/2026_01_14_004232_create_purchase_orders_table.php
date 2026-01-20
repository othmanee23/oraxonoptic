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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('reference');
            $table->string('supplier_name')->nullable();
            $table->string('supplier_id')->nullable();
            $table->string('status')->default('draft');
            $table->string('type')->default('product');
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->string('invoice_number')->nullable();
            $table->string('client_name')->nullable();
            $table->string('lens_type')->nullable();
            $table->json('lens_treatments')->nullable();
            $table->json('lens_parameters')->nullable();
            $table->json('items')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('expected_date')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
