import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

interface AddTenantFormProps {
  onSuccess: () => void;
}

export const AddTenantForm: React.FC<AddTenantFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Ici, vous ajouterez la logique pour enregistrer le locataire
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation de chargement
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du locataire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          + Ajouter un Locataire
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau profil locataire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstname">Prénom</Label>
              <Input id="firstname" placeholder="Prénom" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastname">Nom</Label>
              <Input id="lastname" placeholder="Nom" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@exemple.com" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" placeholder="06 12 34 56 78" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthdate">Date de naissance</Label>
              <Input id="birthdate" type="date" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="idNumber">N° Pièce d'identité</Label>
              <Input id="idNumber" placeholder="N° de carte d'identité" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse actuelle</Label>
            <Input id="address" placeholder="Adresse complète" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes complémentaires</Label>
            <textarea
              id="notes"
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informations complémentaires..."
            />
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
              {isLoading ? 'Création en cours...' : 'Créer le profil'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
