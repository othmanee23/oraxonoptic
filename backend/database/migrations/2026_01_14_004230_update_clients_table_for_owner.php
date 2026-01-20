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
        Schema::table('clients', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete()->after('id');
            $table->foreignId('store_id')->nullable()->constrained('stores')->nullOnDelete()->after('owner_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropForeign(['owner_id']);
            $table->dropColumn(['store_id', 'owner_id']);
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete()->after('id');
        });
    }
};
