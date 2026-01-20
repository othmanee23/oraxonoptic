<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $notifications = Notification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($notifications);
    }

    public function markRead(Request $request, Notification $notification)
    {
        $user = $request->user();
        if (! $user || (int) $notification->user_id !== (int) $user->id) {
            abort(403, 'Forbidden');
        }

        if (! $notification->read_at) {
            $notification->read_at = now();
            $notification->save();
        }

        return response()->json($notification);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        Notification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->noContent();
    }

    public function clear(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        Notification::query()
            ->where('user_id', $user->id)
            ->delete();

        return response()->noContent();
    }
}
