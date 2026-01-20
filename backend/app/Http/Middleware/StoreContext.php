<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StoreContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $headerStoreId = $request->header('X-Store-Id');
        $storeId = $headerStoreId;
        if (! $storeId && $user) {
            $storeId = $user->last_store_id;
        }

        if (! $storeId || ! $user) {
            return $next($request);
        }

        if ($user->role === 'super_admin') {
            return $next($request);
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

        if ($headerStoreId && (int) $user->last_store_id !== (int) $store->id) {
            $user->last_store_id = $store->id;
            $user->save();
        }

        $request->attributes->set('activeStore', $store);
        $request->attributes->set('activeStoreId', (string) $store->id);

        return $next($request);
    }
}
