<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionOffer;
use Illuminate\Http\Request;

class SubscriptionOfferController extends Controller
{
    public function index(Request $request)
    {
        $offers = SubscriptionOffer::query()
            ->orderBy('sort_order')
            ->get();

        if ($offers->isEmpty()) {
            return response()->json([
                [
                    'key' => 'one_store',
                    'label' => '1 magasin',
                    'store_limit' => 1,
                    'monthly_price' => 500,
                    'is_custom' => false,
                    'type_label' => 'Standard',
                    'currency' => 'DH',
                    'sort_order' => 1,
                ],
                [
                    'key' => 'two_stores',
                    'label' => '2 magasins',
                    'store_limit' => 2,
                    'monthly_price' => 900,
                    'is_custom' => false,
                    'type_label' => 'Standard',
                    'currency' => 'DH',
                    'sort_order' => 2,
                ],
                [
                    'key' => 'custom',
                    'label' => 'Sur devis',
                    'store_limit' => null,
                    'monthly_price' => null,
                    'is_custom' => true,
                    'type_label' => 'Sur devis',
                    'currency' => 'DH',
                    'sort_order' => 3,
                ],
            ]);
        }

        return response()->json($offers);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'offers' => ['required', 'array', 'min:1'],
            'offers.*.key' => ['required', 'string', 'max:50'],
            'offers.*.label' => ['required', 'string', 'max:255'],
            'offers.*.store_limit' => ['nullable', 'integer', 'min:1'],
            'offers.*.monthly_price' => ['nullable', 'numeric', 'min:0'],
            'offers.*.is_custom' => ['required', 'boolean'],
            'offers.*.type_label' => ['required', 'string', 'max:50'],
            'offers.*.currency' => ['required', 'string', 'max:10'],
            'offers.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['offers'] as $offerData) {
            SubscriptionOffer::updateOrCreate(
                ['key' => $offerData['key']],
                $offerData
            );
        }

        $offers = SubscriptionOffer::query()
            ->orderBy('sort_order')
            ->get();

        return response()->json($offers);
    }
}
