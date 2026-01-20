<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    private function ensureAdmin(Request $request): User
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if ($user->role !== 'admin') {
            abort(403, 'Forbidden');
        }

        return $user;
    }

    private function mapUser(User $user): array
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'phone' => $user->phone,
            'role' => $user->role,
            'permissions' => $user->permissions,
            'is_active' => (bool) $user->is_active,
            'created_at' => $user->created_at?->toISOString(),
            'last_login_at' => $user->last_login_at?->toISOString(),
            'owner_id' => $user->owner_id,
            'store_ids' => $user->stores->pluck('id')->map(fn ($id) => (string) $id)->all(),
        ];
    }

    private function resolveStoreIds(User $admin, array $storeIds = []): array
    {
        if (empty($storeIds)) {
            return Store::query()
                ->where('owner_id', $admin->id)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();
        }

        $count = Store::query()
            ->where('owner_id', $admin->id)
            ->whereIn('id', $storeIds)
            ->count();

        if ($count !== count($storeIds)) {
            abort(403, 'Forbidden');
        }

        return array_map('intval', $storeIds);
    }

    public function index(Request $request)
    {
        $admin = $this->ensureAdmin($request);

        $users = User::query()
            ->with('stores')
            ->where('owner_id', $admin->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($users->map(fn (User $user) => $this->mapUser($user)));
    }

    public function store(Request $request)
    {
        $admin = $this->ensureAdmin($request);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => ['required', 'string', Rule::in(['manager', 'vendeur', 'technicien'])],
            'password' => ['required', 'string', 'min:6'],
            'permissions' => ['nullable', 'array'],
            'store_ids' => ['nullable', 'array'],
            'store_ids.*' => ['integer', 'exists:stores,id'],
        ]);

        $user = User::create([
            'name' => trim($validated['first_name'].' '.$validated['last_name']),
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? null,
            'is_active' => true,
            'is_pending_approval' => false,
            'owner_id' => $admin->id,
            'password' => Hash::make($validated['password']),
        ]);

        $storeIds = $this->resolveStoreIds($admin, $validated['store_ids'] ?? []);
        $user->stores()->sync($storeIds);
        $user->load('stores');

        return response()->json($this->mapUser($user), 201);
    }

    public function update(Request $request, User $user)
    {
        $admin = $this->ensureAdmin($request);
        if ((int) $user->owner_id !== (int) $admin->id) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => ['required', 'string', Rule::in(['manager', 'vendeur', 'technicien'])],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $user->first_name = $validated['first_name'];
        $user->last_name = $validated['last_name'];
        $user->name = trim($validated['first_name'].' '.$validated['last_name']);
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;
        $user->role = $validated['role'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();
        $user->load('stores');

        return response()->json($this->mapUser($user));
    }

    public function updatePermissions(Request $request, User $user)
    {
        $admin = $this->ensureAdmin($request);
        if ((int) $user->owner_id !== (int) $admin->id) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'permissions' => ['required', 'array'],
        ]);

        $user->permissions = $validated['permissions'];
        $user->save();
        $user->load('stores');

        return response()->json($this->mapUser($user));
    }

    public function updateStores(Request $request, User $user)
    {
        $admin = $this->ensureAdmin($request);
        if ((int) $user->owner_id !== (int) $admin->id) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'store_ids' => ['required', 'array'],
            'store_ids.*' => ['integer', 'exists:stores,id'],
        ]);

        $storeIds = $this->resolveStoreIds($admin, $validated['store_ids']);
        $user->stores()->sync($storeIds);
        $user->load('stores');

        return response()->json($this->mapUser($user));
    }

    public function toggleActive(Request $request, User $user)
    {
        $admin = $this->ensureAdmin($request);
        if ((int) $user->owner_id !== (int) $admin->id) {
            abort(403, 'Forbidden');
        }

        $user->is_active = ! $user->is_active;
        $user->save();
        $user->load('stores');

        return response()->json($this->mapUser($user));
    }
}
