import React from 'react';
import { AlertCircle, BarChart3, Building2, FileText, DollarSign, Users, Package, CheckSquare, BookOpen, MessageSquare, UserCheck, Wrench, Trash2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface SectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  features?: string[];
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const PageSection: React.FC<SectionProps> = ({ title, description, icon: Icon, features, notify }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          <Icon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-2">{description}</p>
        </div>
      </div>

      {/* Feature Cards */}
      {features && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-slate-900">{feature}</h3>
              </div>
              <p className="text-sm text-slate-600">Fonctionnalité en cours de développement</p>
            </Card>
          ))}
        </div>
      )}

      {/* Coming Soon Message */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200">
        <div className="flex items-start gap-4">
          <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-slate-900 mb-2">En cours de développement</h3>
            <p className="text-slate-600 mb-4">Cette section sera bientôt disponible avec toutes ses fonctionnalités.</p>
            <Button 
              variant="primary"
              onClick={() => notify(`${title} sera bientôt disponible!`, 'info')}
            >
              Me notifier
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Composants spécifiques
export const Biens: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Mes Biens"
    description="Gérez vos propriétés locatives et tous les détails y afférents"
    icon={Building2}
    features={['Ajouter un bien', 'Visualiser les biens', 'Modifier les détails', 'Ajouter des photos', 'Lier locataires', 'Historique des locations']}
    notify={notify}
  />
);

export const Locataires: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Locataires"
    description="Gérez vos locataires et leurs informations de contact"
    icon={Users}
    features={['Ajouter un locataire', 'Visualiser la base de données', 'Modifier les informations', 'Générer un dossier', 'Communiquer directement', 'Historique des baux']}
    notify={notify}
  />
);

export const Locations: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Locations"
    description="Gérez vos contrats de location et les termes des baux"
    icon={FileText}
    features={['Créer un bail', 'Générer un contrat', 'Télécharger le bail', 'Gérer les dates', 'Ajouter des clauses', 'Archiver les baux']}
    notify={notify}
  />
);

export const Inventaires: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Inventaires"
    description="Créez et gérez les inventaires de vos propriétés"
    icon={Package}
    features={['Créer un inventaire', 'Ajouter des équipements', 'Décrire l\'état', 'Ajouter des photos', 'Générer un PDF', 'Signer numériquement']}
    notify={notify}
  />
);

export const EtatDesLieux: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="État des Lieux"
    description="Créez des états des lieux d'entrée et de sortie"
    icon={CheckSquare}
    features={['État des lieux d\'entrée', 'État des lieux de sortie', 'Décrire les pièces', 'Ajouter des photos', 'Générer un rapport', 'Gérer les dégradations']}
    notify={notify}
  />
);

export const Finances: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Finances"
    description="Suivez vos revenus, dépenses et générez des rapports financiers"
    icon={DollarSign}
    features={['Suivi des loyers', 'Gestion des dépenses', 'Quittances automatiques', 'Bilan financier', 'Déclarations fiscales', 'Synchronisation bancaire']}
    notify={notify}
  />
);

export const Documents: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Documents"
    description="Archivez et organisez tous vos documents importants"
    icon={FileText}
    features={['Uploader des documents', 'Organiser par catégories', 'Partager avec les locataires', 'Générer des modèles', 'Stocker les quittances', 'Archiver les contrats']}
    notify={notify}
  />
);

export const Carnet: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Carnet"
    description="Carnet d'adresses et notes importantes"
    icon={BookOpen}
    features={['Ajouter des contacts', 'Notes personnelles', 'Catégoriser les contacts', 'Ajouter des numéros', 'Gérer les fournisseurs', 'Historique des interactions']}
    notify={notify}
  />
);

export const Candidats: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Candidats"
    description="Gérez les candidatures pour vos annonces locatives"
    icon={UserCheck}
    features={['Recevoir les candidatures', 'Évaluer les profils', 'Envoyer des messages', 'Imprimer les dossiers', 'Accepter/refuser', 'Archiver les candidatures']}
    notify={notify}
  />
);

export const Outils: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Outils"
    description="Outils utiles pour la gestion immobilière"
    icon={Wrench}
    features={['Révision de loyer', 'Régularisation charges', 'Envoi de courrier', 'Assistant IA', 'Synchronisation bancaire', 'Calculatrice d\'impôts']}
    notify={notify}
  />
);

export const Corbeille: React.FC<{ notify: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({ notify }) => (
  <PageSection
    title="Corbeille"
    description="Récupérez les éléments supprimés"
    icon={Trash2}
    features={['Éléments supprimés récents', 'Restaurer un élément', 'Vider la corbeille', 'Historique de suppression', 'Récupération de documents', 'Gestion de l\'espace']}
    notify={notify}
  />
);
