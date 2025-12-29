import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Home,
  FileCheck,
  FileText,
  Calendar,
  Camera,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  X,
  User,
  Phone,
  Mail,
  Filter,
  RefreshCcw,
  ChevronDown,
} from 'lucide-react';

import {
  propertyService,
  type Property,
  conditionReportService,
  leaseService,
  type Lease,
  type PropertyConditionReport as ApiConditionReport,
} from '@/services/api';

type ConditionType = 'entry' | 'exit' | 'intermediate' | string;
type ConditionStatus = 'good' | 'satisfactory' | 'poor' | 'damaged';

interface PropertyConditionPhoto {
  id: number;
  path: string;
  original_filename?: string | null;
  mime_type?: string | null;
  size?: number | null;
  taken_at?: string | null;
  caption?: string | null;
  condition_status?: ConditionStatus | string | null;
  condition_notes?: string | null;
  url?: string;
}

type TenantLite = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type LeaseWithTenant = Lease & {
  tenant?: TenantLite | null;
};

interface PropertyConditionReport extends Omit<ApiConditionReport, 'photos' | 'lease'> {
  photos?: PropertyConditionPhoto[] | null;
  lease?: LeaseWithTenant | null;
}

type PhotoFormItem = {
  file: File;
  condition_status: ConditionStatus;
  condition_notes?: string;
};

const API_ORIGIN = 'https://wheat-skunk-120710.hostingersite.com';

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Date inconnue';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return dateStr;
  }
};

const getTypeLabel = (type: ConditionType) => {
  switch (type) {
    case 'entry':
      return "État des lieux d'entrée";
    case 'exit':
      return 'État des lieux de sortie';
    case 'intermediate':
      return 'État des lieux intermédiaire';
    default:
      return 'État des lieux';
  }
};

const getBadgeColor = (type: ConditionType) => {
  switch (type) {
    case 'entry':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'exit':
      return 'bg-rose-50 text-rose-700 ring-rose-200';
    case 'intermediate':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-200';
  }
};

const buildPublicPhotoUrl = (photo?: PropertyConditionPhoto | null) => {
  if (!photo) return '';
  if (photo.url) return photo.url;
  const path = (photo.path || '').replace(/^\/+/, '');
  return path ? `${API_ORIGIN}/storage/${path}` : '';
};

const statusLabel = (s: ConditionStatus) => {
  switch (s) {
    case 'good':
      return 'Bon';
    case 'satisfactory':
      return 'Correct';
    case 'poor':
      return 'Mauvais';
    case 'damaged':
      return 'Abîmé';
    default:
      return s;
  }
};

const fullName = (t?: TenantLite | null) => {
  if (!t) return '';
  const fn = (t.first_name || '').trim();
  const ln = (t.last_name || '').trim();
  return `${fn} ${ln}`.trim();
};

const leaseLabel = (lease: Lease, property: Property | null) => {
  const propName = property?.name || property?.reference_code || `Bien #${lease.property_id}`;
  const propAddr = property ? `${property.address}${property.city ? `, ${property.city}` : ''}` : '';
  const range = lease.start_date
    ? `${formatDate(lease.start_date)}${lease.end_date ? ` → ${formatDate(lease.end_date)}` : ''}`
    : '';

  return {
    title: `${propName}${propAddr ? ` — ${propAddr}` : ''}`,
    subtitle: `Bail #${lease.id} • ${lease.type} • ${lease.status}${range ? ` • ${range}` : ''}`,
  };
};

/** ✅ UI helpers */
const ui = {
  input:
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary',
  select:
    'w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary disabled:opacity-60',
  textarea:
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary resize-none',
  label: 'text-[11px] font-semibold text-slate-600 uppercase tracking-wider',
  card: 'rounded-2xl border border-slate-100 bg-white shadow-sm',
  softCard: 'rounded-2xl border border-slate-100 bg-slate-50/60',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
  btnGhost:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50',
};

const EtatsLieux: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const [reports, setReports] = useState<PropertyConditionReport[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedReport, setSelectedReport] = useState<PropertyConditionReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const [leasesForProperty, setLeasesForProperty] = useState<Lease[]>([]);
  const [isLoadingLeases, setIsLoadingLeases] = useState(false);

  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [formType, setFormType] = useState<ConditionType>('entry');
  const [formLeaseId, setFormLeaseId] = useState<number | ''>('');
  const [formReportDate, setFormReportDate] = useState<string>(today);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formPhotos, setFormPhotos] = useState<PhotoFormItem[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentProperty = properties.find((p) => p.id === selectedPropertyId) || null;

  useEffect(() => {
    const anyModalOpen = showCreateModal || !!selectedReport;
    document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCreateModal, selectedReport]);

  const resetForm = () => {
    setFormType('entry');
    setFormReportDate(today);
    setFormNotes('');
    setFormPhotos([]);
    setCreateError(null);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoadingProperties(true);
        setError(null);

        const res = await propertyService.listProperties();
        const list = res?.data || [];
        setProperties(list);

        if (list.length > 0 && !selectedPropertyId) setSelectedPropertyId(list[0].id);
      } catch (e: any) {
        console.error('Erreur chargement propriétés:', e);
        setError(e?.message || 'Impossible de charger les biens. Vérifiez vos droits ou réessayez plus tard.');
      } finally {
        setIsLoadingProperties(false);
      }
    };
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReports = useCallback(async (propertyId: number | null) => {
    if (!propertyId) return;

    try {
      setIsLoadingReports(true);
      setError(null);

      const list = await conditionReportService.listForProperty(propertyId);
      setReports(Array.isArray(list) ? (list as any) : []);
    } catch (e: any) {
      console.error('Erreur API listForProperty:', e);
      if (e?.response?.status === 403) {
        setError("Vous n'êtes pas autorisé à consulter les états des lieux de ce bien.");
      } else {
        setError(e?.response?.data?.message || e?.message || 'Impossible de charger les états des lieux.');
      }
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    loadReports(selectedPropertyId);
  }, [selectedPropertyId, loadReports]);

  useEffect(() => {
    const fetchLeases = async () => {
      if (!selectedPropertyId) {
        setLeasesForProperty([]);
        setFormLeaseId('');
        return;
      }

      try {
        setIsLoadingLeases(true);
        setCreateError(null);

        const allLeases = await leaseService.listLeases();
        const filtered = allLeases.filter((lease) => Number(lease.property_id) === Number(selectedPropertyId));

        setLeasesForProperty(filtered);

        if (filtered.length === 1) setFormLeaseId(filtered[0].id);
        else setFormLeaseId('');
      } catch (e: any) {
        console.error('Erreur chargement baux:', e);
        setCreateError(e?.response?.data?.message || e?.message || "Impossible de charger les baux pour ce bien.");
        setLeasesForProperty([]);
        setFormLeaseId('');
      } finally {
        setIsLoadingLeases(false);
      }
    };

    fetchLeases();
  }, [selectedPropertyId]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const d = (r.report_date || '').slice(0, 10);
      if (filterFrom && d < filterFrom) return false;
      if (filterTo && d > filterTo) return false;
      return true;
    });
  }, [reports, filterFrom, filterTo]);

  const entryReports = useMemo(() => filteredReports.filter((r) => r.type === 'entry'), [filteredReports]);
  const exitReports = useMemo(() => filteredReports.filter((r) => r.type === 'exit'), [filteredReports]);
  const otherReports = useMemo(() => filteredReports.filter((r) => !['entry', 'exit'].includes(r.type)), [filteredReports]);
  const totalReports = filteredReports.length;

  const onPickFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const mapped: PhotoFormItem[] = files.map((f) => ({
      file: f,
      condition_status: 'good',
      condition_notes: '',
    }));

    setFormPhotos((prev) => [...prev, ...mapped]);
  };

  const removePhotoItem = (idx: number) => setFormPhotos((prev) => prev.filter((_, i) => i !== idx));
  const updatePhotoItem = (idx: number, patch: Partial<PhotoFormItem>) =>
    setFormPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

  const openReport = async (reportId: number) => {
    if (!selectedPropertyId) return;
    try {
      setIsLoadingReport(true);
      const full = await conditionReportService.getForProperty(selectedPropertyId, reportId);
      setSelectedReport(full as any);
    } catch (e: any) {
      console.error('Erreur get report:', e);
      setError(e?.response?.data?.message || e?.message || 'Impossible de charger le détail.');
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleSubmitNewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) return;

    if (!formLeaseId) {
      setCreateError('Veuillez sélectionner un bail pour cet état des lieux.');
      return;
    }
    if (formPhotos.length === 0) {
      setCreateError('Veuillez ajouter au moins une photo.');
      return;
    }

    try {
      setIsSubmitting(true);
      setCreateError(null);

      await conditionReportService.createForProperty(selectedPropertyId, {
        lease_id: Number(formLeaseId),
        type: formType as 'entry' | 'exit' | 'intermediate',
        report_date: formReportDate,
        notes: formNotes || undefined,
        photos: formPhotos.map((p) => ({
          file: p.file,
          condition_status: p.condition_status,
          condition_notes: p.condition_notes || undefined,
        })) as any,
      });

      setShowCreateModal(false);
      resetForm();
      await loadReports(selectedPropertyId);
    } catch (e: any) {
      console.error('Erreur création état des lieux:', e);

      const msg = e?.response?.data?.message || e?.message || "Impossible d'enregistrer l'état des lieux.";
      const errorsObj = e?.response?.data?.errors;
      const errorsText = errorsObj
        ? Object.entries(errorsObj)
            .map(([k, v]: any) => `${k}: ${(v || []).join(', ')}`)
            .join('\n')
        : null;

      setCreateError(errorsText ? `${msg}\n${errorsText}` : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`${ui.card} p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">États des lieux</h1>
                <p className="text-sm text-slate-500 mt-0.5">Entrée • Sortie • Intermédiaire — suivi complet avec photos et signatures.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="min-w-[260px]">
              <div className="flex items-center justify-between">
                <span className={ui.label}>Bien</span>
                {isLoadingProperties && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Chargement…
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedPropertyId ?? ''}
                  onChange={(e) => setSelectedPropertyId(e.target.value ? Number(e.target.value) : null)}
                  disabled={isLoadingProperties || properties.length === 0}
                  className={`${ui.select} pl-10`}
                >
                  {properties.length === 0 && <option value="">Aucun bien disponible</option>}
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.reference_code || `Bien #${p.id}`} · {p.address}
                    </option>
                  ))}
                </select>
                <Home className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              disabled={!selectedPropertyId}
              className={ui.btnPrimary}
            >
              <Plus className="h-4 w-4" />
              Nouvel état des lieux
            </button>
          </div>
        </div>

        {currentProperty && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{currentProperty.name || currentProperty.reference_code || 'Bien sélectionné'}</p>
              <p className="text-xs text-slate-500 truncate">
                {currentProperty.address} · {currentProperty.city}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">{totalReports}</span> état(s) des lieux (filtrés)
            </div>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className={`${ui.card} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-2xl bg-slate-900/5 flex items-center justify-center text-slate-700">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Filtres</p>
            <p className="text-xs text-slate-500">Affiner par date de création de l’état des lieux.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={ui.label}>Du</label>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className={ui.input} />
          </div>
          <div>
            <label className={ui.label}>Au</label>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className={ui.input} />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setFilterFrom('');
                setFilterTo('');
              }}
              className={`${ui.btnGhost} w-full`}
            >
              <RefreshCcw className="h-4 w-4" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Une erreur est survenue</p>
            <p className="mt-1 whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="Entrées" value={entryReports.length} tone="emerald" />
        <StatCard title="Sorties" value={exitReports.length} tone="rose" />
        <StatCard title="Autres / Total" value={`${otherReports.length} / ${totalReports}`} tone="amber" />
      </div>

      {/* Loader */}
      {isLoadingReports && (
        <div className={`${ui.card} p-8 flex items-center justify-center text-slate-500 gap-2`}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Chargement des états des lieux…</span>
        </div>
      )}

      {/* Liste vide */}
      {!isLoadingReports && totalReports === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
          <FileCheck className="w-9 h-9 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-800">Aucun état des lieux pour ce filtre</p>
          <p className="text-xs text-slate-500 mt-1">Change le filtre de date ou crée un nouvel état des lieux.</p>
        </div>
      )}

      {/* Liste */}
      {!isLoadingReports && totalReports > 0 && (
        <div className="space-y-6">
          <SectionEtats title="États des lieux d’entrée" reports={entryReports} emptyMessage="Aucun état des lieux d'entrée." onOpen={openReport} />
          <SectionEtats title="États des lieux de sortie" reports={exitReports} emptyMessage="Aucun état des lieux de sortie." onOpen={openReport} />
          <SectionEtats title="États des lieux intermédiaires / autres" reports={otherReports} emptyMessage="Aucun état des lieux intermédiaire." onOpen={openReport} />
        </div>
      )}

      {/* ✅ Modal création — FIX: layout flex + footer toujours visible + submit correct */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-sm p-4">
          <div className="mx-auto flex min-h-full w-full items-center justify-center">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 p-6 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Nouvel état des lieux</h2>
                  <p className="text-xs text-slate-500 mt-1">Type • Bail • Date • Notes • Photos (statut + note par photo)</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body scrollable */}
              <div className="p-6 overflow-y-auto flex-1">
                {createError && (
                  <div className="flex items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700 mb-4">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <p className="whitespace-pre-line">{createError}</p>
                  </div>
                )}

                <form id="create-condition-report-form" onSubmit={handleSubmitNewReport} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={ui.label}>Type</label>
                      <div className="relative">
                        <select value={formType} onChange={(e) => setFormType(e.target.value as ConditionType)} className={ui.select}>
                          <option value="entry">Entrée</option>
                          <option value="exit">Sortie</option>
                          <option value="intermediate">Intermédiaire</option>
                        </select>
                        <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className={ui.label}>Date</label>
                      <div className="relative">
                        <input type="date" value={formReportDate} onChange={(e) => setFormReportDate(e.target.value)} className={ui.input} />
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={ui.label}>
                      Bail associé <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formLeaseId}
                        onChange={(e) => setFormLeaseId(e.target.value ? Number(e.target.value) : '')}
                        disabled={isLoadingLeases || leasesForProperty.length === 0}
                        className={ui.select}
                      >
                        {isLoadingLeases && <option value="">Chargement des baux…</option>}
                        {!isLoadingLeases && leasesForProperty.length === 0 && <option value="">Aucun bail pour ce bien (crée un bail avant)</option>}
                        {!isLoadingLeases && leasesForProperty.length > 0 && !formLeaseId && <option value="">Sélectionner un bail</option>}
                        {leasesForProperty.map((lease) => {
                          const { title, subtitle } = leaseLabel(lease, currentProperty);
                          return (
                            <option key={lease.id} value={lease.id}>
                              {title} — {subtitle}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className={ui.label}>Notes (optionnel)</label>
                    <textarea
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Observations générales, état des pièces, remarques importantes…"
                      className={ui.textarea}
                    />
                  </div>

                  <div>
                    <label className={ui.label}>
                      Photos <span className="text-rose-500">*</span>
                    </label>

                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => onPickFiles(e.target.files)}
                        className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:text-white file:px-3 file:py-2 file:text-xs file:font-semibold hover:file:opacity-90 cursor-pointer"
                      />
                      <p className="mt-2 text-[11px] text-slate-500">Ajoute plusieurs photos. Renseigne un statut + une note par photo si besoin.</p>
                    </div>
                  </div>

                  {formPhotos.length > 0 && (
                    <div className="space-y-3">
                      {formPhotos.map((p, idx) => (
                        <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{p.file.name}</p>
                              <p className="text-[11px] text-slate-500">{Math.round(p.file.size / 1024)} Ko</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removePhotoItem(idx)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-2 py-2 text-slate-600 hover:text-rose-600 hover:bg-slate-50"
                              title="Retirer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={ui.label}>Statut</label>
                              <div className="relative">
                                <select
                                  value={p.condition_status}
                                  onChange={(e) => updatePhotoItem(idx, { condition_status: e.target.value as ConditionStatus })}
                                  className={ui.select}
                                >
                                  <option value="good">Bon</option>
                                  <option value="satisfactory">Correct</option>
                                  <option value="poor">Mauvais</option>
                                  <option value="damaged">Abîmé</option>
                                </select>
                                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className={ui.label}>Note (optionnel)</label>
                              <input
                                value={p.condition_notes || ''}
                                onChange={(e) => updatePhotoItem(idx, { condition_notes: e.target.value })}
                                className={ui.input}
                                placeholder="ex: fissure mur salon"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ✅ padding bottom pour éviter que le dernier bloc “colle” au footer */}
                  <div className="h-2" />
                </form>
              </div>

              {/* Footer sticky (non scroll) */}
              <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => setShowCreateModal(false)} className={ui.btnGhost}>
                  Annuler
                </button>
                <button
                  type="submit"
                  form="create-condition-report-form"
                  disabled={isSubmitting || !selectedPropertyId}
                  className={ui.btnPrimary}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails (inchangé) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-sm p-4">
          <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">
            <div className="w-full rounded-3xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden">
              <div className="flex items-start justify-between gap-3 p-6 border-b border-slate-100">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 truncate">{getTypeLabel(selectedReport.type)}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(selectedReport.report_date)} • ID #{selectedReport.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-78px)]">
                {isLoadingReport ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Chargement du détail…</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                      <div className={`${ui.softCard} p-4`}>
                        <p className={ui.label}>Bail associé</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">Bail #{selectedReport.lease_id}</p>

                        {selectedReport.lease?.tenant ? (
                          <div className="mt-3 space-y-2 text-xs text-slate-700">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold">Locataire :</span>
                              <span className="truncate">{fullName(selectedReport.lease.tenant) || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold">Email :</span>
                              <span className="truncate">{selectedReport.lease.tenant.email || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold">Téléphone :</span>
                              <span className="truncate">{selectedReport.lease.tenant.phone || '—'}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 mt-2">Locataire non chargé (ajoute `lease.tenant` côté backend).</p>
                        )}
                      </div>

                      {selectedReport.notes && (
                        <div className={`${ui.card} p-4`}>
                          <p className={ui.label}>Notes</p>
                          <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{selectedReport.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Photos</p>
                          <p className="text-xs text-slate-500">{selectedReport.photos?.length || 0} élément(s)</p>
                        </div>
                      </div>

                      {!selectedReport.photos || selectedReport.photos.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-500">
                          Aucune photo
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {selectedReport.photos.map((ph) => (
                            <div key={ph.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                              <img src={buildPublicPhotoUrl(ph)} alt={ph.caption || 'Photo'} className="w-full h-56 object-cover" loading="lazy" />
                              <div className="p-3 text-xs text-slate-600 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span>{formatDate(ph.taken_at)}</span>
                                  {ph.condition_status && (
                                    <span className="text-slate-900 font-semibold">
                                      {statusLabel(ph.condition_status as ConditionStatus)}
                                    </span>
                                  )}
                                </div>
                                {ph.caption && (
                                  <div>
                                    <span className="font-semibold">Caption :</span> {ph.caption}
                                  </div>
                                )}
                                {ph.condition_notes && (
                                  <div>
                                    <span className="font-semibold">Note :</span> {ph.condition_notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: any; tone: 'emerald' | 'rose' | 'amber' }> = ({ title, value, tone }) => {
  const toneMap: Record<string, { bg: string; icon: string }> = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  };

  return (
    <div className={`${ui.card} p-4 flex items-center gap-3`}>
      <div className={`h-10 w-10 rounded-2xl ${toneMap[tone].bg} flex items-center justify-center`}>
        <FileText className={`h-4 w-4 ${toneMap[tone].icon}`} />
      </div>
      <div>
        <p className={ui.label}>{title}</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  reports: PropertyConditionReport[];
  emptyMessage: string;
  onOpen: (id: number) => void;
}

const SectionEtats: React.FC<SectionProps> = ({ title, reports, emptyMessage, onOpen }) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-primary" />
          {title}
          <span className="text-xs font-medium text-slate-400">({reports.length})</span>
        </h2>
      </div>

      {reports.length === 0 ? (
        <p className="text-xs text-slate-500 italic">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {reports.map((report) => {
            const photos = report.photos || [];
            const firstPhoto = photos[0] || null;
            const badgeColor = getBadgeColor(report.type as ConditionType);
            const previewUrl = buildPublicPhotoUrl(firstPhoto);
            const tenantName = report.lease?.tenant ? fullName(report.lease.tenant) : '';

            return (
              <article
                key={report.id}
                onClick={() => onOpen(report.id)}
                className="group cursor-pointer rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-44 bg-slate-100 relative">
                    {firstPhoto ? (
                      previewUrl ? (
                        <img src={previewUrl} alt="Aperçu" className="w-full h-44 sm:h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-44 sm:h-full bg-slate-200 flex items-center justify-center text-[11px] text-slate-500 p-2 text-center">
                          <Camera className="w-4 h-4 mr-1" />
                          <span>Photo sans URL</span>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-44 sm:h-full flex flex-col items-center justify-center text-[11px] text-slate-400 gap-1">
                        <Camera className="w-4 h-4" />
                        <span>Pas de photo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(report.report_date)}
                        </p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{getTypeLabel(report.type as ConditionType)}</p>

                        {tenantName && (
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            Locataire : <span className="text-slate-700 font-semibold">{tenantName}</span>
                          </p>
                        )}
                      </div>

                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${badgeColor}`}>
                        ID #{report.id}
                      </span>
                    </div>

                    {report.notes && <p className="text-xs text-slate-600 line-clamp-3">{report.notes}</p>}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Camera className="w-3 h-3" />
                        <span className="font-medium">{photos.length}</span> photo(s)
                      </div>

                      {(report as any).signed_by && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="font-semibold">Signé</span>
                        </div>
                      )}
                    </div>

                    {firstPhoto?.condition_status && (
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold">Statut :</span> {statusLabel(firstPhoto.condition_status as ConditionStatus)}
                        {firstPhoto.condition_notes ? (
                          <>
                            {' '}
                            • <span className="font-semibold">Note :</span> {firstPhoto.condition_notes}
                          </>
                        ) : null}
                      </div>
                    )}

                    <div className="pt-2 text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition">
                      Ouvrir le détail →
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default EtatsLieux;
