<?php

namespace App\Mail;

use App\Models\Store;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StoreNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Store $store;
    public string $title;
    public string $body;
    public ?string $link;

    public function __construct(Store $store, string $title, string $body, ?string $link = null)
    {
        $this->store = $store;
        $this->title = $title;
        $this->body = $body;
        $this->link = $link;
    }

    public function build()
    {
        return $this->subject('OpticAxon - '.$this->title)
            ->view('emails.store-notification');
    }
}
