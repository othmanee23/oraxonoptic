<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
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

        $products = Product::query()
            ->where('store_id', $storeId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $validated = $request->validate([
            'reference' => ['required', 'string', 'max:100', Rule::unique('products')->where('store_id', $storeId)],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'brand' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'integer', 'min:0'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
            'lens_type' => ['nullable', 'string', 'max:50'],
            'sphere' => ['nullable', 'string', 'max:50'],
            'cylinder' => ['nullable', 'string', 'max:50'],
            'axis' => ['nullable', 'string', 'max:50'],
            'addition' => ['nullable', 'string', 'max:50'],
            'base_curve' => ['nullable', 'string', 'max:50'],
            'diameter' => ['nullable', 'string', 'max:50'],
        ]);

        $category = Category::query()
            ->where('store_id', $storeId)
            ->where('name', $validated['category'])
            ->first();

        if (! $category) {
            return response()->json([
                'message' => 'Category not found for this store.',
            ], 422);
        }

        $product = Product::create([
            'store_id' => $storeId,
            'category_id' => $category->id,
            'reference' => $validated['reference'],
            'name' => $validated['name'],
            'brand' => $validated['brand'],
            'description' => $validated['description'] ?? null,
            'purchase_price' => $validated['purchase_price'],
            'selling_price' => $validated['selling_price'],
            'current_stock' => $validated['current_stock'],
            'minimum_stock' => $validated['minimum_stock'],
            'lens_type' => $validated['lens_type'] ?? null,
            'sphere' => $validated['sphere'] ?? null,
            'cylinder' => $validated['cylinder'] ?? null,
            'axis' => $validated['axis'] ?? null,
            'addition' => $validated['addition'] ?? null,
            'base_curve' => $validated['base_curve'] ?? null,
            'diameter' => $validated['diameter'] ?? null,
        ]);

        if ((int) $product->current_stock <= (int) $product->minimum_stock) {
            $store = Store::query()->find($storeId);
            if ($store) {
                NotificationService::notifyStoreUsers($store, [
                    'type' => 'low_stock',
                    'title' => 'Stock faible',
                    'message' => sprintf('%s est en stock faible (%d).', $product->name, $product->current_stock),
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

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $product->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'reference' => ['required', 'string', 'max:100', Rule::unique('products')->where('store_id', $storeId)->ignore($product->id)],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'brand' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'integer', 'min:0'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
            'lens_type' => ['nullable', 'string', 'max:50'],
            'sphere' => ['nullable', 'string', 'max:50'],
            'cylinder' => ['nullable', 'string', 'max:50'],
            'axis' => ['nullable', 'string', 'max:50'],
            'addition' => ['nullable', 'string', 'max:50'],
            'base_curve' => ['nullable', 'string', 'max:50'],
            'diameter' => ['nullable', 'string', 'max:50'],
        ]);

        $category = Category::query()
            ->where('store_id', $storeId)
            ->where('name', $validated['category'])
            ->first();

        if (! $category) {
            return response()->json([
                'message' => 'Category not found for this store.',
            ], 422);
        }

        $previousStock = (int) $product->current_stock;
        $previousMin = (int) $product->minimum_stock;

        $product->update([
            'category_id' => $category->id,
            'reference' => $validated['reference'],
            'name' => $validated['name'],
            'brand' => $validated['brand'],
            'description' => $validated['description'] ?? null,
            'purchase_price' => $validated['purchase_price'],
            'selling_price' => $validated['selling_price'],
            'current_stock' => $validated['current_stock'],
            'minimum_stock' => $validated['minimum_stock'],
            'lens_type' => $validated['lens_type'] ?? null,
            'sphere' => $validated['sphere'] ?? null,
            'cylinder' => $validated['cylinder'] ?? null,
            'axis' => $validated['axis'] ?? null,
            'addition' => $validated['addition'] ?? null,
            'base_curve' => $validated['base_curve'] ?? null,
            'diameter' => $validated['diameter'] ?? null,
        ]);

        $newStock = (int) $product->current_stock;
        $newMin = (int) $product->minimum_stock;
        if ($previousStock > $previousMin && $newStock <= $newMin) {
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

        return response()->json($product);
    }

    public function destroy(Request $request, Product $product)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $product->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $product->delete();

        return response()->noContent();
    }

    public function import(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $validated = $request->validate([
            'products' => ['required', 'array', 'min:1'],
            'products.*.reference' => ['required', 'string', 'max:100'],
            'products.*.name' => ['required', 'string', 'max:255'],
            'products.*.category' => ['required', 'string', 'max:100'],
            'products.*.brand' => ['required', 'string', 'max:255'],
            'products.*.description' => ['nullable', 'string'],
            'products.*.purchase_price' => ['required', 'numeric', 'min:0'],
            'products.*.selling_price' => ['required', 'numeric', 'min:0'],
            'products.*.current_stock' => ['required', 'integer', 'min:0'],
            'products.*.minimum_stock' => ['required', 'integer', 'min:0'],
            'products.*.lens_type' => ['nullable', 'string', 'max:50'],
            'products.*.sphere' => ['nullable', 'string', 'max:50'],
            'products.*.cylinder' => ['nullable', 'string', 'max:50'],
            'products.*.axis' => ['nullable', 'string', 'max:50'],
            'products.*.addition' => ['nullable', 'string', 'max:50'],
            'products.*.base_curve' => ['nullable', 'string', 'max:50'],
            'products.*.diameter' => ['nullable', 'string', 'max:50'],
        ]);

        $created = [];
        foreach ($validated['products'] as $data) {
            $exists = Product::query()
                ->where('store_id', $storeId)
                ->where('reference', $data['reference'])
                ->exists();
            if ($exists) {
                continue;
            }

            $category = Category::query()
                ->where('store_id', $storeId)
                ->where('name', $data['category'])
                ->first();

            if (! $category) {
                continue;
            }

            $created[] = Product::create([
                'store_id' => $storeId,
                'category_id' => $category->id,
                'reference' => $data['reference'],
                'name' => $data['name'],
                'brand' => $data['brand'],
                'description' => $data['description'] ?? null,
                'purchase_price' => $data['purchase_price'],
                'selling_price' => $data['selling_price'],
                'current_stock' => $data['current_stock'],
                'minimum_stock' => $data['minimum_stock'],
                'lens_type' => $data['lens_type'] ?? null,
                'sphere' => $data['sphere'] ?? null,
                'cylinder' => $data['cylinder'] ?? null,
                'axis' => $data['axis'] ?? null,
                'addition' => $data['addition'] ?? null,
                'base_curve' => $data['base_curve'] ?? null,
                'diameter' => $data['diameter'] ?? null,
            ]);
        }

        return response()->json($created, 201);
    }
}
