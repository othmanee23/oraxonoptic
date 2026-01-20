<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
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

        $suppliers = Supplier::query()
            ->where('store_id', $storeId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $supplier = Supplier::create([
            'store_id' => $storeId,
            ...$validated,
        ]);

        return response()->json($supplier, 201);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $supplier->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $supplier->update($validated);

        return response()->json($supplier);
    }

    public function destroy(Request $request, Supplier $supplier)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $supplier->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $supplier->delete();

        return response()->noContent();
    }

    public function import(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $validated = $request->validate([
            'suppliers' => ['required', 'array', 'min:1'],
            'suppliers.*.name' => ['required', 'string', 'max:255'],
            'suppliers.*.contact_name' => ['nullable', 'string', 'max:255'],
            'suppliers.*.email' => ['nullable', 'email', 'max:255'],
            'suppliers.*.phone' => ['nullable', 'string', 'max:50'],
            'suppliers.*.address' => ['nullable', 'string', 'max:255'],
            'suppliers.*.city' => ['nullable', 'string', 'max:255'],
            'suppliers.*.tax_id' => ['nullable', 'string', 'max:50'],
            'suppliers.*.notes' => ['nullable', 'string'],
            'suppliers.*.is_active' => ['nullable', 'boolean'],
        ]);

        $created = [];
        foreach ($validated['suppliers'] as $supplierData) {
            $created[] = Supplier::create([
                'store_id' => $storeId,
                ...$supplierData,
            ]);
        }

        return response()->json($created, 201);
    }
}
