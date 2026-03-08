<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    /**
     * Webhook pour Fedapay (Bénin)
     * URL à configurer dans le dashboard Fedapay : https://votre-site.com/api/webhooks/fedapay
     */
    public function handleFedapay(Request $request)
    {
        // 1. Log pour débugger (très utile au début)
        Log::channel('payments')->info('Webhook Fedapay reçu', $request->all());

        // 2. Vérification de la signature (Sécurité)
        // Fedapay envoie un header 'X-Fedapay-Signature'. 
        // Il faut vérifier que ça correspond à votre clé secrète.
        $signature = $request->header('X-Fedapay-Signature');
        if (!$this->verifySignature($request->getContent(), $signature)) {
            Log::channel('payments')->error('Signature Fedapay invalide');
            return response()->json(['status' => 'forbidden'], 403);
        }

        $event = $request->input('event'); // ex: 'transaction.approved'
        $entity = $request->input('entity');

        if ($event === 'transaction.approved' && $entity['status'] === 'approved') {
            
            // 3. Récupération de la référence facture
            // Lors de l'initiation du paiement côté React, vous devez envoyer 
            // l'ID de la facture dans 'custom_metadata'
            $invoiceRef = $entity['custom_metadata']['invoice_ref'] ?? null;
            
            if (!$invoiceRef) {
                Log::channel('payments')->error('Référence facture manquante dans le webhook Fedapay');
                return response()->json(['status' => 'ignored']);
            }

            $invoice = Invoice::where('invoice_number', $invoiceRef)->first();

            if ($invoice) {
                // 4. Vérifier si la transaction n'existe pas déjà (éviter doublons)
                $exists = Transaction::where('transaction_reference', $entity['id'])
                    ->where('payment_method', 'fedapay')
                    ->exists();

                if (!$exists) {
                    Transaction::create([
                        'invoice_id' => $invoice->id,
                        'payment_method' => 'fedapay', // ou 'mtn_momo' / 'moov_money' si disponible dans entity
                        'transaction_reference' => $entity['id'],
                        'amount' => $entity['amount'], // Attention : Fedapay peut être en centimes parfois, vérifier doc
                        'payment_date' => now(),
                        'notes' => 'Paiement Mobile via Fedapay',
                        'status' => 'success'
                    ]);
                    
                    Log::channel('payments')->info("Facture $invoiceRef payée via Fedapay");
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Webhook pour Kkiapay (Alternative populaire au Bénin)
     */
    public function handleKkiapay(Request $request)
    {
        Log::channel('payments')->info('Webhook Kkiapay reçu', $request->all());

        // Kkiapay envoie 'transaction_id'
        $transactionId = $request->input('transaction_id');
        $status = $request->input('status'); // 'SUCCESS'

        if ($status === 'SUCCESS') {
             // Avec Kkiapay, il faut souvent revérifier la transaction via leur API 
             // pour être sûr du montant et des métadonnées (verifyTransaction)
             // ... Code de vérification API Kkiapay ici ...

             // Supposons qu'on récupère les infos :
             $invoiceRef = $request->input('state'); // On passe souvent la ref dans le champ 'state' ou 'partnerId'
             
             $invoice = Invoice::where('invoice_number', $invoiceRef)->first();

             if ($invoice) {
                 Transaction::firstOrCreate(
                     ['transaction_reference' => $transactionId],
                     [
                        'invoice_id' => $invoice->id,
                        'payment_method' => 'kkiapay',
                        'amount' => $invoice->amount_total, // À récupérer via l'API de vérif idéalement
                        'payment_date' => now(),
                        'status' => 'success'
                     ]
                 );
             }
        }

        return response()->json(['status' => 'received']);
    }

    // Helper basique de vérification (à adapter selon la doc officielle Fedapay)
    private function verifySignature($payload, $signature)
    {
        // Implémentation réelle selon : https://docs.fedapay.com/
        // Pour l'instant on retourne true pour ne pas bloquer le dev
        return true; 
    }
}