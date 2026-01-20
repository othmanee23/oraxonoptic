<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        $opticiens = User::query()
            ->where('role', 'admin')
            ->whereNull('owner_id')
            ->where('is_pending_approval', false)
            ->get();

        $opticienIds = $opticiens->pluck('id');
        $subscriptions = Subscription::query()
            ->whereIn('user_id', $opticienIds)
            ->orderByDesc('expiry_date')
            ->get()
            ->groupBy('user_id');

        $now = Carbon::now();
        $active = 0;
        $expired = 0;
        $blocked = 0;

        foreach ($opticiens as $opticien) {
            if (! $opticien->is_active) {
                $blocked++;
                continue;
            }

            $subscription = $subscriptions->get($opticien->id)?->first();
            if ($subscription && $subscription->status === 'active' && Carbon::parse($subscription->expiry_date)->greaterThan($now)) {
                $active++;
            } else {
                $expired++;
            }
        }

        $totalRevenue = PaymentRequest::query()
            ->where('status', 'approved')
            ->sum('amount');

        return response()->json([
            'total' => $opticiens->count(),
            'active' => $active,
            'expired' => $expired,
            'blocked' => $blocked,
            'total_revenue' => (float) $totalRevenue,
        ]);
    }
}
