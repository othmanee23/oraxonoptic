<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Mail\AdminEmailVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminOpticienController extends Controller
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
            ->withCount('ownedStores')
            ->orderByDesc('created_at')
            ->get();

        $subscriptions = Subscription::query()
            ->whereIn('user_id', $opticiens->pluck('id'))
            ->orderByDesc('expiry_date')
            ->get()
            ->groupBy('user_id');

        $data = $opticiens->map(function (User $opticien) use ($subscriptions) {
            $subscription = $subscriptions->get($opticien->id)?->first();
            return [
                'id' => $opticien->id,
                'first_name' => $opticien->first_name,
                'last_name' => $opticien->last_name,
                'email' => $opticien->email,
                'phone' => $opticien->phone,
                'is_active' => (bool) $opticien->is_active,
                'is_pending_approval' => (bool) $opticien->is_pending_approval,
                'created_at' => $opticien->created_at?->toISOString(),
                'max_stores' => $opticien->max_stores,
                'store_count' => $opticien->owned_stores_count,
                'subscription' => $subscription ? [
                    'id' => $subscription->id,
                    'start_date' => $subscription->start_date?->toISOString(),
                    'expiry_date' => $subscription->expiry_date?->toISOString(),
                    'status' => $subscription->status,
                ] : null,
            ];
        });

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8'],
            'max_stores' => ['nullable', 'integer', 'min:1'],
        ]);

        $opticien = User::create([
            'name' => trim($validated['first_name'].' '.$validated['last_name']),
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => bcrypt($validated['password']),
            'role' => 'admin',
            'max_stores' => $validated['max_stores'] ?? null,
            'is_active' => true,
            'is_pending_approval' => false,
        ]);

        Mail::to($opticien->email)->send(new AdminEmailVerification($opticien));

        return response()->json($opticien, 201);
    }

    public function destroy(Request $request, User $user)
    {
        $currentUser = $request->user();
        if (! $currentUser || $currentUser->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        if ($user->role !== 'admin' || $user->owner_id !== null) {
            abort(404);
        }

        $user->delete();

        return response()->noContent();
    }

    public function updateMaxStores(Request $request, User $user)
    {
        $currentUser = $request->user();
        if (! $currentUser || $currentUser->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        if ($user->role !== 'admin' || $user->owner_id !== null) {
            abort(404);
        }

        $validated = $request->validate([
            'max_stores' => ['required', 'integer', 'min:1'],
        ]);

        $user->max_stores = $validated['max_stores'];
        $user->save();

        return response()->json($user);
    }

    public function updateSubscription(Request $request, User $user)
    {
        $currentUser = $request->user();
        if (! $currentUser || $currentUser->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        if ($user->role !== 'admin' || $user->owner_id !== null) {
            abort(404);
        }

        $validated = $request->validate([
            'action' => ['required', 'in:add,set'],
            'days' => ['required', 'integer', 'min:0'],
        ]);

        $now = now();
        $subscription = \App\Models\Subscription::query()
            ->where('user_id', $user->id)
            ->orderByDesc('expiry_date')
            ->first();

        $days = (int) $validated['days'];

        if ($subscription) {
            $currentExpiry = $subscription->expiry_date ? \Carbon\Carbon::parse($subscription->expiry_date) : $now;
            if ($validated['action'] === 'add') {
                $baseDate = $currentExpiry->greaterThan($now) ? $currentExpiry : $now;
                $subscription->expiry_date = $baseDate->copy()->addDays($days);
            } else {
                $subscription->expiry_date = $now->copy()->addDays($days);
            }
            $subscription->status = 'active';
            if (! $subscription->start_date) {
                $subscription->start_date = $now;
            }
            $subscription->save();
        } else {
            $subscription = \App\Models\Subscription::create([
                'user_id' => $user->id,
                'start_date' => $now,
                'expiry_date' => $now->copy()->addDays($days),
                'status' => 'active',
            ]);
        }

        $user->is_pending_approval = false;
        $user->is_active = true;
        $user->save();

        return response()->json($subscription);
    }

    public function approve(Request $request, User $user)
    {
        $currentUser = $request->user();
        if (! $currentUser || $currentUser->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        if ($user->role !== 'admin' || $user->owner_id !== null) {
            abort(404);
        }

        $user->is_pending_approval = false;
        $user->is_active = true;
        $user->save();

        $hasSubscription = \App\Models\Subscription::query()
            ->where('user_id', $user->id)
            ->exists();

        if (! $hasSubscription) {
            $now = now();
            \App\Models\Subscription::create([
                'user_id' => $user->id,
                'start_date' => $now,
                'expiry_date' => $now->copy()->addDays(14),
                'status' => 'active',
            ]);
        }

        return response()->json($user);
    }

    public function reject(Request $request, User $user)
    {
        $currentUser = $request->user();
        if (! $currentUser || $currentUser->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        if ($user->role !== 'admin' || $user->owner_id !== null) {
            abort(404);
        }

        $user->delete();

        return response()->noContent();
    }

    public function toggleBlock(Request $request, User $user)
    {
        $currentUser = $request->user();
        if (! $currentUser || $currentUser->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        if ($user->role !== 'admin' || $user->owner_id !== null) {
            abort(404);
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        return response()->json($user);
    }
}
