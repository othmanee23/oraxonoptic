<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
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
            ->orderByDesc('created_at')
            ->get();

        if ($clients->isNotEmpty()) {
            $clientIds = $clients->pluck('id')->all();

            $stats = Invoice::query()
                ->selectRaw('client_id, COUNT(*) as invoices_count, COALESCE(SUM(total), 0) as invoices_sum_total')
                ->whereIn('client_id', $clientIds)
                ->groupBy('client_id')
                ->get()
                ->keyBy('client_id');

            $latestInvoiceIds = Invoice::query()
                ->selectRaw('client_id, MAX(id) as id')
                ->whereIn('client_id', $clientIds)
                ->groupBy('client_id')
                ->pluck('id', 'client_id');

            $latestInvoices = Invoice::query()
                ->whereIn('id', $latestInvoiceIds->values()->all())
                ->get()
                ->keyBy('id');

            foreach ($clients as $client) {
                $stat = $stats->get($client->id);
                $client->setAttribute('invoices_count', (int) ($stat->invoices_count ?? 0));
                $client->setAttribute('invoices_sum_total', $stat->invoices_sum_total ?? 0);

                $latestId = $latestInvoiceIds->get($client->id);
                $latest = $latestId ? $latestInvoices->get($latestId) : null;
                $client->setAttribute('latest_invoice', $latest ? [
                    'id' => $latest->id,
                    'client_id' => $latest->client_id,
                    'total' => $latest->total,
                    'amount_paid' => $latest->amount_paid,
                    'amount_due' => $latest->amount_due,
                    'status' => $latest->status,
                    'created_at' => $latest->created_at?->toISOString(),
                    'paid_at' => $latest->paid_at?->toISOString(),
                    'validated_at' => $latest->validated_at?->toISOString(),
                ] : null);
            }
        }

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
