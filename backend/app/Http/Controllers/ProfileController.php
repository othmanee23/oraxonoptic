<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'current_password' => ['nullable', 'string'],
            'new_password' => ['nullable', 'string', 'min:8'],
        ]);

        if (! empty($validated['new_password'])) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Le mot de passe actuel est incorrect.',
                ], 422);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->first_name = $validated['first_name'];
        $user->last_name = $validated['last_name'];
        $user->name = trim($validated['first_name'].' '.$validated['last_name']);
        $user->phone = $validated['phone'] ?? null;
        $user->save();

        return response()->json($user);
    }
}
