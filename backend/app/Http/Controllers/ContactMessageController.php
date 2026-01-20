<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageNotification;
use App\Mail\ContactMessageSubmitted;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        $message = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        Mail::to($validated['email'])->send(new ContactMessageSubmitted($message));

        $adminRecipient = config('mail.contact_admin_address');

        if ($adminRecipient) {
            Mail::to($adminRecipient)->send(new ContactMessageNotification($message));
        } else {
            $superAdminEmails = User::query()
                ->where('role', 'super_admin')
                ->whereNotNull('email')
                ->pluck('email')
                ->all();

            if (! empty($superAdminEmails)) {
                Mail::to($superAdminEmails)->send(new ContactMessageNotification($message));
            }
        }

        return response()->json($message, 201);
    }

    public function index(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $messages = ContactMessage::query()
            ->orderByDesc('created_at')
            ->get();

        return response()->json($messages);
    }

    public function markRead(Request $request, ContactMessage $contactMessage)
    {
        $this->ensureSuperAdmin($request);

        if (! $contactMessage->read_at) {
            $contactMessage->read_at = now();
            $contactMessage->save();
        }

        return response()->json($contactMessage);
    }

    public function destroy(Request $request, ContactMessage $contactMessage)
    {
        $this->ensureSuperAdmin($request);

        $contactMessage->delete();

        return response()->noContent();
    }

    private function ensureSuperAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }
    }
}
