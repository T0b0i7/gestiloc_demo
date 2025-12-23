import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Loader2, Send, FileText, X } from "lucide-react";
import { noticeService } from "../../../services/noticeService";
import tenantApi, { TenantLease } from "../services/tenantApi";

type NoticeStatus = "pending" | "confirmed" | "cancelled";
const isoToday = () => new Date().toISOString().slice(0, 10);

const badge = (s: NoticeStatus) => {
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold";
  if (s === "confirmed") return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  if (s === "cancelled") return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  return `${base} border-amber-200 bg-amber-50 text-amber-800`;
};

type ApiErr = {
  response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
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
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessaie dans quelques instants.";

  const backendMsg = err?.response?.data?.message?.trim();
  if (backendMsg && !looksTechnical(backendMsg)) return backendMsg;

  return fallback;
}

type FormErrors = Partial<{
  leaseId: string;
  endDate: string;
  reason: string;
  notes: string;
}>;

export default function TenantPreavisPage({
  notify,
}: {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [leases, setLeases] = useState<TenantLease[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form
  const [leaseId, setLeaseId] = useState<number | "">("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // ✅ client-side errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // ✅ refs focus
  const leaseRef = useRef<HTMLSelectElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  const reasonRef = useRef<HTMLTextAreaElement | null>(null);

  const inputBase =
    "w-full rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 " +
    "border border-blue-200 px-4 py-3 text-sm font-semibold shadow-sm " +
    "focus:outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400";

  const errorText = "text-xs text-rose-700 font-bold mt-2";

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!leaseId) errs.leaseId = "Choisis un bail.";
    if (!endDate) errs.endDate = "Choisis une date de sortie.";
    else if (endDate < isoToday()) errs.endDate = "La date de sortie doit être au minimum aujourd’hui.";

    if (!reason.trim()) errs.reason = "Ajoute une raison.";
    else if (reason.trim().length < 5) errs.reason = "La raison doit contenir au moins 5 caractères.";

    // notes optionnel : si rempli, on met juste un mini seuil pour éviter “ok”
    if (notes.trim() && notes.trim().length < 3) errs.notes = "Notes trop courtes (au moins 3 caractères).";

    return errs;
  };

  const focusFirstError = (errs: FormErrors) => {
    if (errs.leaseId) leaseRef.current?.focus();
    else if (errs.endDate) endDateRef.current?.focus();
    else if (errs.reason) reasonRef.current?.focus();
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const l = await tenantApi.getLeases();
      setLeases(l);

      const n = await noticeService.list();
      setNotices(Array.isArray(n) ? n : []);

      if (l?.[0]?.id) setLeaseId(l[0].id);
    } catch (e: any) {
      const err = e as ApiErr;
      console.error("fetchAll error:", err);

      const msg = normalizeApiError(err, "Impossible de charger les préavis.");
      setError(msg);
      notify?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await fetchAll();
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLease = useMemo(() => {
    if (!leaseId) return null;
    return leases.find((x) => Number(x.id) === Number(leaseId)) || null;
  }, [leases, leaseId]);

  const propertyLine = useMemo(() => {
    const p = selectedLease?.property;
    if (!p) return "—";
    return [p.address, p.city].filter(Boolean).join(" • ");
  }, [selectedLease]);

  const handleSubmit = async () => {
    setError(null);

    // ✅ client-side validation
    const errs = validate();
    setFormErrors(errs);

    if (Object.keys(errs).length > 0) {
      const msg = Object.values(errs)[0] || "Vérifie le formulaire.";
      setError(msg);
      notify?.(msg, "error");
      focusFirstError(errs);
      return;
    }

    setBusy(true);
    try {
      await noticeService.create({
        lease_id: Number(leaseId),
        end_date: endDate,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });

      notify?.("Demande de préavis envoyée au propriétaire", "success");

      setEndDate("");
      setReason("");
      setNotes("");
      setFormErrors({});

      await fetchAll();
    } catch (e: any) {
      const err = e as ApiErr;
      console.error("create notice error:", err);

      // ✅ si backend renvoie 422 errors{}, on mappe en messages compréhensibles
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const be = err.response.data.errors;
        const mapped: FormErrors = {};

        if (be.lease_id) mapped.leaseId = be.lease_id?.[0] || "Bail invalide.";
        if (be.end_date) mapped.endDate = be.end_date?.[0] || "Date de sortie invalide.";
        if (be.reason) mapped.reason = be.reason?.[0] || "Raison invalide.";
        if (be.notes) mapped.notes = be.notes?.[0] || "Notes invalides.";

        setFormErrors((p) => ({ ...p, ...mapped }));

        const msg = "Certains champs sont invalides. Vérifie le formulaire.";
        setError(msg);
        notify?.(msg, "error");
        focusFirstError(mapped);
        setBusy(false);
        return;
      }

      const msg = normalizeApiError(err, "Erreur lors de l’envoi.");
      setError(msg);
      notify?.(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  const cancelMyNotice = async (id: number) => {
    setBusy(true);
    try {
      await noticeService.update(id, { status: "cancelled" });
      await fetchAll();
      notify?.("Préavis annulé", "success");
    } catch (e: any) {
      const err = e as ApiErr;
      console.error("cancel notice error:", err);

      const msg = normalizeApiError(err, "Impossible d’annuler.");
      notify?.(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-700 font-bold">
          <Loader2 className="animate-spin" /> Chargement…
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Préavis</h1>
        <p className="mt-1 text-sm font-semibold text-gray-600">
          Fais une demande de sortie. Le propriétaire pourra confirmer et organiser la suite.
        </p>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-800 font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Bail</div>
            <select
              ref={leaseRef}
              value={leaseId}
              onChange={(e) => {
                setLeaseId(e.target.value ? Number(e.target.value) : "");
                if (formErrors.leaseId) setFormErrors((p) => ({ ...p, leaseId: undefined }));
              }}
              className={`${inputBase} mt-2`}
            >
              {leases.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.property?.address} — {l.property?.city}
                </option>
              ))}
            </select>
            {formErrors.leaseId ? <div className={errorText}>{formErrors.leaseId}</div> : null}

            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-xs font-extrabold tracking-wide text-blue-700 uppercase">Bien concerné</div>
              <div className="mt-1 text-sm font-extrabold text-gray-900">{propertyLine}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Date de sortie</div>
            <div className="mt-2 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar size={18} />
              </div>
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                min={isoToday()}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (formErrors.endDate) setFormErrors((p) => ({ ...p, endDate: undefined }));
                }}
                className={`${inputBase} pl-12`}
              />
            </div>
            {formErrors.endDate ? <div className={errorText}>{formErrors.endDate}</div> : null}

            <div className="mt-4">
              <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Raison</div>
              <textarea
                ref={reasonRef}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (formErrors.reason) setFormErrors((p) => ({ ...p, reason: undefined }));
                }}
                className={`${inputBase} mt-2 min-h-[110px] resize-none`}
                placeholder="Ex : Mutation pro, changement de ville, achat immobilier…"
              />
              {formErrors.reason ? <div className={errorText}>{formErrors.reason}</div> : null}
            </div>

            <div className="mt-4">
              <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">Notes (optionnel)</div>
              <input
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (formErrors.notes) setFormErrors((p) => ({ ...p, notes: undefined }));
                }}
                className={`${inputBase} mt-2`}
                placeholder="Ex : dispo visites le samedi, remise des clés…"
              />
              {formErrors.notes ? <div className={errorText}>{formErrors.notes}</div> : null}
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={handleSubmit}
              className="
                mt-4 w-full rounded-2xl bg-blue-600 text-white
                px-4 py-3 text-sm font-extrabold
                hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition inline-flex items-center justify-center gap-2
              "
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Envoyer la demande
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="rounded-3xl border border-blue-200 bg-white shadow-sm">
        <div className="border-b border-blue-100 px-6 py-4">
          <div className="text-lg font-extrabold text-gray-900 inline-flex items-center gap-2">
            <FileText size={18} className="text-blue-700" />
            Historique
          </div>
          <div className="text-sm font-semibold text-gray-600">Tes préavis et leur statut.</div>
        </div>

        {notices.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-600 font-semibold">
            Aucun préavis pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-blue-100">
            {notices.map((n: any) => (
              <div key={n.id} className="px-6 py-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm md:text-base font-extrabold text-gray-900 truncate">
                        {n.reason}
                      </div>
                      <span className={badge(n.status)}>{n.status}</span>
                      {n.type ? (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-700">
                          {n.type === "tenant" ? "Demande locataire" : "Préavis bailleur"}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 text-sm font-semibold text-gray-600">
                      Notice: {String(n.notice_date).slice(0, 10)} • Sortie:{" "}
                      <span className="text-gray-900 font-extrabold">
                        {String(n.end_date).slice(0, 10)}
                      </span>
                    </div>

                    <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-gray-800 whitespace-pre-line">
                      {n.notes ? n.notes : <span className="text-gray-500">Aucune note</span>}
                    </div>
                  </div>

                  {n.status === "pending" ? (
                    <button
                      disabled={busy}
                      onClick={() => cancelMyNotice(n.id)}
                      className="
                        mt-2 md:mt-0 inline-flex items-center gap-2
                        rounded-2xl border border-rose-200 bg-rose-50
                        px-4 py-3 text-sm font-extrabold text-rose-700
                        hover:bg-rose-100 disabled:opacity-60
                      "
                      type="button"
                    >
                      <X size={18} /> Annuler
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
