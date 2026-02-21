import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  Search, 
  ArrowLeft, 
  CheckSquare, 
  Calendar, 
  Loader2, 
  AlertOctagon,
  Home,
  AlertCircle,
  Clock,
  Flag,
  User,
  X,
  MoreVertical,
  Edit,
  Copy,
  CheckCircle,
  Circle,
  AlertTriangle,
  Info,
  Tag,
  Building,
  CalendarDays,
  UserCircle,
  BadgeCheck,
  BadgeAlert,
  BadgeInfo,
  BadgeX,
  BadgePlus,
  BadgeMinus,
  BadgePercent,
  BadgeEuro,
  BadgeDollarSign,
  BadgePoundSterling,
  BadgeYen,
  BadgeCent,
  BadgeBitcoin,
  Badge,
  Sparkles,
  Star,
  Heart,
  ThumbsUp,
  Award,
  Crown,
  Medal,
  Trophy,
  Rocket,
  Zap,
  Flame,
  Droplet,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudOff,
  Cloudy,
  Umbrella,
  Snowflake,
  Tornado,
  Hurricane,
  Thermometer,
  Gauge,
  Compass,
  Map,
  MapPin,
  Navigation,
  Locate,
  LocateFixed,
  LocateOff,
  Crosshair,
  Target,
  Bullseye,
  Disc,
  CircleDot,
  CircleDotDashed,
  CircleOff,
  CircleSlash,
  CircleSlash2,
  CircleEllipsis,
  CircleCheck,
  CircleCheckBig,
  CircleAlert,
  CircleX,
  CircleHelp,
  CircleDollarSign,
  CircleEuro,
  CirclePound,
  CircleYen,
  CircleBitcoin,
  CirclePlus,
  CircleMinus,
  CircleDivide,
  CircleEqual,
  CircleSlash,
  CircleOff,
  CircleDot,
  CircleDotDashed,
  CircleEllipsis,
  CircleCheck,
  CircleCheckBig,
  CircleAlert,
  CircleX,
  CircleHelp,
  CircleDollarSign,
  CircleEuro,
  CirclePound,
  CircleYen,
  CircleBitcoin,
  CirclePlus,
  CircleMinus,
  CircleDivide,
  CircleEqual,
  CircleSlash,
  CircleOff,
  CircleDot,
  CircleDotDashed,
  CircleEllipsis,
} from 'lucide-react';
import { Card } from './ui/Card';
import api from '@/services/api';

interface TasksProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Task {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  property_id?: number;
  property?: {
    id: number;
    name: string;
    address: string;
    city: string;
  };
  created_at: string;
  updated_at: string;
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

export const Tasks: React.FC<TasksProps> = ({ notify }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // View state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // Confirmation suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    property_id: undefined,
    assigned_to: 'Moi',
  });

  // Couleur principale
  const PRIMARY_COLOR = '#70AE48';

  // Charger les données
  useEffect(() => {
    fetchTasks();
    fetchProperties();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tenant/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
      notify?.('Erreur lors du chargement des tâches', 'error');
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

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      await api.put(`/tenant/tasks/${id}`, {
        completed: !task.completed
      });
      
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
      notify?.('Statut de la tâche mis à jour', 'success');
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
      notify?.('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDeleteClick = (id: number) => {
    setTaskToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    
    setDeleting(true);
    try {
      await api.delete(`/tenant/tasks/${taskToDelete}`);
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      notify?.('Tâche supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      notify?.('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const handleCreateTask = async () => {
    if (!newTask.title?.trim()) {
      notify?.('Veuillez saisir un titre', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/tenant/tasks', {
        title: newTask.title,
        description: newTask.description || null,
        due_date: newTask.due_date || null,
        priority: newTask.priority || 'medium',
        property_id: newTask.property_id || null,
        assigned_to: newTask.assigned_to || 'Moi',
      });

      setTasks([response.data, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        property_id: undefined,
        assigned_to: 'Moi',
      });
      setShowCreateForm(false);
      notify?.('Tâche créée avec succès', 'success');
    } catch (error) {
      console.error('Erreur création tâche:', error);
      notify?.('Erreur lors de la création de la tâche', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <Flame size={14} className="text-red-600" />,
        label: 'Élevée'
      };
      case 'medium': return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: <Zap size={14} className="text-yellow-600" />,
        label: 'Moyenne'
      };
      case 'low': return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <Droplet size={14} className="text-blue-600" />,
        label: 'Faible'
      };
      default: return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: <Info size={14} className="text-gray-600" />,
        label: priority
      };
    }
  };

  const getStatusIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle size={20} className="text-green-600" />
    ) : (
      <Circle size={20} className="text-gray-400" />
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flame size={14} className="text-red-600" />;
      case 'medium': return <Zap size={14} className="text-yellow-600" />;
      case 'low': return <Droplet size={14} className="text-blue-600" />;
      default: return <Flag size={14} className="text-gray-600" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filterStatus === 'active') return !task.completed;
      if (filterStatus === 'completed') return task.completed;
      return true;
    })
    .filter(task => {
      if (filterPriority === 'all') return true;
      return task.priority === filterPriority;
    })
    .filter(task => 
      searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.property?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const paginatedTasks = filteredTasks.slice(0, parseInt(itemsPerPage));

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: PRIMARY_COLOR }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckSquare size={24} className="text-gray-400" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

  return (
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
              Êtes-vous sûr de vouloir supprimer cette tâche ?
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

      {showCreateForm ? (
        // Formulaire de création centré
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Bouton Retour */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <ArrowLeft size={20} />
              <span>Retour</span>
            </button>
          </div>

          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Nouvelle tâche</h1>
            <p className="text-sm text-gray-600 mt-2">Créez une nouvelle tâche à accomplir</p>
          </div>

          {/* CREATE FORM - Centré */}
          <div className="flex justify-center">
            <Card className="p-8 w-full max-w-2xl">
              <div className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all"
                    style={{ 
                      borderColor: `${PRIMARY_COLOR}80`,
                      focusRing: PRIMARY_COLOR 
                    }}
                    placeholder="Ex: Renouveler l'assurance habitation"
                  />
                </div>

                {/* Bien */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bien concerné
                  </label>
                  <select
                    value={newTask.property_id || ''}
                    onChange={(e) => setNewTask({ 
                      ...newTask, 
                      property_id: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20"
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

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20 min-h-[120px]"
                    style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    placeholder="Description détaillée de la tâche..."
                  />
                </div>

                {/* Date d'échéance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'échéance
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                    />
                  </div>
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Priorité</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['low', 'medium', 'high'] as const).map((p) => {
                      const priorityStyle = getPriorityColor(p);
                      return (
                        <button
                          key={p}
                          onClick={() => setNewTask({ ...newTask, priority: p })}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            newTask.priority === p
                              ? 'text-white shadow-md'
                              : `${priorityStyle.bg} ${priorityStyle.text} hover:opacity-80`
                          }`}
                          style={newTask.priority === p ? { backgroundColor: PRIMARY_COLOR } : {}}
                        >
                          {priorityStyle.icon}
                          {priorityStyle.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assigné à */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigné à
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20"
                      style={{ borderColor: `${PRIMARY_COLOR}80` }}
                      placeholder="Moi, Copropriétaire, etc."
                    />
                  </div>
                </div>

                {/* Boutons */}
                <div className="pt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateTask}
                    disabled={submitting}
                    className="px-6 py-3 text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <CheckSquare size={18} />
                        Créer la tâche
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        // Liste des tâches
        <div className="max-w-7xl mx-auto space-y-6">
          {/* En-tête avec bouton et compteurs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes tâches</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gérez vos tâches et suivez votre progression
              </p>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-all hover:opacity-90 shadow-md"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <Plus size={18} />
              Nouvelle tâche
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Total tâches</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
                  <Circle size={20} />
                </div>
                <div>
                  <p className="text-xs text-yellow-600 font-medium">En cours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => !t.completed).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Terminées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.completed).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Filtrer les tâches</h3>
            
            <div className="flex flex-col md:flex-row gap-3">
              {/* Filtre statut */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={filterStatus === 'all' ? { backgroundColor: PRIMARY_COLOR } : {}}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'active'
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={filterStatus === 'active' ? { backgroundColor: PRIMARY_COLOR } : {}}
                >
                  En cours
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'completed'
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={filterStatus === 'completed' ? { backgroundColor: PRIMARY_COLOR } : {}}
                >
                  Terminées
                </button>
              </div>

              {/* Filtre priorité */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20"
                style={{ borderColor: `${PRIMARY_COLOR}80` }}
              >
                <option value="all">Toutes priorités</option>
                <option value="high">Priorité Élevée</option>
                <option value="medium">Priorité Moyenne</option>
                <option value="low">Priorité Faible</option>
              </select>

              {/* Lignes par page */}
              <div className="relative md:w-40">
                <button
                  onClick={() => setShowItemsDropdown(!showItemsDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:border-gray-400 transition-colors text-sm"
                >
                  <span className="text-gray-400">{itemsPerPage} lignes</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                {showItemsDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {['10', '25', '50', '100'].map((n) => (
                      <button
                        key={n}
                        onClick={() => { setItemsPerPage(n); setShowItemsDropdown(false); }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
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
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                />
              </div>
            </div>
          </Card>

          {/* Liste des tâches - Design amélioré */}
          <div className="space-y-3">
            {paginatedTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
                <p className="text-sm text-gray-500 mb-6">Créez votre première tâche pour commencer</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-xl transition-all hover:opacity-90"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  <Plus size={18} />
                  Nouvelle tâche
                </button>
              </Card>
            ) : (
              paginatedTasks.map((task) => {
                const priorityStyle = getPriorityColor(task.priority);
                const isTaskOverdue = isOverdue(task.due_date) && !task.completed;
                
                return (
                  <Card 
                    key={task.id} 
                    className={`p-4 hover:shadow-md transition-all duration-300 ${
                      task.completed ? 'opacity-75' : ''
                    } ${isTaskOverdue ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox personnalisée */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle size={24} className="text-green-600" />
                        ) : (
                          <Circle size={24} className="text-gray-400 hover:text-green-600 transition-colors" />
                        )}
                      </button>

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${
                              task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h3>
                            
                            {/* Description */}
                            {task.description && (
                              <p className={`text-sm mt-2 ${
                                task.completed ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {task.description}
                              </p>
                            )}

                            {/* Métadonnées - Design en badges */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {/* Bien */}
                              {task.property && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  <Home size={12} />
                                  <span>{task.property.name}</span>
                                </div>
                              )}

                              {/* Date d'échéance */}
                              {task.due_date && (
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                  isTaskOverdue
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  <Calendar size={12} />
                                  <span>Échéance: {formatDate(task.due_date)}</span>
                                  {isTaskOverdue && (
                                    <AlertCircle size={12} className="text-red-600" />
                                  )}
                                </div>
                              )}

                              {/* Assigné à */}
                              {task.assigned_to && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  <User size={12} />
                                  <span>{task.assigned_to}</span>
                                </div>
                              )}

                              {/* Priorité */}
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                                {priorityStyle.icon}
                                <span>{priorityStyle.label}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteClick(task.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Supprimer"
                            >
                              <Trash2 size={18} className="text-gray-400 group-hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pied de page avec compteur */}
          {filteredTasks.length > 0 && (
            <Card className="p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Affichage <span className="font-medium">{Math.min(parseInt(itemsPerPage), filteredTasks.length)}</span> sur{' '}
                    <span className="font-medium">{filteredTasks.length}</span> tâche{filteredTasks.length > 1 ? 's' : ''}
                  </span>
                  <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-medium text-yellow-600">{filteredTasks.filter(t => !t.completed).length}</span> en cours,{' '}
                    <span className="font-medium text-green-600">{filteredTasks.filter(t => t.completed).length}</span> terminées
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Légende :</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Circle size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600">À faire</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-600" />
                      <span className="text-xs text-gray-600">Terminée</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle size={12} className="text-red-600" />
                      <span className="text-xs text-gray-600">En retard</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

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

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Tasks;