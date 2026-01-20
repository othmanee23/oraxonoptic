<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
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

        $orders = PurchaseOrder::query()
            ->where('store_id', $storeId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $validated = $request->validate([
            'reference' => ['required', 'string', 'max:255'],
            'supplier_name' => ['nullable', 'string', 'max:255'],
            'supplier_id' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:50'],
            'type' => ['required', 'string', 'max:50'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'invoice_id' => ['nullable', 'integer', 'exists:invoices,id'],
            'invoice_number' => ['nullable', 'string', 'max:255'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'lens_type' => ['nullable', 'string', 'max:255'],
            'lens_treatments' => ['nullable', 'array'],
            'lens_parameters' => ['nullable', 'array'],
            'items' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
            'expected_date' => ['nullable', 'date'],
            'received_at' => ['nullable', 'date'],
        ]);

        $purchaseOrder = PurchaseOrder::create([
            'store_id' => $storeId,
            'reference' => $validated['reference'],
            'supplier_name' => $validated['supplier_name'] ?? null,
            'supplier_id' => $validated['supplier_id'] ?? null,
            'status' => $validated['status'],
            'type' => $validated['type'],
            'total_amount' => $validated['total_amount'],
            'invoice_id' => $validated['invoice_id'] ?? null,
            'invoice_number' => $validated['invoice_number'] ?? null,
            'client_name' => $validated['client_name'] ?? null,
            'lens_type' => $validated['lens_type'] ?? null,
            'lens_treatments' => $validated['lens_treatments'] ?? null,
            'lens_parameters' => $validated['lens_parameters'] ?? null,
            'items' => $validated['items'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'expected_date' => $validated['expected_date'] ?? null,
            'received_at' => $validated['received_at'] ?? null,
        ]);

        return response()->json($purchaseOrder, 201);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $purchaseOrder->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'reference' => ['required', 'string', 'max:255'],
            'supplier_name' => ['nullable', 'string', 'max:255'],
            'supplier_id' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:50'],
            'type' => ['required', 'string', 'max:50'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'invoice_id' => ['nullable', 'integer', 'exists:invoices,id'],
            'invoice_number' => ['nullable', 'string', 'max:255'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'lens_type' => ['nullable', 'string', 'max:255'],
            'lens_treatments' => ['nullable', 'array'],
            'lens_parameters' => ['nullable', 'array'],
            'items' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
            'expected_date' => ['nullable', 'date'],
            'received_at' => ['nullable', 'date'],
        ]);

        $purchaseOrder->update($validated);

        return response()->json($purchaseOrder);
    }
}
