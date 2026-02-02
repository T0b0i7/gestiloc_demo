<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class CoOwnerLeaseDocumentController extends Controller
{
    /**
     * Afficher les documents d'un bail
     */
    public function index(Request $request, Lease $lease)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le bail appartient à un bien délégué au co-propriétaire
        $isDelegated = PropertyDelegation::where('property_id', $lease->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return redirect()->route('co-owner.leases.index')
                ->with('error', 'Vous n\'avez pas accès à ce bail');
        }

        // Récupérer les documents depuis la colonne meta
        $documents = $lease->meta['documents'] ?? [];

        // Charger les relations nécessaires pour l'affichage
        $lease->load(['property', 'tenant.user', 'property.landlord.user']);

        return view('co-owner.leases.documents', compact('lease', 'documents', 'user'));
    }

    /**
     * Télécharger le PDF du contrat de bail
     */
    public function downloadPdf(Request $request, Lease $lease)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['error' => 'Profil co-propriétaire non trouvé'], 403);
        }

        // Vérifier que le bail appartient à un bien délégué au co-propriétaire
        $isDelegated = PropertyDelegation::where('property_id', $lease->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        try {
            // Charger les relations nécessaires
            $lease->load(['property', 'tenant.user', 'property.landlord.user']);

            // Récupérer le co-propriétaire pour les infos du bailleur
            $bailleur = $coOwner;
            $bailleur->load('user');

            // Récupérer le locataire pour les infos du locataire
            $locataire = $lease->tenant;
            $locataire->load('user');

            // Générer le numéro de bail
            $bailNumber = $lease->lease_number ?? 'BAIL-' . date('Y') . '-' . strtoupper(substr(md5($lease->id), 0, 5));

            // Date du document
            $dateGeneration = now()->format('d/m/Y');
            $dateContrat = now()->format('d/m/Y');

            // Préparer les données pour le PDF
            $data = [
                'bailNumber' => $bailNumber,
                'dateGeneration' => $dateGeneration,
                'dateContrat' => $dateContrat,
                'bailleur' => $bailleur,
                'locataire' => $locataire,
                'property' => $lease->property,
                'lease' => $lease,
                'montantTotal' => $lease->rent_amount + $lease->charges_amount,
                'dureeBail' => $lease->end_date ? 'Déterminée' : 'Indéterminée',
                'dateFin' => $lease->end_date ? $lease->end_date->format('d/m/Y') : 'Durée indéterminée',
                'frequencePaiement' => $this->getFrequencyLabel($lease->payment_frequency ?? 'monthly'),
                'modePaiement' => 'Espèces', // Valeur par défaut
                'chargesIncluses' => 'Aucune', // Valeur par défaut
                'equipements' => 'Aucun équipement spécifié',
                'typeBail' => $lease->type === 'meuble' ? 'meublé' : 'non meublé',
            ];

            // Générer le PDF
            $pdf = Pdf::loadView('co-owner.leases.pdf.lease-contract', $data);
            $pdfContent = $pdf->output();

            // Nom du fichier
            $filename = "Contrat_de_location_" . str_replace(' ', '_', $locataire->first_name) . "_" . str_replace(' ', '_', $locataire->last_name) . "_" . now()->format('Y-m-d') . ".pdf";

            // Sauvegarder dans meta
            $meta = $lease->meta ?? [];
            $documents = $meta['documents'] ?? [];

            // Ajouter le nouveau document
            $documents[] = [
                'id' => uniqid(),
                'filename' => $filename,
                'original_name' => $filename,
                'type' => 'contract',
                'size' => strlen($pdfContent),
                'mime_type' => 'application/pdf',
                'created_at' => now()->toDateTimeString(),
                'generated_by_co_owner' => $coOwner->id,
                'bail_number' => $bailNumber,
            ];

            // Mettre à jour le meta
            $meta['documents'] = $documents;
            $lease->meta = $meta;
            $lease->save();

            Log::info('Document de bail créé et sauvegardé', [
                'lease_id' => $lease->id,
                'filename' => $filename,
                'documents_count' => count($documents),
            ]);

            // Retourner le PDF pour téléchargement
            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Length', strlen($pdfContent));

        } catch (\Exception $e) {
            Log::error('Erreur génération PDF bail', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'lease_id' => $lease->id,
            ]);

            return back()->with('error', 'Erreur lors de la génération du PDF: ' . $e->getMessage());
        }
    }

    /**
     * Prévisualiser le PDF du contrat de bail
     */
    public function previewPdf(Request $request, Lease $lease)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            abort(403, 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            abort(403, 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le bail appartient à un bien délégué au co-propriétaire
        $isDelegated = PropertyDelegation::where('property_id', $lease->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            abort(403, 'Vous n\'avez pas accès à ce document');
        }

        try {
            // Charger les relations nécessaires
            $lease->load(['property', 'tenant.user', 'property.landlord.user']);

            // Récupérer le co-propriétaire pour les infos du bailleur
            $bailleur = $coOwner;
            $bailleur->load('user');

            // Récupérer le locataire pour les infos du locataire
            $locataire = $lease->tenant;
            $locataire->load('user');

            // Générer le numéro de bail
            $bailNumber = $lease->lease_number ?? 'BAIL-' . date('Y') . '-' . strtoupper(substr(md5($lease->id), 0, 5));

            // Date du document
            $dateGeneration = now()->format('d/m/Y');
            $dateContrat = now()->format('d/m/Y');

            // Préparer les données pour le PDF
            $data = [
                'bailNumber' => $bailNumber,
                'dateGeneration' => $dateGeneration,
                'dateContrat' => $dateContrat,
                'bailleur' => $bailleur,
                'locataire' => $locataire,
                'property' => $lease->property,
                'lease' => $lease,
                'montantTotal' => $lease->rent_amount + $lease->charges_amount,
                'dureeBail' => $lease->end_date ? 'Déterminée' : 'Indéterminée',
                'dateFin' => $lease->end_date ? $lease->end_date->format('d/m/Y') : 'Durée indéterminée',
                'frequencePaiement' => $this->getFrequencyLabel($lease->payment_frequency ?? 'monthly'),
                'modePaiement' => 'Espèces',
                'chargesIncluses' => 'Aucune',
                'equipements' => 'Aucun équipement spécifié',
                'typeBail' => $lease->type === 'meuble' ? 'meublé' : 'non meublé',
            ];

            return view('co-owner.leases.pdf.lease-contract', $data);

        } catch (\Exception $e) {
            Log::error('Erreur prévisualisation PDF bail', [
                'error' => $e->getMessage(),
                'lease_id' => $lease->id,
            ]);

            return back()->with('error', 'Erreur lors de la prévisualisation du PDF: ' . $e->getMessage());
        }
    }

    /**
     * Supprimer un document de l'historique
     */
    public function destroy(Request $request, Lease $lease, $documentId)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le bail appartient à un bien délégué au co-propriétaire
        $isDelegated = PropertyDelegation::where('property_id', $lease->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return back()->with('error', 'Vous n\'avez pas accès à ce document');
        }

        try {
            // Récupérer les documents du meta
            $meta = $lease->meta ?? [];
            $documents = $meta['documents'] ?? [];

            // Filtrer pour retirer le document avec l'ID donné
            $newDocuments = array_filter($documents, function($doc) use ($documentId) {
                return ($doc['id'] ?? '') != $documentId;
            });

            // Mettre à jour le meta
            $meta['documents'] = array_values($newDocuments); // Réindexer
            $lease->meta = $meta;
            $lease->save();

            Log::info('Document supprimé du meta', [
                'lease_id' => $lease->id,
                'document_id' => $documentId,
                'deleted_by_co_owner' => $coOwner->id,
                'remaining_documents' => count($newDocuments),
            ]);

            return back()->with('success', 'Document supprimé de l\'historique');

        } catch (\Exception $e) {
            Log::error('Erreur suppression document', [
                'error' => $e->getMessage(),
                'lease_id' => $lease->id,
                'document_id' => $documentId,
            ]);

            return back()->with('error', 'Erreur lors de la suppression du document: ' . $e->getMessage());
        }
    }

    /**
     * Méthodes utilitaires pour le PDF
     */
    private function getFrequencyLabel($frequency)
    {
        $labels = [
            'monthly' => 'Mensuel',
            'quarterly' => 'Trimestriel',
            'yearly' => 'Annuel',
        ];

        return $labels[$frequency] ?? 'Mensuel';
    }

    /**
     * Méthode utilitaire pour récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        // Vérifier l'authentification Sanctum (API)
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // Vérifier le token en paramètre
        if ($request->has('api_token')) {
            $token = $request->get('api_token');
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // Vérifier l'authentification web
        if (auth()->check()) {
            return auth()->user();
        }

        return null;
    }
}
