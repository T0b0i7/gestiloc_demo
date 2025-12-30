// src/pages/landlord/LandlordIncidentsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  Wrench,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

import api from "@/services/api";
import { maintenanceService, MaintenanceRequest, MaintenanceStatus } from "@/services/maintenanceService";

type IncidentStatus = MaintenanceStatus;
type Incident = MaintenanceRequest;

const statusLabel: Record<IncidentStatus, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  cancelled: "Annulé",
};

/**
 * ✅ Base URL backend depuis api.ts (source unique)
 * api.defaults.baseURL = "http://localhost:8000/api"
 * -> origin "http://localhost:8000"
 */
const getBackendOrigin = () => {
  const base = api.defaults.baseURL || "";
  return base.replace(/\/api\/?$/, "");
};

/**
 * ✅ Normalise un path photo stocké en DB
 * - "maintenance/xxx.jpg" => {origin}/storage/maintenance/xxx.jpg
 * - "/storage/maintenance/xxx.jpg" => {origin}/storage/maintenance/xxx.jpg
 * - "http(s)://..." => inchangé
 */
const fileUrl = (p: string) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;

  const origin = getBackendOrigin();

  if (p.startsWith("/storage/")) return `${origin}${p}`;
  if (p.startsWith("storage/")) return `${origin}/${p}`;

  return `${origin}/storage/${p}`;
};

function StatusBadge({ status }: { status: IncidentStatus }) {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border";
  if (status === "open")
    return (
      <span className={`${base} border-blue-200 bg-blue-50 text-blue-700`}>
        <AlertCircle size={14} /> {statusLabel[status]}
      </span>
    );
  if (status === "in_progress")
    return (
      <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>
        <Clock3 size={14} /> {statusLabel[status]}
      </span>
    );
  if (status === "resolved")
    return (
      <span className={`${base} border-green-200 bg-green-50 text-green-700`}>
        <CheckCircle2 size={14} /> {statusLabel[status]}
      </span>
    );
  return (
    <span className={`${base} border-red-200 bg-red-50 text-red-700`}>
      <XCircle size={14} /> {statusLabel[status]}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-extrabold tracking-wide text-gray-700 uppercase">{children}</div>;
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
          text-sm font-semibold
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
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
        transition
      "
    />
  );
}

function PhotoStrip({ photos, onOpen }: { photos: string[]; onOpen: (url: string) => void }) {
  if (!photos?.length) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <FieldLabel>Photos</FieldLabel>
        <span className="text-xs font-bold text-gray-500">{photos.length} photo(s)</span>
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {photos.map((p, idx) => {
          const url = fileUrl(p);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onOpen(url)}
              className="shrink-0 rounded-2xl border border-blue-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition"
              title="Ouvrir"
            >
              <img
                src={url}
                alt={`incident-${idx}`}
                className="h-24 w-36 object-cover block"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="px-3 py-2 text-left">
                <div className="text-xs font-extrabold text-gray-800 inline-flex items-center gap-2">
                  <ImageIcon size={14} />
                  Photo {idx + 1}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ✅ Lightbox en PORTAL : ne sera plus coupé par ton layout dashboard
 * ✅ Largeur réduite + bien centré
 */
function Lightbox({ url, onClose }: { url: string | null; onClose: () => void }) {
  if (!url) return null;

  const node = (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="
          w-[92vw] max-w-3xl
          rounded-3xl bg-white border border-blue-200 shadow-2xl overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-100 bg-blue-50">
          <div className="text-sm font-extrabold text-gray-900">Aperçu photo</div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 py-2 text-xs font-extrabold text-gray-800 hover:bg-blue-50 transition"
            >
              <ExternalLink size={14} /> Ouvrir
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-white px-3 py-2 text-xs font-extrabold text-gray-800 hover:bg-blue-50 transition"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="p-4 bg-white flex items-center justify-center">
          <img
            src={url}
            alt="aperçu"
            className="w-full max-h-[72vh] object-contain rounded-2xl border border-gray-200 bg-white"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

export default function LandlordIncidentsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);

  // UI filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<IncidentStatus | "all">("all");

  // Update state
  const [savingId, setSavingId] = useState<number | null>(null);

  // Lightbox
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const paginated = await maintenanceService.list();
      setItems(paginated.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Impossible de charger les incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      const matchesStatus = status === "all" ? true : it.status === status;
      const blob = [
        it.title,
        it.category,
        it.description,
        it.property?.name,
        it.property?.address,
        it.property?.city,
        it.tenant?.first_name,
        it.tenant?.last_name,
        it.tenant?.user?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQ = needle ? blob.includes(needle) : true;
      return matchesStatus && matchesQ;
    });
  }, [items, q, status]);

  const updateStatus = async (id: number, next: IncidentStatus) => {
    setSavingId(id);
    try {
      const updated = await maintenanceService.update(id, { status: next });
      setItems((prev) => prev.map((x) => (x.id === id ? (updated as Incident) : x)));
    } catch (e: any) {
      alert(e?.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setSavingId(null);
    }
  };

  const updateProvider = async (id: number, provider: string) => {
    setSavingId(id);
    try {
      const updated = await maintenanceService.update(id, { assigned_provider: provider || null });
      setItems((prev) => prev.map((x) => (x.id === id ? (updated as Incident) : x)));
    } catch (e: any) {
      alert(e?.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="py-8">
      <Lightbox url={previewUrl} onClose={() => setPreviewUrl(null)} />

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
            <Wrench size={14} />
            Réparations & Incidents
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Suivi des incidents</h1>
          <p className="mt-1 text-sm font-semibold text-gray-600">
            Consulte les demandes, assigne un prestataire, et change le statut (ouvert / en cours / résolu).
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="
            mt-4 md:mt-0 inline-flex items-center justify-center gap-2
            rounded-2xl border border-blue-200 bg-white px-4 py-3
            text-sm font-extrabold text-gray-800
            hover:bg-blue-50 hover:text-blue-700
            transition
          "
          type="button"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "↻"}
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <FieldLabel>Recherche</FieldLabel>
          <div className="mt-2 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Titre, adresse, locataire, email…"
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

        <div>
          <FieldLabel>Statut</FieldLabel>
          <div className="mt-2">
            <Select
              value={status}
              onChange={(v) => setStatus(v as any)}
              options={[
                { value: "all", label: "Tous" },
                { value: "open", label: "Ouvert" },
                { value: "in_progress", label: "En cours" },
                { value: "resolved", label: "Résolu" },
                { value: "cancelled", label: "Annulé" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-3xl border border-blue-200 bg-white p-8">
            <div className="flex items-center gap-3 text-gray-700 font-bold">
              <Loader2 className="animate-spin" /> Chargement des incidents…
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 font-bold">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-blue-200 bg-white p-8">
            <div className="text-gray-900 font-extrabold">Aucun incident trouvé</div>
            <div className="mt-1 text-sm font-semibold text-gray-600">Essaie de changer le filtre ou la recherche.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((it) => {
              const tenantName = `${it.tenant?.first_name || ""} ${it.tenant?.last_name || ""}`.trim();
              const propLine = [it.property?.name, it.property?.address, it.property?.city].filter(Boolean).join(" • ");
              const photos = Array.isArray(it.photos) ? it.photos.filter(Boolean) : [];

              return (
                <div
                  key={it.id}
                  className="
                    rounded-3xl border border-blue-200 bg-white
                    shadow-sm hover:shadow-md transition
                    p-5 md:p-6
                  "
                >
                  {/* Top */}
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg md:text-xl font-extrabold text-gray-900 truncate">{it.title}</h3>
                        <StatusBadge status={it.status} />
                        {it.category && (
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-700">
                            {it.category}
                          </span>
                        )}
                        {it.priority && (
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-700">
                            Priorité: {String(it.priority)}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-sm font-semibold text-gray-600">
                        {propLine ? <span>{propLine}</span> : <span className="text-gray-400">Bien non renseigné</span>}
                      </div>

                      <div className="mt-1 text-sm font-semibold text-gray-600">
                        {tenantName ? (
                          <span>
                            Locataire : <span className="text-gray-900 font-extrabold">{tenantName}</span>
                            {it.tenant?.user?.email ? <span className="text-gray-500"> • {it.tenant.user.email}</span> : null}
                            {it.tenant?.user?.phone ? <span className="text-gray-500"> • {it.tenant.user.phone}</span> : null}
                          </span>
                        ) : (
                          <span className="text-gray-400">Locataire non renseigné</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full md:w-[340px] space-y-3">
                      <div>
                        <FieldLabel>Changer le statut</FieldLabel>
                        <div className="mt-2">
                          <Select
                            value={it.status}
                            disabled={savingId === it.id}
                            onChange={(v) => updateStatus(it.id, v as IncidentStatus)}
                            options={[
                              { value: "open", label: "Ouvert" },
                              { value: "in_progress", label: "En cours" },
                              { value: "resolved", label: "Résolu" },
                              { value: "cancelled", label: "Annulé" },
                            ]}
                          />
                          {savingId === it.id && (
                            <div className="mt-2 text-xs font-bold text-gray-500 flex items-center gap-2">
                              <Loader2 size={14} className="animate-spin" />
                              Mise à jour…
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <FieldLabel>Prestataire assigné</FieldLabel>
                        <div className="mt-2">
                          <Input
                            value={it.assigned_provider || ""}
                            onChange={(v) =>
                              setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, assigned_provider: v } : x)))
                            }
                            placeholder="Ex : ETS plomberie • +229 …"
                          />
                          <button
                            type="button"
                            disabled={savingId === it.id}
                            onClick={() => updateProvider(it.id, it.assigned_provider || "")}
                            className="
                              mt-2 w-full rounded-2xl
                              bg-blue-600 text-white
                              px-4 py-3 text-sm font-extrabold
                              hover:bg-blue-700
                              disabled:opacity-60 disabled:cursor-not-allowed
                              transition
                            "
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <FieldLabel>Description</FieldLabel>
                    <div className="mt-2 rounded-2xl border border-blue-200 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-800 whitespace-pre-line">
                        {it.description || "Aucune description."}
                      </p>
                    </div>
                  </div>

                  {/* Photos */}
                  <PhotoStrip photos={photos} onOpen={(url) => setPreviewUrl(url)} />

                  {/* Footer meta */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-500">
                    <div>
                      ID #{it.id}
                      {it.created_at ? <span> • Créé le {new Date(it.created_at).toLocaleDateString()}</span> : null}
                    </div>
                    <div>
                      {it.resolved_at ? (
                        <span className="text-green-700">Résolu le {new Date(it.resolved_at).toLocaleDateString()}</span>
                      ) : (
                        <span>Non résolu</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
