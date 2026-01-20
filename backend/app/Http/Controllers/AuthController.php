<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\AdminEmailVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => trim($validated['first_name'].' '.$validated['last_name']),
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => 'admin',
            'is_pending_approval' => true,
            'password' => Hash::make($validated['password']),
        ]);

        Mail::to($user->email)->send(new AdminEmailVerification($user));

        return response()->json([
            'message' => 'Account created. Pending super admin approval and email verification.',
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($validated)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        $user = $request->user();

        if ($user->role === 'admin' && ! $user->email_verified_at) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Email not verified.',
            ], 403);
        }

        if (! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Account is inactive.',
            ], 403);
        }

        $request->session()->regenerate();

        return response()->json($user);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
