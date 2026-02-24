// src/pages/Locataire/components/Documents.tsx

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  Search, 
  ArrowLeft, 
  FileText, 
  Calendar,
  Home,
  User,
  Upload,
  X,
  Loader2,
  Phone,
  Image,
  File,
  Download,
  Share2,
  Users,
  Mail,
  CheckCircle,
  AlertCircle,
  AlertOctagon,
  Paperclip,
  Info,
  Eye,
  Archive,
  RefreshCw,
  MapPin,
  Briefcase,
  DollarSign,
  Globe,
  Copy,
  Link2,
  Facebook,
  Twitter,
  Check
} from 'lucide-react';
import { Card } from './ui/Card';
import { DocumentViewer } from './DocumentViewer';
import api from '@/services/api';

interface DocumentsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Document {
  id: number;
  uuid: string;
  name: string;
  type: string;
  bien: string | null;
  description: string | null;
  file_url: string;
  file_size_formatted: string;
  file_type: string;
  is_shared: boolean;
  shared_with_users: Array<{id: number, name: string, email: string}>;
  shared_with_emails?: string[];
  status: 'actif' | 'archive';
  document_date: string | null;
  created_at: string;
  icon: string;
  property?: { id: number; name: string; };
  lease?: { id: number; };
}

interface Template {
  id: number;
  name: string;
  description: string;
  type: string;
  file_url: string;
  icon: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  role: string;
  type: string;
  property?: string;
}

interface Dossier {
  id: number;
  uuid: string;
  nom: string;
  prenoms: string;
  date_naissance: string | null;
  a_propos: string | null;
  email: string;
  telephone: string | null;
  mobile: string | null;
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  region: string | null;
  type_activite: string | null;
  profession: string | null;
  revenus_mensuels: number | null;
  has_garant: boolean;
  garant_type: string | null;
  garant_description: string | null;
  documents: number[];
  is_shared: boolean;
  shared_with: number[];
  shared_with_emails: string[];
  shared_with_users: Array<{id: number, name: string, email: string}>;
  status: 'brouillon' | 'publie' | 'archive';
  share_url: string | null;
  shareable_url?: string;
  created_at: string;
  updated_at: string;
}

interface FilterOptions {
  properties: Array<{id: number, name: string}>;
  types: string[];
  periodes: string[];
}

// ==================== COMPOSANT SHARE MODAL ====================
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl, title, notify }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    notify?.('Lien copié dans le presse-papiers', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    let url = '';
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Share2 size={20} className="text-[#70AE48]" />
            Partager
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">{title}</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien de partage
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-[#70AE48] text-white rounded-lg hover:bg-[#5a8f3a] transition-colors flex items-center gap-2"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Partager sur
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Facebook size={24} />
                <span className="text-xs">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center gap-2 p-3 bg-sky-50 text-sky-500 rounded-lg hover:bg-sky-100 transition-colors"
              >
                <Twitter size={24} />
                <span className="text-xs">Twitter</span>
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.798 2 2.548 6.193 2.54 11.393c-.003 1.747.456 3.457 1.328 4.987L2.5 21.5l5.216-1.359c1.477.807 3.136 1.235 4.856 1.236h.004c5.19 0 9.465-4.194 9.473-9.396.004-2.528-.98-4.908-2.872-6.813zM12.02 19.734h-.004c-1.51 0-2.991-.405-4.283-1.166l-.307-.184-3.097.807.828-3.007-.2-.317c-.738-1.17-1.129-2.521-1.126-3.908.006-4.34 3.54-7.87 7.897-7.87 2.114 0 4.099.825 5.593 2.322 1.49 1.492 2.312 3.472 2.308 5.584-.005 4.346-3.537 7.874-7.873 7.874z"/>
                </svg>
                <span className="text-xs">WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="flex flex-col items-center gap-2 p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.97 1.25-5.58 3.68-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.24.27-.48.74-.74 2.86-1.25 4.77-2.07 5.72-2.48 2.72-1.16 3.29-1.36 3.66-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.08-.03.2-.03.32z"/>
                </svg>
                <span className="text-xs">Telegram</span>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex flex-col items-center gap-2 p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Mail size={24} />
                <span className="text-xs">Email</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-2 p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Link2 size={24} />
                <span className="text-xs">Lien</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-[#70AE48]" />
                <span className="text-sm font-medium text-gray-700">Visible au public</span>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Actif
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Toute personne ayant ce lien peut voir le dossier
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPOSANT DOCUMENT VIEWER MODAL ====================
interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, document, notify }) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-slideUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-[#70AE48]" />
            {document.name}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              {document.file_type?.startsWith('image/') ? (
                <img src={document.file_url} alt={document.name} className="w-20 h-20 object-cover rounded-lg" />
              ) : (
                <div className="w-20 h-20 bg-[#70AE48]/10 rounded-lg flex items-center justify-center">
                  <FileText size={32} className="text-[#70AE48]" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                <p className="text-sm text-gray-500">{document.file_size_formatted}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {document.type && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium text-gray-900">
                  {document.type === 'acte_vente' && 'Acte de vente'}
                  {document.type === 'bail' && 'Bail'}
                  {document.type === 'quittance' && 'Quittance'}
                  {document.type === 'dpe' && 'DPE'}
                  {document.type === 'diagnostic' && 'Diagnostic'}
                  {document.type === 'autre' && 'Autre'}
                </span>
              </div>
            )}

            {document.bien && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Bien</span>
                <span className="text-sm font-medium text-gray-900">{document.bien}</span>
              </div>
            )}

            {document.description && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Description</span>
                <span className="text-sm font-medium text-gray-900">{document.description}</span>
              </div>
            )}

            {document.created_at && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Date d'ajout</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(document.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            {document.shared_with_users && document.shared_with_users.length > 0 && (
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 block mb-2">Partagé avec</span>
                <div className="space-y-2">
                  {document.shared_with_users.map(user => (
                    <div key={user.id} className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-900">{user.name}</span>
                      <span className="text-gray-500">({user.email})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
           
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================
export const Documents: React.FC<DocumentsProps> = ({ notify }) => {
  // États principaux
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'dossier'>('documents');
  const [activeFilter, setActiveFilter] = useState<'actifs' | 'archives' | 'templates'>('actifs');
  
  // États pour les données
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    properties: [],
    types: [],
    periodes: ['Toutes']
  });
  
  // États pour les compteurs
  const [actifsCount, setActifsCount] = useState(0);
  const [archivesCount, setArchivesCount] = useState(0);
  const [templatesCount, setTemplatesCount] = useState(0);
  
  // États pour les modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');
  
  // États pour les filtres
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [periode, setPeriode] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // Confirmation suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state pour nouveau document
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    name: '',
    type: '',
    bien: '',
    description: '',
    is_shared: false,
    shared_with: [],
  });

  // Dossier form state - TOUS LES CHAMPS
  const [dossierForm, setDossierForm] = useState({
    nom: '',
    prenoms: '',
    date_naissance: '',
    a_propos: '',
    email: '',
    telephone: '',
    mobile: '',
    adresse: '',
    ville: '',
    pays: '',
    region: '',
    type_activite: '',
    profession: '',
    revenus_mensuels: '',
    has_garant: false,
    garant_type: '',
    garant_description: '',
    is_shared: false,
    shared_with: [] as number[],
    shared_with_emails: [] as string[],
  });

  // Fichiers
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Couleur principale
  const PRIMARY_COLOR = '#70AE48';

  // Options pour les selects
  const typeOptions = [
    { value: 'acte_vente', label: 'Acte de vente' },
    { value: 'bail', label: 'Bail' },
    { value: 'quittance', label: 'Quittance' },
    { value: 'dpe', label: 'DPE' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'autre', label: 'Autre' }
  ];

  const activityOptions = [
    'Salarié CDI', 'Salarié CDD', 'Gérant salarié', 'Non salarié',
    'Fonctionnaire', 'Etudiant', 'Intermittent du spectacle',
    'Intérimaire', 'Assistante maternelle', 'Retraité', 'Autre'
  ];

  const paysOptions = ['Bénin', 'France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada', 'Autre'];

  const garantTypeOptions = [
    { value: 'personne_physique', label: 'Personne physique' },
    { value: 'organisme', label: 'Organisme ou société' },
    { value: 'bancaire', label: 'Garantie bancaire' },
    { value: 'autre', label: 'Autre' }
  ];

  // Charger les données
  useEffect(() => {
    fetchDocuments();
    fetchTemplates();
    fetchDossier();
    fetchFilterOptions();
  }, []);

  // Recharger quand les filtres changent
  useEffect(() => {
    if (activeTab === 'documents' && activeFilter !== 'templates') {
      fetchDocuments();
    }
  }, [activeFilter, searchQuery, periode, typeFilter, propertyFilter, itemsPerPage]);

  // Charger les contacts quand un bien est sélectionné
  useEffect(() => {
    if (newDocument.property_id) {
      fetchContacts(newDocument.property_id);
    } else {
      setContacts([]);
    }
  }, [newDocument.property_id]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        per_page: itemsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(periode && periode !== 'Toutes' && { periode }),
        ...(typeFilter && { type: typeFilter }),
        ...(propertyFilter && { property_id: propertyFilter }),
        status: activeFilter === 'actifs' ? 'actifs' : 'archives',
      });

      const response = await api.get(`/tenant/documents?${params}`);
      
      if (response.data.success) {
        setDocuments(response.data.data.data || []);
        setActifsCount(response.data.actifs_count || 0);
        setArchivesCount(response.data.archives_count || 0);
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      notify?.('Erreur lors du chargement des documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/tenant/documents/templates');
      if (response.data.success) {
        setTemplates(response.data.data || []);
        setTemplatesCount(response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  const fetchDossier = async () => {
    try {
      const response = await api.get('/tenant/dossier');
      if (response.data.success) {
        setDossier(response.data.data);
        setDossierForm({
          nom: response.data.data.nom || '',
          prenoms: response.data.data.prenoms || '',
          date_naissance: response.data.data.date_naissance || '',
          a_propos: response.data.data.a_propos || '',
          email: response.data.data.email || '',
          telephone: response.data.data.telephone || '',
          mobile: response.data.data.mobile || '',
          adresse: response.data.data.adresse || '',
          ville: response.data.data.ville || '',
          pays: response.data.data.pays || '',
          region: response.data.data.region || '',
          type_activite: response.data.data.type_activite || '',
          profession: response.data.data.profession || '',
          revenus_mensuels: response.data.data.revenus_mensuels?.toString() || '',
          has_garant: response.data.data.has_garant || false,
          garant_type: response.data.data.garant_type || '',
          garant_description: response.data.data.garant_description || '',
          is_shared: response.data.data.is_shared || false,
          shared_with: response.data.data.shared_with || [],
          shared_with_emails: response.data.data.shared_with_emails || [],
        });
      }
    } catch (error) {
      console.error('Erreur chargement dossier:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/tenant/documents/filters/options');
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement options filtres:', error);
    }
  };

  const fetchContacts = async (propertyId?: number) => {
    try {
      const params = propertyId ? `?property_id=${propertyId}` : '';
      const response = await api.get(`/tenant/documents/shareable-contacts${params}`);
      setContacts(response.data);
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDocToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    
    setDeleting(true);
    try {
      const response = await api.delete(`/tenant/documents/${docToDelete}`);
      if (response.data.success) {
        setDocuments(documents.filter(d => d.id !== docToDelete));
        notify?.('Document supprimé avec succès', 'success');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Erreur suppression document:', error);
      notify?.('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDocToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDocToDelete(null);
  };

  const handleArchive = async (doc: Document) => {
    try {
      const response = await api.post(`/tenant/documents/${doc.id}/archive`);
      if (response.data.success) {
        notify?.('Document archivé avec succès', 'success');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Erreur archivage:', error);
      notify?.('Erreur lors de l\'archivage', 'error');
    }
  };

  const handleRestore = async (doc: Document) => {
    try {
      const response = await api.post(`/tenant/documents/${doc.id}/restore`);
      if (response.data.success) {
        notify?.('Document restauré avec succès', 'success');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Erreur restauration:', error);
      notify?.('Erreur lors de la restauration', 'error');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await api.get(`/tenant/documents/${doc.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.name);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      notify?.('Téléchargement réussi', 'success');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      notify?.('Erreur lors du téléchargement', 'error');
    }
  };

  const handleDownloadPdf = async (doc: Document) => {
    try {
      const response = await api.get(`/tenant/documents/${doc.id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document_${doc.id}_informations.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      notify?.('PDF des informations téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      notify?.('Erreur lors du téléchargement du PDF', 'error');
    }
  };

  const handleDownloadDossier = async () => {
    try {
      const response = await api.get('/tenant/dossier/download', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dossier_${dossierForm.nom}_${dossierForm.prenoms}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      notify?.('Dossier téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur téléchargement dossier:', error);
      notify?.('Erreur lors du téléchargement', 'error');
    }
  };

  const handleShareDossier = () => {
    if (dossier?.shareable_url) {
      setShareUrl(dossier.shareable_url);
      setShareTitle(`Dossier de ${dossierForm.nom} ${dossierForm.prenoms}`);
      setShowShareModal(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateDocument = async () => {
    if (!selectedFile) {
      notify?.('Veuillez sélectionner un fichier', 'error');
      return;
    }

    if (!newDocument.type) {
      notify?.('Veuillez sélectionner un type de document', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newDocument.name || selectedFile.name);
      formData.append('type', newDocument.type);
      formData.append('file', selectedFile);
      
      if (newDocument.bien) formData.append('bien', newDocument.bien);
      if (newDocument.description) formData.append('description', newDocument.description);
      if (newDocument.property_id) formData.append('property_id', newDocument.property_id.toString());
      
      formData.append('is_shared', newDocument.is_shared ? '1' : '0');
      
      if (newDocument.is_shared && newDocument.shared_with && newDocument.shared_with.length > 0) {
        newDocument.shared_with.forEach(id => {
          formData.append('shared_with[]', id.toString());
        });
      }

      const response = await api.post('/tenant/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setDocuments([response.data.data, ...documents]);
        setNewDocument({
          name: '',
          type: '',
          bien: '',
          description: '',
          property_id: undefined,
          is_shared: false,
          shared_with: [],
        });
        setSelectedFile(null);
        setShowAddModal(false);
        notify?.('Document ajouté avec succès', 'success');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Erreur création document:', error);
      notify?.('Erreur lors de l\'ajout du document', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDossier = async () => {
    setSubmitting(true);
    try {
      const response = await api.put('/tenant/dossier', dossierForm);
      if (response.data.success) {
        notify?.('Dossier enregistré avec succès', 'success');
        fetchDossier();
      }
    } catch (error) {
      console.error('Erreur enregistrement dossier:', error);
      notify?.('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishDossier = async () => {
    try {
      const response = await api.post('/tenant/dossier/publish');
      if (response.data.success) {
        notify?.('Dossier publié avec succès', 'success');
        fetchDossier();
      }
    } catch (error) {
      console.error('Erreur publication dossier:', error);
      notify?.('Erreur lors de la publication', 'error');
    }
  };

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDocumentViewer(true);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <Image size={20} className="text-blue-600" />;
    if (fileType?.includes('pdf')) return <FileText size={20} className="text-red-600" />;
    if (fileType?.includes('word') || fileType?.includes('document')) return <FileText size={20} className="text-blue-600" />;
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return <FileText size={20} className="text-green-600" />;
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return <FileText size={20} className="text-orange-600" />;
    return <File size={20} className="text-gray-600" />;
  };

  const getContactTypeColor = (type: string) => {
    switch(type) {
      case 'creator': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'landlord': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'co_owner': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredDocuments = documents
    .filter(doc => {
      if (typeFilter) return doc.type === typeFilter;
      return true;
    })
    .filter(doc => 
      searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.bien?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.property?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const paginatedDocuments = filteredDocuments.slice(0, parseInt(itemsPerPage));

  if (loading && activeTab === 'documents' && activeFilter !== 'templates') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: PRIMARY_COLOR }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText size={24} className="text-gray-400" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Chargement de vos documents...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertOctagon size={28} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirmer la suppression</h3>
                <p className="text-sm text-gray-500 mt-1">Cette action est irréversible</p>
              </div>
            </div>

            <p className="text-gray-600 mb-8">
              Êtes-vous sûr de vouloir supprimer définitivement ce document ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de document */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">Ajouter un document</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Information Banner */}
              <div className="bg-[#FFF8E7] border-l-4 border-[#FFB74D] p-4 rounded-r-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Information</h4>
                <p className="text-sm text-gray-600">
                  Formats acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF. Taille maximale : 15 Mo.
                </p>
              </div>

              {/* Fichier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center">
                      <Upload size={28} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newDocument.type || ''}
                  onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                >
                  <option value="">Sélectionnez un type</option>
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nom du document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du document</label>
                <input
                  type="text"
                  value={newDocument.name || ''}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  placeholder="Laissez vide pour utiliser le nom du fichier"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                />
              </div>

              {/* Bien */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bien concerné</label>
                <select
                  value={newDocument.property_id || ''}
                  onChange={(e) => setNewDocument({ 
                    ...newDocument, 
                    property_id: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                >
                  <option value="">Sélectionnez un bien</option>
                  {filterOptions.properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newDocument.description || ''}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                />
              </div>

              {/* Options de partage */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Partage</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDocument.is_shared}
                        onChange={(e) => setNewDocument({ 
                          ...newDocument, 
                          is_shared: e.target.checked,
                          shared_with: e.target.checked ? [] : undefined
                        })}
                        className="w-4 h-4 rounded border-gray-300"
                        style={{ accentColor: PRIMARY_COLOR }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Partager ce document
                      </span>
                    </label>
                  </div>

                  {newDocument.is_shared && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partager avec
                      </label>
                      
                      {contacts.length === 0 ? (
                        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                          Aucun contact disponible pour ce bien
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                          {contacts.map((contact) => (
                            <label
                              key={contact.id}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={contact.id}
                                checked={newDocument.shared_with?.includes(contact.id)}
                                onChange={(e) => {
                                  const sharedWith = newDocument.shared_with || [];
                                  if (e.target.checked) {
                                    setNewDocument({
                                      ...newDocument,
                                      shared_with: [...sharedWith, contact.id]
                                    });
                                  } else {
                                    setNewDocument({
                                      ...newDocument,
                                      shared_with: sharedWith.filter(id => id !== contact.id)
                                    });
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300"
                                style={{ accentColor: PRIMARY_COLOR }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {contact.name}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getContactTypeColor(contact.type)}`}>
                                    {contact.role}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{contact.email}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateDocument}
                  disabled={submitting || !selectedFile || !newDocument.type}
                  className="px-4 py-2 text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={showDocumentViewer}
        onClose={() => setShowDocumentViewer(false)}
        document={selectedDocument}
        notify={notify}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
        title={shareTitle}
        notify={notify}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        {/* Tabs */}
        <div className="flex mb-6 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-3 px-6 text-sm font-medium rounded-l-lg transition-colors ${
              activeTab === 'documents' 
                ? 'bg-[#FFB74D] text-white' 
                : 'bg-[#FFF3E0] text-gray-700 hover:bg-[#FFE0B2]'
            }`}
          >
            MES DOCUMENTS
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex-1 py-3 px-6 text-sm font-medium rounded-r-lg transition-colors ${
              activeTab === 'dossier' 
                ? 'bg-[#FFB74D] text-white' 
                : 'bg-[#FFF3E0] text-gray-700 hover:bg-[#FFE0B2]'
            }`}
          >
            MON DOSSIER
          </button>
        </div>

        {activeTab === 'dossier' ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Information Banner */}
            <div className="bg-[#FFF8E7] border-l-4 border-[#FFB74D] p-4 rounded-r-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Informations</h4>
              <p className="text-sm text-gray-600">
                Créez votre dossier de candidature en ligne. Vous le partagez ensuite en un clic avec les propriétaires et agences immobilières de votre choix.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3">
              {dossier?.shareable_url && (
                <button
                  onClick={handleShareDossier}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Share2 size={18} />
                  Partager
                </button>
              )}
              <button
                onClick={handleDownloadDossier}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Download size={18} />
                Télécharger PDF
              </button>
            </div>

            {/* Lien de partage */}
            {dossier?.shareable_url && dossier.is_shared && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">Dossier public</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dossier.shareable_url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleShareDossier}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <Share2 size={16} />
                    Partager
                  </button>
                </div>
              </div>
            )}

            {/* Informations personnelles */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-[#70AE48]" />
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={dossierForm.nom}
                    onChange={(e) => setDossierForm({ ...dossierForm, nom: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    placeholder="DUPONT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénoms</label>
                  <input
                    type="text"
                    value={dossierForm.prenoms}
                    onChange={(e) => setDossierForm({ ...dossierForm, prenoms: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    placeholder="Jean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={dossierForm.date_naissance}
                      onChange={(e) => setDossierForm({ ...dossierForm, date_naissance: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">A propos de vous</label>
                  <textarea
                    value={dossierForm.a_propos}
                    onChange={(e) => setDossierForm({ ...dossierForm, a_propos: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    placeholder="Parlez de vous..."
                  />
                </div>
              </div>
            </Card>

            {/* Informations de contact */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={20} className="text-[#70AE48]" />
                Informations de contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={dossierForm.email}
                      onChange={(e) => setDossierForm({ ...dossierForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={dossierForm.telephone}
                      onChange={(e) => setDossierForm({ ...dossierForm, telephone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={dossierForm.mobile}
                      onChange={(e) => setDossierForm({ ...dossierForm, mobile: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Adresse */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#70AE48]" />
                Adresse
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={dossierForm.adresse}
                    onChange={(e) => setDossierForm({ ...dossierForm, adresse: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    placeholder="Votre adresse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={dossierForm.ville}
                    onChange={(e) => setDossierForm({ ...dossierForm, ville: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    placeholder="Votre ville"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                  <input
                    type="text"
                    value={dossierForm.region}
                    onChange={(e) => setDossierForm({ ...dossierForm, region: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    placeholder="Votre région"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <select
                    value={dossierForm.pays}
                    onChange={(e) => setDossierForm({ ...dossierForm, pays: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                  >
                    <option value="">Sélectionnez...</option>
                    {paysOptions.map(pays => (
                      <option key={pays} value={pays}>{pays}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Situation professionnelle */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-[#70AE48]" />
                Situation professionnelle
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d'activité</label>
                  <select
                    value={dossierForm.type_activite}
                    onChange={(e) => setDossierForm({ ...dossierForm, type_activite: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                  >
                    <option value="">Sélectionnez...</option>
                    {activityOptions.map(activity => (
                      <option key={activity} value={activity}>{activity}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={dossierForm.profession}
                    onChange={(e) => setDossierForm({ ...dossierForm, profession: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    placeholder="Votre profession"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenus mensuels (FCFA)</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={dossierForm.revenus_mensuels}
                      onChange={(e) => setDossierForm({ ...dossierForm, revenus_mensuels: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Garants */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-[#70AE48]" />
                Garants
              </h3>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-sm text-gray-600">J'ai un garant</span>
                <button
                  onClick={() => setDossierForm({ ...dossierForm, has_garant: !dossierForm.has_garant })}
                  className="relative w-20 h-8 rounded-full transition-colors"
                  style={{ backgroundColor: dossierForm.has_garant ? '#70AE48' : '#EF4444' }}
                >
                  <div 
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform"
                    style={{ transform: dossierForm.has_garant ? 'translateX(46px)' : 'translateX(4px)' }}
                  />
                </button>
                <span className="text-sm text-gray-600">Je n'ai pas de garant</span>
              </div>

              {dossierForm.has_garant && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de garant</label>
                    <select
                      value={dossierForm.garant_type}
                      onChange={(e) => setDossierForm({ ...dossierForm, garant_type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    >
                      <option value="">Choisir</option>
                      {garantTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={dossierForm.garant_description}
                      onChange={(e) => setDossierForm({ ...dossierForm, garant_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none bg-white text-gray-900"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                      placeholder="Informations sur le garant..."
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Options de partage */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-[#70AE48]" />
                Options de partage
              </h3>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-sm text-gray-600">Visible au public</span>
                <button
                  onClick={() => setDossierForm({ ...dossierForm, is_shared: !dossierForm.is_shared })}
                  className="relative w-16 h-8 rounded-full transition-colors"
                  style={{ backgroundColor: dossierForm.is_shared ? '#70AE48' : '#E5E7EB' }}
                >
                  <div 
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform"
                    style={{ transform: dossierForm.is_shared ? 'translateX(34px)' : 'translateX(4px)' }}
                  />
                </button>
                <span className="text-sm text-gray-600">Pas visible au public</span>
              </div>

              {dossierForm.is_shared && (
                <p className="text-center text-sm text-[#70AE48]">
                  L'adresse URL ci-dessous sera visible aux destinataires.
                </p>
              )}
            </Card>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6">
              <button
                onClick={() => setActiveTab('documents')}
                className="px-6 py-2.5 text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              {dossier?.status === 'brouillon' && (
                <button
                  onClick={handlePublishDossier}
                  className="px-6 py-2.5 bg-[#FFB74D] text-white font-medium rounded-lg hover:bg-[#FFA726] transition-colors"
                >
                  Publier
                </button>
              )}
              <button
                onClick={handleSaveDossier}
                disabled={submitting}
                className="px-6 py-2.5 bg-[#70AE48] text-white font-medium rounded-lg hover:bg-[#5a8f3a] transition-colors disabled:opacity-50 min-w-[120px] flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes documents</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Gérez vos documents et fichiers partagés
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#70AE48] text-white font-medium rounded-xl transition-all hover:opacity-90 shadow-md"
              >
                <Plus size={18} />
                Nouveau document
              </button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Total documents</p>
                    <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{actifsCount}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                    <Archive size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-medium">Archivés</p>
                    <p className="text-2xl font-bold text-gray-900">{archivesCount}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Partagés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {documents.filter(d => d.is_shared).length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveFilter('actifs')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeFilter === 'actifs' ? 'text-[#70AE48]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CheckCircle size={16} className={activeFilter === 'actifs' ? 'text-[#70AE48]' : 'text-gray-400'}/>
                  Actifs <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{actifsCount}</span>
                </button>
                <button
                  onClick={() => setActiveFilter('archives')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeFilter === 'archives' ? 'text-[#70AE48]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Archive size={16} className={activeFilter === 'archives' ? 'text-[#70AE48]' : 'text-gray-400'}/>
                  Archives <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{archivesCount}</span>
                </button>
                <button
                  onClick={() => setActiveFilter('templates')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeFilter === 'templates' ? 'text-[#70AE48]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText size={16} className={activeFilter === 'templates' ? 'text-[#70AE48]' : 'text-gray-400'}/>
                  Templates <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{templatesCount}</span>
                </button>
              </div>
            </div>

            {/* Filter Card */}
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Filtrer les documents</h3>
              
              <div className="flex flex-col md:flex-row gap-3">
                {/* Lignes par page */}
                <div className="relative md:w-36">
                  <button
                    onClick={() => setShowItemsDropdown(!showItemsDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:border-gray-400 transition-colors text-sm"
                  >
                    <span className="text-gray-400">{itemsPerPage} lignes</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {showItemsDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {['10', '25', '50', '100'].map((n) => (
                        <button
                          key={n}
                          onClick={() => { setItemsPerPage(n); setShowItemsDropdown(false); }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                        >
                          {n} lignes
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Période */}
                <select
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20 md:w-40 bg-white text-gray-900"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                >
                  <option value="">Période</option>
                  {filterOptions.periodes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {/* Type */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20 md:w-40 bg-white text-gray-900"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                >
                  <option value="">Type</option>
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Bien */}
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20 md:w-48 bg-white text-gray-900"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                >
                  <option value="">Tous les biens</option>
                  {filterOptions.properties.map(property => (
                    <option key={property.id} value={property.id.toString()}>
                      {property.name}
                    </option>
                  ))}
                </select>

                {/* Recherche */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un document..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20 bg-white text-gray-900"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                  />
                </div>
              </div>
            </Card>

            {/* Liste des documents */}
            <div className="space-y-3">
              {activeFilter === 'templates' ? (
                templates.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun template</h3>
                    <p className="text-sm text-gray-500">Aucun template disponible</p>
                  </Card>
                ) : (
                  templates.map((template) => (
                    <Card key={template.id} className="p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(template.type)}
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                            <p className="text-xs text-gray-500">{template.description}</p>
                          </div>
                        </div>
                        <a
                          href={template.file_url}
                          download
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Download size={18} className="text-[#70AE48]" />
                        </a>
                      </div>
                    </Card>
                  ))
                )
              ) : paginatedDocuments.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun document trouvé</h3>
                  <p className="text-sm text-gray-500 mb-4">Ajoutez votre premier document</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-all hover:opacity-90"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    <Plus size={16} />
                    Nouveau document
                  </button>
                </Card>
              ) : (
                paginatedDocuments.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getFileIcon(doc.file_type)}
                          <h3 className="text-base font-semibold text-gray-900">{doc.name}</h3>
                          {doc.is_shared && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                              <Share2 size={10} />
                              Partagé
                            </span>
                          )}
                          {doc.status === 'archive' && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                              <Archive size={10} />
                              Archivé
                            </span>
                          )}
                        </div>

                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {doc.description.length > 100 ? `${doc.description.substring(0, 100)}...` : doc.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {doc.property && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Home size={12} />
                              <span>{doc.property.name}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{formatDate(doc.created_at)}</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FileText size={12} />
                            <span>{doc.file_size_formatted}</span>
                          </div>

                          {doc.shared_with_users && doc.shared_with_users.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users size={12} />
                              <span>
                                {doc.shared_with_users.length} destinataire{doc.shared_with_users.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {doc.shared_with_users && doc.shared_with_users.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {doc.shared_with_users.slice(0, 2).map((user) => (
                              <div
                                key={user.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                              >
                                <Mail size={8} className="text-gray-500" />
                                <span className="truncate max-w-[100px]">{user.name}</span>
                              </div>
                            ))}
                            {doc.shared_with_users.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{doc.shared_with_users.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Voir"
                        >
                          <Eye size={16} className="text-gray-500 group-hover:text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Télécharger le fichier"
                        >
                          <Download size={16} className="text-gray-500 group-hover:text-[#70AE48]" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(doc)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Télécharger les informations PDF"
                        >
                          <FileText size={16} className="text-gray-500 group-hover:text-purple-600" />
                        </button>
                        {activeFilter === 'actifs' ? (
                          <button
                            onClick={() => handleArchive(doc)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                            title="Archiver"
                          >
                            <Archive size={16} className="text-gray-500 group-hover:text-orange-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(doc)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                            title="Restaurer"
                          >
                            <RefreshCw size={16} className="text-gray-500 group-hover:text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(doc.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Supprimer"
                        >
                          <Trash2 size={16} className="text-gray-500 group-hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Pied de page */}
            {filteredDocuments.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
                </span>
                <span>
                  Affichage {Math.min(parseInt(itemsPerPage), filteredDocuments.length)} sur {filteredDocuments.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Documents;