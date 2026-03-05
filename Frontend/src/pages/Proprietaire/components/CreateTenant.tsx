import React, { useState } from 'react';
import { ChevronLeft, Save, X, Upload } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { countries } from '../data/countries';
import { CountrySelectorWithSearch, PhoneInput, PhoneCountrySelector } from './CountrySelectorWithSearch';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  title?: string;
  ariaLabel?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ value, onChange, label, title, ariaLabel }) => {
  const selectedCountry = countries.find(c => c.name === value);
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={title}
        aria-label={ariaLabel}
      >
        <option value="">Choisir</option>
        {countries.map((country) => (
          <option key={country.code} value={country.name}>
            {country.flag} {country.name}
          </option>
        ))}
      </select>
    </div>
  );
};

interface Garant {
  id: string;
  type: string;
  prenom: string;
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
  email: string;
  mobile: string;
  paysIndicatif?: string;
}

interface Contact {
  id: string;
  type: string;
  prenom: string;
  nom: string;
  email: string;
  mobile: string;
  paysIndicatif?: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  commentaires?: string;
}

interface FormData {
  typeLocataire: string;
  photo: string | null;
  couleur: string;
  civilite: string;
  prenom: string;
  deuxiemePrenom: string;
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  numeroSPI: string;
  profession: string;
  revenusMenuels: string;
  typePiece: string;
  numeroPiece: string;
  expirationPiece: string;
  fichierPiece: string | null;
  email: string;
  emailSecondaire: string;
  mobile: string;
  telephone: string;
  adresse: string;
  adresse2: string;
  ville: string;
  codePostal: string;
  region: string;
  pays: string;
  situationProfessionnelle: string;
  societe: string;
  noTVA: string;
  rcsOrSiren: string;
  capital: string;
  domaineActivite: string;
  adresseProfessionnelle: string;
  employeur: string;
  adresseEmployeur: string;
  villeEmployeur: string;
  codePostalEmployeur: string;
  regionEmployeur: string;
  paysEmployeur: string;
  nouvelleAdresse: string;
  nouvelleAdresse2: string;
  nouvelleVille: string;
  nouveauCodePostal: string;
  nouvelleRegion: string;
  nouveauPays: string;
  notePrivee: string;
  garants: Garant[];
  contacts: Contact[];
}

interface CreateTenantProps {
  onBack: () => void;
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type TabType = 'general' | 'complementaires' | 'garants' | 'contacts' | 'documents';

export const CreateTenant: React.FC<CreateTenantProps> = ({ onBack, notify }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [showNewGarantForm, setShowNewGarantForm] = useState(false);
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [newGarant, setNewGarant] = useState<Garant>({
    id: '',
    type: 'Particulier',
    prenom: '',
    nom: '',
    dateNaissance: '',
    lieuNaissance: '',
    email: '',
    mobile: ''
  });
  const [newContact, setNewContact] = useState<Contact>({
    id: '',
    type: 'Particulier',
    prenom: '',
    nom: '',
    email: '',
    mobile: '',
    paysIndicatif: 'France',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    commentaires: ''
  });
  const [formData, setFormData] = useState<FormData>({
    typeLocataire: 'Particulier',
    photo: null,
    couleur: '#ffffff',
    civilite: '',
    prenom: '',
    deuxiemePrenom: '',
    nom: '',
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: '',
    numeroSPI: '',
    profession: '',
    revenusMenuels: '',
    typePiece: '',
    numeroPiece: '',
    expirationPiece: '',
    fichierPiece: null,
    email: '',
    emailSecondaire: '',
    mobile: '',
    telephone: '',
    adresse: '',
    adresse2: '',
    ville: '',
    codePostal: '',
    region: '',
    pays: '',
    situationProfessionnelle: '',
    societe: '',
    noTVA: '',
    rcsOrSiren: '',
    capital: '',
    domaineActivite: '',
    adresseProfessionnelle: '',
    employeur: '',
    adresseEmployeur: '',
    villeEmployeur: '',
    codePostalEmployeur: '',
    regionEmployeur: '',
    paysEmployeur: '',
    nouvelleAdresse: '',
    nouvelleAdresse2: '',
    nouvelleVille: '',
    nouveauCodePostal: '',
    nouvelleRegion: '',
    nouveauPays: '',
    notePrivee: '',
    garants: [],
    contacts: []
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddGarant = () => {
    if (!newGarant.prenom || !newGarant.nom || !newGarant.email) {
      notify('Veuillez remplir les champs obligatoires du garant', 'error');
      return;
    }
    const garantWithId = { ...newGarant, id: Date.now().toString() };
    setFormData(prev => ({
      ...prev,
      garants: [...prev.garants, garantWithId]
    }));
    setNewGarant({
      id: '',
      type: 'Particulier',
      prenom: '',
      nom: '',
      dateNaissance: '',
      lieuNaissance: '',
      email: '',
      mobile: '',
      paysIndicatif: 'France'
    });
    setShowNewGarantForm(false);
    notify('Garant ajouté avec succès', 'success');
  };

  const handleRemoveGarant = (garantId: string) => {
    setFormData(prev => ({
      ...prev,
      garants: prev.garants.filter(g => g.id !== garantId)
    }));
    notify('Garant supprimé', 'info');
  };

  const handleAddContact = () => {
    if (!newContact.prenom || !newContact.nom || !newContact.email) {
      notify('Veuillez remplir les champs obligatoires du contact', 'error');
      return;
    }
    const contactWithId: Contact = {
      ...newContact,
      id: Date.now().toString()
    };
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, contactWithId]
    }));
    setNewContact({
      id: '',
      type: 'Particulier',
      prenom: '',
      nom: '',
      email: '',
      mobile: '',
      paysIndicatif: 'France',
      adresse: '',
      ville: '',
      codePostal: '',
      pays: 'France',
      commentaires: ''
    });
    setShowNewContactForm(false);
    notify('Contact d\'urgence ajouté avec succès', 'success');
  };

  const handleRemoveContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== contactId)
    }));
    notify('Contact d\'urgence supprimé', 'info');
  };

  const handleSave = () => {
    if (!formData.nom || !formData.prenom || !formData.email) {
      notify('Veuillez remplir les champs obligatoires', 'error');
      return;
    }
    notify('Locataire créé avec succès', 'success');
    onBack();
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'general', label: 'INFORMATIONS GÉNÉRALES' },
    { id: 'complementaires', label: 'INFORMATIONS COMPLÉMENTAIRES' },
    { id: 'garants', label: 'GARANTS' },
    { id: 'contacts', label: 'CONTACTS D\'URGENCE' },
    { id: 'documents', label: 'DOCUMENTS' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            {/* Type */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Type</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">TYPE DE LOCATAIRE</label>
                <select
                  value={formData.typeLocataire}
                  onChange={(e) => handleInputChange('typeLocataire', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Type de locataire"
                  aria-label="Type de locataire"
                >
                  <option value="Particulier">Particulier</option>
                  <option value="Personne morale">Personne morale</option>
                  <option value="Entreprise">Entreprise</option>
                </select>
              </div>
            </div>

            {/* Photo et couleur */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Photo et couleur</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">PHOTO</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Déposer une image ou cliquer pour sélectionner</p>
                    <p className="text-xs text-slate-500 mb-3">Formats acceptés: GIF, JPG, PNG. Taille maximale: 15 Mo</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      title="Sélectionner une photo"
                      aria-label="Sélectionner une photo"
                    />
                    <Button variant="secondary" size="sm">Parcourir</Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">COULEUR</label>
                  <input
                    type="color"
                    value={formData.couleur}
                    onChange={(e) => handleInputChange('couleur', e.target.value)}
                    className="h-10 w-20 rounded-lg border border-slate-300 cursor-pointer"
                    title="Couleur du locataire"
                    aria-label="Couleur du locataire"
                  />
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations personnelles</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CIVILITÉ</label>
                  <select
                    value={formData.civilite}
                    onChange={(e) => handleInputChange('civilite', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Civilité"
                    aria-label="Civilité"
                  >
                    <option value="">Choisir</option>
                    <option value="M">Monsieur</option>
                    <option value="Mme">Madame</option>
                    <option value="Mlle">Mademoiselle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PRÉNOM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Prénom"
                    aria-label="Prénom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">2ÈME PRÉNOM</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.deuxiemePrenom}
                    onChange={(e) => handleInputChange('deuxiemePrenom', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Deuxième prénom"
                    aria-label="Deuxième prénom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NOM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Nom"
                    aria-label="Nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">DATE DE NAISSANCE</label>
                  <input
                    type="text"
                    placeholder="JJ/MM/AAAA"
                    value={formData.dateNaissance}
                    onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Date de naissance"
                    aria-label="Date de naissance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">LIEU DE NAISSANCE</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.lieuNaissance}
                    onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Lieu de naissance"
                    aria-label="Lieu de naissance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">NATIONALITÉ</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.nationalite}
                    onChange={(e) => handleInputChange('nationalite', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Nationalité"
                    aria-label="Nationalité"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">NUMÉRO SPI</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.numeroSPI}
                    onChange={(e) => handleInputChange('numeroSPI', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Numéro SPI"
                    aria-label="Numéro SPI"
                  />
                </div>
              </div>
            </div>

            {/* Situation professionnelle */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Situation professionnelle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">PROFESSION</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Profession"
                    aria-label="Profession"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">REVENUS MENSUELS</label>
                  <input
                    type="number"
                    placeholder=""
                    value={formData.revenusMenuels}
                    onChange={(e) => handleInputChange('revenusMenuels', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Revenus mensuels"
                    aria-label="Revenus mensuels"
                  />
                </div>
              </div>
            </div>

            {/* Pièce d'identité */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Pièce d'identité</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">TYPE</label>
                  <select
                    value={formData.typePiece}
                    onChange={(e) => handleInputChange('typePiece', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Type de pièce d'identité"
                    aria-label="Type de pièce d'identité"
                  >
                    <option value="">Choisir</option>
                    <option value="Carte nationale">Carte nationale d'identité</option>
                    <option value="Passeport">Passeport</option>
                    <option value="Permis">Permis de conduire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">NUMÉRO</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.numeroPiece}
                    onChange={(e) => handleInputChange('numeroPiece', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Numéro de pièce"
                    aria-label="Numéro de pièce"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">EXPIRATION</label>
                  <input
                    type="text"
                    placeholder="JJ/MM/AAAA"
                    value={formData.expirationPiece}
                    onChange={(e) => handleInputChange('expirationPiece', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Date d'expiration"
                    aria-label="Date d'expiration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">FICHIER</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Déposer un fichier ou cliquer pour sélectionner</p>
                    <p className="text-xs text-slate-500 mb-3">Copie de la pièce d'identité. Formats acceptés: Word, PDF, Images (GIF, JPG, PNG).</p>
                    <input
                      type="file"
                      className="hidden"
                      title="Sélectionner un fichier"
                      aria-label="Sélectionner un fichier de pièce d'identité"
                    />
                    <Button variant="secondary" size="sm">Parcourir</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Information de contact */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Information de contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-MAIL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder=""
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="E-mail"
                    aria-label="E-mail"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    <strong>Invitation:</strong> Inviter le locataire pour lui donner accès à son espace.
                    Pour inviter votre locataire et lui donner accès à son espace, saisissez son adresse e-mail (une adresse unique par locataire).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">E-MAIL SECONDAIRE</label>
                  <input
                    type="email"
                    placeholder=""
                    value={formData.emailSecondaire}
                    onChange={(e) => handleInputChange('emailSecondaire', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="E-mail secondaire"
                    aria-label="E-mail secondaire"
                  />
                  <p className="text-xs text-slate-500 mt-2">Adresse e-mail secondaire utilisée pour l'envoi manuel des quittances.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">MOBILE</label>
                  <PhoneCountrySelector
                    countryName={formData.pays || 'France'}
                    onCountryChange={(country) => handleInputChange('pays', country)}
                    phoneValue={formData.mobile}
                    onPhoneChange={(value) => handleInputChange('mobile', value)}
                    placeholder="12 34 56 78"
                    title="Mobile"
                    ariaLabel="Mobile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">TÉLÉPHONE</label>
                  <PhoneCountrySelector
                    countryName={formData.pays || 'France'}
                    onCountryChange={(country) => handleInputChange('pays', country)}
                    phoneValue={formData.telephone}
                    onPhoneChange={(value) => handleInputChange('telephone', value)}
                    placeholder="12 34 56 78"
                    title="Téléphone"
                    ariaLabel="Téléphone"
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Adresse</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ADRESSE</label>
                  <input
                    type="text"
                    placeholder="Indiquez un lieu"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Adresse"
                    aria-label="Adresse"
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
                    title="Adresse 2"
                    aria-label="Adresse 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">VILLE</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">CODE POSTAL</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">PAYS</label>
                  <CountrySelectorWithSearch
                    value={formData.pays}
                    onChange={(value) => handleInputChange('pays', value)}
                    label=""
                    title="Pays"
                    ariaLabel="Pays"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'complementaires':
        return (
          <div className="space-y-8">
            {/* Situation professionnelle */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Situation professionnelle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SITUATION PROFESSIONNELLE</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.situationProfessionnelle}
                    onChange={(e) => handleInputChange('situationProfessionnelle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Situation professionnelle"
                    aria-label="Situation professionnelle"
                  />
                </div>
              </div>
            </div>

            {/* Informations société */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations société</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SOCIÉTÉ</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.societe}
                    onChange={(e) => handleInputChange('societe', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Société"
                    aria-label="Société"
                  />
                  <p className="text-xs text-slate-500 mt-2">Si vous remplissez ce champs, le nom de la société figurera sur les documents.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">N° TVA</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.noTVA}
                    onChange={(e) => handleInputChange('noTVA', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="N° TVA"
                    aria-label="N° TVA"
                  />
                  <p className="text-xs text-slate-500 mt-2">Si vous remplissez ce champs, cette information figurera sur certains documents automatiques.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">RCS / SIREN</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.rcsOrSiren}
                    onChange={(e) => handleInputChange('rcsOrSiren', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="RCS / SIREN"
                    aria-label="RCS / SIREN"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CAPITAL</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.capital}
                    onChange={(e) => handleInputChange('capital', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Capital"
                    aria-label="Capital"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">DOMAINE D'ACTIVITÉ</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.domaineActivite}
                    onChange={(e) => handleInputChange('domaineActivite', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Domaine d'activité"
                    aria-label="Domaine d'activité"
                  />
                </div>
              </div>
            </div>

            {/* Adresse professionnelle */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Adresse professionnelle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ADRESSE</label>
                  <input
                    type="text"
                    placeholder="Indiquez un lieu"
                    value={formData.adresseProfessionnelle}
                    onChange={(e) => handleInputChange('adresseProfessionnelle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Adresse professionnelle"
                    aria-label="Adresse professionnelle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">VILLE</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.villeEmployeur}
                    onChange={(e) => handleInputChange('villeEmployeur', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Ville"
                    aria-label="Ville"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CODE POSTAL</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.codePostalEmployeur}
                    onChange={(e) => handleInputChange('codePostalEmployeur', e.target.value)}
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
                    value={formData.regionEmployeur}
                    onChange={(e) => handleInputChange('regionEmployeur', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Région"
                    aria-label="Région"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">PAYS</label>
                  <CountrySelectorWithSearch
                    value={formData.paysEmployeur}
                    onChange={(value) => handleInputChange('paysEmployeur', value)}
                    label=""
                    title="Pays"
                    ariaLabel="Pays"
                  />
                </div>
              </div>
            </div>

            {/* Employeur */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Employeur</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">EMPLOYEUR</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.employeur}
                    onChange={(e) => handleInputChange('employeur', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Employeur"
                    aria-label="Employeur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ADRESSE</label>
                  <input
                    type="text"
                    placeholder="Indiquez un lieu"
                    value={formData.adresseEmployeur}
                    onChange={(e) => handleInputChange('adresseEmployeur', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Adresse employeur"
                    aria-label="Adresse employeur"
                  />
                </div>
              </div>
            </div>

            {/* Nouvelle adresse */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Nouvelle adresse</h3>
              <p className="text-sm text-slate-600 mb-4">Nouvelle adresse du locataire pour toute future correspondance après son départ.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ADRESSE</label>
                  <input
                    type="text"
                    placeholder="Indiquez un lieu"
                    value={formData.nouvelleAdresse}
                    onChange={(e) => handleInputChange('nouvelleAdresse', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Nouvelle adresse"
                    aria-label="Nouvelle adresse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ADRESSE 2</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.nouvelleAdresse2}
                    onChange={(e) => handleInputChange('nouvelleAdresse2', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Adresse 2"
                    aria-label="Adresse 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">VILLE</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.nouvelleVille}
                    onChange={(e) => handleInputChange('nouvelleVille', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Ville"
                    aria-label="Ville"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CODE POSTAL</label>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.nouveauCodePostal}
                    onChange={(e) => handleInputChange('nouveauCodePostal', e.target.value)}
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
                    value={formData.nouvelleRegion}
                    onChange={(e) => handleInputChange('nouvelleRegion', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Région"
                    aria-label="Région"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">PAYS</label>
                  <CountrySelectorWithSearch
                    value={formData.nouveauPays}
                    onChange={(value) => handleInputChange('nouveauPays', value)}
                    label=""
                    title="Pays"
                    ariaLabel="Pays"
                  />
                </div>
              </div>
            </div>

            {/* Note privée */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations complémentaires</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">NOTE PRIVÉE</label>
                  <textarea
                    placeholder=""
                    value={formData.notePrivee}
                    onChange={(e) => handleInputChange('notePrivee', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 resize-vertical"
                    title="Note privée"
                    aria-label="Note privée"
                  />
                  <p className="text-xs text-slate-500 mt-2">Cette note est visible uniquement pour vous.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'garants':
        return (
          <div className="space-y-6">
            {/* Titre et info */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Garants</h3>
              <p className="text-sm text-slate-600 mb-4">Vous pouvez ajouter plusieurs garants si besoin. On contacte sans sauvegarde dans la rubrique carnet.</p>
            </div>

            {/* Tabs garants / ajouter garant */}
            <div className="border-b border-slate-200 flex gap-4">
              <button
                onClick={() => setShowNewGarantForm(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  !showNewGarantForm
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                GARANTS
              </button>
              <button
                onClick={() => setShowNewGarantForm(true)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                  showNewGarantForm
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                  {showNewGarantForm && <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                Ajouter un garant
              </button>
            </div>

            {/* Liste des garants */}
            {!showNewGarantForm && (
              <div className="space-y-4">
                {formData.garants.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Aucun garant ajouté pour le moment</p>
                ) : (
                  formData.garants.map((garant) => (
                    <div key={garant.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{garant.prenom} {garant.nom}</h4>
                          <p className="text-sm text-slate-600">{garant.type}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveGarant(garant.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Supprimer le garant"
                          aria-label="Supprimer le garant"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-600">Date de naissance</p>
                          <p className="font-medium text-slate-900">{garant.dateNaissance || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Lieu de naissance</p>
                          <p className="font-medium text-slate-900">{garant.lieuNaissance || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Email</p>
                          <p className="font-medium text-slate-900">{garant.email}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Mobile</p>
                          <p className="font-medium text-slate-900">{garant.mobile || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Boutons d'action */}
            {!showNewGarantForm && (
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="secondary" size="sm">
                  Annuler
                </Button>
                <Button variant="primary" size="sm">
                  Sauvegarder
                </Button>
              </div>
            )}

            {/* Modal pour nouveau garant */}
            <Modal
              isOpen={showNewGarantForm}
              title="Nouveau garant"
              onClose={() => setShowNewGarantForm(false)}
            >
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-900">
                    💡 Cliquez un nouveau, ou chercher un déjà existant
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">GARANT</label>
                  <select
                    value={newGarant.id}
                    onChange={(e) => setNewGarant(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Sélectionner ou créer un garant"
                    aria-label="Sélectionner ou créer un garant"
                  >
                    <option value="">Ajouter un nouveau</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">TYPE</label>
                  <select
                    value={newGarant.type}
                    onChange={(e) => setNewGarant(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Type de garant"
                    aria-label="Type de garant"
                  >
                    <option value="Particulier">Particulier</option>
                    <option value="Personne morale">Personne morale</option>
                    <option value="Entreprise">Entreprise</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">PRÉNOM <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder=""
                      value={newGarant.prenom}
                      onChange={(e) => setNewGarant(prev => ({ ...prev, prenom: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Prénom du garant"
                      aria-label="Prénom du garant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">NOM <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder=""
                      value={newGarant.nom}
                      onChange={(e) => setNewGarant(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Nom du garant"
                      aria-label="Nom du garant"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">DATE DE NAISSANCE</label>
                    <input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={newGarant.dateNaissance}
                      onChange={(e) => setNewGarant(prev => ({ ...prev, dateNaissance: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Date de naissance"
                      aria-label="Date de naissance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">LIEU DE NAISSANCE</label>
                    <input
                      type="text"
                      placeholder=""
                      value={newGarant.lieuNaissance}
                      onChange={(e) => setNewGarant(prev => ({ ...prev, lieuNaissance: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Lieu de naissance"
                      aria-label="Lieu de naissance"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">E-MAIL <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    placeholder=""
                    value={newGarant.email}
                    onChange={(e) => setNewGarant(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Email du garant"
                    aria-label="Email du garant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">MOBILE</label>
                  <PhoneCountrySelector
                    countryName={newGarant.paysIndicatif || 'France'}
                    onCountryChange={(country) => setNewGarant(prev => ({ ...prev, paysIndicatif: country }))}
                    phoneValue={newGarant.mobile}
                    onPhoneChange={(value) => setNewGarant(prev => ({ ...prev, mobile: value }))}
                    placeholder="12 34 56 78"
                    title="Mobile du garant"
                    ariaLabel="Mobile du garant"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={() => setShowNewGarantForm(false)}
                    size="sm"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddGarant}
                    size="sm"
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        );
      case 'contacts':
        return (
          <div className="space-y-6">
            {/* Titre et info */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Contacts d'urgence</h3>
              <p className="text-sm text-slate-600 mb-4">Vous pouvez ajouter plusieurs contacts d'urgence. Chaque contact sera sauvegardé dans le carnet.</p>
            </div>

            {/* Tabs contacts / ajouter contact */}
            <div className="border-b border-slate-200 flex gap-4">
              <button
                onClick={() => setShowNewContactForm(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  !showNewContactForm
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                CONTACTS
              </button>
              <button
                onClick={() => setShowNewContactForm(true)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                  showNewContactForm
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                  {showNewContactForm && <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                Ajouter un contact
              </button>
            </div>

            {/* Liste des contacts */}
            {!showNewContactForm && (
              <div className="space-y-3">
                {formData.contacts.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">Aucun contact d'urgence pour le moment</p>
                ) : (
                  formData.contacts.map((contact) => (
                    <div key={contact.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-slate-600 text-sm">Type</p>
                        <p className="font-medium text-slate-900 mb-2">{contact.type}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Prénom</p>
                            <p className="font-medium text-slate-900">{contact.prenom}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Nom</p>
                            <p className="font-medium text-slate-900">{contact.nom}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Email</p>
                            <p className="font-medium text-slate-900">{contact.email}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Mobile</p>
                            <p className="font-medium text-slate-900">{contact.mobile || '-'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-slate-600">Adresse</p>
                            <p className="font-medium text-slate-900">{contact.adresse || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Ville</p>
                            <p className="font-medium text-slate-900">{contact.ville || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Code postal</p>
                            <p className="font-medium text-slate-900">{contact.codePostal || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Pays</p>
                            <p className="font-medium text-slate-900">{contact.pays || '-'}</p>
                          </div>
                          {contact.commentaires && (
                            <div className="col-span-2">
                              <p className="text-slate-600">Commentaires</p>
                              <p className="font-medium text-slate-900">{contact.commentaires}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveContact(contact.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer ce contact"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Formulaire d'ajout de contact */}
            <Modal
              isOpen={showNewContactForm}
              title="Nouveau contact d'urgence"
              onClose={() => setShowNewContactForm(false)}
            >
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-900">
                    💡 Créer un nouveau contact, ou chercher un déjà existant.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">TYPE <span className="text-red-500">*</span></label>
                    <select
                      value={newContact.type}
                      onChange={(e) => setNewContact(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Type de contact"
                      aria-label="Type de contact"
                    >
                      <option value="Particulier">Particulier</option>
                      <option value="Entreprise">Entreprise</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">PRÉNOM <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder=""
                      value={newContact.prenom}
                      onChange={(e) => setNewContact(prev => ({ ...prev, prenom: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Prénom du contact"
                      aria-label="Prénom du contact"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">NOM <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder=""
                      value={newContact.nom}
                      onChange={(e) => setNewContact(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Nom du contact"
                      aria-label="Nom du contact"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">E-MAIL <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    placeholder=""
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Email du contact"
                    aria-label="Email du contact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">MOBILE</label>
                  <PhoneCountrySelector
                    countryName={newContact.paysIndicatif || 'France'}
                    onCountryChange={(country) => setNewContact(prev => ({ ...prev, paysIndicatif: country }))}
                    phoneValue={newContact.mobile}
                    onPhoneChange={(value) => setNewContact(prev => ({ ...prev, mobile: value }))}
                    placeholder="12 34 56 78"
                    title="Mobile du contact"
                    ariaLabel="Mobile du contact"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ADRESSE</label>
                    <input
                      type="text"
                      placeholder=""
                      value={newContact.adresse}
                      onChange={(e) => setNewContact(prev => ({ ...prev, adresse: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Adresse du contact"
                      aria-label="Adresse du contact"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">VILLE</label>
                    <input
                      type="text"
                      placeholder=""
                      value={newContact.ville}
                      onChange={(e) => setNewContact(prev => ({ ...prev, ville: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Ville du contact"
                      aria-label="Ville du contact"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CODE POSTAL</label>
                    <input
                      type="text"
                      placeholder=""
                      value={newContact.codePostal}
                      onChange={(e) => setNewContact(prev => ({ ...prev, codePostal: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Code postal du contact"
                      aria-label="Code postal du contact"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">PAYS</label>
                    <CountrySelectorWithSearch
                      value={newContact.pays}
                      onChange={(country) => setNewContact(prev => ({ ...prev, pays: country }))}
                      label=""
                      title="Pays du contact"
                      ariaLabel="Pays du contact"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">COMMENTAIRES</label>
                  <textarea
                    placeholder=""
                    value={newContact.commentaires || ''}
                    onChange={(e) => setNewContact(prev => ({ ...prev, commentaires: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    title="Commentaires"
                    aria-label="Commentaires"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={() => setShowNewContactForm(false)}
                    size="sm"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddContact}
                    size="sm"
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        );
      case 'documents':
        return (
          <div className="py-12 text-center">
            <p className="text-slate-500">Onglet {tabs.find(t => t.id === activeTab)?.label} - En développement</p>
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
            aria-label="Retour à la liste des locataires"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nouveau locataire</h1>
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
