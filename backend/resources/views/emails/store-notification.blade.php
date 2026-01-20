<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Notification OpticAxon</title>
  </head>
  <body>
    <p>Bonjour,</p>
    <p>{{ $title }}</p>
    <p>{{ $message }}</p>
    @if (!empty($link))
      <p><a href="{{ $link }}">Voir dans OpticAxon</a></p>
    @endif
    <p>Magasin: {{ $store->name }}</p>
  </body>
</html>
