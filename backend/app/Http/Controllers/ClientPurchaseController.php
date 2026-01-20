<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Http\Request;

class ClientPurchaseController extends Controller
{
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

    private function authorizeClient(User $user, Client $client): void
    {
        $ownerId = $this->resolveOwnerId($user);
        if ((int) $client->owner_id !== $ownerId) {
            abort(403, 'Forbidden');
        }
    }

    public function index(Request $request, Client $client)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $this->authorizeClient($user, $client);

        $invoices = Invoice::query()
            ->with(['items'])
            ->where('client_id', $client->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($invoices);
    }
}
