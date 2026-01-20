<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class AdminEmailVerification extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $verificationUrl;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(24),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );
    }

    public function build()
    {
        return $this->subject('Verification de votre email')
            ->view('emails.admin-email-verification');
    }
}
