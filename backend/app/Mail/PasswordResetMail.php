<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $resetLink;

    public function __construct(User $user, string $resetLink)
    {
        $this->user = $user;
        $this->resetLink = $resetLink;
    }

    public function build()
    {
        return $this->subject('Reinitialisation de mot de passe')
            ->view('emails.password-reset');
    }
}
