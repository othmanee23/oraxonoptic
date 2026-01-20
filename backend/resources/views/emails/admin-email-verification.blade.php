<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Verification email</title>
  </head>
  <body>
    <p>Bonjour {{ $user->first_name }},</p>
    <p>Merci de verifier votre adresse email pour activer votre compte admin.</p>
    <p>
      <a href="{{ $verificationUrl }}">Verifier mon email</a>
    </p>
    <p>Si vous n'etes pas a l'origine de cette demande, ignorez ce message.</p>
    <p>Equipe OpticAxon</p>
  </body>
</html>
