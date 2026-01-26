<?php

namespace App\Http\Controllers;

use App\Models\PricingConfig;
use App\Models\SubscriptionDuration;
use Illuminate\Http\Request;

class SubscriptionDurationController extends Controller
{
    public function index(Request $request)
    {
        $durations = SubscriptionDuration::query()
            ->orderBy('sort_order')
            ->get();

        if ($durations->isNotEmpty()) {
            return response()->json($durations);
        }

        $config = PricingConfig::query()->latest('id')->first();
        $defaults = [
            'monthly_price' => 200,
            'semiannual_price' => 960,
            'annual_price' => 1680,
        ];

        $monthlyPrice = $config?->monthly_price ?? $defaults['monthly_price'];
        $semiannualPrice = $config?->semiannual_price ?? $defaults['semiannual_price'];
        $annualPrice = $config?->annual_price ?? $defaults['annual_price'];

        return response()->json([
            [
                'months' => 1,
                'base_price' => $monthlyPrice,
                'label' => '1 mois',
                'sort_order' => 1,
            ],
            [
                'months' => 6,
                'base_price' => $semiannualPrice,
                'label' => '6 mois',
                'sort_order' => 2,
            ],
            [
                'months' => 12,
                'base_price' => $annualPrice,
                'label' => '12 mois',
                'sort_order' => 3,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'durations' => ['required', 'array', 'min:1'],
            'durations.*.months' => ['required', 'integer', 'min:1'],
            'durations.*.base_price' => ['required', 'numeric', 'min:0'],
            'durations.*.label' => ['required', 'string', 'max:255'],
            'durations.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        $monthsList = collect($validated['durations'])->pluck('months')->all();

        SubscriptionDuration::query()
            ->whereNotIn('months', $monthsList)
            ->delete();

        foreach ($validated['durations'] as $durationData) {
            SubscriptionDuration::updateOrCreate(
                ['months' => $durationData['months']],
                $durationData
            );
        }

        $durations = SubscriptionDuration::query()
            ->orderBy('sort_order')
            ->get();

        return response()->json($durations);
    }
}
