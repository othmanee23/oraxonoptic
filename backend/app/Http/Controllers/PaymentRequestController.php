<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PaymentRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $query = PaymentRequest::query()->orderByDesc('submitted_at');

        if ($user->role !== 'super_admin') {
            $query->where('user_id', $user->id);
        }

        $status = $request->query('status');
        if ($status) {
            $query->where('status', $status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $validated = $request->validate([
            'months_requested' => ['required', 'integer', 'min:1'],
            'amount' => ['required', 'numeric', 'min:0'],
            'screenshot' => ['required', 'string'],
            'plan_key' => ['nullable', 'string', 'max:50'],
        ]);

        $paymentRequest = PaymentRequest::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_name' => trim($user->first_name.' '.$user->last_name),
            'amount' => $validated['amount'],
            'months_requested' => $validated['months_requested'],
            'plan_key' => $validated['plan_key'] ?? null,
            'screenshot' => $validated['screenshot'],
            'submitted_at' => now(),
            'status' => 'pending',
        ]);

        $superAdmins = User::query()->where('role', 'super_admin')->get();
        foreach ($superAdmins as $superAdmin) {
            Notification::create([
                'user_id' => $superAdmin->id,
                'type' => 'payment_request',
                'title' => 'Nouvelle demande de paiement',
                'message' => sprintf('%s a soumis une demande de paiement.', $paymentRequest->user_name),
                'link' => '/abonnement',
                'data' => [
                    'payment_request_id' => $paymentRequest->id,
                ],
            ]);
        }

        return response()->json($paymentRequest, 201);
    }

    public function approve(Request $request, PaymentRequest $paymentRequest)
    {
        $this->ensureSuperAdmin($request);

        if ($paymentRequest->status !== 'pending') {
            return response()->json($paymentRequest);
        }

        $paymentRequest->status = 'approved';
        $paymentRequest->processed_at = now();
        $paymentRequest->processed_by = $request->user()->id;
        $paymentRequest->save();

        $this->activateSubscription($paymentRequest);

        Notification::create([
            'user_id' => $paymentRequest->user_id,
            'type' => 'payment_approved',
            'title' => 'Paiement approuvé',
            'message' => 'Votre demande de paiement a été approuvée.',
            'link' => '/abonnement',
            'data' => [
                'payment_request_id' => $paymentRequest->id,
            ],
        ]);

        return response()->json($paymentRequest);
    }

    public function reject(Request $request, PaymentRequest $paymentRequest)
    {
        $this->ensureSuperAdmin($request);

        if ($paymentRequest->status !== 'pending') {
            return response()->json($paymentRequest);
        }

        $validated = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $paymentRequest->status = 'rejected';
        $paymentRequest->processed_at = now();
        $paymentRequest->processed_by = $request->user()->id;
        $paymentRequest->rejection_reason = $validated['rejection_reason'] ?? null;
        $paymentRequest->save();

        Notification::create([
            'user_id' => $paymentRequest->user_id,
            'type' => 'payment_rejected',
            'title' => 'Paiement rejeté',
            'message' => $paymentRequest->rejection_reason
                ? 'Votre demande de paiement a été rejetée: '.$paymentRequest->rejection_reason
                : 'Votre demande de paiement a été rejetée.',
            'link' => '/abonnement',
            'data' => [
                'payment_request_id' => $paymentRequest->id,
            ],
        ]);

        return response()->json($paymentRequest);
    }

    private function activateSubscription(PaymentRequest $paymentRequest): void
    {
        $now = Carbon::now();
        $subscription = Subscription::query()
            ->where('user_id', $paymentRequest->user_id)
            ->orderByDesc('expiry_date')
            ->first();

        $baseDate = $now;
        if ($subscription && Carbon::parse($subscription->expiry_date)->greaterThan($now)) {
            $baseDate = Carbon::parse($subscription->expiry_date);
        }

        if ($subscription) {
            $subscription->expiry_date = $baseDate->copy()->addMonths($paymentRequest->months_requested);
            $subscription->status = 'active';
            if (! $subscription->start_date) {
                $subscription->start_date = $now;
            }
            $subscription->save();
        } else {
            Subscription::create([
                'user_id' => $paymentRequest->user_id,
                'start_date' => $now,
                'expiry_date' => $baseDate->copy()->addMonths($paymentRequest->months_requested),
                'status' => 'active',
            ]);
        }

        $user = User::find($paymentRequest->user_id);
        if ($user) {
            $user->is_pending_approval = false;
            $user->is_active = true;
            if ($paymentRequest->plan_key) {
                $offer = \App\Models\SubscriptionOffer::query()
                    ->where('key', $paymentRequest->plan_key)
                    ->first();
                if ($offer && $offer->store_limit !== null) {
                    $user->max_stores = $offer->store_limit;
                }
            }
            $user->save();
        }
    }

    private function ensureSuperAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }
    }
}
