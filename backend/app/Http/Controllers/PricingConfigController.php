<?php

namespace App\Http\Controllers;

use App\Models\PricingConfig;
use Illuminate\Http\Request;

class PricingConfigController extends Controller
{
    public function show(Request $request)
    {
        $config = PricingConfig::query()->latest('id')->first();

        if (! $config) {
            return response()->json([
                'monthly_price' => 500,
                'price_per_store' => 200,
                'currency' => 'DH',
            ]);
        }

        return response()->json($config);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'monthly_price' => ['required', 'numeric', 'min:0'],
            'price_per_store' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'max:10'],
        ]);

        $config = PricingConfig::query()->latest('id')->first();
        if ($config) {
            $config->update($validated);
        } else {
            $config = PricingConfig::create($validated);
        }

        return response()->json($config);
    }
}
