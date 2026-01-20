<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;

class AdminStoreController extends Controller
{
    private function ensureSuperAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }
    }

    public function index(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $stores = Store::query()
            ->orderByDesc('created_at')
            ->get();

        return response()->json($stores);
    }

    public function toggle(Request $request, Store $store)
    {
        $this->ensureSuperAdmin($request);

        $store->is_active = ! $store->is_active;
        $store->save();

        return response()->json($store);
    }
}
