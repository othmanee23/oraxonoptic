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
        Schema::table('pricing_configs', function (Blueprint $table) {
            $table->decimal('semiannual_price', 10, 2)->after('monthly_price')->default(960);
            $table->decimal('annual_price', 10, 2)->after('semiannual_price')->default(1680);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pricing_configs', function (Blueprint $table) {
            $table->dropColumn(['semiannual_price', 'annual_price']);
        });
    }
};
