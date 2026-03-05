import React, { useState } from 'react';
import { ChevronLeft, Save, X, Plus, Trash2, Upload } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface FormData {
  // Informations Générales
  identifiant: string;
  couleur: string;
  adresse: string;
  adresse2: string;
  ville: string;
  codePostal: string;
  region: string;
  pays: string;
  
  // Informations Complémentaires
  superficieMetersCarre: string;
  anneeConstruction: string;
  description: string;
  notePrivee: string;
  
  // Informations Financières
  dateAcquisition: string;
  prixAcquisition: string;
  fraisAcquisition: string;
  taxeFonciere: string;
  
  // Clés et Digicode
  clesCodes: Array<{ id: string; description: string; localisation: string }>;
  
  // Clés de Répartition
  repartition: Array<{ id: string; locataire: string; cles: string }>;
}

interface CreateImmeublesProps {
  onBack: () => void;
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type TabType = 'general' | 'lots' | 'complementaires' | 'financieres' | 'cles' | 'repartition' | 'photos' | 'documents';

export const CreateImmeubles: React.FC<CreateImmeublesProps> = ({ onBack, notify }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [formData, setFormData] = useState<FormData>({
    identifiant: '',
    couleur: '#ffffff',
    adresse: '',
    adresse2: '',
    ville: '',
    codePostal: '',
    region: '',
    pays: '',
    superficieMetersCarre: '',
    anneeConstruction: '',
    description: '',
    notePrivee: '',
    dateAcquisition: '',
    prixAcquisition: '',
    fraisAcquisition: '',
    taxeFonciere: '',
    clesCodes: [],
    repartition: []
  });

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const handleInputChange = (field: keyof Omit<FormData, 'clesCodes' | 'repartition'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCleCode = () => {
    setFormData(prev => ({
      ...prev,
      clesCodes: [...prev.clesCodes, { id: Date.now().toString(), description: '', localisation: '' }]
    }));
  };

  const removeCleCode = (id: string) => {
    setFormData(prev => ({
      ...prev,
      clesCodes: prev.clesCodes.filter(c => c.id !== id)
    }));
  };

  const updateCleCode = (id: string, field: 'description' | 'localisation', value: string) => {
    setFormData(prev => ({
      ...prev,
      clesCodes: prev.clesCodes.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addRepartition = () => {
    setFormData(prev => ({
      ...prev,
      repartition: [...prev.repartition, { id: Date.now().toString(), locataire: '', cles: '' }]
    }));
  };

  const removeRepartition = (id: string) => {
    setFormData(prev => ({
      ...prev,
      repartition: prev.repartition.filter(r => r.id !== id)
    }));
  };

  const updateRepartition = (id: string, field: 'locataire' | 'cles', value: string) => {
    setFormData(prev => ({
      ...prev,
      repartition: prev.repartition.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const handleSave = () => {
    if (!formData.identifiant || !formData.adresse || !formData.ville) {
      notify('Veuillez remplir les champs obligatoires', 'error');
      return;
    }
    notify('Immeuble créé avec succès', 'success');
    onBack();
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'general', label: 'INFORMATIONS GÉNÉRALES' },
    { id: 'lots', label: 'LOTS' },
    { id: 'complementaires', label: 'INFORMATIONS COMPLÉMENTAIRES' },
    { id: 'financieres', label: 'INFORMATIONS FINANCIÈRES' },
    { id: 'cles', label: 'CLÉS ET DIGICODE' },
    { id: 'repartition', label: 'CLÉS DE RÉPARTITION' },
    { id: 'photos', label: 'PHOTOS' },
    { id: 'documents', label: 'DOCUMENTS' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Identifiant Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Identifiant</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    IDENTIFIANT <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nouvel immeuble"
                    value={formData.identifiant}
                    onChange={(e) => handleInputChange('identifiant', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Identifiant de l'immeuble"
                    aria-label="Identifiant de l'immeuble"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Saisir un identifiant, référence ou numéro unique. Vous pouvez saisir ou inventer une référence libre.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">COULEUR</label>
                  <input
                    type="color"
                    value={formData.couleur}
                    onChange={(e) => handleInputChange('couleur', e.target.value)}
                    className="h-10 w-20 rounded-lg border border-slate-300 cursor-pointer"
                    title="Couleur de l'immeuble"
                    aria-label="Couleur de l'immeuble"
                  />
                </div>
              </div>
            </div>

            {/* Adresse Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Adresse</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ADRESSE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Indiquez un lieu"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Adresse principale"
                    aria-label="Adresse principale"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ADRESSE 2</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.adresse2}
                    onChange={(e) => handleInputChange('adresse2', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Adresse secondaire"
                    aria-label="Adresse secondaire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    VILLE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Ville"
                    aria-label="Ville"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CODE POSTAL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.codePostal}
                    onChange={(e) => handleInputChange('codePostal', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Code postal"
                    aria-label="Code postal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">RÉGION</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Région"
                    aria-label="Région"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PAYS <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.pays}
                    onChange={(e) => handleInputChange('pays', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Pays"
                    aria-label="Sélectionner le pays"
                  >
                    <option value="">Choisissez le pays</option>
                    <option value="france">France</option>
                    <option value="belgique">Belgique</option>
                    <option value="suisse">Suisse</option>
                    <option value="luxembourg">Luxembourg</option>
                    <option value="canada">Canada</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'lots':
        return (
          <div className="py-12 text-center">
            <p className="text-slate-500 mb-4">Gestion des lots de l'immeuble</p>
            <p className="text-sm text-slate-400">Vous pouvez ajouter les lots qui composent cet immeuble (appartements, bureaux, commerces, etc.)</p>
          </div>
        );

      case 'complementaires':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Description</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">SUPERFICIE M²</label>
              <input
                type="number"
                placeholder=""
                value={formData.superficieMetersCarre}
                onChange={(e) => handleInputChange('superficieMetersCarre', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Superficie en m²"
                aria-label="Superficie en m²"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ANNÉE DE CONSTRUCTION</label>
              <input
                type="number"
                placeholder=""
                value={formData.anneeConstruction}
                onChange={(e) => handleInputChange('anneeConstruction', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Année de construction"
                aria-label="Année de construction"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">DESCRIPTION</label>
              <textarea
                placeholder=""
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                title="Description de l'immeuble"
                aria-label="Description de l'immeuble"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">NOTE PRIVÉE</label>
              <textarea
                placeholder=""
                value={formData.notePrivee}
                onChange={(e) => handleInputChange('notePrivee', e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                title="Note privée"
                aria-label="Note privée"
              />
              <p className="text-xs text-slate-500 mt-1">Cette note est visible uniquement pour vous.</p>
            </div>
          </div>
        );

      case 'financieres':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations Financières</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">DATE D'ACQUISITION</label>
              <input
                type="date"
                value={formData.dateAcquisition}
                onChange={(e) => handleInputChange('dateAcquisition', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Date d'acquisition"
                aria-label="Date d'acquisition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">PRIX D'ACQUISITION (FCFA)</label>
              <input
                type="number"
                placeholder="Exemple: 250000"
                value={formData.prixAcquisition}
                onChange={(e) => handleInputChange('prixAcquisition', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Prix d'acquisition"
                aria-label="Prix d'acquisition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">FRAIS D'ACQUISITION (FCFA)</label>
              <input
                type="number"
                placeholder="Frais de notaire, droits d'enregistrement, etc."
                value={formData.fraisAcquisition}
                onChange={(e) => handleInputChange('fraisAcquisition', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Frais d'acquisition"
                aria-label="Frais d'acquisition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">TAXE FONCIÈRE ANNUELLE (FCFA)</label>
              <input
                type="number"
                placeholder="Montant annuel"
                value={formData.taxeFonciere}
                onChange={(e) => handleInputChange('taxeFonciere', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Taxe foncière"
                aria-label="Taxe foncière"
              />
            </div>
          </div>
        );

      case 'cles':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Clés et Digicodes</h3>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={addCleCode}
              >
                Ajouter une clé
              </Button>
            </div>

            {formData.clesCodes.length === 0 ? (
              <p className="text-slate-500 py-8 text-center">Aucune clé ou digicode enregistré</p>
            ) : (
              <div className="space-y-4">
                {formData.clesCodes.map((cle) => (
                  <Card key={cle.id} className="p-4 border-l-4 border-l-blue-500">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">DESCRIPTION</label>
                        <input
                          type="text"
                          placeholder="Ex: Clé entrée principale, Digicode garage, etc."
                          value={cle.description}
                          onChange={(e) => updateCleCode(cle.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Description"
                          aria-label="Description de la clé"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">LOCALISATION</label>
                        <input
                          type="text"
                          placeholder="Ex: Chez le gestionnaire, Chez le locataire, etc."
                          value={cle.localisation}
                          onChange={(e) => updateCleCode(cle.id, 'localisation', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Localisation"
                          aria-label="Localisation de la clé"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeCleCode(cle.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                          aria-label="Supprimer cette clé"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'repartition':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Clés de Répartition</h3>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={addRepartition}
              >
                Ajouter une répartition
              </Button>
            </div>

            {formData.repartition.length === 0 ? (
              <p className="text-slate-500 py-8 text-center">Aucune répartition de clé enregistrée</p>
            ) : (
              <div className="space-y-4">
                {formData.repartition.map((rep) => (
                  <Card key={rep.id} className="p-4 border-l-4 border-l-green-500">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">LOCATAIRE / RESPONSABLE</label>
                        <input
                          type="text"
                          placeholder="Nom du locataire ou du responsable"
                          value={rep.locataire}
                          onChange={(e) => updateRepartition(rep.id, 'locataire', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Locataire"
                          aria-label="Locataire ou responsable"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">CLÉS ATTRIBUÉES</label>
                        <input
                          type="text"
                          placeholder="Ex: Clé principale, Clé garage, Digicode"
                          value={rep.cles}
                          onChange={(e) => updateRepartition(rep.id, 'cles', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Clés"
                          aria-label="Clés attribuées"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeRepartition(rep.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                          aria-label="Supprimer cette répartition"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Photos</h3>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-slate-600 font-medium mb-1">Déposer des fichiers ici ou cliquer pour sélectionner</p>
              <p className="text-xs text-slate-500 mb-4">Formats acceptés: JPG, PNG, GIF. Taille max: 10 Mo</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                title="Sélectionner des photos"
                aria-label="Sélectionner des photos"
              />
              <Button variant="secondary" size="sm">Parcourir</Button>
            </div>

            {uploadedPhotos.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Photos téléchargées ({uploadedPhotos.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedPhotos.map((photo, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden bg-slate-100 aspect-square">
                      <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        title="Supprimer cette photo"
                        aria-label="Supprimer cette photo"
                      >
                        <Trash2 size={20} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Documents</h3>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-slate-600 font-medium mb-1">Déposer des documents ici ou cliquer pour sélectionner</p>
              <p className="text-xs text-slate-500 mb-4">Formats acceptés: PDF, DOC, XLS, etc. Taille max: 50 Mo</p>
              <input
                type="file"
                multiple
                className="hidden"
                title="Sélectionner des documents"
                aria-label="Sélectionner des documents"
              />
              <Button variant="secondary" size="sm">Parcourir</Button>
            </div>

            {uploadedDocuments.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Documents téléchargés ({uploadedDocuments.length})</h4>
                <div className="space-y-2">
                  {uploadedDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-sm text-slate-700">{doc}</span>
                      <button
                        onClick={() => setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== idx))}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                        aria-label="Supprimer ce document"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Retour"
            aria-label="Retour à la liste des immeubles"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nouvel immeuble</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-2 min-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-orange-600 border-orange-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
              title={tab.label}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card className="p-8">
        {renderContent()}
      </Card>

      {/* Footer Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t">
        <Button
          variant="secondary"
          onClick={onBack}
          icon={<X size={16} />}
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          icon={<Save size={16} />}
        >
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};
