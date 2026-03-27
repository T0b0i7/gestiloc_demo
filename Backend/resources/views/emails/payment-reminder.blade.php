<!DOCTYPE html>
<html>
<head>
    <title>Rappel de paiement</title>
</head>
<body>
    <h2>Rappel de paiement</h2>
    <p>Bonjour,</p>
    <p>Ceci est un rappel concernant votre facture <strong>{{ $invoice->invoice_number }}</strong> d'un montant de <strong>{{ $invoice->amount_total }}</strong>.</p>
    <p>La date d'échéance était le <strong>{{ \Carbon\Carbon::parse($invoice->due_date)->format('d/m/Y') }}</strong>.</p>
    <p>Merci de procéder au règlement dès que possible.</p>
</body>
</html>
