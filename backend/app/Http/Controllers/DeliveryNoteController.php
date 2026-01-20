<?php

namespace App\Http\Controllers;

use App\Models\DeliveryNote;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\WorkshopOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryNoteController extends Controller
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

        $notes = DeliveryNote::query()
            ->where('store_id', $storeId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request)
    {
        $storeId = $this->activeStoreId($request);
        $user = $request->user();

        $validated = $request->validate([
            'reference' => ['required', 'string', 'max:255'],
            'purchase_order_id' => ['nullable', 'integer', 'exists:purchase_orders,id'],
            'purchase_order_ref' => ['nullable', 'string', 'max:255'],
            'supplier_id' => ['nullable', 'string', 'max:255'],
            'supplier_name' => ['nullable', 'string', 'max:255'],
            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required', 'string'],
            'items.*.product_name' => ['required', 'string', 'max:255'],
            'items.*.product_reference' => ['nullable', 'string', 'max:255'],
            'items.*.ordered_quantity' => ['nullable', 'numeric', 'min:0'],
            'items.*.received_quantity' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'validated_at' => ['nullable', 'date'],
        ]);

        $deliveryNote = DB::transaction(function () use ($validated, $storeId, $user) {
            $note = DeliveryNote::create([
                'store_id' => $storeId,
                'reference' => $validated['reference'],
                'purchase_order_id' => $validated['purchase_order_id'] ?? null,
                'purchase_order_ref' => $validated['purchase_order_ref'] ?? null,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'supplier_name' => $validated['supplier_name'] ?? null,
                'items' => $validated['items'] ?? [],
                'status' => $validated['status'] ?? 'validated',
                'notes' => $validated['notes'] ?? null,
                'validated_at' => $validated['validated_at'] ?? now(),
            ]);

            if (! empty($validated['purchase_order_id'])) {
                $order = PurchaseOrder::query()->whereKey($validated['purchase_order_id'])->first();
                if ($order && (int) $order->store_id === $storeId) {
                    $this->updatePurchaseOrderStatus($order, $storeId);
                }
            }

            $items = $validated['items'] ?? [];
            foreach ($items as $item) {
                $productId = $item['product_id'] ?? null;
                if (! $productId) {
                    continue;
                }
                $product = Product::query()->whereKey($productId)->first();
                if (! $product || (int) $product->store_id !== $storeId) {
                    continue;
                }

                $receivedQty = (int) $item['received_quantity'];
                if ($receivedQty <= 0) {
                    continue;
                }

                $previousStock = (int) $product->current_stock;
                $newStock = $previousStock + $receivedQty;
                $product->current_stock = $newStock;
                $product->save();

                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'entree',
                    'quantity' => $receivedQty,
                    'previous_stock' => $previousStock,
                    'new_stock' => $newStock,
                    'reason' => 'Réception fournisseur',
                    'from_store_id' => null,
                    'to_store_id' => $storeId,
                    'reference' => $note->reference,
                    'created_by' => $user?->id,
                ]);
            }

            return $note;
        });

        return response()->json($deliveryNote, 201);
    }

    private function updatePurchaseOrderStatus(PurchaseOrder $order, int $storeId): void
    {
            if ($order->type === 'lens') {
                $order->status = 'received';
                $order->received_at = now();
                $order->save();

            WorkshopOrder::query()
                ->where('purchase_order_id', $order->id)
                ->where('store_id', $storeId)
                ->update([
                    'status' => 'verres_recus',
                    'lens_received_at' => now(),
                ]);

            return;
        }

        $notes = DeliveryNote::query()
            ->where('purchase_order_id', $order->id)
            ->where('store_id', $storeId)
            ->get();

        $receivedTotals = [];
        foreach ($notes as $note) {
            foreach ($note->items ?? [] as $item) {
                $productId = (string) ($item['product_id'] ?? '');
                if (! $productId) {
                    continue;
                }
                $receivedTotals[$productId] = ($receivedTotals[$productId] ?? 0) + (float) ($item['received_quantity'] ?? 0);
            }
        }

        $items = $order->items ?? [];
        $allComplete = true;
        $hasAny = false;
        foreach ($items as $item) {
            $productId = (string) ($item['product_id'] ?? '');
            $ordered = (float) ($item['quantity'] ?? 0);
            $received = (float) ($receivedTotals[$productId] ?? 0);
            if ($received > 0) {
                $hasAny = true;
            }
            if ($received < $ordered) {
                $allComplete = false;
            }
        }

        if ($allComplete && $hasAny) {
            $order->status = 'received';
            $order->received_at = now();
        } elseif ($hasAny) {
            $order->status = 'partial';
        }
        $order->save();
    }
}
