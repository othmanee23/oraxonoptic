<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\WorkshopOrder;
use Illuminate\Http\Request;
use App\Services\NotificationService;

class WorkshopOrderController extends Controller
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

        $orders = WorkshopOrder::query()
            ->where('store_id', $storeId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $validated = $request->validate([
            'order_number' => ['required', 'string', 'max:255'],
            'invoice_id' => ['nullable', 'integer', 'exists:invoices,id'],
            'invoice_number' => ['nullable', 'string', 'max:255'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'purchase_order_id' => ['nullable', 'integer', 'exists:purchase_orders,id'],
            'purchase_order_ref' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:50'],
            'priority' => ['required', 'string', 'max:50'],
            'lens_type' => ['nullable', 'string', 'max:255'],
            'lens_treatments' => ['nullable', 'array'],
            'lens_parameters' => ['nullable', 'array'],
            'lens_supplier' => ['nullable', 'string', 'max:255'],
            'lens_supplier_order_ref' => ['nullable', 'string', 'max:255'],
            'lens_supplier_id' => ['nullable', 'string', 'max:255'],
            'lens_purchase_price' => ['nullable', 'numeric', 'min:0'],
            'lens_selling_price' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $workshopOrder = WorkshopOrder::create([
            'store_id' => $storeId,
            'order_number' => $validated['order_number'],
            'invoice_id' => $validated['invoice_id'] ?? null,
            'invoice_number' => $validated['invoice_number'] ?? null,
            'client_id' => $validated['client_id'] ?? null,
            'client_name' => $validated['client_name'] ?? null,
            'purchase_order_id' => $validated['purchase_order_id'] ?? null,
            'purchase_order_ref' => $validated['purchase_order_ref'] ?? null,
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'lens_type' => $validated['lens_type'] ?? null,
            'lens_treatments' => $validated['lens_treatments'] ?? null,
            'lens_parameters' => $validated['lens_parameters'] ?? null,
            'lens_supplier' => $validated['lens_supplier'] ?? null,
            'lens_supplier_order_ref' => $validated['lens_supplier_order_ref'] ?? null,
            'lens_supplier_id' => $validated['lens_supplier_id'] ?? null,
            'lens_purchase_price' => $validated['lens_purchase_price'] ?? null,
            'lens_selling_price' => $validated['lens_selling_price'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($workshopOrder, 201);
    }

    public function update(Request $request, WorkshopOrder $workshopOrder)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $workshopOrder->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'status' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        $now = now();
        $previousStatus = $workshopOrder->status;
        if (! empty($validated['status']) && $validated['status'] !== $workshopOrder->status) {
            $workshopOrder->status = $validated['status'];
            if ($validated['status'] === 'verres_recus') {
                $workshopOrder->lens_received_at = $now;
            } elseif ($validated['status'] === 'pret') {
                $workshopOrder->completed_at = $now;
            } elseif ($validated['status'] === 'livre') {
                $workshopOrder->delivered_at = $now;
            }
        }

        if (array_key_exists('priority', $validated)) {
            $workshopOrder->priority = $validated['priority'] ?? $workshopOrder->priority;
        }

        if (array_key_exists('notes', $validated)) {
            $workshopOrder->notes = $validated['notes'];
        }

        $workshopOrder->save();

        if ($previousStatus !== 'pret' && $workshopOrder->status === 'pret') {
            $store = Store::query()->find($storeId);
            if ($store) {
                $clientName = $workshopOrder->client_name ?: 'Client';
                NotificationService::notifyStoreUsers($store, [
                    'type' => 'workshop_ready',
                    'title' => 'Montage prêt',
                    'message' => sprintf('Commande %s prête pour %s.', $workshopOrder->order_number, $clientName),
                    'link' => '/atelier',
                    'data' => [
                        'workshop_order_id' => $workshopOrder->id,
                    ],
                    'dedupe' => [
                        'field' => 'workshop_order_id',
                        'value' => $workshopOrder->id,
                    ],
                ]);
            }
        }

        return response()->json($workshopOrder);
    }
}
