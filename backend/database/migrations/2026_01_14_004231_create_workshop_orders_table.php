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
        Schema::create('workshop_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->string('invoice_number')->nullable();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->string('client_name')->nullable();
            $table->unsignedBigInteger('purchase_order_id')->nullable();
            $table->string('purchase_order_ref')->nullable();
            $table->string('order_number');
            $table->string('status')->default('en_attente_verres');
            $table->string('priority')->default('normal');
            $table->string('lens_type')->nullable();
            $table->json('lens_treatments')->nullable();
            $table->json('lens_parameters')->nullable();
            $table->string('lens_supplier')->nullable();
            $table->string('lens_supplier_order_ref')->nullable();
            $table->string('lens_supplier_id')->nullable();
            $table->decimal('lens_purchase_price', 10, 2)->nullable();
            $table->decimal('lens_selling_price', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workshop_orders');
    }
};
