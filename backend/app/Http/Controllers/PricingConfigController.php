<?php

namespace App\Http\Controllers;

use App\Models\PricingConfig;
use Illuminate\Http\Request;

class PricingConfigController extends Controller
{
    public function show(Request $request)
    {
        $config = PricingConfig::query()->latest('id')->first();

        $defaults = [
            'monthly_price' => 200,
            'semiannual_price' => 960,
            'annual_price' => 1680,
            'price_per_store' => 70,
            'currency' => 'DH',
        ];

        if (! $config) {
            return response()->json($defaults);
        }

        return response()->json([
            'monthly_price' => $config->monthly_price ?? $defaults['monthly_price'],
            'semiannual_price' => $config->semiannual_price ?? $defaults['semiannual_price'],
            'annual_price' => $config->annual_price ?? $defaults['annual_price'],
            'price_per_store' => $config->price_per_store ?? $defaults['price_per_store'],
            'currency' => $config->currency ?? $defaults['currency'],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'monthly_price' => ['required', 'numeric', 'min:0'],
            'semiannual_price' => ['required', 'numeric', 'min:0'],
            'annual_price' => ['required', 'numeric', 'min:0'],
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
