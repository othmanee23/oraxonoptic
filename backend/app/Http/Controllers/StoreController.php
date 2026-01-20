<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if ($user->role === 'admin') {
            $stores = Store::query()
                ->where('owner_id', $user->id)
                ->orderByDesc('created_at')
                ->get();
        } else {
            $stores = $user->stores()->orderByDesc('stores.created_at')->get();
        }

        return response()->json($stores);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if ($user->role !== 'admin') {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'invoice_prefix' => ['nullable', 'string', 'max:20'],
        ]);

        if ($user->max_stores !== null) {
            $count = Store::query()->where('owner_id', $user->id)->count();
            if ($count >= $user->max_stores) {
                return response()->json([
                    'message' => 'Store limit reached.',
                ], 422);
            }
        }

        $store = Store::create([
            'owner_id' => $user->id,
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'tax_id' => $validated['tax_id'] ?? null,
            'invoice_prefix' => $validated['invoice_prefix'] ?? null,
            'is_active' => true,
        ]);

        $user->stores()->syncWithoutDetaching([$store->id]);

        return response()->json($store, 201);
    }

    public function update(Request $request, Store $store)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if ($user->role !== 'admin' || $store->owner_id !== $user->id) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'invoice_prefix' => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $store->update($validated);

        return response()->json($store);
    }

    public function setSelected(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if ($user->role === 'super_admin') {
            $user->last_store_id = null;
            $user->save();

            return response()->json($user);
        }

        $validated = $request->validate([
            'store_id' => ['nullable', 'integer', 'exists:stores,id'],
        ]);

        $storeId = $validated['store_id'] ?? null;
        if (! $storeId) {
            $user->last_store_id = null;
            $user->save();

            return response()->json($user);
        }

        $store = Store::query()->whereKey($storeId)->first();
        if (! $store) {
            return response()->json([
                'message' => 'Store not found.',
            ], 404);
        }

        if (! $store->is_active) {
            return response()->json([
                'message' => 'Store inactive.',
            ], 403);
        }

        if ($user->role === 'admin') {
            if ((int) $store->owner_id !== (int) $user->id) {
                return response()->json([
                    'message' => 'Forbidden.',
                ], 403);
            }
        } elseif (! $user->stores()->whereKey($store->id)->exists()) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        $user->last_store_id = $store->id;
        $user->save();

        return response()->json($user);
    }

    public function toggleActive(Request $request, Store $store)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if ($user->role !== 'admin' || $store->owner_id !== $user->id) {
            abort(403, 'Forbidden');
        }

        $store->is_active = ! $store->is_active;
        $store->save();

        return response()->json($store);
    }

    public function destroy(Request $request, Store $store)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if ($user->role !== 'admin' || $store->owner_id !== $user->id) {
            abort(403, 'Forbidden');
        }

        $store->delete();

        return response()->noContent();
    }
}
