import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';

interface CreateLotProps {
  onBack: () => void;
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const CreateLot: React.FC<CreateLotProps> = ({ onBack, notify }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    // Infos générales
    type: 'Appartement',
    identifiant: '',
    couleur: '#2563eb',
    adresse: '',
    adresse2: '',
    batiment: '',
    escalier: '',
    etage: '',
    numero: '',
    ville: '',
    codePostal: '',
    region: '',
    pays: 'France',
    // Infos complémentaires
    typeHabitat: 'Immeuble collectif',
    regimeJuridique: 'Copropriété',
    bienMeuble: false,
    fumeurs: false,
    animaux: false,
    // Équipements
    equipements: [] as string[],
    espacesExterieurs: [] as string[],
    batimentEquipements: [] as string[],
    securite: [] as string[],
    equipementsSportifs: [] as string[],
    // Autres infos complémentaires
    parking: '',
    autresDependances: '',
    cave: '',
    lot: '',
    milliemes: '',
    // Références cadastrales
    feuilleCadastrale: '',
    parcelleCadastrale: '',
    categorieCadastrale: '',
    valeurLocativeC: '',
    // Infos complémentaires générales
    superficie: '',
    pieces: '',
    chambres: '',
    sallesDeBain: '',
    dateConstruction: '',
    description: '',
    // Infos financières
    etatLocatif: 'Automatique',
    typeLocation: '',
    loyerHT: '',
    charges: '',
    frequencePaiement: '',
    // Données d'acquisition et valeur
    dateAcquisition: '',
    prixAcquisition: '',
    fraisAcquisition: '',
    fraisAgence: '',
    valeurActuelle: '',
    prixVente: '',
    // Informations fiscales
    regimeFiscal: 'Choisir',
    siret: '',
    dateDebutActivite: '',
    numeroFiscal: '',
    taxeHabitation: '',
    taxeFonciere: '',
    // Centre d'impôts
    nomCentreImpots: '',
    adresseCentreImpots: '',
    adresse2CentreImpots: '',
    codePostalCentreImpots: '',
    villeCentreImpots: '',
    notesCentreImpots: '',
    // Énergie
    classeEnergie: '',
    gazEffetSerre: '',
    depensesAnnuellesMin: '',
    depensesAnnuellesMax: '',
    anneeReference: new Date().getFullYear().toString(),
    // Notes
    notePrivee: ''
  });

  const [cles, setCles] = useState<Array<{ id: number; numero: string; nombre: string; detenteur: string; commentaire: string }>>([]);
  const [documents, setDocuments] = useState<Array<{ id: number; type: string; titre: string; description: string; dateEtablissement: string; dateValidite: string; fichier: string; fichierNom: string }>>([]);
  const [photos, setPhotos] = useState<Array<{ id: number; name: string; size: string }>>([]);
  const [formDocument, setFormDocument] = useState({ type: 'Choisir', documentMode: 'nouveau', description: '', dateEtablissement: '', dateEchance: '', documentExistant: '' });
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentFormMode, setDocumentFormMode] = useState<'nouveau' | 'existant'>('nouveau');
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ id: number; type: string; documentMode: string; fichier: string; fichierNom: string; description: string; partage: boolean }>>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCle = () => {
    setCles([...cles, { id: Date.now(), numero: '', nombre: '', detenteur: '', commentaire: '' }]);
  };

  const handleRemoveCle = (id: number) => {
    setCles(cles.filter(c => c.id !== id));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        id: Date.now(),
        name: file.name,
        size: (file.size / 1024).toFixed(2)
      }));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleAddDocument = () => {
    setDocuments([...documents, { id: Date.now(), type: 'Choisir', titre: '', description: '', dateEtablissement: '', dateValidite: '', fichier: '', fichierNom: '' }]);
  };

  const handleRemoveDocument = (id: number) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const handleDocumentChange = (id: number, field: string, value: string) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleSave = () => {
    if (!formData.identifiant || !formData.adresse || !formData.ville) {
      notify('Veuillez remplir les champs obligatoires', 'error');
      return;
    }
    notify('Lot créé avec succès', 'success');
    onBack();
  };

  const tabs = [
    { id: 'general', label: 'INFORMATIONS GÉNÉRALES' },
    { id: 'lots', label: 'LOTS' },
    { id: 'complementaires', label: 'INFORMATIONS COMPLÉMENTAIRES' },
    { id: 'financieres', label: 'INFORMATIONS FINANCIÈRES' },
    { id: 'cles', label: 'CLÉS ET DIGICODE' },
    { id: 'repartition', label: 'CLÉS DE RÉPARTITION' },
    { id: 'photos', label: 'PHOTOS' },
    { id: 'notes', label: 'DOCUMENTS' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Nouveau lot</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        {/* INFORMATIONS GÉNÉRALES */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                title="Type de bien"
                aria-label="Sélectionner le type de bien"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Appartement</option>
                <option>Atelier</option>
                <option>Boutique</option>
                <option>Box de stockage</option>
                <option>Bureau partagé</option>
                <option>Bureaux</option>
                <option>Caravane</option>
                <option>Cave</option>
                <option>Chalet</option>
                <option>Chambre</option>
                <option>Château</option>
                <option>Commerce</option>
                <option>Entrepôt</option>
                <option>Garage</option>
                <option>Grenier</option>
                <option>Hôtel Particulier</option>
                <option>Local professionnel</option>
                <option>Local commercial</option>
                <option>Loft</option>
                <option>Maison</option>
                <option>Mobil-Home</option>
                <option>Parking</option>
                <option>Studio</option>
                <option>Terrain</option>
                <option>Autre</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Identifiant *</label>
              <input
                type="text"
                placeholder="Nouveau bien"
                value={formData.identifiant}
                onChange={(e) => handleInputChange('identifiant', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500">Saisir un identifiant, référence ou numéro unique. Vous pouvez saisir ou inventer une référence libre.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Couleur</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  title="Sélectionner la couleur du bien"
                  aria-label="Couleur de représentation du bien"
                  value={formData.couleur}
                  onChange={(e) => handleInputChange('couleur', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  title="Code couleur hexadécimal"
                  aria-label="Code couleur hexadécimal"
                  placeholder="#2563eb"
                  value={formData.couleur}
                  onChange={(e) => handleInputChange('couleur', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Adresse *</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Indiquez un lieu"
                  title="Adresse principale"
                  aria-label="Adresse principale du bien"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Adresse 2"
                  title="Adresse complémentaire"
                  aria-label="Adresse complémentaire du bien"
                  value={formData.adresse2}
                  onChange={(e) => handleInputChange('adresse2', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Bâtiment"
                    value={formData.batiment}
                    onChange={(e) => handleInputChange('batiment', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Escalier"
                    value={formData.escalier}
                    onChange={(e) => handleInputChange('escalier', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Étage"
                    value={formData.etage}
                    onChange={(e) => handleInputChange('etage', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Numéro"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Ville *"
                  value={formData.ville}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Code postal *"
                    value={formData.codePostal}
                    onChange={(e) => handleInputChange('codePostal', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Région"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={formData.pays}
                  onChange={(e) => handleInputChange('pays', e.target.value)}
                  title="Sélectionner un pays"
                  aria-label="Sélectionner le pays du bien"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>France</option>
                  <option>Afghanistan</option>
                  <option>Afrique du Sud</option>
                  <option>Albanie</option>
                  <option>Algérie</option>
                  <option>Allemagne</option>
                  <option>Andorre</option>
                  <option>Angola</option>
                  <option>Antigua-et-Barbuda</option>
                  <option>Arabie saoudite</option>
                  <option>Argentine</option>
                  <option>Arménie</option>
                  <option>Australie</option>
                  <option>Autriche</option>
                  <option>Azerbaïdjan</option>
                  <option>Bahamas</option>
                  <option>Bahreïn</option>
                  <option>Bangladesh</option>
                  <option>Barbade</option>
                  <option>Belgique</option>
                  <option>Belize</option>
                  <option>Benin</option>
                  <option>Bermudes</option>
                  <option>Bhoutan</option>
                  <option>Birmanie</option>
                  <option>Bolivie</option>
                  <option>Bosnie-Herzégovine</option>
                  <option>Botswana</option>
                  <option>Brésil</option>
                  <option>Brunei</option>
                  <option>Bulgarie</option>
                  <option>Burkina Faso</option>
                  <option>Burundi</option>
                  <option>Cambodge</option>
                  <option>Cameroun</option>
                  <option>Canada</option>
                  <option>Cap Vert</option>
                  <option>Chili</option>
                  <option>Chine</option>
                  <option>Chypre</option>
                  <option>Colombie</option>
                  <option>Comores</option>
                  <option>Congo</option>
                  <option>Corée du Nord</option>
                  <option>Corée du Sud</option>
                  <option>Costa Rica</option>
                  <option>Côte d'Ivoire</option>
                  <option>Croatie</option>
                  <option>Cuba</option>
                  <option>Danemark</option>
                  <option>Djibouti</option>
                  <option>Dominique</option>
                  <option>Égypte</option>
                  <option>Émirats arabes unis</option>
                  <option>Équateur</option>
                  <option>Érythrée</option>
                  <option>Espagne</option>
                  <option>Estonie</option>
                  <option>États-Unis</option>
                  <option>Éthiopie</option>
                  <option>Fidji</option>
                  <option>Finlande</option>
                  <option>Gabon</option>
                  <option>Gambie</option>
                  <option>Géorgie</option>
                  <option>Ghana</option>
                  <option>Gibraltar</option>
                  <option>Grenade</option>
                  <option>Groenland</option>
                  <option>Grèce</option>
                  <option>Guadeloupe</option>
                  <option>Guam</option>
                  <option>Guatemala</option>
                  <option>Guernesey</option>
                  <option>Guinée</option>
                  <option>Guinée équatoriale</option>
                  <option>Guinée-Bissau</option>
                  <option>Guyana</option>
                  <option>Guyane française</option>
                  <option>Haïti</option>
                  <option>Honduras</option>
                  <option>Hong-Kong</option>
                  <option>Hongrie</option>
                  <option>Île Bouvet</option>
                  <option>Île Christmas</option>
                  <option>Île Norfolk</option>
                  <option>Îles Åland</option>
                  <option>Îles Caïmanes</option>
                  <option>Îles Cocos</option>
                  <option>Îles Cook</option>
                  <option>Îles Féroé</option>
                  <option>Îles Heard et MacDonald</option>
                  <option>Îles Mariannes du Nord</option>
                  <option>Îles Marshall</option>
                  <option>Îles Salomon</option>
                  <option>Îles Turks et Caïques</option>
                  <option>Îles Vierges Britanniques</option>
                  <option>Îles Vierges des États-Unis</option>
                  <option>Inde</option>
                  <option>Indonésie</option>
                  <option>Irak</option>
                  <option>Iran</option>
                  <option>Irlande</option>
                  <option>Islande</option>
                  <option>Israël</option>
                  <option>Italie</option>
                  <option>Jamaïque</option>
                  <option>Japon</option>
                  <option>Jordanie</option>
                  <option>Jersey</option>
                  <option>Kazakhstan</option>
                  <option>Kenya</option>
                  <option>Kirghizistan</option>
                  <option>Kiribati</option>
                  <option>Kosovo</option>
                  <option>Koweït</option>
                  <option>Laos</option>
                  <option>Lesotho</option>
                  <option>Lettonie</option>
                  <option>Liban</option>
                  <option>Liberia</option>
                  <option>Libye</option>
                  <option>Liechtenstein</option>
                  <option>Lituanie</option>
                  <option>Luxembourg</option>
                  <option>Macao</option>
                  <option>Macédoine</option>
                  <option>Madagascar</option>
                  <option>Malaisie</option>
                  <option>Malawi</option>
                  <option>Maldives</option>
                  <option>Mali</option>
                  <option>Malte</option>
                  <option>Maroc</option>
                  <option>Martinique</option>
                  <option>Maurice</option>
                  <option>Mauritanie</option>
                  <option>Mayotte</option>
                  <option>Mexique</option>
                  <option>Micronésie</option>
                  <option>Moldavie</option>
                  <option>Monaco</option>
                  <option>Mongolie</option>
                  <option>Monténégro</option>
                  <option>Montserrat</option>
                  <option>Mozambique</option>
                  <option>Namibie</option>
                  <option>Nauru</option>
                  <option>Népal</option>
                  <option>Néerlande</option>
                  <option>Nicaragua</option>
                  <option>Niger</option>
                  <option>Nigéria</option>
                  <option>Niue</option>
                  <option>Norvège</option>
                  <option>Nouvelle-Calédonie</option>
                  <option>Nouvelle-Zélande</option>
                  <option>Oman</option>
                  <option>Ouganda</option>
                  <option>Ouzbékistan</option>
                  <option>Pakistan</option>
                  <option>Palaos</option>
                  <option>Palestine</option>
                  <option>Panama</option>
                  <option>Papouasie-Nouvelle-Guinée</option>
                  <option>Paraguay</option>
                  <option>Pays-Bas</option>
                  <option>Pérou</option>
                  <option>Philippines</option>
                  <option>Pitcairn</option>
                  <option>Pologne</option>
                  <option>Polynésie française</option>
                  <option>Porto Rico</option>
                  <option>Portugal</option>
                  <option>Qatar</option>
                  <option>République centrafricaine</option>
                  <option>République démocratique du Congo</option>
                  <option>République dominicaine</option>
                  <option>République tchèque</option>
                  <option>Réunion</option>
                  <option>Roumanie</option>
                  <option>Royaume-Uni</option>
                  <option>Russie</option>
                  <option>Rwanda</option>
                  <option>Sahara occidental</option>
                  <option>Saint-Barthélemy</option>
                  <option>Saint-Marin</option>
                  <option>Saint-Martin</option>
                  <option>Saint-Pierre-et-Miquelon</option>
                  <option>Saint-Siège</option>
                  <option>Saint-Vincent-et-les Grenadines</option>
                  <option>Sainte-Hélène</option>
                  <option>Sainte-Lucie</option>
                  <option>Samoa</option>
                  <option>Samoa américaines</option>
                  <option>Sao Tomé-et-Principe</option>
                  <option>Sénégal</option>
                  <option>Serbie</option>
                  <option>Seychelles</option>
                  <option>Sierra Leone</option>
                  <option>Singapour</option>
                  <option>Sint Maarten</option>
                  <option>Slovaquie</option>
                  <option>Slovénie</option>
                  <option>Somalie</option>
                  <option>Soudan</option>
                  <option>South Sudan</option>
                  <option>Sri Lanka</option>
                  <option>Suède</option>
                  <option>Suisse</option>
                  <option>Suriname</option>
                  <option>Swaziland</option>
                  <option>Syrie</option>
                  <option>Tadjikistan</option>
                  <option>Tahiti</option>
                  <option>Taïwan</option>
                  <option>Tanzanie</option>
                  <option>Tchad</option>
                  <option>Terres australes françaises</option>
                  <option>Territoire britannique de l'océan indien</option>
                  <option>Thaïlande</option>
                  <option>Timor-Leste</option>
                  <option>Togo</option>
                  <option>Tokelau</option>
                  <option>Tonga</option>
                  <option>Trinité-et-Tobago</option>
                  <option>Tunisie</option>
                  <option>Turkménistan</option>
                  <option>Turquie</option>
                  <option>Tuvalu</option>
                  <option>Ukraine</option>
                  <option>Uruguay</option>
                  <option>Vanuatu</option>
                  <option>Vatican</option>
                  <option>Venezuela</option>
                  <option>Viêt Nam</option>
                  <option>Wallis et Futuna</option>
                  <option>Yémen</option>
                  <option>Zambie</option>
                  <option>Zimbabwe</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* LOTS */}
        {activeTab === 'lots' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Lots</h3>
              <p className="text-xs text-slate-600">
                Gérez les lots individuels de votre immeuble.
              </p>
            </div>
          </div>
        )}

        {/* INFORMATIONS COMPLÉMENTAIRES */}
        {activeTab === 'complementaires' && (
          <div className="space-y-6">
            {/* TYPE D'HABITAT */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Type d'habitat</h3>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="typeHabitat"
                    value="Immeuble collectif"
                    checked={formData.typeHabitat === 'Immeuble collectif'}
                    onChange={(e) => handleInputChange('typeHabitat', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Immeuble collectif</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="typeHabitat"
                    value="Immeuble Individuel"
                    checked={formData.typeHabitat === 'Immeuble Individuel'}
                    onChange={(e) => handleInputChange('typeHabitat', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Immeuble Individuel</span>
                </label>
              </div>
            </div>

            {/* RÉGIME JURIDIQUE */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Régime juridique de l'immeuble</h3>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="regimeJuridique"
                    value="Copropriété"
                    checked={formData.regimeJuridique === 'Copropriété'}
                    onChange={(e) => handleInputChange('regimeJuridique', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Copropriété</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="regimeJuridique"
                    value="Mono propriété"
                    checked={formData.regimeJuridique === 'Mono propriété'}
                    onChange={(e) => handleInputChange('regimeJuridique', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Mono propriété</span>
                </label>
              </div>
            </div>

            {/* BIEN MEUBLÉ, FUMEURS, ANIMAUX */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.bienMeuble}
                  onChange={(e) => handleInputChange('bienMeuble', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-slate-900">Bien meublé</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.fumeurs}
                  onChange={(e) => handleInputChange('fumeurs', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-slate-900">Fumeurs acceptés</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.animaux}
                  onChange={(e) => handleInputChange('animaux', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-slate-900">Animaux acceptés</span>
              </label>
            </div>

            {/* DÉSIGNATION DES PARTIES ET ÉQUIPEMENTS */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Désignation des parties et équipements</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Accès Internet', 'Air conditionné', 'Borne voiture électrique', 'Chauffage collectif',
                  'Détecteur de fumée', 'Double vitrage', 'Panneaux solaires', 'Sauna',
                  'Stores électriques', 'Ventilation', 'VMC', 'Volets roulants électriques'
                ].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.equipements.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('equipements', JSON.stringify([...formData.equipements, item]));
                        } else {
                          handleInputChange('equipements', JSON.stringify(formData.equipements.filter(e => e !== item)));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                {[
                  'Adoucisseur d\'eau', 'Antenne TV collective', 'Câble/Fibre', 'Cheminée',
                  'Domotique', 'Eau chaude collective', 'Parking', 'Stores',
                  'Thermostat connecté', 'Vide ordures', 'Volets roulants'
                ].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.equipements.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('equipements', JSON.stringify([...formData.equipements, item]));
                        } else {
                          handleInputChange('equipements', JSON.stringify(formData.equipements.filter(e => e !== item)));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ESPACES EXTÉRIEURS */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Espaces extérieurs</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Aire de jeux', 'Barbecue', 'Jardin', 'Balcon', 'Espace vert', 'Terrasse'
                ].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.espacesExterieurs.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('espacesExterieurs', JSON.stringify([...formData.espacesExterieurs, item]));
                        } else {
                          handleInputChange('espacesExterieurs', JSON.stringify(formData.espacesExterieurs.filter(e => e !== item)));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* BÂTIMENT */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Bâtiment</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Accès handicapé', 'Buanderie commune', 'Cinéma', 'Fibre optique',
                  'Garage à vélo', 'Local à vélo', 'Ascenseur', 'Cave', 'Concierge', 'Garage', 'Laverie'
                ].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.batimentEquipements.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('batimentEquipements', JSON.stringify([...formData.batimentEquipements, item]));
                        } else {
                          handleInputChange('batimentEquipements', JSON.stringify(formData.batimentEquipements.filter(e => e !== item)));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SÉCURITÉ */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Sécurité</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Alarme', 'Barres de fenêtres', 'Digicode', 'Interphone', 'Service de sécurité',
                  'Télésurveillance', 'Alarme incendie', 'Coffre-fort', 'Gardien', 'Porte blindée',
                  'Système de sécurité', 'Vidéophone'
                ].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.securite.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('securite', JSON.stringify([...formData.securite, item]));
                        } else {
                          handleInputChange('securite', JSON.stringify(formData.securite.filter(e => e !== item)));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ÉQUIPEMENTS SPORTIFS */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Équipements sportifs</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Fitness', 'Salle de sport', 'Tennis', 'Piscine', 'Spa', 'Terrain de jeux'
                ].map(item => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.equipementsSportifs.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('equipementsSportifs', JSON.stringify([...formData.equipementsSportifs, item]));
                        } else {
                          handleInputChange('equipementsSportifs', JSON.stringify(formData.equipementsSportifs.filter(e => e !== item)));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* AUTRES CHAMPS */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Parking</label>
                <input
                  type="text"
                  title="Nombre ou description du parking"
                  aria-label="Parking"
                  placeholder="Nombre ou description"
                  value={formData.parking}
                  onChange={(e) => handleInputChange('parking', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Autres dépendances</label>
                <input
                  type="text"
                  title="Autres dépendances"
                  aria-label="Autres dépendances"
                  placeholder="Décrivez"
                  value={formData.autresDependances}
                  onChange={(e) => handleInputChange('autresDependances', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Cave</label>
                <input
                  type="text"
                  title="Informations sur la cave"
                  aria-label="Cave"
                  placeholder="Décrivez"
                  value={formData.cave}
                  onChange={(e) => handleInputChange('cave', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Lot</label>
                <input
                  type="text"
                  title="Numéro de lot"
                  aria-label="Lot"
                  placeholder="Numéro de lot"
                  value={formData.lot}
                  onChange={(e) => handleInputChange('lot', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Millièmes</label>
                <input
                  type="text"
                  title="Millièmes de copropriété"
                  aria-label="Millièmes"
                  placeholder="Millièmes"
                  value={formData.milliemes}
                  onChange={(e) => handleInputChange('milliemes', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* RÉFÉRENCES CADASTRALES */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Références cadastrales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Feuille cadastrale</label>
                  <input
                    type="text"
                    title="Feuille cadastrale"
                    aria-label="Feuille cadastrale"
                    placeholder="Feuille"
                    value={formData.feuilleCadastrale}
                    onChange={(e) => handleInputChange('feuilleCadastrale', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Parcelle cadastrale</label>
                  <input
                    type="text"
                    title="Parcelle cadastrale"
                    aria-label="Parcelle cadastrale"
                    placeholder="Parcelle"
                    value={formData.parcelleCadastrale}
                    onChange={(e) => handleInputChange('parcelleCadastrale', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Catégorie cadastrale</label>
                  <input
                    type="text"
                    title="Catégorie cadastrale"
                    aria-label="Catégorie cadastrale"
                    placeholder="Catégorie"
                    value={formData.categorieCadastrale}
                    onChange={(e) => handleInputChange('categorieCadastrale', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Valeur locative cadastrale</label>
                  <input
                    type="text"
                    title="Valeur locative cadastrale"
                    aria-label="Valeur locative cadastrale"
                    placeholder="Valeur"
                    value={formData.valeurLocativeC}
                    onChange={(e) => handleInputChange('valeurLocativeC', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* SUPERFICIE ET PIÈCES */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Caractéristiques du bien</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Superficie (m²)</label>
                  <input
                    type="number"
                    title="Superficie en mètres carrés"
                    aria-label="Superficie du bien en m²"
                    placeholder="0"
                    value={formData.superficie}
                    onChange={(e) => handleInputChange('superficie', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Nombre de pièces</label>
                  <input
                    type="number"
                    title="Nombre de pièces"
                    aria-label="Nombre de pièces du bien"
                    placeholder="0"
                    value={formData.pieces}
                    onChange={(e) => handleInputChange('pieces', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Nombre de chambres</label>
                  <input
                    type="number"
                    title="Nombre de chambres"
                    aria-label="Nombre de chambres du bien"
                    placeholder="0"
                    value={formData.chambres}
                    onChange={(e) => handleInputChange('chambres', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Salles de bain</label>
                  <input
                    type="number"
                    title="Nombre de salles de bain"
                    aria-label="Nombre de salles de bain du bien"
                    placeholder="0"
                    value={formData.sallesDeBain}
                    onChange={(e) => handleInputChange('sallesDeBain', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Date de construction</label>
                <input
                  type="date"
                  title="Date de construction du bien"
                  aria-label="Date de construction du bien"
                  value={formData.dateConstruction}
                  onChange={(e) => handleInputChange('dateConstruction', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Description</label>
                <textarea
                  rows={4}
                  placeholder="Décrivez brièvement le bien immobilier : type, taille, aménagements, confort et particularités..."
                  title="Description du bien"
                  aria-label="Description du bien immobilier"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-500">Description du bien immobilier reprise sur le contrat de location</p>
              </div>
            </div>
          </div>
        )}

        {/* INFORMATIONS FINANCIÈRES */}
        {activeTab === 'financieres' && (
          <div className="space-y-6">
            {/* DONNÉES D'ACQUISITION ET VALEUR */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Données d'acquisition et valeur</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Date d'acquisition</label>
                  <input
                    type="date"
                    title="Date d'acquisition du bien"
                    aria-label="Date d'acquisition du bien"
                    value={formData.dateAcquisition}
                    onChange={(e) => handleInputChange('dateAcquisition', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Prix d'acquisition (FCFA)</label>
                  <input
                    type="number"
                    title="Prix d'acquisition du bien"
                    aria-label="Prix d'acquisition du bien"
                    placeholder="0"
                    value={formData.prixAcquisition}
                    onChange={(e) => handleInputChange('prixAcquisition', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Montant utilisé pour calculer la rentabilité dans la rubrique Bilan</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Frais d'acquisition (FCFA)</label>
                  <input
                    type="number"
                    title="Frais d'acquisition (notaire, inscription, etc.)"
                    aria-label="Frais d'acquisition"
                    placeholder="0"
                    value={formData.fraisAcquisition}
                    onChange={(e) => handleInputChange('fraisAcquisition', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Frais de notaire, frais d'inscription, etc.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Frais d'agence (FCFA)</label>
                  <input
                    type="number"
                    title="Frais d'agence"
                    aria-label="Frais d'agence"
                    placeholder="0"
                    value={formData.fraisAgence}
                    onChange={(e) => handleInputChange('fraisAgence', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Valeur actuelle (FCFA)</label>
                  <input
                    type="number"
                    title="Valeur actuelle du bien"
                    aria-label="Valeur actuelle du bien"
                    placeholder="0"
                    value={formData.valeurActuelle}
                    onChange={(e) => handleInputChange('valeurActuelle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Estimation de la valeur du marché de votre bien</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Prix de vente (FCFA)</label>
                  <input
                    type="number"
                    title="Prix de vente indicatif"
                    aria-label="Prix de vente indicatif"
                    placeholder="0"
                    value={formData.prixVente}
                    onChange={(e) => handleInputChange('prixVente', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Montant indicatif concernant le prix de vente du bien</p>
                </div>
              </div>
            </div>

            {/* INFORMATIONS LOCATIVES */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Informations locatives</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">État locatif *</label>
                  <select
                    value={formData.etatLocatif}
                    onChange={(e) => handleInputChange('etatLocatif', e.target.value)}
                    title="État locatif du bien"
                    aria-label="Sélectionner l'état locatif du bien"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Automatique</option>
                    <option>Disponible</option>
                    <option>Loué</option>
                    <option>Préavis / Départ</option>
                    <option>Recherche de locataire</option>
                    <option>Indisponible</option>
                    <option>Travaux</option>
                  </select>
                  <p className="text-xs text-slate-500">État locatif du bien (loué, vacant, en rénovation...)</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Type de location proposé</label>
                  <select
                    value={formData.typeLocation}
                    onChange={(e) => handleInputChange('typeLocation', e.target.value)}
                    title="Type de location proposé"
                    aria-label="Sélectionner le type de location proposé"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choisir</option>
                    <option>Meublée</option>
                    <option>Vide</option>
                    <option>Saisonnière</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Loyer hors charges (FCFA)</label>
                  <input
                    type="number"
                    title="Loyer hors charges"
                    aria-label="Loyer hors charges en euros"
                    placeholder="0"
                    value={formData.loyerHT}
                    onChange={(e) => handleInputChange('loyerHT', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Montant repris dans la page de création de location et la fiche produit</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Charges locatives (FCFA)</label>
                  <input
                    type="number"
                    title="Charges locatives"
                    aria-label="Charges locatives en euros"
                    placeholder="0"
                    value={formData.charges}
                    onChange={(e) => handleInputChange('charges', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Montant repris dans la page de création de location et la fiche produit</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Fréquence de paiement</label>
                <select
                  value={formData.frequencePaiement}
                  onChange={(e) => handleInputChange('frequencePaiement', e.target.value)}
                  title="Fréquence de paiement du loyer"
                  aria-label="Sélectionner la fréquence de paiement"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choisir</option>
                  <option>Mensuel</option>
                  <option>Bimestriel</option>
                  <option>Trimestriel</option>
                  <option>Semestriel</option>
                  <option>Annuel</option>
                </select>
              </div>
            </div>

            {/* INFORMATIONS FISCALES */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Informations fiscales</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Régime fiscal</label>
                <select
                  value={formData.regimeFiscal}
                  onChange={(e) => handleInputChange('regimeFiscal', e.target.value)}
                  title="Régime fiscal du bien"
                  aria-label="Sélectionner le régime fiscal du bien"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Choisir</option>
                  <option>Pinel 6 ans</option>
                  <option>Pinel 9 ans</option>
                  <option>Revenu foncier classique Réel</option>
                  <option>Revenu foncier classique Micro</option>
                  <option>BIC Réel / location meublée</option>
                  <option>BIC Micro / location meublée</option>
                  <option>Indéfini</option>
                  <option>Pinel Réhabilitation</option>
                  <option>Censi-Bouvard</option>
                  <option>Monument Historique</option>
                  <option>Malraux</option>
                  <option>Girardin</option>
                  <option>Girardin intermédiaire</option>
                  <option>Paul</option>
                  <option>Paul intermédiaire</option>
                  <option>Démembrement usufruitier/nu-propriétaire</option>
                  <option>Besson neuf</option>
                  <option>Besson ancien</option>
                  <option>Besson réhabilité</option>
                  <option>Robien neuf</option>
                  <option>Robien recentré</option>
                  <option>Robien recentré réhabilité</option>
                  <option>Borloo neuf</option>
                  <option>Borloo ancien</option>
                  <option>Borloo réhabilité</option>
                  <option>Demessine</option>
                  <option>ZRR</option>
                  <option>Perissol</option>
                  <option>Scellier</option>
                  <option>Scellier intermédiaire</option>
                  <option>Scellier réhabilitation</option>
                  <option>Denormandie</option>
                  <option>Duflot neuf</option>
                  <option>Duflot réhabilitation</option>
                  <option>SCI à l'IS</option>
                  <option>SCI à l'IR</option>
                  <option>SARL</option>
                  <option>SARL de famille</option>
                  <option>SAS</option>
                  <option>Autre forme de société</option>
                  <option>Autres</option>
                </select>
                <p className="text-xs text-slate-500">Régime fiscal du bien</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">SIRET</label>
                  <input
                    type="text"
                    title="Numéro SIRET"
                    aria-label="SIRET - Numéro d'immatriculation de votre activité"
                    placeholder="SIRET"
                    value={formData.siret}
                    onChange={(e) => handleInputChange('siret', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Numéro d'immatriculation attribué par l'administration fiscale</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Date de début d'activité</label>
                  <input
                    type="date"
                    title="Date de début d'activité"
                    aria-label="Date de début d'activité - Date de première mise en location"
                    value={formData.dateDebutActivite}
                    onChange={(e) => handleInputChange('dateDebutActivite', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Date de première mise en location</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Numéro fiscal</label>
                  <input
                    type="text"
                    title="Numéro fiscal"
                    aria-label="Numéro fiscal du bien"
                    placeholder="Numéro fiscal"
                    value={formData.numeroFiscal}
                    onChange={(e) => handleInputChange('numeroFiscal', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Attribué par l'administration fiscale</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Taxe d'habitation (FCFA)</label>
                  <input
                    type="number"
                    title="Taxe d'habitation"
                    aria-label="Montant de la taxe d'habitation"
                    placeholder="0"
                    value={formData.taxeHabitation}
                    onChange={(e) => handleInputChange('taxeHabitation', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500">Montant indicatif repris dans la fiche du bien</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Taxe foncière (FCFA)</label>
                <input
                  type="number"
                  title="Taxe foncière"
                  aria-label="Montant de la taxe foncière"
                  placeholder="0"
                  value={formData.taxeFonciere}
                  onChange={(e) => handleInputChange('taxeFonciere', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500">Montant indicatif repris dans la fiche du bien</p>
              </div>
            </div>

            {/* CENTRE D'IMPÔTS */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Centre d'impôts</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Nom du centre</label>
                <input
                  type="text"
                  title="Nom du centre d'impôts"
                  aria-label="Nom du centre d'impôts"
                  placeholder="Nom du centre"
                  value={formData.nomCentreImpots}
                  onChange={(e) => handleInputChange('nomCentreImpots', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Adresse</label>
                  <input
                    type="text"
                    title="Adresse du centre d'impôts"
                    aria-label="Adresse du centre d'impôts"
                    placeholder="Adresse"
                    value={formData.adresseCentreImpots}
                    onChange={(e) => handleInputChange('adresseCentreImpots', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Adresse 2</label>
                  <input
                    type="text"
                    title="Adresse 2 du centre d'impôts"
                    aria-label="Adresse 2 du centre d'impôts"
                    placeholder="Adresse 2 (optionnel)"
                    value={formData.adresse2CentreImpots}
                    onChange={(e) => handleInputChange('adresse2CentreImpots', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Code Postal</label>
                  <input
                    type="text"
                    title="Code postal du centre d'impôts"
                    aria-label="Code postal du centre d'impôts"
                    placeholder="Code Postal"
                    value={formData.codePostalCentreImpots}
                    onChange={(e) => handleInputChange('codePostalCentreImpots', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Ville</label>
                  <input
                    type="text"
                    title="Ville du centre d'impôts"
                    aria-label="Ville du centre d'impôts"
                    placeholder="Ville"
                    value={formData.villeCentreImpots}
                    onChange={(e) => handleInputChange('villeCentreImpots', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Notes</label>
                <textarea
                  rows={3}
                  title="Notes sur le centre d'impôts"
                  aria-label="Notes ou informations supplémentaires sur le centre d'impôts"
                  placeholder="Notes ou informations supplémentaires..."
                  value={formData.notesCentreImpots}
                  onChange={(e) => handleInputChange('notesCentreImpots', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* CONSOMMATIONS ÉNERGÉTIQUES */}
        {/* CLÉS ET DIGICODE */}
        {activeTab === 'cles' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Clés et Digicode</span> - Vous pouvez ajouter plusieurs clés et codes d'accès si besoin.
              </p>
            </div>

            {cles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Clés et codes enregistrés</h3>
                {cles.map((cle) => (
                  <div key={cle.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase">Clé ou Code</label>
                        <p className="text-sm text-slate-900 font-medium">{cle.numero || '(vide)'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase">Nombre</label>
                        <p className="text-sm text-slate-900 font-medium">{cle.nombre || '0'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase">Détenteur</label>
                        <p className="text-sm text-slate-900 font-medium">{cle.detenteur || '(non spécifié)'}</p>
                      </div>
                    </div>
                    {cle.commentaire && (
                      <div className="mb-3">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Commentaire</label>
                        <p className="text-sm text-slate-700">{cle.commentaire}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemoveCle(cle.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                        title="Supprimer cette clé"
                        aria-label={`Supprimer la clé : ${cle.numero}`}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAddCle}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              title="Ajouter une nouvelle clé ou un nouveau code"
              aria-label="Ajouter une nouvelle clé ou un code d'accès"
            >
              <Plus size={18} />
              Ajouter un élément
            </button>

            {/* MODAL / FORM POUR AJOUTER UNE CLÉ */}
            {cles.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Ajouter une nouvelle clé ou un code</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">Clé ou Code</label>
                      <input
                        type="text"
                        placeholder="Ex: Clé appartement, Code portail, Digicode"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">Numéro</label>
                      <input
                        type="text"
                        placeholder="# Numéro"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">Nombre</label>
                      <input
                        type="number"
                        placeholder="Nombre"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1">Détenteur</label>
                      <select 
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        title="Type de personne qui détient la clé ou le code"
                        aria-label="Sélectionner le type de détenteur (Locataire, Gardien, Agence, etc.)"
                      >
                        <option value="">Sélectionner</option>
                        <option>Locataire</option>
                        <option>Gardien</option>
                        <option>Agence</option>
                        <option>Propriétaire</option>
                        <option>Syndic</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Commentaire</label>
                    <textarea
                      rows={3}
                      placeholder="Commentaire"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-center text-center text-slate-500">
                  <p className="text-xs">📎 Déposez des fichiers ici ou cliquez pour charger</p>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLÉS DE RÉPARTITION */}
        {activeTab === 'repartition' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Clés de Répartition</h3>
              <p className="text-xs text-slate-600">
                Gérez les clés de répartition des charges de votre immeuble.
              </p>
            </div>
          </div>
        )}

        {/* PHOTOS */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Photos</h2>

            {/* ZONE DE TÉLÉCHARGEMENT */}
            <label 
              htmlFor="photoUpload"
              className="block border-2 border-dashed border-slate-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              title="Zone de téléchargement de photos"
            >
              <input
                id="photoUpload"
                type="file"
                multiple
                accept="image/gif,image/jpeg,image/png"
                onChange={handlePhotoUpload}
                className="hidden"
                aria-label="Télécharger des photos (GIF, JPG, PNG - max 15 Mo)"
                title="Sélectionner des photos à télécharger"
              />
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <p className="text-sm font-medium text-blue-600">Déposez des fichiers ici ou cliquez pour charger.</p>
              </div>
            </label>

            {/* FORMATS ACCEPTÉS */}
            <p className="text-xs text-slate-600">Formats acceptés: GIF, JPG, PNG. Taille maximale: 15 Mo</p>

            {/* PHOTOS TÉLÉCHARGÉES */}
            {photos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Photos téléchargées ({photos.length})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative group p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 font-medium">Photo</span>
                        <button
                          onClick={() => setPhotos(photos.filter(p => p.id !== photo.id))}
                          className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={`Supprimer la photo ${photo.name}`}
                          aria-label={`Supprimer la photo : ${photo.name}`}
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="bg-slate-200 rounded h-24 flex items-center justify-center mb-2">
                        <span className="text-2xl">🖼️</span>
                      </div>
                      <p className="text-xs text-slate-700 truncate font-medium">{photo.name}</p>
                      <p className="text-xs text-slate-500">{photo.size} KB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOUTONS */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                title="Sauvegarder les photos"
                aria-label="Sauvegarder les photos téléchargées"
              >
                Sauvegarder
              </button>
              <button
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg"
                title="Annuler le téléchargement"
                aria-label="Annuler et réinitialiser"
              >
                Annuler
              </button>
            </div>
          </div>
        )}


        {/* DOCUMENTS */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* En-tête */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Documents</h3>
                  <p className="text-xs text-slate-600">
                    Vous pouvez ajouter plusieurs documents. Ces documents seront sauvegardés dans la rubrique Documents.
                  </p>
                </div>
                <button
                  onClick={() => setShowDocumentForm(true)}
                  className="px-3 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium flex items-center gap-1"
                  title="Ajouter un nouveau document"
                  aria-label="Ajouter un nouveau document"
                >
                  ➕ Ajouter un document
                </button>
              </div>
            </div>

            {/* Liste des documents existants */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">DOCUMENTS</label>
                <div className="space-y-2">
                  {uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{doc.fichierNom}</p>
                        <p className="text-xs text-slate-500">{doc.type}</p>
                      </div>
                      <button
                        onClick={() => setUploadedDocuments(uploadedDocuments.filter(d => d.id !== doc.id))}
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer le document"
                        aria-label="Supprimer le document"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message d'information */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-slate-700">
                <strong>INFORMATION</strong> {uploadedDocuments.length > 0 ? 'Vous pouvez ajouter d\'autres documents.' : 'Cliquez sur "Ajouter un document" pour en télécharger un nouveau.'}
              </p>
            </div>

            {/* Formulaire de nouveau document - Affichage conditionnel */}
            {showDocumentForm && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Nouveau document</h3>
                  <button
                    onClick={() => setShowDocumentForm(false)}
                    className="text-slate-500 hover:text-slate-700"
                    title="Fermer le formulaire"
                    aria-label="Fermer le formulaire de document"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mode Document */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">DOCUMENT *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="documentMode"
                        value="nouveau"
                        checked={documentFormMode === 'nouveau'}
                        onChange={(e) => setDocumentFormMode(e.target.value as 'nouveau' | 'existant')}
                        title="Télécharger un nouveau document"
                        aria-label="Télécharger un nouveau document"
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">Nouveau</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="documentMode"
                        value="existant"
                        checked={documentFormMode === 'existant'}
                        onChange={(e) => setDocumentFormMode(e.target.value as 'nouveau' | 'existant')}
                        title="Sélectionner un document existant"
                        aria-label="Sélectionner un document existant"
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">Déjà existant</span>
                    </label>
                  </div>
                </div>

                {/* Type de Document */}
                <div className="space-y-2">
                  <label htmlFor="docType" className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    TYPE *
                  </label>
                  <select
                    id="docType"
                    title="Type de document"
                    aria-label="Sélectionner le type de document"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choisir</option>
                    <option>Appels de fonds</option>
                    <option>Assemblée générale</option>
                    <option>Attestation d'assurance</option>
                    <option>Attestation de scolarité</option>
                    <option>Attestation employeur</option>
                    <option>Bilan annuel</option>
                    <option>Bulletin de salaire</option>
                    <option>Caution solidaire</option>
                    <option>Certificat</option>
                    <option>Contrat</option>
                    <option>Contrat d'abonnement</option>
                    <option>Contrat d'assurance</option>
                    <option>Contrat d'entretien</option>
                    <option>Contrat de location</option>
                    <option>Contrat de travail</option>
                    <option>Contrôle technique</option>
                    <option>Dernier Avis d'imposition</option>
                    <option>Dernier bulletin de pension</option>
                    <option>Devis</option>
                    <option>Diagnostic</option>
                    <option>Etat des lieux</option>
                    <option>Facture</option>
                    <option>Inventaire</option>
                    <option>Kbis</option>
                    <option>Mode d'emploi</option>
                    <option>Notice</option>
                    <option>Pièce d'identité</option>
                    <option>Quittance de loyer</option>
                    <option>Règlement copropriété</option>
                    <option>Règlement intérieur</option>
                    <option>Relevé de compte</option>
                    <option>Relevé d'identité bancaire</option>
                    <option>Révision du loyer</option>
                    <option>Taxes et impôts locaux</option>
                    <option>Titre de propriété</option>
                    <option>Autre</option>
                  </select>
                </div>

                {/* Fichier - Conditionnel selon le mode */}
                <div className="space-y-2">
                  <label htmlFor="docFile" className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    FICHIER *
                  </label>
                  
                  {documentFormMode === 'nouveau' ? (
                    /* Upload de fichier pour nouveau document */
                    <label
                      htmlFor="docFile"
                      className="block border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <input
                        id="docFile"
                        type="file"
                        title="Télécharger un fichier document"
                        aria-label="Télécharger un fichier document"
                        className="hidden"
                      />
                      <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                      <p className="text-sm font-medium text-slate-700">Parcourir</p>
                      <p className="text-xs text-slate-500 mt-1">Formats acceptés: Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale: 15 Mo</p>
                    </label>
                  ) : (
                    /* Dropdown pour document existant */
                    <select
                      id="docFile"
                      title="Sélectionner un document existant"
                      aria-label="Choisissez parmi les fichiers déjà existants dans le carnet"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choisir</option>
                      <option>Choisissez parmi les fichiers déjà existants</option>
                      {uploadedDocuments.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.fichierNom} - {doc.type}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="docDescription" className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    DESCRIPTION
                  </label>
                  <textarea
                    id="docDescription"
                    rows={3}
                    title="Description du document"
                    aria-label="Description du document"
                    placeholder="Ajouter une description..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Partage */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      title="Partager le document avec votre locataire"
                      aria-label="Partager le document avec votre locataire"
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-700">Partager le document avec votre locataire</span>
                  </label>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowDocumentForm(false)}
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm"
                    title="Annuler"
                    aria-label="Annuler et fermer le formulaire"
                  >
                    Annuler
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                    title="Sauvegarder le document"
                    aria-label="Sauvegarder le document"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


        {/* DOCUMENTS */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* En-tête */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Documents</h3>
                  <p className="text-xs text-slate-600">
                    Vous pouvez ajouter plusieurs documents. Ces documents seront sauvegardés dans la rubrique Documents.
                  </p>
                </div>
                <button
                  onClick={() => setShowDocumentForm(true)}
                  className="px-3 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium flex items-center gap-1"
                  title="Ajouter un nouveau document"
                  aria-label="Ajouter un nouveau document"
                >
                  ➕ Ajouter un document
                </button>
              </div>
            </div>

            {/* Liste des documents existants */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">DOCUMENTS</label>
                <div className="space-y-2">
                  {uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{doc.fichierNom}</p>
                        <p className="text-xs text-slate-500">{doc.type}</p>
                      </div>
                      <button
                        onClick={() => setUploadedDocuments(uploadedDocuments.filter(d => d.id !== doc.id))}
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer le document"
                        aria-label="Supprimer le document"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message d'information */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-slate-700">
                <strong>INFORMATION</strong> {uploadedDocuments.length > 0 ? 'Vous pouvez ajouter d\'autres documents.' : 'Cliquez sur "Ajouter un document" pour en télécharger un nouveau.'}
              </p>
            </div>

            {/* Formulaire de nouveau document - Affichage conditionnel */}
            {showDocumentForm && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Nouveau document</h3>
                  <button
                    onClick={() => setShowDocumentForm(false)}
                    className="text-slate-500 hover:text-slate-700"
                    title="Fermer le formulaire"
                    aria-label="Fermer le formulaire de document"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mode Document */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">DOCUMENT *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="documentMode"
                        value="nouveau"
                        checked={documentFormMode === 'nouveau'}
                        onChange={(e) => setDocumentFormMode(e.target.value as 'nouveau' | 'existant')}
                        title="Télécharger un nouveau document"
                        aria-label="Télécharger un nouveau document"
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">Nouveau</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="documentMode"
                        value="existant"
                        checked={documentFormMode === 'existant'}
                        onChange={(e) => setDocumentFormMode(e.target.value as 'nouveau' | 'existant')}
                        title="Sélectionner un document existant"
                        aria-label="Sélectionner un document existant"
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">Déjà existant</span>
                    </label>
                  </div>
                </div>

                {/* Type de Document */}
                <div className="space-y-2">
                  <label htmlFor="docType" className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    TYPE *
                  </label>
                  <select
                    id="docType"
                    title="Type de document"
                    aria-label="Sélectionner le type de document"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choisir</option>
                    <option>Appels de fonds</option>
                    <option>Assemblée générale</option>
                    <option>Attestation d'assurance</option>
                    <option>Attestation de scolarité</option>
                    <option>Attestation employeur</option>
                    <option>Bilan annuel</option>
                    <option>Bulletin de salaire</option>
                    <option>Caution solidaire</option>
                    <option>Certificat</option>
                    <option>Contrat</option>
                    <option>Contrat d'abonnement</option>
                    <option>Contrat d'assurance</option>
                    <option>Contrat d'entretien</option>
                    <option>Contrat de location</option>
                    <option>Contrat de travail</option>
                    <option>Contrôle technique</option>
                    <option>Dernier Avis d'imposition</option>
                    <option>Dernier bulletin de pension</option>
                    <option>Devis</option>
                    <option>Diagnostic</option>
                    <option>Etat des lieux</option>
                    <option>Facture</option>
                    <option>Inventaire</option>
                    <option>Kbis</option>
                    <option>Mode d'emploi</option>
                    <option>Notice</option>
                    <option>Pièce d'identité</option>
                    <option>Quittance de loyer</option>
                    <option>Règlement copropriété</option>
                    <option>Règlement intérieur</option>
                    <option>Relevé de compte</option>
                    <option>Relevé d'identité bancaire</option>
                    <option>Révision du loyer</option>
                    <option>Taxes et impôts locaux</option>
                    <option>Titre de propriété</option>
                    <option>Autre</option>
                  </select>
                </div>

                {/* Fichier - Conditionnel selon le mode */}
                <div className="space-y-2">
                  <label htmlFor="docFile" className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    FICHIER *
                  </label>
                  
                  {documentFormMode === 'nouveau' ? (
                    /* Upload de fichier pour nouveau document */
                    <label
                      htmlFor="docFile"
                      className="block border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <input
                        id="docFile"
                        type="file"
                        title="Télécharger un fichier document"
                        aria-label="Télécharger un fichier document"
                        className="hidden"
                      />
                      <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                      <p className="text-sm font-medium text-slate-700">Parcourir</p>
                      <p className="text-xs text-slate-500 mt-1">Formats acceptés: Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale: 15 Mo</p>
                    </label>
                  ) : (
                    /* Dropdown pour document existant */
                    <select
                      id="docFile"
                      title="Sélectionner un document existant"
                      aria-label="Choisissez parmi les fichiers déjà existants dans le carnet"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choisir</option>
                      <option>Choisissez parmi les fichiers déjà existants</option>
                      {uploadedDocuments.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.fichierNom} - {doc.type}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="docDescription" className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    DESCRIPTION
                  </label>
                  <textarea
                    id="docDescription"
                    rows={3}
                    title="Description du document"
                    aria-label="Description du document"
                    placeholder="Ajouter une description..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Partage */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      title="Partager le document avec votre locataire"
                      aria-label="Partager le document avec votre locataire"
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-700">Partager le document avec votre locataire</span>
                  </label>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowDocumentForm(false)}
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm"
                    title="Annuler"
                    aria-label="Annuler et fermer le formulaire"
                  >
                    Annuler
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                    title="Sauvegarder le document"
                    aria-label="Sauvegarder le document"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};
