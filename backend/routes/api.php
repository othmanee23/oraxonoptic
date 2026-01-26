<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentRequestController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AdminOpticienController;
use App\Http\Controllers\BankInfoController;
use App\Http\Controllers\PricingConfigController;
use App\Http\Controllers\SubscriptionOfferController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\ClientPurchaseController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\WorkshopOrderController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\DeliveryNoteController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\StoreSettingController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminStoreController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\PasswordResetController;

Route::get('/health', function () {
    return ['status' => 'ok'];
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:3,1');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');
    Route::post('/forgot-password', [PasswordResetController::class, 'request']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

Route::post('/contact-messages', [ContactMessageController::class, 'store']);
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::middleware(['auth:sanctum', 'store.context'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/subscription/me', [SubscriptionController::class, 'me']);

    Route::get('/bank-info', [BankInfoController::class, 'show']);
    Route::put('/bank-info', [BankInfoController::class, 'update']);

    Route::get('/pricing-config', [PricingConfigController::class, 'show']);
    Route::put('/pricing-config', [PricingConfigController::class, 'update']);

    Route::get('/subscription-offers', [SubscriptionOfferController::class, 'index']);
    Route::put('/subscription-offers', [SubscriptionOfferController::class, 'update']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::prefix('stores')->group(function () {
        Route::get('/', [StoreController::class, 'index']);
        Route::post('/', [StoreController::class, 'store']);
        Route::patch('/selected', [StoreController::class, 'setSelected']);
        Route::put('/{store}', [StoreController::class, 'update']);
        Route::patch('/{store}/toggle', [StoreController::class, 'toggleActive']);
        Route::delete('/{store}', [StoreController::class, 'destroy']);
    });

    Route::prefix('clients')->group(function () {
        Route::get('/', [ClientController::class, 'index']);
        Route::post('/', [ClientController::class, 'store']);
        Route::post('/import', [ClientController::class, 'import']);
        Route::put('/{client}', [ClientController::class, 'update']);
        Route::delete('/{client}', [ClientController::class, 'destroy']);
        Route::get('/{client}/prescriptions', [PrescriptionController::class, 'index']);
        Route::post('/{client}/prescriptions', [PrescriptionController::class, 'store']);
        Route::get('/{client}/purchases', [ClientPurchaseController::class, 'index']);
    });

    Route::prefix('prescriptions')->group(function () {
        Route::get('/', [PrescriptionController::class, 'indexAll']);
        Route::post('/import', [PrescriptionController::class, 'import']);
        Route::put('/{prescription}', [PrescriptionController::class, 'update']);
        Route::delete('/{prescription}', [PrescriptionController::class, 'destroy']);
    });

    Route::prefix('stock')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        Route::get('/products', [ProductController::class, 'index']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::post('/products/import', [ProductController::class, 'import']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);

        Route::get('/movements', [StockMovementController::class, 'index']);
        Route::post('/movements', [StockMovementController::class, 'store']);
    });

    Route::get('/store-settings', [StoreSettingController::class, 'show']);
    Route::put('/store-settings', [StoreSettingController::class, 'update']);

    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/suppliers', [SupplierController::class, 'store']);
    Route::post('/suppliers/import', [SupplierController::class, 'import']);
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);

    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
    Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update']);

    Route::get('/delivery-notes', [DeliveryNoteController::class, 'index']);
    Route::post('/delivery-notes', [DeliveryNoteController::class, 'store']);

    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::post('/invoices/{invoice}/payments', [InvoiceController::class, 'addPayment']);
    Route::patch('/invoices/{invoice}/cancel', [InvoiceController::class, 'cancel']);
    Route::get('/workshop-orders', [WorkshopOrderController::class, 'index']);
    Route::post('/workshop-orders', [WorkshopOrderController::class, 'store']);
    Route::patch('/workshop-orders/{workshopOrder}', [WorkshopOrderController::class, 'update']);

    Route::prefix('payment-requests')->group(function () {
        Route::get('/', [PaymentRequestController::class, 'index']);
        Route::post('/', [PaymentRequestController::class, 'store']);
        Route::patch('/{paymentRequest}/approve', [PaymentRequestController::class, 'approve']);
        Route::patch('/{paymentRequest}/reject', [PaymentRequestController::class, 'reject']);
    });

    Route::prefix('admin')->group(function () {
        Route::get('/opticiens', [AdminOpticienController::class, 'index']);
        Route::post('/opticiens', [AdminOpticienController::class, 'store']);
        Route::delete('/opticiens/{user}', [AdminOpticienController::class, 'destroy']);
        Route::patch('/opticiens/{user}/max-stores', [AdminOpticienController::class, 'updateMaxStores']);
        Route::patch('/opticiens/{user}/subscription', [AdminOpticienController::class, 'updateSubscription']);
        Route::patch('/opticiens/{user}/approve', [AdminOpticienController::class, 'approve']);
        Route::delete('/opticiens/{user}/reject', [AdminOpticienController::class, 'reject']);
        Route::patch('/opticiens/{user}/toggle-block', [AdminOpticienController::class, 'toggleBlock']);
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/stores', [AdminStoreController::class, 'index']);
        Route::patch('/stores/{store}/toggle', [AdminStoreController::class, 'toggle']);
    });

    Route::prefix('users')->group(function () {
        Route::get('/', [UserManagementController::class, 'index']);
        Route::post('/', [UserManagementController::class, 'store']);
        Route::put('/{user}', [UserManagementController::class, 'update']);
        Route::patch('/{user}/permissions', [UserManagementController::class, 'updatePermissions']);
        Route::patch('/{user}/stores', [UserManagementController::class, 'updateStores']);
        Route::patch('/{user}/toggle', [UserManagementController::class, 'toggleActive']);
    });

    Route::prefix('contact-messages')->group(function () {
        Route::get('/', [ContactMessageController::class, 'index']);
        Route::patch('/{contactMessage}/read', [ContactMessageController::class, 'markRead']);
        Route::delete('/{contactMessage}', [ContactMessageController::class, 'destroy']);
    });

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::patch('/{notification}/read', [NotificationController::class, 'markRead']);
        Route::patch('/read-all', [NotificationController::class, 'markAllRead']);
        Route::delete('/clear', [NotificationController::class, 'clear']);
    });
});
