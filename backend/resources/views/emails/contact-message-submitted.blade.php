<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Confirmation de message</title>
  </head>
  <body>
    <p>Bonjour {{ $contactMessage->name }},</p>
    <p>Nous avons bien recu votre message. Notre equipe vous repondra rapidement.</p>
    <p><strong>Sujet:</strong> {{ $contactMessage->subject }}</p>
    <p><strong>Message:</strong></p>
    <p>{!! nl2br(e($contactMessage->message)) !!}</p>
    <p>Merci,<br>Equipe OrAxonOptic</p>
  </body>
</html>
