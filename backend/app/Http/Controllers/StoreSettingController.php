<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\StoreSetting;
use Illuminate\Http\Request;

class StoreSettingController extends Controller
{
    private function activeStoreId(Request $request): int
    {
        $storeId = $request->attributes->get('activeStoreId');
        if (! $storeId) {
            abort(422, 'Store context missing.');
        }

        return (int) $storeId;
    }

    public function show(Request $request)
    {
        $storeId = $this->activeStoreId($request);
        $store = Store::query()->findOrFail($storeId);

        $settings = StoreSetting::query()->firstOrCreate(
            ['store_id' => $storeId],
            [
                'name' => $store->name,
                'address' => $store->address,
                'city' => $store->city,
                'phone' => $store->phone,
                'email' => $store->email,
                'primary_color' => '#2563eb',
                'currency' => 'DH',
                'footer_text' => 'Merci pour votre confiance !',
                'notify_low_stock_in_app' => true,
                'notify_low_stock_email' => true,
                'notify_workshop_ready_in_app' => true,
                'notify_workshop_ready_email' => true,
                'notify_new_client_in_app' => true,
                'notify_new_client_email' => true,
                'notify_invoice_created_in_app' => true,
                'notify_invoice_created_email' => true,
            ]
        );

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'ice' => ['nullable', 'string', 'max:255'],
            'rc' => ['nullable', 'string', 'max:255'],
            'patente' => ['nullable', 'string', 'max:255'],
            'cnss' => ['nullable', 'string', 'max:255'],
            'rib' => ['nullable', 'string', 'max:255'],
            'footer_text' => ['nullable', 'string', 'max:500'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'currency' => ['nullable', 'string', 'max:20'],
            'notify_low_stock_in_app' => ['nullable', 'boolean'],
            'notify_low_stock_email' => ['nullable', 'boolean'],
            'notify_workshop_ready_in_app' => ['nullable', 'boolean'],
            'notify_workshop_ready_email' => ['nullable', 'boolean'],
            'notify_new_client_in_app' => ['nullable', 'boolean'],
            'notify_new_client_email' => ['nullable', 'boolean'],
            'notify_invoice_created_in_app' => ['nullable', 'boolean'],
            'notify_invoice_created_email' => ['nullable', 'boolean'],
        ]);

        $settings = StoreSetting::query()->firstOrNew(['store_id' => $storeId]);
        $settings->fill($validated);
        $settings->store_id = $storeId;
        $settings->save();

        return response()->json($settings);
    }
}
