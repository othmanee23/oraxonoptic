<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Store;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    private function activeStoreId(Request $request): int
    {
        $storeId = $request->attributes->get('activeStoreId');
        if (! $storeId) {
            abort(422, 'Store context missing.');
        }

        return (int) $storeId;
    }

    public function index(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $movements = StockMovement::query()
            ->where(function ($query) use ($storeId) {
                $query->where('from_store_id', $storeId)
                    ->orWhere('to_store_id', $storeId)
                    ->orWhereHas('product', function ($productQuery) use ($storeId) {
                        $productQuery->where('store_id', $storeId);
                    });
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json($movements);
    }

    public function store(Request $request)
    {
        $storeId = $this->activeStoreId($request);
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'type' => ['required', 'string'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:255'],
            'reference' => ['nullable', 'string', 'max:255'],
            'to_store_id' => ['nullable', 'integer', 'exists:stores,id'],
        ]);

        $product = Product::query()->whereKey($validated['product_id'])->firstOrFail();
        if ((int) $product->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $movement = DB::transaction(function () use ($validated, $product, $storeId, $user) {
            $previousStock = (int) $product->current_stock;
            $newStock = $previousStock;

            if ($validated['type'] === 'entree') {
                $newStock = $previousStock + $validated['quantity'];
            } elseif ($validated['type'] === 'sortie' || $validated['type'] === 'transfert') {
                if ($validated['quantity'] > $previousStock) {
                    return null;
                }
                $newStock = $previousStock - $validated['quantity'];
            } elseif ($validated['type'] === 'ajustement') {
                $newStock = $validated['quantity'];
            }

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reason' => $validated['reason'],
                'from_store_id' => $storeId,
                'to_store_id' => $validated['to_store_id'] ?? null,
                'reference' => $validated['reference'] ?? null,
                'created_by' => $user->id,
            ]);

            $product->current_stock = $newStock;
            $product->save();

            return $movement;
        });

        if (! $movement) {
            return response()->json([
                'message' => 'Stock insuffisant.',
            ], 422);
        }

        $previousStock = (int) $movement->previous_stock;
        $newStock = (int) $movement->new_stock;
        if ($previousStock > (int) $product->minimum_stock && $newStock <= (int) $product->minimum_stock) {
            $store = Store::query()->find($storeId);
            if ($store) {
                NotificationService::notifyStoreUsers($store, [
                    'type' => 'low_stock',
                    'title' => 'Stock faible',
                    'message' => sprintf('%s est en stock faible (%d).', $product->name, $newStock),
                    'link' => '/stock',
                    'data' => [
                        'product_id' => $product->id,
                    ],
                    'dedupe' => [
                        'field' => 'product_id',
                        'value' => $product->id,
                    ],
                ]);
            }
        }

        return response()->json($movement, 201);
    }
}
