<html>
<body>
<p>Bonjour,</p>
<p>Vous pouvez régler votre facture n°{{ $invoice->invoice_number ?? $invoice->id }} en suivant ce lien sécurisé (valable 24h) :</p>
<p><a href="{{ $url }}">Payer ma facture</a></p>
<p>Merci,</p>
<p>L'équipe</p>
</body>
</html>