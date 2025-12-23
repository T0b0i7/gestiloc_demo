import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  Wrench,
  XCircle,
  Save,
  CalendarDays,
  User,
  Home,
  MessageSquareText,
  FileText,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

import { leaseService } from "@/services/api";
import { noticeService, Notice, NoticeStatus, NoticeType } from "@/services/noticeService";

type LeaseLite = any;

const isoToday = () => new Date().toISOString().slice(0, 10);

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
  return dt.toLocaleDateString();
};

const statusLabel: Record<NoticeStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
};

function StatusBadge({ status }: { status: NoticeStatus }) {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold border";
  if (status === "pending")
    return (
      <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>
        <Clock3 size={14} /> En attente
      </span>
    );
  if (status === "confirmed")
    return (
      <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}>
        <CheckCircle2 size={14} /> Confirmé
      </span>
    );
  return (
    <span className={`${base} border-rose-200 bg-rose-50 text-rose-700`}>
      <XCircle size={14} /> Annulé
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-700">
      {children}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">{children}</div>;
}

function Select({
  value,
  onChange,
  disabled,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full appearance-none rounded-2xl
          bg-white text-gray-900
          border border-blue-200
          px-4 py-3 pr-10
          text-sm font-extrabold
          outline-none
          focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400
          disabled:opacity-60 disabled:cursor-not-allowed
          transition
        "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">▾</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full rounded-2xl bg-white text-gray-900
        border border-blue-200
        px-4 py-3
        text-sm font-semibold
        placeholder:text-gray-400
        outline-none
        focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400
        disabled:opacity-60 disabled:cursor-not-allowed
        transition
      "
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <textarea
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full min-h-[110px] resize-none rounded-2xl bg-white text-gray-900
        border border-blue-200
        px-4 py-3
        text-sm font-semibold
        placeholder:text-gray-400
        outline-none
        focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400
        disabled:opacity-60 disabled:cursor-not-allowed
        transition
      "
    />
  );
}

/** ✅ Helpers erreurs / notifications (modale vs page) */
type NotifyType = "success" | "info" | "error";

type ApiErr = {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
  request?: unknown;
  message?: string;
};

function looksTechnical(msg?: string) {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("sql") ||
    m.includes("exception") ||
    m.includes("stack") ||
    m.includes("trace") ||
    m.includes("undefined") ||
    m.includes("vendor/") ||
    m.includes("laravel") ||
    m.includes("symfony")
  );
}

function normalizeApiError(err: ApiErr, fallback: string) {
  if (err?.request && !err?.response) return "Le serveur ne répond pas. Vérifie ta connexion puis réessaie.";
  const status = err?.response?.status;

  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 413) return "Fichiers trop volumineux.";
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessaie dans quelques instants.";

  const backendMsg =
    err?.response?.data?.message?.trim() ||
    err?.response?.data?.error?.trim() ||
    err?.message?.trim();

  if (backendMsg && !looksTechnical(backendMsg)) return backendMsg;

  return fallback;
}

export default function LandlordNoticesPage({
  notify,
}: {
  notify?: (msg: string, type: NotifyType) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [leases, setLeases] = useState<LeaseLite[]>([]);

  // ✅ erreurs séparées
  const [pageError, setPageError] = useState<string | null>(null);   // fetchAll
  const [modalError, setModalError] = useState<string | null>(null); // create modal
  const [inlineError, setInlineError] = useState<string | null>(null); // actions list (optionnel)

  // Filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<NoticeStatus | "all">("all");
  const [type, setType] = useState<"all" | "tenant" | "landlord">("all");

  // Save state
  const [savingId, setSavingId] = useState<number | null>(null);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | "">("");
  const [noticeType, setNoticeType] = useState<NoticeType>("landlord"); // ✅ bailleur crée
  const [endDate, setEndDate] = useState<string>(isoToday());
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // notes internes par notice (bailleur)
  const [draftNotes, setDraftNotes] = useState<Record<number, string>>({});

  const pushNotify = (msg: string, type: NotifyType) => {
    if (notify) notify(msg, type);
    else alert(msg);
  };

  const selectedLease = useMemo(() => {
    if (!selectedLeaseId) return null;
    return leases.find((l: any) => Number(l.id) === Number(selectedLeaseId)) || null;
  }, [selectedLeaseId, leases]);

  const computedPropertyId = useMemo(() => {
    return selectedLease?.property_id ?? selectedLease?.property?.id ?? null;
  }, [selectedLease]);

  const tenantLabel = useMemo(() => {
    const t = selectedLease?.tenant;
    if (!t) return "—";
    const name = `${t.first_name || ""} ${t.last_name || ""}`.trim();
    return name || t?.user?.email || "Locataire";
  }, [selectedLease]);

  const propertyLabel = useMemo(() => {
    const p = selectedLease?.property;
    if (!p) return "—";
    const city = p.city ? `, ${p.city}` : "";
    return `${p.address || "Sans adresse"}${city}`;
  }, [selectedLease]);

  const fetchAll = async () => {
    setLoading(true);
    setPageError(null);
    setInlineError(null);
    try {
      const [leasesRes, noticesRes] = await Promise.all([leaseService.listLeases(), noticeService.list()]);
      const leasesArr = Array.isArray(leasesRes) ? leasesRes : [];
      const noticesArr = Array.isArray(noticesRes) ? noticesRes : [];

      setLeases(leasesArr);
      setItems(noticesArr);

      const map: Record<number, string> = {};
      noticesArr.forEach((n) => (map[n.id] = n.notes || ""));
      setDraftNotes(map);
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Erreur lors du chargement.");
      setPageError(msg);
      pushNotify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetCreate = () => {
    setSelectedLeaseId("");
    setNoticeType("landlord");
    setEndDate(isoToday());
    setReason("");
    setNotes("");
    setModalError(null);
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return items
      .filter((it) => {
        const matchesStatus = status === "all" ? true : it.status === status;
        const matchesType = type === "all" ? true : it.type === type;

        const tenantName = `${it.tenant?.first_name || ""} ${it.tenant?.last_name || ""}`.trim();
        const tenantEmail = it.tenant?.user?.email || "";
        const propLine = [it.property?.address, it.property?.city].filter(Boolean).join(" ");

        const blob = [it.reason, it.notes, it.type, tenantName, tenantEmail, propLine]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQ = needle ? blob.includes(needle) : true;
        return matchesStatus && matchesType && matchesQ;
      })
      .sort((a, b) => {
        const prio = (s: NoticeStatus) => (s === "pending" ? 0 : s === "confirmed" ? 1 : 2);
        const pa = prio(a.status);
        const pb = prio(b.status);
        if (pa !== pb) return pa - pb;

        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
  }, [items, q, status, type]);

  const quickUpdate = async (id: number, payload: Partial<Pick<Notice, "status" | "notes">>) => {
    setSavingId(id);
    setInlineError(null);
    try {
      const updated = await noticeService.update(id, payload);
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      setDraftNotes((prev) => ({ ...prev, [id]: updated.notes || "" }));
      pushNotify("Mise à jour enregistrée.", "success");
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Erreur lors de la mise à jour.");
      setInlineError(msg);
      pushNotify(msg, "error");
    } finally {
      setSavingId(null);
    }
  };

  const saveNotes = async (id: number) => {
    const n = draftNotes[id] ?? "";
    await quickUpdate(id, { notes: n || null });
  };

  const handleCreate = async () => {
    // ✅ erreur dans la modale uniquement
    setModalError(null);

    if (!selectedLease || !computedPropertyId) {
      const msg = "Choisis une location valide.";
      setModalError(msg);
      return;
    }
    if (!endDate) {
      const msg = "Choisis une date de libération.";
      setModalError(msg);
      return;
    }
    const r = (reason || "").trim();
    if (!r) {
      const msg = "Ajoute une raison (motif du préavis).";
      setModalError(msg);
      return;
    }

    setBusy(true);

    try {
      await noticeService.create({
        property_id: Number(computedPropertyId),
        lease_id: Number(selectedLease.id),
        type: noticeType,
        reason: r,
        notice_date: isoToday(),
        end_date: endDate,
        notes: notes || null,
      });

      pushNotify("Préavis créé.", "success");
      setOpenCreate(false);
      resetCreate();
      await fetchAll();
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Erreur lors de la création.");
      setModalError(msg);
      pushNotify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
            <Wrench size={14} />
            Préavis
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Suivi des préavis</h1>

          <p className="mt-1 text-sm font-semibold text-gray-600">
            Demandes de sortie + préavis bailleur. Confirme/annule et ajoute tes notes.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={fetchAll}
            disabled={busy}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-blue-200 bg-white px-4 py-3
              text-sm font-extrabold text-gray-800
              hover:bg-blue-50 hover:text-blue-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
            "
            type="button"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Actualiser
          </button>

          <button
            onClick={() => {
              setModalError(null);
              setOpenCreate(true);
            }}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl bg-blue-600 px-4 py-3
              text-sm font-extrabold text-white
              hover:bg-blue-700 transition
            "
            type="button"
          >
            <Plus size={18} />
            Nouveau préavis
          </button>
        </div>
      </div>

      {/* Page error: uniquement chargement global */}
      {pageError && (
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 font-bold">
          {pageError}
        </div>
      )}

      {/* Inline error (updates) */}
      {inlineError && (
        <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 font-bold">
          {inlineError}
        </div>
      )}

      {/* Create Modal */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-blue-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 px-6 py-5">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-700" size={18} />
                <h2 className="text-lg font-extrabold text-gray-900">Créer un préavis</h2>
              </div>

              <button
                onClick={() => {
                  setOpenCreate(false);
                  resetCreate();
                }}
                className="rounded-2xl p-2 text-gray-600 hover:bg-blue-50 transition"
                type="button"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* ✅ ERREUR DANS LA MODALE */}
              {modalError && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 font-bold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Type</FieldLabel>
                  <div className="mt-2">
                    <Select
                      value={noticeType}
                      onChange={(v) => setNoticeType(v as NoticeType)}
                      options={[
                        { value: "landlord", label: "Préavis bailleur" },
                        { value: "tenant", label: "Préavis locataire (simulation)" },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Location (bail)</FieldLabel>
                  <div className="mt-2">
                    <Select
                      value={String(selectedLeaseId || "")}
                      onChange={(v) => setSelectedLeaseId(v ? Number(v) : "")}
                      options={[
                        { value: "", label: "— Choisir une location —" },
                        ...leases.map((l: any) => {
                          const addr = l.property?.address || `Bien #${l.property_id}`;
                          const t = l.tenant ? `${l.tenant.first_name || ""} ${l.tenant.last_name || ""}`.trim() : "";
                          const label = `${addr}${t ? ` — ${t}` : ""}`;
                          return { value: String(l.id), label };
                        }),
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                    <Home size={14} /> Bien
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-gray-900">{propertyLabel}</div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                    <User size={14} /> Locataire
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-gray-900">{tenantLabel}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Date de libération (fin du préavis)</FieldLabel>
                  <div className="mt-2">
                    <Input value={endDate} onChange={(v) => setEndDate(v)} placeholder="YYYY-MM-DD" />
                    <div className="mt-2 text-xs font-bold text-gray-500 flex items-center gap-2">
                      <CalendarDays size={14} className="text-blue-700" />
                      notice_date = aujourd’hui ({isoToday()})
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel>Raison (motif)</FieldLabel>
                  <div className="mt-2">
                    <Input
                      value={reason}
                      onChange={(v) => setReason(v)}
                      placeholder='Ex : "Reprise pour habiter" / "Fin de bail" / "Vente"...'
                    />
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel>Message / notes (visible dans le préavis)</FieldLabel>
                <div className="mt-2">
                  <TextArea
                    value={notes}
                    onChange={(v) => setNotes(v)}
                    placeholder="Ex : Merci de préparer l’état des lieux, remise des clés, plages de visite…"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-blue-100 px-6 py-5">
              <button
                onClick={() => {
                  setOpenCreate(false);
                  resetCreate();
                }}
                disabled={busy}
                className="
                  rounded-2xl border border-blue-200 bg-white px-4 py-3
                  text-sm font-extrabold text-gray-800
                  hover:bg-blue-50
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition
                "
                type="button"
              >
                Annuler
              </button>

              <button
                onClick={handleCreate}
                disabled={busy || !selectedLeaseId}
                className="
                  inline-flex items-center gap-2 rounded-2xl
                  bg-blue-600 px-4 py-3 text-sm font-extrabold text-white
                  hover:bg-blue-700
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition
                "
                type="button"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <FieldLabel>Recherche</FieldLabel>
            <div className="mt-2 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Raison, adresse, ville, locataire, email…"
                className="
                  w-full rounded-2xl bg-white text-gray-900
                  border border-blue-200
                  pl-12 pr-4 py-3
                  text-sm font-semibold
                  placeholder:text-gray-400
                  outline-none
                  focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400
                  transition
                "
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Type</FieldLabel>
              <div className="mt-2">
                <Select
                  value={type}
                  onChange={(v) => setType(v as any)}
                  options={[
                    { value: "all", label: "Tous" },
                    { value: "tenant", label: "Locataire" },
                    { value: "landlord", label: "Bailleur" },
                  ]}
                />
              </div>
            </div>

            <div>
              <FieldLabel>Statut</FieldLabel>
              <div className="mt-2">
                <Select
                  value={status}
                  onChange={(v) => setStatus(v as any)}
                  options={[
                    { value: "all", label: "Tous" },
                    { value: "pending", label: "En attente" },
                    { value: "confirmed", label: "Confirmé" },
                    { value: "cancelled", label: "Annulé" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-blue-200 bg-white p-8">
              <div className="flex items-center gap-3 text-gray-700 font-bold">
                <Loader2 className="animate-spin" /> Chargement des préavis…
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-blue-200 bg-white p-8">
              <div className="text-gray-900 font-extrabold">Aucun préavis trouvé</div>
              <div className="mt-1 text-sm font-semibold text-gray-600">Essaie de changer le filtre ou la recherche.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((it) => {
                const tenantName = `${it.tenant?.first_name || ""} ${it.tenant?.last_name || ""}`.trim();
                const tenantEmail = it.tenant?.user?.email || "";
                const tenantPhone = it.tenant?.user?.phone || "";
                const propLine = [it.property?.address, it.property?.city].filter(Boolean).join(" • ");

                const canDecide = it.status === "pending";

                return (
                  <div
                    key={it.id}
                    className="rounded-3xl border border-blue-200 bg-white shadow-sm hover:shadow-md transition p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg md:text-xl font-extrabold text-gray-900 truncate">{it.reason}</h3>
                          <StatusBadge status={it.status} />
                          <Chip>{it.type === "tenant" ? "Demande locataire" : "Préavis bailleur"}</Chip>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                              <Home size={14} /> Bien
                            </div>
                            <div className="mt-1 text-sm font-extrabold text-gray-900">
                              {propLine || <span className="text-gray-500">Bien non renseigné</span>}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                              <User size={14} /> Locataire
                            </div>
                            <div className="mt-1 text-sm font-extrabold text-gray-900">
                              {tenantName || <span className="text-gray-500">—</span>}
                            </div>
                            <div className="mt-1 text-xs font-bold text-gray-600">
                              {tenantEmail ? <span>{tenantEmail}</span> : <span className="text-gray-500">Email —</span>}
                              {tenantPhone ? <span> • {tenantPhone}</span> : null}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Chip>
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={14} />
                              Notice: <span className="text-gray-900">{fmtDate(it.notice_date)}</span>
                            </span>
                          </Chip>
                          <Chip>
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={14} />
                              Sortie: <span className="text-gray-900">{fmtDate(it.end_date)}</span>
                            </span>
                          </Chip>
                          <Chip>ID #{it.id}</Chip>
                        </div>
                      </div>

                      <div className="w-full md:w-[360px] space-y-3">
                        <div className="rounded-3xl border border-blue-200 bg-white p-4">
                          <FieldLabel>Décision</FieldLabel>

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={!canDecide || savingId === it.id}
                              onClick={() => quickUpdate(it.id, { status: "confirmed" })}
                              className="
                                rounded-2xl bg-emerald-600 text-white px-4 py-3 text-sm font-extrabold
                                hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition
                                inline-flex items-center justify-center gap-2
                              "
                            >
                              {savingId === it.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                              Confirmer
                            </button>

                            <button
                              type="button"
                              disabled={!canDecide || savingId === it.id}
                              onClick={() => quickUpdate(it.id, { status: "cancelled" })}
                              className="
                                rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-extrabold
                                hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed transition
                                inline-flex items-center justify-center gap-2
                              "
                            >
                              <XCircle size={16} />
                              Annuler
                            </button>
                          </div>

                          <div className="mt-3">
                            <FieldLabel>Statut (manuel)</FieldLabel>
                            <div className="mt-2">
                              <Select
                                value={it.status}
                                disabled={savingId === it.id}
                                onChange={(v) => quickUpdate(it.id, { status: v as NoticeStatus })}
                                options={[
                                  { value: "pending", label: "En attente" },
                                  { value: "confirmed", label: "Confirmé" },
                                  { value: "cancelled", label: "Annulé" },
                                ]}
                              />
                            </div>

                            {savingId === it.id && (
                              <div className="mt-2 text-xs font-bold text-gray-500 flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                Mise à jour…
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-3xl border border-blue-200 bg-white p-4">
                          <FieldLabel>Notes internes</FieldLabel>

                          <div className="mt-2">
                            <TextArea
                              value={draftNotes[it.id] ?? ""}
                              disabled={savingId === it.id}
                              onChange={(v) => setDraftNotes((prev) => ({ ...prev, [it.id]: v }))}
                              placeholder="Ex : organiser visite de sortie, état des lieux, remise des clés…"
                            />

                            <button
                              type="button"
                              disabled={savingId === it.id}
                              onClick={() => saveNotes(it.id)}
                              className="
                                mt-2 w-full rounded-2xl bg-blue-600 text-white
                                px-4 py-3 text-sm font-extrabold
                                hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                                transition inline-flex items-center justify-center gap-2
                              "
                            >
                              {savingId === it.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              Enregistrer les notes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mt-4">
                      <FieldLabel>Message</FieldLabel>
                      <div className="mt-2 rounded-2xl border border-blue-200 bg-white p-4">
                        <div className="flex items-start gap-2">
                          <MessageSquareText size={16} className="text-blue-700 mt-0.5" />
                          <p className="text-sm font-semibold text-gray-800 whitespace-pre-line">
                            {it.notes ? it.notes : "Aucun message."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-500">
                      <div>Créé le {fmtDate(it.created_at)}</div>
                      <div className="inline-flex items-center gap-2">
                        <FileText size={14} className="text-blue-700" />
                        {statusLabel[it.status]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
