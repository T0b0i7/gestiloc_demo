<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreTicketRequest;
use App\Http\Resources\TicketResource; // À créer
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    private function getTenant()
    {
        return auth()->user()->tenant;
    }

    /**
     * Lister mes demandes d'intervention.
     */
    public function index(Request $request)
    {
        // Récupérer tous les IDs de baux du locataire
        $leaseIds = $this->getTenant()->leases()->pluck('id');

        $query = Ticket::whereIn('lease_id', $leaseIds)
            ->with(['lease.property']) // Pour afficher "Fuite d'eau - Villa Cotonou"
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return TicketResource::collection($query->paginate(15));
    }

    /**
     * Créer un nouveau signalement.
     */
    public function store(StoreTicketRequest $request)
    {
        // 1. Trouver le bail ACTIF du locataire
        $activeLease = $this->getTenant()->activeLease; // Utilise la méthode définie dans le modèle Tenant

        if (!$activeLease) {
            return response()->json(['message' => 'Aucun bail actif trouvé. Vous ne pouvez pas créer de ticket.'], 403);
        }

        $data = $request->validated();

        // Gestion des photos (Preuves du dégât)
        $photos = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('tickets', 'public');
                $photos[] = Storage::url($path);
            }
        }

        // Création du ticket
        $ticket = Ticket::create([
            'lease_id' => $activeLease->id,
            'creator_user_id' => auth()->id(), // L'utilisateur connecté (le locataire)
            'subject' => $data['subject'],
            'description' => $data['description'],
            'priority' => $data['priority'] ?? 'medium',
            'status' => 'open',
            // On pourrait ajouter un champ 'photos' json dans la migration Ticket si ce n'est pas fait
            // 'photos' => $photos 
        ]);
        
        // Si vous n'avez pas de colonne photos dans tickets, stockez-les dans une table liée 'ticket_attachments'
        // Pour l'instant, supposons que vous avez ajouté une colonne JSON 'meta' ou 'attachments' au modèle Ticket.

        return new TicketResource($ticket);
    }

    /**
     * Voir le détail d'un ticket.
     */
    public function show($id)
    {
        // Vérification que le ticket appartient bien à un des baux du locataire
        $leaseIds = $this->getTenant()->leases()->pluck('id');
        
        $ticket = Ticket::whereIn('lease_id', $leaseIds)
            ->where('id', $id)
            ->firstOrFail();

        return new TicketResource($ticket);
    }
    
    /**
     * (Optionnel) Le locataire peut annuler/fermer son ticket s'il a résolu le problème.
     */
    public function close($id)
    {
        $leaseIds = $this->getTenant()->leases()->pluck('id');
        
        $ticket = Ticket::whereIn('lease_id', $leaseIds)
            ->where('id', $id)
            ->firstOrFail();

        if ($ticket->status === 'closed') {
             return response()->json(['message' => 'Ticket déjà fermé.'], 400);
        }

        $ticket->update(['status' => 'closed']); // Ou 'resolved'

        return response()->json(['message' => 'Ticket fermé avec succès.']);
    }
}