<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Reinitialisation de mot de passe</title>
  </head>
  <body>
    <p>Bonjour {{ $user->first_name }},</p>
    <p>Vous avez demande la reinitialisation de votre mot de passe.</p>
    <p><a href="{{ $resetLink }}">Reinitialiser mon mot de passe</a></p>
    <p>Si vous n'etes pas a l'origine de cette demande, ignorez ce message.</p>
  </body>
</html>
