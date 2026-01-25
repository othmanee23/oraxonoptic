<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function verify(Request $request, int $id, string $hash)
    {
        $user = User::findOrFail($id);
        $frontendUrl = trim(explode(',', config('app.frontend_url', 'http://localhost:8080'))[0]);

        if (! hash_equals(sha1($user->email), $hash)) {
            return redirect()->to(rtrim($frontendUrl, '/').'/auth?verified=0');
        }

        if (! $user->email_verified_at) {
            $user->email_verified_at = now();
            $user->save();
        }

        return redirect()->to(rtrim($frontendUrl, '/').'/auth?verified=1');
    }
}
