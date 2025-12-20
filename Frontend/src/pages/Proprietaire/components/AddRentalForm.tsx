import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';

interface AddRentalFormProps {
  onSuccess: () => void;
}

export const AddRentalForm: React.FC<AddRentalFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Données factices pour la démonstration
  const properties = [
    { id: 1, name: 'Appartement T2 - 42 rue des Lilas, Paris' },
    { id: 2, name: 'Maison - 15 avenue des Champs-Élysées' },
  ];
  
  const tenants = [
    { id: 1, name: 'Dupont Jean' },
    { id: 2, name: 'Martin Sophie' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Ici, vous ajouterez la logique pour créer le contrat de location
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation de chargement
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du contrat de location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          + Nouvelle Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau contrat de bail</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="property">Bien immobilier</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un bien" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tenant">Locataire</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un locataire" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input id="startDate" type="date" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin (optionnel)</Label>
              <Input id="endDate" type="date" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rent">Loyer mensuel (FCFA)</Label>
              <Input id="rent" type="number" placeholder="850" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deposit">Dépôt de garantie (FCFA)</Label>
              <Input id="deposit" type="number" placeholder="850" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="charges">Charges mensuelles (FCFA)</Label>
              <Input id="charges" type="number" placeholder="100" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentDay">Jour de paiement</Label>
              <Input id="paymentDay" type="number" min="1" max="31" defaultValue="5" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="terms">Conditions particulières</Label>
            <textarea
              id="terms"
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Conditions particulières du bail..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="sendEmail" className="rounded border-gray-300 text-blue-600" />
            <Label htmlFor="sendEmail" className="text-sm font-medium">
              Envoyer une notification par email au locataire
            </Label>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Création en cours...' : 'Créer le contrat'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
