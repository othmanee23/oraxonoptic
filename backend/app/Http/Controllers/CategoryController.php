<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
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

        $categories = Category::query()
            ->where('store_id', $storeId)
            ->orderBy('label')
            ->get();

        if ($categories->isEmpty()) {
            $defaults = [
                ['name' => 'montures', 'label' => 'Montures', 'is_default' => true],
                ['name' => 'lentilles', 'label' => 'Lentilles de contact', 'is_default' => true],
                ['name' => 'accessoires', 'label' => 'Accessoires', 'is_default' => true],
                ['name' => 'solaires', 'label' => 'Solaires', 'is_default' => true],
                ['name' => 'divers', 'label' => 'Divers', 'is_default' => true],
            ];

            foreach ($defaults as $data) {
                Category::create([
                    'store_id' => $storeId,
                    'name' => $data['name'],
                    'label' => $data['label'],
                    'is_default' => $data['is_default'],
                ]);
            }

            $categories = Category::query()
                ->where('store_id', $storeId)
                ->orderBy('label')
                ->get();
        }

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('categories')->where('store_id', $storeId)],
            'label' => ['required', 'string', 'max:150'],
        ]);

        $category = Category::create([
            'store_id' => $storeId,
            'name' => $validated['name'],
            'label' => $validated['label'],
            'is_default' => false,
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $category->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $rules = [
            'label' => ['required', 'string', 'max:150'],
        ];

        if (! $category->is_default) {
            $rules['name'] = ['required', 'string', 'max:100', Rule::unique('categories')->where('store_id', $storeId)->ignore($category->id)];
        }

        $validated = $request->validate($rules);

        $category->label = $validated['label'];
        if (! $category->is_default && isset($validated['name'])) {
            $category->name = $validated['name'];
        }
        $category->save();

        return response()->json($category);
    }

    public function destroy(Request $request, Category $category)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $category->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        if ($category->is_default) {
            return response()->json([
                'message' => 'Default categories cannot be deleted.',
            ], 422);
        }

        $category->delete();

        return response()->noContent();
    }
}
