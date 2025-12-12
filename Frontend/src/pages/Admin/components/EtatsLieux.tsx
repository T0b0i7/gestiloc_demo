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

const API_ORIGIN = 'http://localhost:8000';

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Date inconnue';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
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
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    case 'exit':
      return 'bg-rose-50 text-rose-700 ring-rose-100';
    case 'intermediate':
      return 'bg-amber-50 text-amber-700 ring-amber-100';
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-100';
  }
};

const buildPublicPhotoUrl = (photo?: PropertyConditionPhoto | null) => {
  if (!photo) return '';
  if (photo.url) return photo.url;

  const path = photo.path?.replace(/^\/+/, '');
  return path ? `${API_ORIGIN}/storage/${path}` : '';
};

const leaseLabel = (lease: Lease, property: Property | null) => {
  const propName =
    property?.name || property?.reference_code || `Bien #${lease.property_id}`;

  const propAddr = property
    ? `${property.address}${property.city ? `, ${property.city}` : ''}`
    : '';

  const range = lease.start_date
    ? `${formatDate(lease.start_date)}${lease.end_date ? ` → ${formatDate(lease.end_date)}` : ''}`
    : '';

  return {
    title: `${propName}${propAddr ? ` — ${propAddr}` : ''}`,
    subtitle: `Bail #${lease.id} • ${lease.type} • ${lease.status}${range ? ` • ${range}` : ''}`,
  };
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

const EtatsLieux: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const [reports, setReports] = useState<PropertyConditionReport[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // ✅ Modal détails
  const [selectedReport, setSelectedReport] = useState<PropertyConditionReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Baux du bien sélectionné
  const [leasesForProperty, setLeasesForProperty] = useState<Lease[]>([]);
  const [isLoadingLeases, setIsLoadingLeases] = useState(false);

  // Filtre dates
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');

  // Form
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [formType, setFormType] = useState<ConditionType>('entry');
  const [formLeaseId, setFormLeaseId] = useState<number | ''>('');
  const [formReportDate, setFormReportDate] = useState<string>(today);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formPhotos, setFormPhotos] = useState<PhotoFormItem[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentProperty = properties.find((p) => p.id === selectedPropertyId) || null;

  // ✅ Bloquer scroll derrière quand une modal est ouverte
  useEffect(() => {
    const anyModalOpen = showCreateModal || !!selectedReport;
    if (anyModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
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

  // Charger propriétés
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoadingProperties(true);
        setError(null);

        const res = await propertyService.listProperties();
        const list = res?.data || [];
        setProperties(list);

        if (list.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(list[0].id);
        }
      } catch (e: any) {
        console.error('Erreur chargement propriétés:', e);
        setError(
          e?.message ||
            'Impossible de charger les biens. Vérifiez vos droits ou réessayez plus tard.'
        );
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Charger reports (backend = tableau simple)
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
        setError(
          e?.response?.data?.message ||
            e?.message ||
            'Impossible de charger les états des lieux.'
        );
      }
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    loadReports(selectedPropertyId);
  }, [selectedPropertyId, loadReports]);

  // Charger baux du bien
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
        const filtered = allLeases.filter(
          (lease) => Number(lease.property_id) === Number(selectedPropertyId)
        );

        setLeasesForProperty(filtered);

        if (filtered.length === 1) setFormLeaseId(filtered[0].id);
        else setFormLeaseId('');
      } catch (e: any) {
        console.error('Erreur chargement baux:', e);
        setCreateError(
          e?.response?.data?.message || e?.message || "Impossible de charger les baux pour ce bien."
        );
        setLeasesForProperty([]);
        setFormLeaseId('');
      } finally {
        setIsLoadingLeases(false);
      }
    };

    fetchLeases();
  }, [selectedPropertyId]);

  // ✅ Filtre dates (front)
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const d = (r.report_date || '').slice(0, 10);
      if (filterFrom && d < filterFrom) return false;
      if (filterTo && d > filterTo) return false;
      return true;
    });
  }, [reports, filterFrom, filterTo]);

  // Regroupement
  const entryReports = useMemo(
    () => filteredReports.filter((r) => r.type === 'entry'),
    [filteredReports]
  );
  const exitReports = useMemo(
    () => filteredReports.filter((r) => r.type === 'exit'),
    [filteredReports]
  );
  const otherReports = useMemo(
    () => filteredReports.filter((r) => !['entry', 'exit'].includes(r.type)),
    [filteredReports]
  );
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

  const removePhotoItem = (idx: number) => {
    setFormPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePhotoItem = (idx: number, patch: Partial<PhotoFormItem>) => {
    setFormPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  // ✅ Ouvrir modal détails (getForProperty)
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

      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Impossible d'enregistrer l'état des lieux.";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-primary" />
            États des lieux
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Suivi des états des lieux d&apos;entrée, de sortie et intermédiaires.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-3">
          {/* Sélecteur de bien */}
          <div className="flex flex-col items-stretch gap-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Bien concerné
            </label>
            <div className="relative">
              <select
                value={selectedPropertyId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedPropertyId(v ? Number(v) : null);
                }}
                disabled={isLoadingProperties || properties.length === 0}
                className="pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-w-[280px]"
              >
                {properties.length === 0 && <option value="">Aucun bien disponible</option>}
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.reference_code || `Bien #${p.id}`} · {p.address}
                  </option>
                ))}
              </select>
              <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Bouton nouveau */}
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            disabled={!selectedPropertyId}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-medium px-4 py-2.5 shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Nouvel état des lieux
          </button>
        </div>
      </div>

      {/* Filtre date */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Du</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Au</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setFilterFrom('');
              setFilterTo('');
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Info bien */}
      {currentProperty && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {currentProperty.name || currentProperty.reference_code || 'Bien sélectionné'}
              </p>
              <p className="text-xs text-slate-500">
                {currentProperty.address} · {currentProperty.city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {totalReports} état(s) des lieux (filtrés)
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Une erreur est survenue</p>
            <p className="mt-0.5 whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Entrées</p>
            <p className="text-lg font-semibold text-slate-900">{entryReports.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Sorties</p>
            <p className="text-lg font-semibold text-slate-900">{exitReports.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Autres & total</p>
            <p className="text-lg font-semibold text-slate-900">
              {otherReports.length} / {totalReports}
            </p>
          </div>
        </div>
      </div>

      {/* Loader */}
      {isLoadingReports && (
        <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Chargement des états des lieux...</span>
        </div>
      )}

      {/* Liste vide */}
      {!isLoadingReports && totalReports === 0 && !error && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center">
          <FileCheck className="w-8 h-8 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-800">
            Aucun état des lieux pour ce filtre
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Change le filtre de date ou crée un nouvel état des lieux.
          </p>
        </div>
      )}

      {/* Liste */}
      {!isLoadingReports && totalReports > 0 && (
        <div className="space-y-6">
          <SectionEtats
            title="États des lieux d’entrée"
            reports={entryReports}
            emptyMessage="Aucun état des lieux d'entrée."
            onOpen={openReport}
          />
          <SectionEtats
            title="États des lieux de sortie"
            reports={exitReports}
            emptyMessage="Aucun état des lieux de sortie."
            onOpen={openReport}
          />
          <SectionEtats
            title="États des lieux intermédiaires / autres"
            reports={otherReports}
            emptyMessage="Aucun état des lieux intermédiaire."
            onOpen={openReport}
          />
        </div>
      )}

      {/* ✅ Modal création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="mx-auto flex min-h-full w-full max-w-2xl items-center justify-center">
            <div className="w-full rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[90vh] overflow-hidden">
              <div className="flex items-start justify-between gap-3 p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Nouvel état des lieux</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Type • Bail • Date • Notes • Photos (statut + note par photo)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-78px)]">
                {createError && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700 mb-4">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <p className="whitespace-pre-line">{createError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitNewReport} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        Type d&apos;état des lieux
                      </label>
                      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as ConditionType)}
                          className="w-full rounded-xl bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="entry">Entrée</option>
                          <option value="exit">Sortie</option>
                          <option value="intermediate">Intermédiaire</option>
                        </select>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">Date</label>
                      <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm">
                        <input
                          type="date"
                          value={formReportDate}
                          onChange={(e) => setFormReportDate(e.target.value)}
                          className="w-full rounded-xl bg-white px-3 py-3 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Bail */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Bail associé <span className="text-rose-500">*</span>
                    </label>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                      <select
                        value={formLeaseId}
                        onChange={(e) =>
                          setFormLeaseId(e.target.value ? Number(e.target.value) : '')
                        }
                        disabled={isLoadingLeases || leasesForProperty.length === 0}
                        className="w-full rounded-xl bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                      >
                        {isLoadingLeases && <option value="">Chargement des baux...</option>}

                        {!isLoadingLeases && leasesForProperty.length === 0 && (
                          <option value="">Aucun bail pour ce bien (crée un bail avant)</option>
                        )}

                        {!isLoadingLeases && leasesForProperty.length > 0 && !formLeaseId && (
                          <option value="">Sélectionner un bail</option>
                        )}

                        {leasesForProperty.map((lease) => {
                          const { title, subtitle } = leaseLabel(lease, currentProperty);
                          return (
                            <option key={lease.id} value={lease.id}>
                              {title} — {subtitle}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Notes (optionnel)</label>
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                      <textarea
                        rows={3}
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="Observations générales, état des pièces, remarques importantes..."
                        className="w-full rounded-xl bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      />
                    </div>
                  </div>

                  {/* Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Photos <span className="text-rose-500">*</span>
                    </label>

                    <div className="rounded-xl border border-dashed border-slate-300 bg-white shadow-sm p-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => onPickFiles(e.target.files)}
                        className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:px-3 file:py-2 file:text-xs file:font-medium hover:file:opacity-90 cursor-pointer"
                      />
                      <p className="mt-2 text-[11px] text-slate-500">
                        Ajoute plusieurs photos. Tu peux renseigner un statut + une note par photo.
                      </p>
                    </div>
                  </div>

                  {/* Liste photos */}
                  {formPhotos.length > 0 && (
                    <div className="space-y-3">
                      {formPhotos.map((p, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {p.file.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {Math.round(p.file.size / 1024)} Ko
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removePhotoItem(idx)}
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-slate-500 hover:text-rose-600 hover:bg-slate-50"
                              title="Retirer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-[11px] font-medium text-slate-600">
                                Statut
                              </label>
                              <div className="rounded-xl border border-slate-200 bg-white">
                                <select
                                  value={p.condition_status}
                                  onChange={(e) =>
                                    updatePhotoItem(idx, {
                                      condition_status: e.target.value as ConditionStatus,
                                    })
                                  }
                                  className="w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                  <option value="good">Bon</option>
                                  <option value="satisfactory">Correct</option>
                                  <option value="poor">Mauvais</option>
                                  <option value="damaged">Abîmé</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[11px] font-medium text-slate-600">
                                Note (optionnel)
                              </label>
                              <div className="rounded-xl border border-slate-200 bg-white">
                                <input
                                  value={p.condition_notes || ''}
                                  onChange={(e) =>
                                    updatePhotoItem(idx, { condition_notes: e.target.value })
                                  }
                                  className="w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                  placeholder="ex: fissure mur salon"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedPropertyId}
                      className="px-3 py-2 text-sm rounded-lg bg-primary text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal détails */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center">
            <div className="w-full rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[90vh] overflow-hidden">
              <div className="flex items-start justify-between gap-3 p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {getTypeLabel(selectedReport.type)}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(selectedReport.report_date)} • ID #{selectedReport.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-78px)] space-y-6">
                {isLoadingReport ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Chargement du détail...</span>
                  </div>
                ) : (
                  <>
                    {/* Bloc bail + locataire */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">Bail associé</p>
                      <p className="text-sm font-medium text-slate-900">
                        Bail #{selectedReport.lease_id}
                      </p>

                      {selectedReport.lease?.tenant ? (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">Locataire :</span>
                            <span className="truncate">
                              {fullName(selectedReport.lease.tenant) || '—'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">Email :</span>
                            <span className="truncate">
                              {selectedReport.lease.tenant.email || '—'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">Téléphone :</span>
                            <span className="truncate">
                              {selectedReport.lease.tenant.phone || '—'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2">
                          Locataire non chargé (ajoute `lease.tenant` dans le backend).
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    {selectedReport.notes && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">Notes</p>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 whitespace-pre-line">
                          {selectedReport.notes}
                        </div>
                      </div>
                    )}

                    {/* Photos */}
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        Photos ({selectedReport.photos?.length || 0})
                      </p>

                      {(!selectedReport.photos || selectedReport.photos.length === 0) ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                          Aucune photo
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(selectedReport.photos || []).map((ph) => (
                            <div key={ph.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                              <img
                                src={buildPublicPhotoUrl(ph)}
                                alt={ph.caption || 'Photo'}
                                className="w-full h-56 object-cover"
                                loading="lazy"
                              />
                              <div className="p-3 text-xs text-slate-600 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span>{formatDate(ph.taken_at)}</span>
                                  {ph.condition_status && (
                                    <span className="text-slate-800 font-medium">
                                      {statusLabel(ph.condition_status as ConditionStatus)}
                                    </span>
                                  )}
                                </div>
                                {ph.caption && (
                                  <div>
                                    <span className="font-medium">Caption :</span> {ph.caption}
                                  </div>
                                )}
                                {ph.condition_notes && (
                                  <div>
                                    <span className="font-medium">Note :</span> {ph.condition_notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
      <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
        <FileCheck className="w-4 h-4 text-primary" />
        {title}
        <span className="text-xs font-normal text-slate-400">({reports.length})</span>
      </h2>

      {reports.length === 0 ? (
        <p className="text-xs text-slate-500 italic">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                className="cursor-pointer rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Aperçu photo */}
                  <div className="md:w-40 bg-slate-100 flex items-center justify-center relative">
                    {firstPhoto ? (
                      previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Aperçu"
                          className="w-full h-40 md:h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-40 md:h-full bg-slate-200 flex items-center justify-center text-[11px] text-slate-500 p-2 text-center">
                          <Camera className="w-4 h-4 mr-1" />
                          <span>Photo sans URL</span>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-40 md:h-full flex flex-col items-center justify-center text-[11px] text-slate-400 gap-1">
                        <Camera className="w-4 h-4" />
                        <span>Pas de photo</span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(report.report_date)}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {getTypeLabel(report.type as ConditionType)}
                        </p>

                        {/* Locataire (si chargé) */}
                        {tenantName && (
                          <p className="text-xs text-slate-500 mt-1">
                            Locataire : <span className="text-slate-700 font-medium">{tenantName}</span>
                          </p>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${badgeColor}`}
                      >
                        ID #{report.id}
                      </span>
                    </div>

                    {report.notes && (
                      <p className="text-xs text-slate-600 line-clamp-3">{report.notes}</p>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Camera className="w-3 h-3" />
                        <span>{photos.length} photo(s)</span>
                      </div>

                      {report.signed_by && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Signé</span>
                        </div>
                      )}
                    </div>

                    {/* Détails rapides photo */}
                    {firstPhoto?.condition_status && (
                      <div className="text-[11px] text-slate-600">
                        <span className="font-medium">Statut :</span>{' '}
                        {statusLabel(firstPhoto.condition_status as ConditionStatus)}
                        {firstPhoto.condition_notes ? (
                          <>
                            {' '}
                            • <span className="font-medium">Note :</span>{' '}
                            {firstPhoto.condition_notes}
                          </>
                        ) : null}
                      </div>
                    )}
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
