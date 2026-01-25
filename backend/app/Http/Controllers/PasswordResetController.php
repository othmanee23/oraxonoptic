<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    public function request(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();
        if (! $user) {
            return response()->json(['message' => 'If the email exists, a reset link has been sent.']);
        }

        $token = Password::broker()->createToken($user);
        $frontendUrl = trim(explode(',', config('app.frontend_url', 'http://localhost:8080'))[0]);
        $resetLink = rtrim($frontendUrl, '/').'/auth?token='.urlencode($token).'&email='.urlencode($user->email);

        Mail::to($user->email)->send(new PasswordResetMail($user, $resetLink));

        return response()->json(['message' => 'Reset link sent.']);
    }

    public function reset(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string', 'min:8'],
        ]);

        $status = Password::broker()->reset(
            [
                'email' => $validated['email'],
                'password' => $validated['password'],
                'password_confirmation' => $validated['password_confirmation'],
                'token' => $validated['token'],
            ],
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Invalid token or email.'], 422);
        }

        return response()->json(['message' => 'Password updated.']);
    }
}
