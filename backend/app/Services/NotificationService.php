<?php

namespace App\Services;

use App\Mail\StoreNotificationMail;
use App\Models\Notification;
use App\Models\Store;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * @return array{in_app: bool, email: bool}
     */
    private static function resolveChannels(?StoreSetting $settings, string $type): array
    {
        $map = [
            'low_stock' => ['notify_low_stock_in_app', 'notify_low_stock_email'],
            'workshop_ready' => ['notify_workshop_ready_in_app', 'notify_workshop_ready_email'],
            'new_client' => ['notify_new_client_in_app', 'notify_new_client_email'],
            'invoice_created' => ['notify_invoice_created_in_app', 'notify_invoice_created_email'],
        ];

        if (! isset($map[$type])) {
            return ['in_app' => true, 'email' => false];
        }

        [$inAppField, $emailField] = $map[$type];

        return [
            'in_app' => $settings ? (bool) $settings->{$inAppField} : true,
            'email' => $settings ? (bool) $settings->{$emailField} : true,
        ];
    }

    /**
     * @param array{
     *   type:string,
     *   title:string,
     *   message:string,
     *   link?:string|null,
     *   data?:array,
     *   dedupe?:array{field:string,value:mixed}
     * } $payload
     */
    public static function notifyStoreUsers(Store $store, array $payload): void
    {
        $settings = StoreSetting::query()->where('store_id', $store->id)->first();
        $channels = self::resolveChannels($settings, $payload['type']);

        if (! $channels['in_app'] && ! $channels['email']) {
            return;
        }

        if ($channels['email']) {
            $recipient = $settings?->email ?: $store->email;
            if ($recipient) {
                $frontendUrl = trim(explode(',', config('app.frontend_url', 'http://localhost:8080'))[0]);
                $link = $payload['link'] ?? null;
                $fullLink = $link ? rtrim($frontendUrl, '/').$link : null;
                Mail::to($recipient)->send(new StoreNotificationMail(
                    $store,
                    $payload['title'],
                    $payload['message'],
                    $fullLink
                ));
            }
        }

        if (! $channels['in_app']) {
            return;
        }

        $userIds = $store->users()->pluck('users.id')->map(fn ($id) => (int) $id)->all();
        if ($store->owner_id) {
            $userIds[] = (int) $store->owner_id;
        }

        $userIds = array_values(array_unique($userIds));

        foreach ($userIds as $userId) {
            if (! empty($payload['dedupe'])) {
                $field = $payload['dedupe']['field'] ?? null;
                $value = $payload['dedupe']['value'] ?? null;
                if ($field) {
                    $exists = Notification::query()
                        ->where('user_id', $userId)
                        ->where('type', $payload['type'])
                        ->whereNull('read_at')
                        ->where("data->$field", $value)
                        ->exists();
                    if ($exists) {
                        continue;
                    }
                }
            }

            Notification::create([
                'user_id' => $userId,
                'type' => $payload['type'],
                'title' => $payload['title'],
                'message' => $payload['message'],
                'link' => $payload['link'] ?? null,
                'data' => $payload['data'] ?? null,
            ]);
        }
    }
}
