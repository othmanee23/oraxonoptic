<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $subscription = Subscription::query()
            ->where('user_id', $user->id)
            ->orderByDesc('expiry_date')
            ->first();

        if (! $subscription) {
            return response()->json([
                'subscription' => null,
                'is_active' => false,
            ]);
        }

        $isActive = $subscription->status === 'active'
            && Carbon::parse($subscription->expiry_date)->greaterThan(Carbon::now());

        return response()->json([
            'subscription' => $subscription,
            'is_active' => $isActive,
        ]);
    }
}
