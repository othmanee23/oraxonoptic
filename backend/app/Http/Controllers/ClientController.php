<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Store;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    private function activeStoreId(Request $request): ?int
    {
        $storeId = $request->attributes->get('activeStoreId');
        return $storeId ? (int) $storeId : null;
    }

    private function resolveOwnerId(User $user): int
    {
        if ($user->role === 'admin') {
            return (int) $user->id;
        }

        if ($user->owner_id) {
            return (int) $user->owner_id;
        }

        abort(403, 'Forbidden');
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $ownerId = $this->resolveOwnerId($user);

        $clients = Client::query()
            ->where('owner_id', $ownerId)
            ->with([
                'latestInvoice' => function ($query) {
                    $query->select(
                        'invoices.id',
                        'invoices.client_id',
                        'invoices.total',
                        'invoices.amount_paid',
                        'invoices.amount_due',
                        'invoices.status',
                        'invoices.created_at',
                        'invoices.paid_at',
                        'invoices.validated_at'
                    );
                },
            ])
            ->withCount('invoices')
            ->withSum('invoices', 'total')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $ownerId = $this->resolveOwnerId($user);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $client = Client::create([
            'owner_id' => $ownerId,
            'store_id' => null,
            ...$validated,
        ]);

        $storeId = $this->activeStoreId($request);
        if ($storeId) {
            $store = Store::query()->find($storeId);
            if ($store) {
                $clientName = trim($client->first_name.' '.$client->last_name);
                NotificationService::notifyStoreUsers($store, [
                    'type' => 'new_client',
                    'title' => 'Nouveau client',
                    'message' => sprintf('%s a ete ajoute.', $clientName ?: 'Un client'),
                    'link' => '/clients',
                    'data' => [
                        'client_id' => $client->id,
                    ],
                ]);
            }
        }

        return response()->json($client, 201);
    }

    public function update(Request $request, Client $client)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $ownerId = $this->resolveOwnerId($user);
        if ((int) $client->owner_id !== $ownerId) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Request $request, Client $client)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $ownerId = $this->resolveOwnerId($user);
        if ((int) $client->owner_id !== $ownerId) {
            abort(403, 'Forbidden');
        }

        $client->delete();

        return response()->noContent();
    }

    public function import(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $ownerId = $this->resolveOwnerId($user);

        $validated = $request->validate([
            'clients' => ['required', 'array', 'min:1'],
            'clients.*.first_name' => ['required', 'string', 'max:255'],
            'clients.*.last_name' => ['required', 'string', 'max:255'],
            'clients.*.email' => ['nullable', 'email', 'max:255'],
            'clients.*.phone' => ['required', 'string', 'max:50'],
            'clients.*.address' => ['nullable', 'string', 'max:255'],
            'clients.*.date_of_birth' => ['nullable', 'date'],
            'clients.*.notes' => ['nullable', 'string'],
        ]);

        $created = [];
        foreach ($validated['clients'] as $clientData) {
            $created[] = Client::create([
                'owner_id' => $ownerId,
                'store_id' => null,
                ...$clientData,
            ]);
        }

        return response()->json($created, 201);
    }
}
