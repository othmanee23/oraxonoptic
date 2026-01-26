<?php

namespace App\Http\Controllers;

use App\Mail\AdminEmailVerification;
use App\Models\User;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

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

    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        if (! Auth::attempt($validated)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
                'code' => 'AUTH_INVALID_CREDENTIALS',
            ], 401);
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
