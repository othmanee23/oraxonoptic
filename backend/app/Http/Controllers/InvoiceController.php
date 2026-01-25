<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Store;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    private function activeStoreId(Request $request): int
    {
        $storeId = $request->attributes->get('activeStoreId');
        if (! $storeId) {
            abort(422, 'Store context missing.');
        }

        return (int) $storeId;
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

    private function generateInvoiceNumber(int $storeId): string
    {
        $store = Store::query()->find($storeId);
        $prefix = $store?->invoice_prefix ?: 'FAC';

        do {
            $random = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            $date = now()->format('ymd');
            $number = sprintf('%s-%s-%s', $prefix, $date, $random);
            $exists = Invoice::query()
                ->where('store_id', $storeId)
                ->where('invoice_number', $number)
                ->exists();
        } while ($exists);

        return $number;
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $storeId = $this->activeStoreId($request);
        $ownerId = $this->resolveOwnerId($user);

        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.product_name' => ['required', 'string', 'max:255'],
            'items.*.product_reference' => ['nullable', 'string', 'max:100'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'payment' => ['nullable', 'array'],
            'payment.amount' => ['required_with:payment', 'numeric', 'min:0'],
            'payment.method' => ['required_with:payment', 'string', 'max:50'],
            'payment.reference' => ['nullable', 'string', 'max:255'],
            'payment.notes' => ['nullable', 'string'],
            'validate_only' => ['nullable', 'boolean'],
        ]);

        if ($validated['client_id'] ?? null) {
            $client = Client::query()->whereKey($validated['client_id'])->first();
            if (! $client || (int) $client->owner_id !== $ownerId) {
                abort(403, 'Forbidden');
            }
        }

        $invoice = DB::transaction(function () use ($validated, $user, $storeId) {
            $taxRate = (float) ($validated['tax_rate'] ?? 0);

            $subtotal = 0;
            $discountTotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $discount = (float) ($item['discount'] ?? 0);

                $lineSubtotal = $unitPrice * $quantity;
                $lineDiscount = $lineSubtotal * ($discount / 100);
                $lineTotal = $lineSubtotal - $lineDiscount;

                $subtotal += $lineSubtotal;
                $discountTotal += $lineDiscount;

                $itemsData[] = [
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'product_reference' => $item['product_reference'] ?? null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount' => $discount,
                    'total' => $lineTotal,
                ];
            }

            $taxableAmount = $subtotal - $discountTotal;
            $taxAmount = $taxableAmount * ($taxRate / 100);
            $total = $taxableAmount + $taxAmount;

            $amountPaid = 0;
            $paymentData = $validated['payment'] ?? null;
            if ($paymentData) {
                $amountPaid = (float) $paymentData['amount'];
            }
            $amountDue = max(0, $total - $amountPaid);

            $status = 'pending';
            if ($paymentData && $amountPaid > 0) {
                $status = $amountDue <= 0 ? 'paid' : 'partial';
            } elseif (! empty($validated['validate_only'])) {
                $status = 'pending';
            } else {
                $status = 'draft';
            }

            $invoice = Invoice::create([
                'invoice_number' => $this->generateInvoiceNumber($storeId),
                'client_id' => $validated['client_id'] ?? null,
                'store_id' => $storeId,
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'amount_paid' => $amountPaid,
                'amount_due' => $amountDue,
                'status' => $status,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $user->id,
                'validated_at' => ($status !== 'draft') ? now() : null,
                'paid_at' => ($status === 'paid') ? now() : null,
            ]);

            foreach ($itemsData as $itemData) {
                $item = InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $itemData['product_id'],
                    'product_name' => $itemData['product_name'],
                    'product_reference' => $itemData['product_reference'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'discount' => $itemData['discount'],
                    'total' => $itemData['total'],
                ]);

                if (! $itemData['product_id']) {
                    continue;
                }

                $product = Product::query()->whereKey($itemData['product_id'])->first();
                if (! $product || (int) $product->store_id !== $storeId) {
                    continue;
                }

                $previousStock = (int) $product->current_stock;
                $newStock = max(0, $previousStock - $itemData['quantity']);

                $product->current_stock = $newStock;
                $product->save();

                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'sortie',
                    'quantity' => $itemData['quantity'],
                    'previous_stock' => $previousStock,
                    'new_stock' => $newStock,
                    'reason' => 'Vente',
                    'from_store_id' => $storeId,
                    'to_store_id' => null,
                    'reference' => $invoice->invoice_number,
                    'created_by' => $user->id,
                ]);

                if ($previousStock > (int) $product->minimum_stock && $newStock <= (int) $product->minimum_stock) {
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
            }

            if ($paymentData && $amountPaid > 0) {
                Payment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => $amountPaid,
                    'method' => $paymentData['method'],
                    'date' => now()->toDateString(),
                    'reference' => $paymentData['reference'] ?? null,
                    'notes' => $paymentData['notes'] ?? null,
                ]);
            }

            return $invoice;
        });

        $store = Store::query()->find($storeId);
        if ($store) {
            NotificationService::notifyStoreUsers($store, [
                'type' => 'invoice_created',
                'title' => 'Nouvelle facture',
                'message' => sprintf('Facture %s creee.', $invoice->invoice_number),
                'link' => '/factures',
                'data' => [
                    'invoice_id' => $invoice->id,
                ],
            ]);
        }

        return response()->json($invoice->load(['items', 'payments']), 201);
    }

    public function index(Request $request)
    {
        $storeId = $this->activeStoreId($request);

        $invoices = Invoice::query()
            ->with(['items', 'payments'])
            ->where('store_id', $storeId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($invoices);
    }

    public function addPayment(Request $request, Invoice $invoice)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $invoice->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'method' => ['required', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $payment = Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'date' => now()->toDateString(),
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $invoice->amount_paid = (float) $invoice->amount_paid + (float) $validated['amount'];
        $invoice->amount_due = max(0, (float) $invoice->total - (float) $invoice->amount_paid);
        if ($invoice->amount_due <= 0) {
            $invoice->status = 'paid';
            $invoice->paid_at = now();
        } elseif ($invoice->amount_paid > 0) {
            $invoice->status = 'partial';
        }
        $invoice->save();

        return response()->json($invoice->fresh()->load(['items', 'payments']));
    }

    public function cancel(Request $request, Invoice $invoice)
    {
        $storeId = $this->activeStoreId($request);
        if ((int) $invoice->store_id !== $storeId) {
            abort(403, 'Forbidden');
        }

        $invoice->status = 'cancelled';
        $invoice->save();

        return response()->json($invoice->fresh()->load(['items', 'payments']));
    }
}
