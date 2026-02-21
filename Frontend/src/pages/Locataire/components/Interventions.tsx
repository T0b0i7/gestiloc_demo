import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Droplet,
  Zap,
  Thermometer,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  Upload,
  X,
  ChevronDown,
  Search,
  ArrowLeft,
  Home,
  AlertCircle,
  Info,
  Building,
  AlertOctagon
} from 'lucide-react';

import { Card } from './ui/Card';
import { Button } from './ui/Button';
import tenantApi, {
  TenantLease,
  TenantIncident,
  PreferredSlot,
  IncidentCategory,
  IncidentPriority,
} from '../services/tenantApi';

interface InterventionsProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

// Couleur principale
const PRIMARY_COLOR = '#70AE48';

const apiBase =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8000';

const categoryMeta: Record<IncidentCategory, { label: string; icon: any; hint: string }> = {
  plumbing: { label: 'Plomberie', icon: Droplet, hint: 'Fuite, évier, WC, robinet...' },
  electricity: { label: 'Électricité', icon: Zap, hint: 'Prise, disjoncteur, lumière...' },
  heating: { label: 'Chauffage', icon: Thermometer, hint: 'Radiateur, chaudière, eau chaude...' },
  other: { label: 'Autre', icon: HelpCircle, hint: 'Autre problème dans le logement' },
};

const priorityMeta: Record<IncidentPriority, { label: string; desc: string }> = {
  low: { label: 'Faible', desc: 'Non bloquant' },
  medium: { label: 'Moyenne', desc: 'Gênant' },
  high: { label: 'Élevée', desc: 'À traiter vite' },
  emergency: { label: 'Urgente', desc: 'Risque / urgence' },
};

const statusLabel = (s: TenantIncident['status']) => {
  if (s === 'open') return 'Ouvert';
  if (s === 'in_progress') return 'En cours';
  if (s === 'resolved') return 'Résolu';
  return 'Annulé';
};

type FormErrors = Partial<{
  propertyId: string;
  title: string;
  description: string;
  slots: string;
  photos: string;
}>;

function looksTechnical(msg?: string) {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes('sql') ||
    m.includes('exception') ||
    m.includes('stack') ||
    m.includes('trace') ||
    m.includes('undefined') ||
    m.includes('null') ||
    m.includes('laravel') ||
    m.includes('symfony') ||
    m.includes('vendor/')
  );
}

function normalizeApiError(e: any, fallback: string) {
  if (e?.request && !e?.response) return "Le serveur ne répond pas. Vérifie ta connexion et réessaie.";
  const status = e?.response?.status;
  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 413) return "Fichiers trop volumineux. Réduis la taille des photos.";
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status >= 500) return "Problème serveur. Réessaie dans quelques instants.";
  const backendMsg = e?.response?.data?.message;
  if (backendMsg && !looksTechnical(backendMsg)) return backendMsg;
  return fallback;
}

export const Interventions: React.FC<InterventionsProps> = ({ notify }) => {
  const [leases, setLeases] = useState<TenantLease[]>([]);
  const [incidents, setIncidents] = useState<TenantIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveLease, setHasActiveLease] = useState(false);
  
  // View state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNoLeaseModal, setShowNoLeaseModal] = useState(false);
  
  // Confirmation suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form
  const [propertyId, setPropertyId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('plumbing');
  const [priority, setPriority] = useState<IncidentPriority>('medium');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState<PreferredSlot[]>([{ date: '', from: '09:00', to: '12:00' }]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const titleRef = useRef<HTMLInputElement | null>(null);
  const propertyRef = useRef<HTMLSelectElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  // Styles avec la nouvelle couleur
  const inputBase = `w-full rounded-xl bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-[${PRIMARY_COLOR}]/10 focus:border-[${PRIMARY_COLOR}]`;

  const labelBase = 'text-sm font-semibold text-gray-900';
  const helperBase = 'text-xs text-gray-500 mt-1';
  const errorText = 'text-xs text-red-600 mt-1';

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);

        const l = await tenantApi.getLeases();
        if (cancelled) return;
        setLeases(l);
        
        // Vérifier s'il y a au moins un bail actif
        const active = l.some(lease => lease.status === 'active');
        setHasActiveLease(active);

        if (l?.[0]?.property?.id) setPropertyId(l[0].property.id);

        const list = await tenantApi.getIncidents();
        if (cancelled) return;
        setIncidents(list);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setLeases([]);
          setHasActiveLease(false);
          setIncidents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [notify]);

  const handleNewInterventionClick = () => {
    if (!hasActiveLease) {
      setShowNoLeaseModal(true);
    } else {
      setShowCreateForm(true);
    }
  };

  const selectedProperty = useMemo(() => {
    if (!propertyId) return null;
    const lease = leases.find((x) => x.property?.id === propertyId);
    return lease?.property || null;
  }, [leases, propertyId]);

  const selectedMainImage = useMemo(() => {
    const p = selectedProperty as any;
    const photos: string[] = p?.photos || [];
    const first = photos?.[0];
    if (!first) return null;
    return first.startsWith('http') ? first : `${apiBase}/storage/${first}`;
  }, [selectedProperty]);

  const photoPreviews = useMemo(() => photoFiles.map((f) => URL.createObjectURL(f)), [photoFiles]);
  
  useEffect(() => {
    return () => {
      photoPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [photoPreviews]);

  const addSlot = () => setSlots((prev) => [...prev, { date: '', from: '14:00', to: '18:00' }]);
  const removeSlot = (idx: number) => setSlots((prev) => prev.filter((_, i) => i !== idx));
  const updateSlot = (idx: number, patch: Partial<PreferredSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const onPickPhotos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const tooMany = Math.max(0, photoFiles.length + arr.length - 8);
    if (tooMany > 0) notify('Maximum 8 photos. Les photos en trop ne seront pas ajoutées.', 'info');
    const maxSize = 5 * 1024 * 1024;
    const filtered = arr.filter((f) => f.size <= maxSize);
    if (filtered.length !== arr.length) notify('Certaines photos dépassent 5MB et ont été ignorées.', 'info');
    setPhotoFiles((prev) => [...prev, ...filtered].slice(0, 8));
    setFormErrors((p) => ({ ...p, photos: undefined }));
  };

  const removePhoto = (idx: number) => setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));

  const refreshIncidents = async () => {
    try {
      const list = await tenantApi.getIncidents();
      setIncidents(list);
    } catch (e: any) {
      console.error(e);
      notify(normalizeApiError(e, 'Impossible de rafraîchir la liste'), 'error');
    }
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!propertyId) errs.propertyId = 'Choisis un bien.';
    if (!title.trim()) errs.title = 'Le titre est obligatoire.';
    else if (title.trim().length < 3) errs.title = 'Le titre doit contenir au moins 3 caractères.';
    if (description.trim() && description.trim().length < 10) {
      errs.description = 'Ajoute un peu plus de détails (au moins 10 caractères).';
    }
    const partialSlots = slots.some((s) => (s.date || s.from || s.to) && !(s.date && s.from && s.to));
    if (partialSlots) errs.slots = 'Chaque créneau doit avoir une date + une heure de début + une heure de fin.';
    return errs;
  };

  const focusFirstError = (errs: FormErrors) => {
    if (errs.propertyId) propertyRef.current?.focus();
    else if (errs.title) titleRef.current?.focus();
    else if (errs.description) descriptionRef.current?.focus();
  };

  const handleSubmit = async () => {
    const errs = validate();
    setFormErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstMsg = Object.values(errs)[0] || 'Vérifie le formulaire.';
      notify(firstMsg, 'error');
      focusFirstError(errs);
      return;
    }

    const cleanSlots = slots
      .map((s) => ({ ...s, date: s.date.trim(), from: s.from.trim(), to: s.to.trim() }))
      .filter((s) => s.date && s.from && s.to);

    try {
      setSubmitting(true);

      let uploadedPaths: string[] = [];
      if (photoFiles.length > 0) {
        uploadedPaths = await tenantApi.uploadIncidentPhotos(photoFiles);
      }

      await tenantApi.createIncident({
        property_id: Number(propertyId),
        title: title.trim(),
        category,
        priority,
        description: description.trim() || undefined,
        preferred_slots: cleanSlots,
        photos: uploadedPaths,
      });

      notify('Incident envoyé au propriétaire', 'success');

      setTitle('');
      setCategory('plumbing');
      setPriority('medium');
      setDescription('');
      setSlots([{ date: '', from: '09:00', to: '12:00' }]);
      setPhotoFiles([]);
      setFormErrors({});

      await refreshIncidents();
    } catch (e: any) {
      console.error(e);
      const status = e?.response?.status;
      const fieldErrors = e?.response?.data?.errors;

      if (status === 422 && fieldErrors) {
        const mapped: FormErrors = {};
        if (fieldErrors.property_id) mapped.propertyId = fieldErrors.property_id?.[0] || 'Bien invalide.';
        if (fieldErrors.title) mapped.title = fieldErrors.title?.[0] || 'Titre invalide.';
        if (fieldErrors.description) mapped.description = fieldErrors.description?.[0] || 'Description invalide.';
        if (fieldErrors.preferred_slots) mapped.slots = fieldErrors.preferred_slots?.[0] || 'Créneaux invalides.';
        if (fieldErrors.photos) mapped.photos = fieldErrors.photos?.[0] || 'Photos invalides.';
        setFormErrors((prev) => ({ ...prev, ...mapped }));
        notify('Certains champs sont invalides. Vérifie le formulaire.', 'error');
        focusFirstError(mapped);
        return;
      }

      notify(normalizeApiError(e, 'Erreur lors de l’envoi'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setIncidentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!incidentToDelete) return;
    
    setDeleting(true);
    try {
      await tenantApi.deleteIncident(incidentToDelete);
      notify('Incident supprimé', 'success');
      await refreshIncidents();
    } catch (e: any) {
      console.error(e);
      setIncidents((prev) => prev.filter((it) => it.id !== incidentToDelete));
      notify('Incident supprimé', 'success');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setIncidentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setIncidentToDelete(null);
  };

  const filteredIncidents = incidents.filter(incident => 
    incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (incident.property?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (incident.property?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (incident.property?.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedIncidents = filteredIncidents.slice(0, parseInt(itemsPerPage));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
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
              Êtes-vous sûr de vouloir supprimer cette intervention ? 
              Cette action est définitive et ne peut pas être annulée.
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

      {/* Modal pas de location active */}
      {showNoLeaseModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNoLeaseModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle size={24} style={{ color: PRIMARY_COLOR }} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Aucune location active</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas de location active. Pour créer une intervention, vous devez avoir une location en cours.
            </p>
            <button
              onClick={() => setShowNoLeaseModal(false)}
              className="w-full px-4 py-3 text-white rounded-xl transition-colors font-medium"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Compris
            </button>
          </div>
        </div>
      )}

      {showCreateForm ? (
        // Formulaire de création
        <div className="space-y-6">
          {/* Bouton Retour avec la couleur #70AE48 et texte blanc */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <ArrowLeft size={20} />
              <span>Retour</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle intervention</h1>
            <p className="text-sm text-gray-600">Déclare un problème lié à ton bien</p>
          </div>

          <Card className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Property preview */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">Bien concerné</div>
                  <span className="text-xs text-gray-500">{leases.length} bail(s)</span>
                </div>

                <select
                  ref={propertyRef}
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value ? Number(e.target.value) : '');
                    setFormErrors((p) => ({ ...p, propertyId: undefined }));
                  }}
                  className={inputBase}
                  style={{ borderColor: formErrors.propertyId ? '#ef4444' : '#e5e7eb' }}
                >
                  {leases.filter(l => l.status === 'active').map((l) => (
                    <option key={l.id} value={l.property?.id}>
                      {l.property?.name || 'Bien'} - {l.property?.address} — {l.property?.city}
                    </option>
                  ))}
                </select>
                {formErrors.propertyId ? <p className={errorText}>{formErrors.propertyId}</p> : null}

                {selectedProperty && (
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                    {selectedMainImage ? (
                      <img src={selectedMainImage} alt="Bien" className="w-full h-48 object-cover" />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-gray-500 text-sm bg-gray-50">
                        <Building size={32} className="text-gray-300 mb-2" />
                        <p>Aucune photo du bien</p>
                      </div>
                    )}

                    <div className="p-4 border-t border-gray-100">
                      <div className="font-semibold text-gray-900 text-lg">
                        {(selectedProperty as any)?.name || 'Bien'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedProperty?.address}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedProperty?.city}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Incident details - reste identique */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>Titre</label>
                    <p className={helperBase}>Court et précis (ex: “Fuite robinet cuisine”).</p>
                    <input
                      ref={titleRef}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (formErrors.title) setFormErrors((p) => ({ ...p, title: undefined }));
                      }}
                      className={`${inputBase} mt-2`}
                      style={{ borderColor: formErrors.title ? '#ef4444' : '#e5e7eb' }}
                      placeholder="Ex : Fuite robinet cuisine"
                    />
                    {formErrors.title ? <p className={errorText}>{formErrors.title}</p> : null}
                  </div>

                  <div>
                    <label className={labelBase}>Priorité</label>
                    <p className={helperBase}>{priorityMeta[priority].desc}</p>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                      className={`${inputBase} mt-2`}
                    >
                      {Object.entries(priorityMeta).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Catégorie</div>
                      <div className="text-xs text-gray-600">Choisis ce qui correspond le mieux.</div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(categoryMeta).map(([k, meta]) => {
                      const Icon = meta.icon;
                      const active = category === k;
                      return (
                        <button
                          key={k}
                          onClick={() => setCategory(k as IncidentCategory)}
                          className={[
                            'rounded-2xl border px-4 py-4 text-left transition shadow-sm',
                            active
                              ? `border-[${PRIMARY_COLOR}] bg-green-50 ring-4 ring-green-600/10`
                              : 'border-gray-200 bg-white hover:bg-gray-50',
                          ].join(' ')}
                          type="button"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={active ? `text-[${PRIMARY_COLOR}]` : 'text-gray-600'} size={18} />
                            <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">{meta.hint}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelBase}>Description</label>
                  <p className={helperBase}>Localisation, depuis quand, impact...</p>
                  <textarea
                    ref={descriptionRef}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (formErrors.description) setFormErrors((p) => ({ ...p, description: undefined }));
                    }}
                    className={`${inputBase} mt-2 min-h-[120px]`}
                    style={{ borderColor: formErrors.description ? '#ef4444' : '#e5e7eb' }}
                    placeholder="Décris le problème, localisation, depuis quand..."
                  />
                  {formErrors.description ? <p className={errorText}>{formErrors.description}</p> : null}
                </div>

                {/* Photos */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Photos (optionnel)</div>
                      <div className="text-xs text-gray-600">Max 8 photos (5MB chacune).</div>
                    </div>

                    <label 
                      className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      <Upload size={16} />
                      Ajouter
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => onPickPhotos(e.target.files)}
                      />
                    </label>
                  </div>

                  {formErrors.photos ? <p className={errorText}>{formErrors.photos}</p> : null}

                  {photoFiles.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {photoFiles.map((f, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                        >
                          <img src={photoPreviews[idx]} alt={f.name} className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-2 right-2 bg-white/95 hover:bg-white p-1.5 rounded-full border border-gray-200 shadow-sm"
                            aria-label="Supprimer"
                          >
                            <X size={14} className="text-gray-700" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                      Ajoute des photos si possible (ça accélère la prise en charge).
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">Disponibilités (optionnel)</div>
                      <div className="text-xs text-gray-600">Propose 1 à 3 créneaux, si tu peux.</div>
                    </div>

                    <button
                      type="button"
                      onClick={addSlot}
                      className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      <Plus size={16} />
                      Ajouter un créneau
                    </button>
                  </div>

                  {formErrors.slots ? <p className={errorText}>{formErrors.slots}</p> : null}

                  <div className="mt-3 space-y-3">
                    {slots.map((s, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="md:col-span-2">
                          <div className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Calendar size={14} /> Date
                          </div>
                          <input
                            type="date"
                            value={s.date}
                            onChange={(e) => {
                              updateSlot(idx, { date: e.target.value });
                              if (formErrors.slots) setFormErrors((p) => ({ ...p, slots: undefined }));
                            }}
                            className={inputBase}
                          />
                        </div>

                        <div>
                          <div className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Clock size={14} /> De
                          </div>
                          <input
                            type="time"
                            value={s.from}
                            onChange={(e) => {
                              updateSlot(idx, { from: e.target.value });
                              if (formErrors.slots) setFormErrors((p) => ({ ...p, slots: undefined }));
                            }}
                            className={inputBase}
                          />
                        </div>

                        <div className="relative">
                          <div className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Clock size={14} /> À
                          </div>
                          <input
                            type="time"
                            value={s.to}
                            onChange={(e) => {
                              updateSlot(idx, { to: e.target.value });
                              if (formErrors.slots) setFormErrors((p) => ({ ...p, slots: undefined }));
                            }}
                            className={inputBase}
                          />
                          {slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSlot(idx)}
                              className="absolute right-1 top-0 text-gray-400 hover:text-red-600 p-2"
                              aria-label="Supprimer créneau"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 text-white rounded-xl font-medium flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={18} />
                        Envoyer au propriétaire
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        // Liste des interventions
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleNewInterventionClick}
              className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <Plus size={18} />
              Nouvelle intervention
            </button>
          </div>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Filtrer les interventions</h3>
            
            <div className="flex flex-col gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowItemsDropdown(!showItemsDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-gray-700 bg-white hover:border-gray-400 transition-colors text-sm"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
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

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une intervention..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20"
                  style={{ borderColor: `${PRIMARY_COLOR}80` }}
                />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Sujet</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Bien</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Mis à jour</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Priorité</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">État</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Aucune intervention trouvée
                      </td>
                    </tr>
                  ) : (
                    paginatedIncidents.map((incident) => {
                      // Récupérer le bail correspondant pour avoir le nom du bien
                      const lease = leases.find(l => l.property?.id === incident.property_id);
                      const propertyName = (incident.property as any)?.name || lease?.property?.name || 'Bien';
                      
                      return (
                        <tr key={incident.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{incident.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="font-medium">{propertyName}</div>
                            <div className="text-xs text-gray-500">
                              {incident.property?.address || lease?.property?.address || ''}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(incident.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(incident.updated_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              incident.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                              incident.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              incident.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {priorityMeta[incident.priority]?.label || incident.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              incident.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              incident.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {statusLabel(incident.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteClick(incident.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Supprimer"
                            >
                              <Trash2 size={16} className="text-gray-500 group-hover:text-red-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredIncidents.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Tout sélectionner</span>
                <span className="text-sm text-gray-500 ml-auto">
                  {filteredIncidents.length} intervention{filteredIncidents.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </Card>
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

export default Interventions;