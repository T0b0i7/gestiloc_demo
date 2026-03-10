import React, { useEffect, useState } from "react";
import {
  Plus, Search, Settings, Trash2, Eye, Edit, Archive, X,
  User, Phone, Mail, Home, CreditCard, Save, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { tenantService, TenantApi, TenantIndexResponse } from "@/services/api";

/* ─── Types ─── */
interface Locataire {
  id: string;
  nom: string;
  prenom: string;
  nom_famille: string;
  type: string;
  bien: string;
  telephone: string;
  email: string;
  solde: number;
  etat: "Actif" | "Préavis" | "Archivé";
  modeles: string[];
}

interface LocatairesProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

/* ─── Mapper API → UI ─── */
function mapTenant(tenant: TenantApi): Locataire {
  const prenom = tenant.first_name || "";
  const nomFamille = tenant.last_name || "";
  const nom = [prenom, nomFamille].filter(Boolean).join(" ") || tenant.email || "Locataire sans nom";

  const bien = tenant.property
    ? `${tenant.property.name ?? "Bien"} – ${tenant.property.address}${tenant.property.city ? ` (${tenant.property.city})` : ""}`
    : "Aucun bien";

  let etat: Locataire["etat"] = "Actif";
  if (tenant.status === "archived") etat = "Archivé";
  else if (tenant.status === "preavis") etat = "Préavis";

  return {
    id: String(tenant.id),
    nom,
    prenom,
    nom_famille: nomFamille,
    type: "Personne Physique",
    bien,
    telephone: tenant.phone || "",
    email: tenant.email || "",
    solde: 0,
    etat,
    modeles: [],
  };
}

/* ═══════════════════════════════════════════════════
   MODALES
═══════════════════════════════════════════════════ */

/* ── Modale générique overlay ── */
function Modal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 540,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        maxHeight: "90vh", overflowY: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          borderBottom: "1.5px solid #f3f4f6",
        }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#111" }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            background: "#f3f4f6", border: "none", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280",
          }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Modale VOIR ── */
function ModalVoir({ loc, onClose }: { loc: Locataire; onClose: () => void }) {
  const rows: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: "Nom complet", value: loc.nom, icon: <User size={15} /> },
    { label: "Email", value: loc.email || "—", icon: <Mail size={15} /> },
    { label: "Téléphone", value: loc.telephone || "Non renseigné", icon: <Phone size={15} /> },
    { label: "Type", value: loc.type, icon: <User size={15} /> },
    { label: "Bien associé", value: loc.bien, icon: <Home size={15} /> },
    { label: "Solde", value: `${loc.solde.toLocaleString("fr-FR")} FCFA`, icon: <CreditCard size={15} /> },
  ];

  const etatColor: Record<string, { bg: string; color: string }> = {
    Actif: { bg: "#f0fdf4", color: "#16a34a" },
    Archivé: { bg: "#f1f5f9", color: "#64748b" },
    Préavis: { bg: "#fefce8", color: "#ca8a04" },
  };
  const colors = etatColor[loc.etat] || { bg: "#f3f4f6", color: "#374151" };

  return (
    <Modal title="Fiche locataire" onClose={onClose}>
      {/* Badge état */}
      <div style={{ marginBottom: "1.25rem" }}>
        <span style={{
          display: "inline-block", padding: "4px 14px", borderRadius: 20,
          fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase",
          background: colors.bg, color: colors.color,
          letterSpacing: "0.05em",
        }}>
          {loc.etat}
        </span>
      </div>

      {/* Infos */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {rows.map(({ label, value, icon }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.75rem 1rem", background: "#f9fafb",
            borderRadius: 10, border: "1px solid #f3f4f6",
          }}>
            <span style={{ color: "#83C757", flexShrink: 0 }}>{icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#111" }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ── Modale MODIFIER ── */
function ModalModifier({
  loc, onClose, onSaved,
}: {
  loc: Locataire;
  onClose: () => void;
  onSaved: (updated: Locataire) => void;
}) {
  const [form, setForm] = useState({
    first_name: loc.prenom,
    last_name: loc.nom_famille,
    email: loc.email,
    phone: loc.telephone,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await tenantService.updateTenant(loc.id, form);
      onSaved({
        ...loc,
        prenom: form.first_name,
        nom_famille: form.last_name,
        nom: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        telephone: form.phone,
      });
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const fields: { label: string; field: string; type: string; icon: React.ReactNode }[] = [
    { label: "Prénom", field: "first_name", type: "text", icon: <User size={14} /> },
    { label: "Nom de famille", field: "last_name", type: "text", icon: <User size={14} /> },
    { label: "Email", field: "email", type: "email", icon: <Mail size={14} /> },
    { label: "Téléphone", field: "phone", type: "tel", icon: <Phone size={14} /> },
  ];

  return (
    <Modal title="Modifier le locataire" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {fields.map(({ label, field, type, icon }) => (
          <div key={field}>
            <label style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: "0.72rem", fontWeight: 700, color: "#374151",
              marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              <span style={{ color: "#83C757" }}>{icon}</span>
              {label}
            </label>
            <input
              type={type}
              value={(form as any)[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              style={{
                width: "100%", padding: "0.65rem 0.85rem",
                border: "1.5px solid #e5e7eb", borderRadius: 10,
                fontSize: "0.85rem", fontFamily: "Manrope, sans-serif",
                color: "#111", outline: "none", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#83C757")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        ))}

        {error && (
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#e11d48", fontWeight: 600 }}>
            ⚠ {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button type="button" onClick={onClose} style={{
            padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb",
            background: "#fff", fontSize: "0.82rem", fontWeight: 700,
            color: "#374151", cursor: "pointer",
          }}>
            Annuler
          </button>
          <button type="submit" disabled={saving} style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: "#83C757", color: "#fff", fontSize: "0.82rem",
            fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Modale ARCHIVER (confirmation) ── */
function ModalArchiver({
  loc, onClose, onConfirm, loading,
}: {
  loc: Locataire;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Modal title="Archiver ce locataire" onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "#fefce8", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 1.25rem",
        }}>
          <Archive size={28} color="#ca8a04" />
        </div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", fontWeight: 700, color: "#111" }}>
          Archiver <strong>{loc.nom}</strong> ?
        </p>
        <p style={{ margin: "0 0 1.5rem", fontSize: "0.82rem", color: "#6b7280" }}>
          Le locataire sera déplacé dans les archives. Il ne sera plus visible dans la liste active,
          mais ses données resteront accessibles.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{
            padding: "10px 24px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", background: "#fff",
            fontSize: "0.82rem", fontWeight: 700, color: "#374151", cursor: "pointer",
          }}>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: "10px 24px", borderRadius: 10,
            border: "1.5px solid #fde68a",
            background: "#fefce8", color: "#ca8a04",
            fontSize: "0.82rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Archive size={15} />}
            {loading ? "Archivage..." : "Confirmer l'archivage"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Modale SUPPRIMER (confirmation) ── */
function ModalSupprimer({
  loc, onClose, onConfirm, loading,
}: {
  loc: Locataire;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Modal title="Supprimer ce locataire" onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "#fff1f2", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 1.25rem",
        }}>
          <Trash2 size={28} color="#e11d48" />
        </div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", fontWeight: 700, color: "#111" }}>
          Supprimer <strong>{loc.nom}</strong> ?
        </p>
        <p style={{ margin: "0 0 1.5rem", fontSize: "0.82rem", color: "#6b7280" }}>
          Cette action est <strong>irréversible</strong>. Toutes les données associées à ce locataire
          seront définitivement supprimées de la base de données.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{
            padding: "10px 24px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", background: "#fff",
            fontSize: "0.82rem", fontWeight: 700, color: "#374151", cursor: "pointer",
          }}>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "#e11d48", color: "#fff",
            fontSize: "0.82rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? "Suppression..." : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════════════ */
export const TenantsList: React.FC<LocatairesProps> = ({ notify }) => {
  const navigate = useNavigate();

  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"actifs" | "archives">("actifs");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [searchTerm, setSearchTerm] = useState("");
  const [linesPerPage, setLinesPerPage] = useState("100");

  /* ── Modal state ── */
  const [modalVoir, setModalVoir] = useState<Locataire | null>(null);
  const [modalModifier, setModalModifier] = useState<Locataire | null>(null);
  const [modalArchiver, setModalArchiver] = useState<Locataire | null>(null);
  const [modalSupprimer, setModalSupprimer] = useState<Locataire | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ── Fetch ── */
  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: TenantIndexResponse = await tenantService.listTenants();
      setLocataires((res.tenants || []).map(mapTenant));
    } catch (err: any) {
      const message = err?.message || "Impossible de charger les locataires";
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  /* ── Filters ── */
  const filtered = locataires.filter((l) => {
    const matchSearch =
      l.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBien = filterBien === "Tous les biens" || l.bien.includes(filterBien);
    const matchTab = activeTab === "actifs" ? l.etat !== "Archivé" : l.etat === "Archivé";
    return matchSearch && matchBien && matchTab;
  });

  const biens = Array.from(new Set(locataires.map((l) => l.bien)));
  const actifCount = locataires.filter((l) => l.etat !== "Archivé").length;
  const archiveCount = locataires.filter((l) => l.etat === "Archivé").length;

  /* ── Handlers ── */
  const handleArchive = async () => {
    if (!modalArchiver) return;
    setActionLoading(true);
    try {
      await tenantService.archiveTenant(modalArchiver.id);
      notify("Locataire archivé avec succès", "success");
      setLocataires((prev) =>
        prev.map((l) => l.id === modalArchiver.id ? { ...l, etat: "Archivé" } : l)
      );
      setModalArchiver(null);
    } catch {
      notify("Erreur lors de l'archivage", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modalSupprimer) return;
    setActionLoading(true);
    try {
      await tenantService.deleteTenant(modalSupprimer.id);
      notify("Locataire supprimé avec succès", "success");
      setLocataires((prev) => prev.filter((l) => l.id !== modalSupprimer.id));
      setModalSupprimer(null);
    } catch {
      notify("Erreur lors de la suppression", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaved = (updated: Locataire) => {
    setLocataires((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    setModalModifier(null);
    notify("Locataire mis à jour avec succès", "success");
  };

  /* ── Render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');

        .tl-page { padding: 1.5rem 2.5rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; }

        .tl-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .tl-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; color: #1a1a1a; margin: 0 0 6px 0; }
        .tl-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; }
        .tl-btn-add { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; border: none; background: #83C757; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #fff; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .tl-btn-add:hover { background: #72b44a; }

        .tl-tabs { display: flex; align-items: center; gap: 1.2rem; border-bottom: 1.5px solid #e5e7eb; margin-bottom: 1.25rem; }
        .tl-tab { display: flex; align-items: center; gap: 5px; background: none; border: none; padding: 8px 0 12px; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 600; color: #9ca3af; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1.5px; transition: all 0.15s; }
        .tl-tab.active { color: #4b8c2a; border-bottom-color: #83C757; }
        .tl-tab-count { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; border-radius: 4px; font-size: 0.62rem; font-weight: 800; padding: 0 4px; }
        .tl-tab.active .tl-tab-count { background: #83C757; color: #fff; }
        .tl-tab:not(.active) .tl-tab-count { background: #e5e7eb; color: #6b7280; }

        .tl-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .tl-filter-title { font-size: 0.68rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .tl-filter-row { display: grid; grid-template-columns: 2fr 3fr; gap: 3rem; }
        .tl-filter-field { display: flex; flex-direction: column; gap: 6px; }
        .tl-filter-label { font-size: 0.78rem; font-weight: 700; color: #374151; }
        .tl-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }

        .tl-search-row { display: flex; gap: 12px; align-items: stretch; }
        .tl-search-wrap { flex: 1; position: relative; }
        .tl-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .tl-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #374151; background: #fff; outline: none; box-sizing: border-box; }
        .tl-search-input::placeholder { color: #9ca3af; }
        .tl-btn-display { display: inline-flex; align-items: center; gap: 6px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #d1d5db; background: #fff; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #374151; cursor: pointer; }

        .tl-table-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .tl-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
        .tl-table thead th { text-align: left; padding: 13px 16px; font-size: 0.7rem; font-family: 'Manrope', sans-serif; font-weight: 700; letter-spacing: 0.03em; color: #6b7280; background: #fafbfc; border-bottom: 1.5px solid #e5e7eb; white-space: nowrap; text-transform: uppercase; }
        .tl-table tbody td { padding: 14px 16px; font-size: 0.78rem; font-family: 'Manrope', sans-serif; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; transition: background 0.15s; }
        .tl-table tbody tr:last-child td { border-bottom: none; }
        .tl-table tbody tr { transition: all 0.2s ease; }
        .tl-table tbody tr:hover { background: #f8faf8; }
        .tl-table tbody tr:hover td { color: #111; }

        .tl-type-badge { display: inline-block; background: #eef6ff; color: #3b82f6; font-weight: 600; font-size: 0.7rem; padding: 3px 10px; border-radius: 20px; border: 1px solid #bfdbfe; white-space: nowrap; }
        .tl-status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
        .tl-status-actif   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .tl-status-preavis { background: #fefce8; color: #ca8a04; border: 1px solid #fde68a; }
        .tl-status-archive { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        .tl-invitation-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; white-space: nowrap; }

        /* ── Action buttons (fluid professional design) ── */
        .tl-actions { display: flex; gap: 5px; align-items: center; flex-wrap: nowrap; }
        .tl-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 8px;
          font-family: 'Manrope', sans-serif; font-size: 0.68rem; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(0);
        }
        .tl-btn:active { transform: translateY(1px); }
        .tl-btn-voir     { background: #f9fafb; color: #374151; border: 1.5px solid #e5e7eb; }
        .tl-btn-voir:hover { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; box-shadow: 0 2px 8px rgba(22,163,74,0.08); }
        .tl-btn-edit     { background: #f9fafb; color: #374151; border: 1.5px solid #e5e7eb; }
        .tl-btn-edit:hover { background: #eff6ff; color: #2563eb; border-color: #93c5fd; box-shadow: 0 2px 8px rgba(37,99,235,0.08); }
        .tl-btn-archive  { background: #f9fafb; color: #374151; border: 1.5px solid #e5e7eb; }
        .tl-btn-archive:hover { background: #fefce8; color: #b45309; border-color: #fbbf24; box-shadow: 0 2px 8px rgba(180,83,9,0.08); }
        .tl-btn-delete   { background: #f9fafb; color: #374151; border: 1.5px solid #e5e7eb; }
        .tl-btn-delete:hover { background: #fff1f2; color: #e11d48; border-color: #fca5a5; box-shadow: 0 2px 8px rgba(225,29,72,0.08); }

        .tl-empty { text-align: center; padding: 3.5rem 1rem; display: flex; flex-direction: column; align-items: center; }
        .tl-empty-title { font-size: 0.88rem; font-weight: 700; color: #1a1a1a; margin: 0 0 6px 0; }
        .tl-empty-text  { font-size: 0.8rem; color: #6b7280; margin: 0 0 14px 0; }
      `}</style>

      {/* ── Modales ── */}
      {modalVoir && <ModalVoir loc={modalVoir} onClose={() => setModalVoir(null)} />}
      {modalModifier && (
        <ModalModifier
          loc={modalModifier}
          onClose={() => setModalModifier(null)}
          onSaved={handleSaved}
        />
      )}
      {modalArchiver && (
        <ModalArchiver
          loc={modalArchiver}
          onClose={() => setModalArchiver(null)}
          onConfirm={handleArchive}
          loading={actionLoading}
        />
      )}
      {modalSupprimer && (
        <ModalSupprimer
          loc={modalSupprimer}
          onClose={() => setModalSupprimer(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <div className="tl-page">
        {/* Header */}
        <div className="tl-header">
          <div>
            <h1 className="tl-title">Liste des locataires</h1>
            <p className="tl-subtitle">Créez un nouveau contrat entre un bien et un locataire</p>
          </div>
          <button className="tl-btn-add" onClick={() => navigate("/proprietaire/ajouter-locataire")}>
            <Plus size={15} />
            Ajouter un locataire
          </button>
        </div>

        {/* Tabs */}
        <div className="tl-tabs">
          <button className={`tl-tab ${activeTab === "actifs" ? "active" : ""}`} onClick={() => setActiveTab("actifs")}>
            <span>✓</span> Actifs <span className="tl-tab-count">{actifCount}</span>
          </button>
          <button className={`tl-tab ${activeTab === "archives" ? "active" : ""}`} onClick={() => setActiveTab("archives")}>
            <span>📁</span> Archives <span className="tl-tab-count">{archiveCount}</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="tl-card">
          <p className="tl-filter-title">FILTRER - UTILISEZ LES OPTIONS CI-DESSOUS</p>
          <div className="tl-filter-row">
            <div className="tl-filter-field">
              <span className="tl-filter-label">Bien</span>
              <select className="tl-select" value={filterBien} onChange={(e) => setFilterBien(e.target.value)}>
                <option>Tous les biens</option>
                {biens.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="tl-filter-field">
              <span className="tl-filter-label">Lignes par page</span>
              <select className="tl-select" value={linesPerPage} onChange={(e) => setLinesPerPage(e.target.value)}>
                <option value="25">25 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="tl-card">
          <div className="tl-search-row">
            <div className="tl-search-wrap">
              <Search size={16} className="tl-search-icon" />
              <input
                type="text"
                className="tl-search-input"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="tl-btn-display">
              <Settings size={15} /> Affichage
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="tl-table-card">
          {loading && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px", display: "block" }} />
              Chargement...
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#e11d48" }}>
              Erreur : {error}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <table className="tl-table">
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Type</th>
                  <th>Bien</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Solde</th>
                  <th>Etat</th>
                  <th>Invitation</th>
                  <th>Modèle</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, Number(linesPerPage)).map((loc) => (
                  <tr key={loc.id}>
                    <td style={{ fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{loc.nom}</td>
                    <td><span className="tl-type-badge">{loc.type === "Personne Physique" ? "Etudiant" : loc.type}</span></td>
                    <td style={{ color: "#374151" }}>{loc.bien}</td>
                    <td style={{ color: "#374151" }}>{loc.telephone || "—"}</td>
                    <td style={{ color: "#3b82f6" }}>{loc.email}</td>
                    <td style={{ fontWeight: 500, color: "#374151" }}>{loc.solde.toLocaleString("fr-FR")} FCFA</td>
                    <td>
                      <span className={`tl-status-badge tl-status-${loc.etat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
                        {loc.etat}
                      </span>
                    </td>
                    <td>
                      <span className="tl-invitation-badge">
                        <span style={{ color: "#16a34a", fontSize: "0.82rem" }}>☑</span>
                        Acceptée
                      </span>
                    </td>
                    <td style={{ color: "#6b7280" }}>{loc.modeles.length} Bail(s)</td>
                    <td>
                      <div className="tl-actions">
                        <button className="tl-btn tl-btn-voir" onClick={() => setModalVoir(loc)}>
                          <Eye size={13} /> Voir
                        </button>
                        <button className="tl-btn tl-btn-edit" onClick={() => setModalModifier(loc)}>
                          <Edit size={13} /> Modifier
                        </button>
                        {loc.etat !== "Archivé" && (
                          <button className="tl-btn tl-btn-archive" onClick={() => setModalArchiver(loc)}>
                            <Archive size={13} /> Archiver
                          </button>
                        )}
                        <button className="tl-btn tl-btn-delete" onClick={() => setModalSupprimer(loc)}>
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className="tl-empty">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ marginBottom: 16 }}>
                <circle cx="28" cy="20" r="9" fill="#d1d5db" />
                <path d="M10 48C10 38.059 18.059 30 28 30C37.941 30 46 38.059 46 48" fill="#d1d5db" />
              </svg>
              <p className="tl-empty-title">Aucun locataire trouvé</p>
              <p className="tl-empty-text">
                Vous pouvez inviter vos locataires pour leur donner accès à la zone membres.
              </p>
              <button
                style={{ color: "#83C757", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: "0.82rem", textDecoration: "underline" }}
                onClick={() => navigate("/proprietaire/ajouter-locataire")}
              >
                Créer un locataire
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TenantsList;