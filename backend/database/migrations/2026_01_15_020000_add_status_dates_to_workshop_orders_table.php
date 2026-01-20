<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workshop_orders', function (Blueprint $table) {
            $table->timestamp('lens_received_at')->nullable()->after('notes');
            $table->timestamp('completed_at')->nullable()->after('lens_received_at');
            $table->timestamp('delivered_at')->nullable()->after('completed_at');
            $table->timestamp('expected_date')->nullable()->after('delivered_at');
        });
    }

    public function down(): void
    {
        Schema::table('workshop_orders', function (Blueprint $table) {
            $table->dropColumn([
                'lens_received_at',
                'completed_at',
                'delivered_at',
                'expected_date',
            ]);
        });
    }
};
