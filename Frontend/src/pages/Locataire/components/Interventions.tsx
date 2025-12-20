import React, { useEffect, useMemo, useState } from 'react';
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

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://https://wheat-skunk-120710.hostingersite.com';

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

  // Shared input styles (clean, lisible)
  const inputBase =
    'w-full rounded-xl bg-white text-gray-900 placeholder:text-gray-400 ' +
    'border border-gray-200 px-3 py-3 text-sm shadow-sm ' +
    'focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500';

  const labelBase = 'text-sm font-semibold text-gray-900';
  const helperBase = 'text-xs text-gray-500 mt-1';

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
      } catch (e) {
        console.error(e);
        notify('Impossible de charger les incidents', 'error');
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

  const addSlot = () =>
    setSlots((prev) => [...prev, { date: '', from: '14:00', to: '18:00' }]);

  const removeSlot = (idx: number) => setSlots((prev) => prev.filter((_, i) => i !== idx));

  const updateSlot = (idx: number, patch: Partial<PreferredSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const onPickPhotos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setPhotoFiles((prev) => [...prev, ...arr].slice(0, 8));
  };

  const removePhoto = (idx: number) => setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));

  const refreshIncidents = async () => {
    const list = await tenantApi.getIncidents();
    setIncidents(list);
  };

  const handleSubmit = async () => {
    if (!propertyId) return notify('Choisis un bien', 'error');
    if (!title.trim()) return notify('Ajoute un titre', 'error');

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

      await refreshIncidents();
    } catch (e: any) {
      console.error(e);
      notify(e?.response?.data?.message || 'Erreur lors de l’envoi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tenantApi.deleteIncident(id);
      notify('Incident supprimé', 'success');
      await refreshIncidents();
    } catch (e) {
      console.error(e);
      notify('Impossible de supprimer', 'error');
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
        <p className="text-sm text-gray-600">
          Déclare un problème lié à ton bien (photos + disponibilités).
        </p>
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
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value ? Number(e.target.value) : '')}
              className={inputBase}
            >
              {leases.map((l) => (
                <option key={l.id} value={l.property?.id}>
                  {l.property?.address} — {l.property?.city}
                </option>
              ))}
            </select>

            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              {selectedMainImage ? (
                <img src={selectedMainImage} alt="Bien" className="w-full h-48 object-cover" />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm bg-gray-50">
                  Aucune photo du bien
                </div>
              )}

              <div className="p-4 border-t border-gray-100">
                <div className="font-semibold text-gray-900">
                  {selectedProperty?.address || '—'}
                </div>
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${inputBase} mt-2`}
                  placeholder="Ex : Fuite robinet cuisine"
                />
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputBase} mt-2 min-h-[120px]`}
                placeholder="Décris le problème, localisation, depuis quand..."
              />
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

              {photoFiles.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photoFiles.map((f, idx) => (
                    <div key={idx} className="relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="h-24 w-full object-cover" />
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
                        onChange={(e) => updateSlot(idx, { date: e.target.value })}
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
                        onChange={(e) => updateSlot(idx, { from: e.target.value })}
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
                        onChange={(e) => updateSlot(idx, { to: e.target.value })}
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
          <div className="text-sm text-gray-600">Suivi de tes incidents (statut, prestataire, résolution).</div>
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
