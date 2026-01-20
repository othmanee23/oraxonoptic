<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
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

    private function authorizePrescription(User $user, Prescription $prescription): void
    {
        $client = $prescription->client;
        if (! $client) {
            abort(404, 'Client not found.');
        }
        $this->authorizeClient($user, $client);
    }

    public function index(Request $request, Client $client)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $this->authorizeClient($user, $client);

        $prescriptions = Prescription::query()
            ->where('client_id', $client->id)
            ->orderByDesc('date')
            ->get();

        return response()->json($prescriptions);
    }

    public function indexAll(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $ownerId = $this->resolveOwnerId($user);
        $clientIds = Client::query()
            ->where('owner_id', $ownerId)
            ->pluck('id');

        if ($clientIds->isEmpty()) {
            return response()->json([]);
        }

        $prescriptions = Prescription::query()
            ->whereIn('client_id', $clientIds)
            ->orderByDesc('date')
            ->get();

        return response()->json($prescriptions);
    }

    public function store(Request $request, Client $client)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $this->authorizeClient($user, $client);

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'prescriber' => ['nullable', 'string', 'max:100'],
            'expiry_date' => ['nullable', 'date'],
            'od_sphere' => ['nullable', 'numeric'],
            'od_cylinder' => ['nullable', 'numeric'],
            'od_axis' => ['nullable', 'integer', 'min:0', 'max:180'],
            'od_addition' => ['nullable', 'numeric'],
            'od_pd' => ['nullable', 'numeric'],
            'og_sphere' => ['nullable', 'numeric'],
            'og_cylinder' => ['nullable', 'numeric'],
            'og_axis' => ['nullable', 'integer', 'min:0', 'max:180'],
            'og_addition' => ['nullable', 'numeric'],
            'og_pd' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
        ]);

        $prescription = Prescription::create([
            'client_id' => $client->id,
            ...$validated,
        ]);

        return response()->json($prescription, 201);
    }

    public function update(Request $request, Prescription $prescription)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $this->authorizePrescription($user, $prescription);

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'prescriber' => ['nullable', 'string', 'max:100'],
            'expiry_date' => ['nullable', 'date'],
            'od_sphere' => ['nullable', 'numeric'],
            'od_cylinder' => ['nullable', 'numeric'],
            'od_axis' => ['nullable', 'integer', 'min:0', 'max:180'],
            'od_addition' => ['nullable', 'numeric'],
            'od_pd' => ['nullable', 'numeric'],
            'og_sphere' => ['nullable', 'numeric'],
            'og_cylinder' => ['nullable', 'numeric'],
            'og_axis' => ['nullable', 'integer', 'min:0', 'max:180'],
            'og_addition' => ['nullable', 'numeric'],
            'og_pd' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
        ]);

        $prescription->update($validated);

        return response()->json($prescription);
    }

    public function destroy(Request $request, Prescription $prescription)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $this->authorizePrescription($user, $prescription);

        $prescription->delete();

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
            'prescriptions' => ['required', 'array', 'min:1'],
            'prescriptions.*.client_id' => ['required', 'integer', 'exists:clients,id'],
            'prescriptions.*.date' => ['required', 'date'],
            'prescriptions.*.prescriber' => ['nullable', 'string', 'max:100'],
            'prescriptions.*.expiry_date' => ['nullable', 'date'],
            'prescriptions.*.od_sphere' => ['nullable', 'numeric'],
            'prescriptions.*.od_cylinder' => ['nullable', 'numeric'],
            'prescriptions.*.od_axis' => ['nullable', 'integer', 'min:0', 'max:180'],
            'prescriptions.*.od_addition' => ['nullable', 'numeric'],
            'prescriptions.*.od_pd' => ['nullable', 'numeric'],
            'prescriptions.*.og_sphere' => ['nullable', 'numeric'],
            'prescriptions.*.og_cylinder' => ['nullable', 'numeric'],
            'prescriptions.*.og_axis' => ['nullable', 'integer', 'min:0', 'max:180'],
            'prescriptions.*.og_addition' => ['nullable', 'numeric'],
            'prescriptions.*.og_pd' => ['nullable', 'numeric'],
            'prescriptions.*.notes' => ['nullable', 'string'],
        ]);

        $allowedClientIds = Client::query()
            ->where('owner_id', $ownerId)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $created = [];
        foreach ($validated['prescriptions'] as $data) {
            if (! in_array((int) $data['client_id'], $allowedClientIds, true)) {
                abort(403, 'Forbidden');
            }

            $created[] = Prescription::create([
                'client_id' => $data['client_id'],
                'date' => $data['date'],
                'prescriber' => $data['prescriber'] ?? null,
                'expiry_date' => $data['expiry_date'] ?? null,
                'od_sphere' => $data['od_sphere'] ?? null,
                'od_cylinder' => $data['od_cylinder'] ?? null,
                'od_axis' => $data['od_axis'] ?? null,
                'od_addition' => $data['od_addition'] ?? null,
                'od_pd' => $data['od_pd'] ?? null,
                'og_sphere' => $data['og_sphere'] ?? null,
                'og_cylinder' => $data['og_cylinder'] ?? null,
                'og_axis' => $data['og_axis'] ?? null,
                'og_addition' => $data['og_addition'] ?? null,
                'og_pd' => $data['og_pd'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);
        }

        return response()->json($created, 201);
    }
}
