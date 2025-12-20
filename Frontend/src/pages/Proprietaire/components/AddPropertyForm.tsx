import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';

interface AddPropertyFormProps {
  onSuccess: () => void;
}

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Ici, vous ajouterez la logique pour enregistrer le bien
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation de chargement
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bien:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          + Ajouter un Bien
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau bien immobilier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Type de bien</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="local">Local commercial</SelectItem>
                  <SelectItem value="bureau">Bureau</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" placeholder="Adresse complète" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="surface">Surface (m²)</Label>
              <Input id="surface" type="number" placeholder="Ex: 75" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rooms">Nombre de pièces</Label>
              <Input id="rooms" type="number" placeholder="Ex: 3" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rent">Loyer (FCFA)</Label>
              <Input id="rent" type="number" placeholder="Ex: 850" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select defaultValue="available">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Occupé</SelectItem>
                  <SelectItem value="maintenance">En rénovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description du bien..."
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
              {isLoading ? 'Enregistrement...' : 'Enregistrer le bien'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
