import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  Search,
  ArrowLeft,
  StickyNote,
  Calendar,
  Home,
  User,
  Upload,
  X,
  Loader2,
  FileText,
  Image,
  File,
  Download,
  Share2,
  Users,
  Building,
  Mail,
  CheckCircle,
  AlertCircle,
  AlertOctagon,
  Paperclip,
  Info,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit,
  Copy,
  Check,
  MessageCircle,
  PhoneCall,
  Send,
  Link,
  Globe,
  MapPin,
  Clock,
  Flag,
  Briefcase,
  Award,
  Star,
  Heart,
  ThumbsUp,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Menu,
  Sparkles as SparklesIcon,
  FileSignature,
  CheckSquare,
  StickyNote as StickyNoteIcon,
  Folder,
  Wrench,
  DollarSign,
  Key,
  Gift,
  Share,
  MessageSquare,
  Video,
  Mic,
  Camera,
  Navigation,
  Compass,
  Map,
  Link2,
  MailOpen,
  UserCheck,
  UserX,
  UserMinus,
  UserPlus,
  UserCog,
  UserCircle,
  Users2,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  UserMinus as UserMinusIcon,
  UserPlus as UserPlusIcon,
  UserCog as UserCogIcon,
  UserCircle as UserCircleIcon,
  Users2 as Users2Icon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  Share2 as ShareIcon,
  Copy as CopyIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  EyeOff,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Grid,
  List,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { Card } from './ui/Card';
import api from '@/services/api';

interface NotesProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Note {
  id: number;
  uuid: string;
  title: string;
  content?: string;
  property_id?: number;
  property?: {
    id: number;
    name: string;
    address: string;
  };
  lease_id?: number;
  is_shared: boolean;
  shared_with?: number[];
  shared_with_users?: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
  files?: string[];
  file_urls?: string[];
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  role: string;
  type: 'creator' | 'landlord' | 'co_owner';
}

interface Property {
  id: number;
  property: {
    id: number;
    name: string;
    address: string;
    city: string;
  };
}

export const Notes: React.FC<NotesProps> = ({ notify }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // View state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterShared, setFilterShared] = useState<string>('all');

  // Confirmation suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    property_id: undefined,
    is_shared: false,
    shared_with: [],
  });

  // Fichiers
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Couleur principale
  const PRIMARY_COLOR = '#70AE48';

  // Charger les données
  useEffect(() => {
    fetchNotes();
    fetchProperties();
  }, []);

  // Charger les contacts quand un bien est sélectionné
  useEffect(() => {
    if (newNote.property_id) {
      fetchContacts(newNote.property_id);
    } else {
      setContacts([]);
    }
  }, [newNote.property_id]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tenant/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Erreur chargement notes:', error);
      notify?.('Erreur lors du chargement des notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.get('/tenant/my-leases');
      setProperties(response.data);
    } catch (error) {
      console.error('Erreur chargement propriétés:', error);
    }
  };

  const fetchContacts = async (propertyId: number) => {
    try {
      const response = await api.get('/tenant/shareable-contacts', {
        params: { property_id: propertyId }
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setNoteToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/tenant/notes/${noteToDelete}`);
      setNotes(notes.filter(n => n.id !== noteToDelete));
      notify?.('Note supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur suppression note:', error);
      notify?.('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    // Vérifier la taille (15MB max)
    const maxSize = 15 * 1024 * 1024;
    const validFiles = files.filter(f => f.size <= maxSize);

    if (validFiles.length !== files.length) {
      notify?.('Certains fichiers dépassent 15MB et ont été ignorés', 'error');
    }

    // Vérifier le nombre total
    if (selectedFiles.length + validFiles.length > 5) {
      notify?.('Maximum 5 fichiers', 'error');
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);

    // Créer les previews
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setFilePreviews([...filePreviews, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setFilePreviews(filePreviews.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image size={20} className="text-blue-600" />;
    if (type.includes('pdf')) return <FileText size={20} className="text-red-600" />;
    if (type.includes('word') || type.includes('document')) return <FileText size={20} className="text-blue-600" />;
    if (type.includes('excel') || type.includes('sheet')) return <FileText size={20} className="text-green-600" />;
    if (type.includes('presentation') || type.includes('powerpoint')) return <FileText size={20} className="text-orange-600" />;
    return <File size={20} className="text-gray-600" />;
  };

  const handleCreateNote = async () => {
    if (!newNote.title?.trim()) {
      notify?.('Veuillez saisir un titre', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newNote.title);
      if (newNote.content) formData.append('content', newNote.content);
      if (newNote.property_id) formData.append('property_id', newNote.property_id.toString());

      // Envoyer comme booléen
      formData.append('is_shared', newNote.is_shared ? '1' : '0');

      if (newNote.is_shared && newNote.shared_with && newNote.shared_with.length > 0) {
        newNote.shared_with.forEach(id => {
          formData.append('shared_with[]', id.toString());
        });
      }

      // Ajouter les fichiers
      selectedFiles.forEach(file => {
        formData.append('files[]', file);
      });

      const response = await api.post('/tenant/notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNotes([response.data, ...notes]);
      setNewNote({
        title: '',
        content: '',
        property_id: undefined,
        is_shared: false,
        shared_with: [],
      });
      setSelectedFiles([]);
      setFilePreviews([]);
      setShowCreateForm(false);
      notify?.('Note créée avec succès', 'success');
    } catch (error) {
      console.error('Erreur création note:', error);
      notify?.('Erreur lors de la création de la note', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotes = notes
    .filter(note => {
      if (filterProperty !== 'all') {
        return note.property_id === parseInt(filterProperty);
      }
      return true;
    })
    .filter(note => {
      if (filterShared === 'shared') return note.is_shared;
      if (filterShared === 'private') return !note.is_shared;
      return true;
    })
    .filter(note =>
      searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.property?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'creator':
        return 'bg-blue-100 text-blue-700';
      case 'landlord':
        return 'bg-green-100 text-green-700';
      case 'co_owner':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Pagination
  const currentPage = 1;
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  const EmptyStateIllustration = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <circle cx="100" cy="80" r="60" fill="#FFF5F5" />
        <circle cx="70" cy="60" r="8" fill="#FFB6B6" />
        <circle cx="130" cy="50" r="6" fill="#FFD6D6" />
        <circle cx="140" cy="90" r="4" fill="#FFE6E6" />
        <rect x="85" y="40" width="30" height="40" rx="4" fill="#7CB342" opacity="0.8" />
        <rect x="80" y="50" width="40" height="30" rx="3" fill="#8BC34A" />
        <rect x="90" y="45" width="20" height="25" rx="2" fill="#AED581" />
        <circle cx="100" cy="100" r="25" fill="#FFCCBC" opacity="0.6" />
        <path d="M85 95 Q100 85 115 95" stroke="#8D6E63" strokeWidth="2" fill="none" />
        <circle cx="92" cy="90" r="3" fill="#5D4037" />
        <circle cx="108" cy="90" r="3" fill="#5D4037" />
        <ellipse cx="100" cy="98" rx="4" ry="3" fill="#5D4037" />
        <rect x="75" y="110" width="12" height="25" rx="6" fill="#FFCCBC" />
        <rect x="113" y="110" width="12" height="25" rx="6" fill="#FFCCBC" />
        <rect x="70" y="100" width="15" height="20" rx="7" fill="#FFAB91" />
        <rect x="115" y="100" width="15" height="20" rx="7" fill="#FFAB91" />
        <path d="M60 70 Q55 60 65 55" stroke="#8BC34A" strokeWidth="2" fill="none" />
        <circle cx="65" cy="55" r="3" fill="#8BC34A" />
        <path d="M140 75 Q145 65 135 60" stroke="#8BC34A" strokeWidth="2" fill="none" />
        <circle cx="135" cy="60" r="3" fill="#8BC34A" />
      </svg>
      <button
        onClick={() => setShowCreateForm(true)}
        className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
        style={{ background: 'rgba(82, 157, 33, 1)' }}
      >
        Nouvelle note
      </button>
    </div>
  );

  // List view component
  const ListView: React.FC = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: PRIMARY_COLOR }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <StickyNote size={24} className="text-gray-400" />
              </div>
            </div>
            <p className="text-gray-600 font-medium">Chargement de vos notes...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Top button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
            style={{ background: 'rgba(82, 157, 33, 1)' }}
          >
            <Plus size={18} />
            Une nouvelle note
          </button>
        </div>

        {/* Rest of ListView content */}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
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
                  Êtes-vous sûr de vouloir supprimer cette note ?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:bg-white"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:bg-white flex items-center justify-center gap-2"
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

          {showCreateForm ? (
            // Formulaire de création centré
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Bouton Retour et titre */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-white hover:opacity-90"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <ArrowLeft size={20} />
                  <span>Retour</span>
                </button>
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-gray-900">Nouvelle note</h1>
                  <p className="text-sm text-gray-600">Créez une note et partagez-la avec vos interlocuteurs</p>
                </div>
              </div>

              {/* Information Card - Même largeur que le formulaire */}
              <Card className="p-4 border-l-4 border-l-amber-400 bg-amber-50">
                <div className="flex gap-3">
                  <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-amber-800">Information</h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      Archivez vos documents scannés et partagez les avec vos propriétaires.<br />
                      <span className="font-medium">Formats acceptés:</span> Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale: 15 Mo<br />
                      Pour numériser vos documents, vous pouvez:<br />
                      • Les prendre en photo mais il faut faire attention au cadrage et à la qualité de l'image. Vous pouvez utiliser certaines applications de Scan pour Smartphones.<br />
                      • À l'aide d'un Scanner. Une résolution de 150 à 200dpi suffit largement pour éviter d'avoir des tailles de fichiers trop élevées.
                    </p>
                  </div>
                </div>
              </Card>

              {/* CREATE FORM */}
              <Card className="p-6">
                <div className="space-y-5">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                      placeholder="Ex: Contact plombier"
                    />
                  </div>

                  {/* Bien */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bien concerné
                    </label>
                    <select
                      value={newNote.property_id || ''}
                      onChange={(e) => setNewNote({
                        ...newNote,
                        property_id: e.target.value ? Number(e.target.value) : undefined
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    >
                      <option value="">Sélectionner un bien</option>
                      {properties.map((lease) => (
                        <option key={lease.id} value={lease.property?.id}>
                          {lease.property?.name} - {lease.property?.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contenu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contenu
                    </label>
                    <textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20 min-h-[120px]"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                      placeholder="Contenu de votre note..."
                    />
                  </div>

                  {/* Fichiers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fichiers joints (optionnel, max 5 fichiers, 15MB chacun)
                    </label>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}>
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-1">
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Cliquez pour ajouter des fichiers
                        </span>
                        <span className="text-xs text-gray-500">
                          PDF, Word, Excel, PowerPoint, Images (max 15MB)
                        </span>
                      </div>
                    </div>

                    {/* Liste des fichiers sélectionnés */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              {getFileIcon(file)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <X size={14} className="text-gray-500 hover:text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Options de partage */}
                  <div className="pt-3 border-t border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Partage</h3>

                    <div className="space-y-3">
                      {/* Toggle partage */}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newNote.is_shared}
                            onChange={(e) => setNewNote({
                              ...newNote,
                              is_shared: e.target.checked,
                              shared_with: e.target.checked ? [] : undefined
                            })}
                            className="w-4 h-4 rounded border-gray-300"
                            style={{ accentColor: PRIMARY_COLOR }}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Partager cette note
                          </span>
                        </label>
                      </div>

                      {/* Sélection des destinataires */}
                      {newNote.is_shared && (
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
                                    checked={newNote.shared_with?.includes(contact.id)}
                                    onChange={(e) => {
                                      const sharedWith = newNote.shared_with || [];
                                      if (e.target.checked) {
                                        setNewNote({
                                          ...newNote,
                                          shared_with: [...sharedWith, contact.id]
                                        });
                                      } else {
                                        setNewNote({
                                          ...newNote,
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
                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreateNote}
                      disabled={submitting}
                      className="px-4 py-2 text-white rounded-lg transition-all hover:opacity-90 disabled:bg-white disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <StickyNote size={16} />
                          Créer la note
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            // Liste des notes
            <div className="max-w-7xl mx-auto space-y-6">
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mes notes</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Gérez vos notes et documents partagés
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-all hover:opacity-90 shadow-md"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <Plus size={18} />
                  Nouvelle note
                </button>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                      <StickyNote size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Total notes</p>
                      <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                      <Share2 size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">Notes partagées</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {notes.filter(n => n.is_shared).length}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                      <Paperclip size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Avec fichiers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {notes.filter(n => n.files && n.files.length > 0).length}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Filtres */}
              <Card className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Filtrer les notes</h3>

                <div className="flex flex-col md:flex-row gap-3">
                  {/* Filtre bien */}
                  <select
                    value={filterProperty}
                    onChange={(e) => setFilterProperty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                  >
                    <option value="all">Tous les biens</option>
                    {properties.map((lease) => (
                      <option key={lease.id} value={lease.property?.id}>
                        {lease.property?.name}
                      </option>
                    ))}
                  </select>

                  {/* Filtre partage */}
                  <select
                    value={filterShared}
                    onChange={(e) => setFilterShared(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                  >
                    <option value="all">Toutes les notes</option>
                    <option value="shared">Partagées</option>
                    <option value="private">Privées</option>
                  </select>

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
                        {['5', '10', '25', '50', '100'].map((n) => (
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

                  {/* Recherche */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher une note..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Liste des notes */}
              <div className="space-y-3">
                {paginatedNotes.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <StickyNote size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune note trouvée</h3>
                    <p className="text-sm text-gray-500 mb-4">Créez votre première note</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-xl transition-all hover:opacity-90"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      <Plus size={16} />
                      Nouvelle note
                    </button>
                  </Card>
                ) : (
                  paginatedNotes.map((note) => (
                    <Card
                      key={note.id}
                      className="p-4 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <StickyNote size={18} className="text-gray-400" />
                            <h3 className="text-base font-semibold text-gray-900">{note.title}</h3>
                            {note.is_shared && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <Share2 size={10} />
                                Partagée
                              </span>
                            )}
                          </div>

                          {note.content && (
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                              {note.content.length > 200 ? `${note.content.substring(0, 200)}...` : note.content}
                            </p>
                          )}

                          {/* Métadonnées */}
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {note.property && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Home size={12} />
                                <span>{note.property.name}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              <span>{formatDate(note.created_at)}</span>
                            </div>

                            {note.shared_with_users && note.shared_with_users.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users size={12} />
                                <span>
                                  {note.shared_with_users.length} destinataire{note.shared_with_users.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Liste des destinataires (compacte) */}
                          {note.shared_with_users && note.shared_with_users.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {note.shared_with_users.slice(0, 2).map((user) => (
                                <div
                                  key={user.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                                >
                                  <Mail size={8} className="text-gray-500" />
                                  <span className="truncate max-w-[100px]">{user.name}</span>
                                </div>
                              ))}
                              {note.shared_with_users.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{note.shared_with_users.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Fichiers joints (icônes seulement) */}
                          {note.file_urls && note.file_urls.length > 0 && (
                            <div className="mt-2 flex gap-1">
                              {note.file_urls.slice(0, 3).map((url, index) => {
                                const fileName = url.split('/').pop() || '';
                                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
                                return (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                    title={fileName}
                                  >
                                    {isImage ? (
                                      <Image size={14} className="text-blue-600" />
                                    ) : (
                                      <FileText size={14} className="text-gray-600" />
                                    )}
                                  </a>
                                );
                              })}
                              {note.file_urls.length > 3 && (
                                <span className="text-xs text-gray-500 self-center">
                                  +{note.file_urls.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <button
                          onClick={() => handleDeleteClick(note.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group flex-shrink-0"
                          title="Supprimer"
                        >
                          <Trash2 size={16} className="text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Pied de page */}
              {filteredNotes.length > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {filteredNotes.length} note{filteredNotes.length > 1 ? 's' : ''}
                  </span>
                  <span>
                    Affichage {Math.min(parseInt(itemsPerPage), filteredNotes.length)} sur {filteredNotes.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main component return
  return <ListView />;
};

export default Notes;
