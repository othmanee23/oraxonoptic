<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->boolean('notify_low_stock_in_app')->default(true)->after('currency');
            $table->boolean('notify_low_stock_email')->default(true)->after('notify_low_stock_in_app');
            $table->boolean('notify_workshop_ready_in_app')->default(true)->after('notify_low_stock_email');
            $table->boolean('notify_workshop_ready_email')->default(true)->after('notify_workshop_ready_in_app');
            $table->boolean('notify_new_client_in_app')->default(true)->after('notify_workshop_ready_email');
            $table->boolean('notify_new_client_email')->default(true)->after('notify_new_client_in_app');
            $table->boolean('notify_invoice_created_in_app')->default(true)->after('notify_new_client_email');
            $table->boolean('notify_invoice_created_email')->default(true)->after('notify_invoice_created_in_app');
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn([
                'notify_low_stock_in_app',
                'notify_low_stock_email',
                'notify_workshop_ready_in_app',
                'notify_workshop_ready_email',
                'notify_new_client_in_app',
                'notify_new_client_email',
                'notify_invoice_created_in_app',
                'notify_invoice_created_email',
            ]);
        });
    }
};
