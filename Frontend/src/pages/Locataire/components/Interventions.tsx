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

// ✅ Fix valeur par défaut (ton code avait http://https://)
const apiBase =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'https://wheat-skunk-120710.hostingersite.com';

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
  // Réseau / serveur HS
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

  // Form
  const [propertyId, setPropertyId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('plumbing');
  const [priority, setPriority] = useState<IncidentPriority>('medium');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState<PreferredSlot[]>([{ date: '', from: '09:00', to: '12:00' }]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ✅ erreurs client side
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // ✅ refs pour focus
  const titleRef = useRef<HTMLInputElement | null>(null);
  const propertyRef = useRef<HTMLSelectElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  // Shared input styles (clean, lisible)
  const inputBase =
    'w-full rounded-xl bg-white text-gray-900 placeholder:text-gray-400 ' +
    'border border-gray-200 px-3 py-3 text-sm shadow-sm ' +
    'focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500';

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

        if (l?.[0]?.property?.id) setPropertyId(l[0].property.id);

        const list = await tenantApi.getIncidents();
        if (cancelled) return;
        setIncidents(list);
      } catch (e: any) {
        console.error(e);
        notify(normalizeApiError(e, 'Impossible de charger les incidents'), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [notify]);

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

  // ✅ previews (et cleanup pour éviter fuite mémoire)
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

    // ✅ petite validation “compréhensible”
    const tooMany = Math.max(0, photoFiles.length + arr.length - 8);
    if (tooMany > 0) notify('Maximum 8 photos. Les photos en trop ne seront pas ajoutées.', 'info');

    // (Optionnel) check taille 5MB
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

    // description optionnelle, mais si fournie on peut mettre un mini seuil
    if (description.trim() && description.trim().length < 10) {
      errs.description = 'Ajoute un peu plus de détails (au moins 10 caractères).';
    }

    // slots optionnels : si l’utilisateur a commencé à remplir un slot, il doit être complet
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
    // ✅ client-side validation
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

      // ✅ si backend renvoie errors{} Laravel 422, on “traduit” en messages simples
      const status = e?.response?.status;
      const fieldErrors = e?.response?.data?.errors;

      if (status === 422 && fieldErrors) {
        // mapping minimal (tu peux l’étendre selon ton backend)
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

      // ✅ message propre
      notify(normalizeApiError(e, 'Erreur lors de l’envoi'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tenantApi.deleteIncident(id);
      notify('Incident supprimé', 'success');
      await refreshIncidents();
    } catch (e: any) {
      console.error(e);
      notify(normalizeApiError(e, 'Impossible de supprimer'), 'error');
    }
  };

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
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
        <p className="text-sm text-gray-600">Déclare un problème lié à ton bien (photos + disponibilités).</p>
      </div>

      {/* CREATE FORM */}
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
            >
              {leases.map((l) => (
                <option key={l.id} value={l.property?.id}>
                  {l.property?.address} — {l.property?.city}
                </option>
              ))}
            </select>
            {formErrors.propertyId ? <p className={errorText}>{formErrors.propertyId}</p> : null}

            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              {selectedMainImage ? (
                <img src={selectedMainImage} alt="Bien" className="w-full h-48 object-cover" />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm bg-gray-50">
                  Aucune photo du bien
                </div>
              )}

              <div className="p-4 border-t border-gray-100">
                <div className="font-semibold text-gray-900">{selectedProperty?.address || '—'}</div>
                <div className="text-sm text-gray-600">
                  {(selectedProperty as any)?.zip_code || ''} {selectedProperty?.city || ''}
                </div>
              </div>
            </div>
          </div>

          {/* Incident details */}
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
                          ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-600/10'
                          : 'border-gray-200 bg-white hover:bg-gray-50',
                      ].join(' ')}
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={active ? 'text-blue-600' : 'text-gray-600'} size={18} />
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
              <p className={helperBase}>Localisation, depuis quand, impact (bruit, fuite, danger...).</p>
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formErrors.description) setFormErrors((p) => ({ ...p, description: undefined }));
                }}
                className={`${inputBase} mt-2 min-h-[120px]`}
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

                <label className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 cursor-pointer hover:text-blue-700">
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
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
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
                          title="Supprimer ce créneau"
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
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
                icon={<AlertTriangle size={18} />}
              >
                {submitting ? 'Envoi…' : 'Envoyer au propriétaire'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* LIST */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="text-lg font-bold text-gray-900">Historique</div>
          <div className="text-sm text-gray-600">
            Suivi de tes incidents (statut, prestataire, résolution).
          </div>
        </div>

        {incidents.length === 0 ? (
          <div className="py-10 text-center text-gray-600 text-sm bg-gray-50 rounded-2xl border border-gray-200">
            Aucun incident pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((it) => {
              const Icon = categoryMeta[it.category]?.icon || HelpCircle;
              const prop = it.property;

              return (
                <div
                  key={it.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{it.title}</div>
                        <div className="text-sm text-gray-600 truncate">
                          {prop ? `${prop.address} — ${prop.city}` : `Bien #${it.property_id}`}
                        </div>

                        {it.description ? (
                          <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                            {it.description}
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-2 mt-3 text-xs">
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                            {statusLabel(it.status)}
                          </span>

                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                            Priorité: {priorityMeta[it.priority]?.label || it.priority}
                          </span>

                          {it.assigned_provider ? (
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                              Prestataire: {it.assigned_provider}
                            </span>
                          ) : null}

                          {it.status === 'resolved' ? (
                            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 inline-flex items-center gap-1">
                              <CheckCircle size={14} /> Résolu
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(it.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Photos list */}
                  {it.photos?.length ? (
                    <div className="mt-4 flex gap-2 overflow-x-auto">
                      {it.photos.map((p, idx) => {
                        const url = p.startsWith('http') ? p : `${apiBase}/storage/${p}`;
                        return (
                          <img
                            key={idx}
                            src={url}
                            alt="incident"
                            className="h-20 w-28 object-cover rounded-xl border border-gray-200 bg-white shadow-sm"
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Interventions;
