<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Nouveau message de contact</title>
  </head>
  <body>
    <p>Bonjour,</p>
    <p>Un client vient de soumettre un message via le formulaire de contact.</p>
    <p><strong>Nom:</strong> {{ $contactMessage->name }}</p>
    <p><strong>Email:</strong> {{ $contactMessage->email }}</p>
    <p><strong>Sujet:</strong> {{ $contactMessage->subject }}</p>
    <p><strong>Message:</strong></p>
    <p>{!! nl2br(e($contactMessage->message)) !!}</p>
    <p>Equipe OrAxonOptic</p>
  </body>
</html>
