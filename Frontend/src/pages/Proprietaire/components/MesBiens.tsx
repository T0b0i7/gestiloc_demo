import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Home,
  MapPin,
  Euro,
  Image as ImageIcon,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  Eye,
  Edit,
  Lock,
  Users,
  ShieldCheck,
  X,
  Save,
  Building2,
  Ruler,
  ArrowLeft,
  Bath,
  Bed,
  Layers,
  Thermometer,
  Zap,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { uploadService, propertyService } from "../../../services/api";

// Types
interface Property {
  id: number;
  type: string;
  name: string;
  title?: string;
  description?: string;
  address: string;
  city?: string;
  district?: string;
  zip_code?: string;
  surface?: string;
  room_count?: number;
  bedroom_count?: number;
  bathroom_count?: number;
  rent_amount?: string;
  status?: string;
  reference_code?: string;
  photos?: string[];
  meta?: {
    terrace?: boolean;
    balcony?: boolean;
    garden?: boolean;
    parking?: boolean;
    floor?: number;
    elevator?: boolean;
    furnished?: boolean;
    heating_type?: string;
    energy_class?: string;
    [key: string]: any;
  };
  delegation_type?: string;
  delegation_info?: {
    co_owner_name?: string;
    co_owner_company?: string;
    delegated_at?: string;
    [key: string]: any;
  };
  can_edit?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  per_page?: number;
}

interface MesBiensProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
  currentUser?: {
    id: number;
    email: string;
    role: "landlord" | "co_owner" | "admin";
  };
}

const filters = ["Tous", "Disponible", "Loué", "En maintenance", "Retiré du marché"];

const STATUS_MAP: Record<string, string> = {
  available: "Disponible",
  rented: "Loué",
  maintenance: "En maintenance",
  off_market: "Retiré du marché",
};

const TYPE_MAP: Record<string, string> = {
  apartment: "APPARTEMENT",
  house: "MAISON",
  office: "BUREAU",
  commercial: "LOCAL COMMERCIAL",
  parking: "PARKING",
  other: "AUTRE",
};

const statutColor: Record<string, string> = {
  Loué: "#3b82f6",
  Disponible: "#22c55e",
  "En travaux": "#f59e0b",
  Préavis: "#ef4444",
  Meublé: "#8b5cf6",
};

// Fonctions utilitaires
const formatPrice = (value: string | undefined) => {
  if (!value) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("fr-FR", { minimumFractionDigits: 0 }) + " FCFA";
};

const formatSurface = (value: string | undefined) => {
  if (!value) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `${num.toLocaleString("fr-FR")} m²`;
};

const statusLabel: Record<string, string> = {
  available: "Disponible",
  rented: "Loué",
  maintenance: "En maintenance",
  off_market: "Retiré du marché",
};

const typeLabel: Record<string, string> = {
  apartment: "Appartement",
  house: "Maison",
  office: "Bureau",
  commercial: "Local commercial",
  parking: "Parking",
  land: "Terrain",
  other: "Autre",
};

const heatingTypeLabel: Record<string, string> = {
  electric: "Électrique",
  gas: "Gaz",
  oil: "Fioul",
  heat_pump: "Pompe à chaleur",
  solar: "Solaire",
  collective: "Collectif",
  none: "Aucun",
};

const delegationLabel: Record<string, { label: string; icon: React.ReactNode }> = {
  agency: {
    label: "Géré par agence",
    icon: <Lock size={11} />
  },
  co_owner: {
    label: "Partagé avec co-propriétaire",
    icon: <Users size={11} />
  }
};

const getBackendOrigin = () => {
  const baseURL = (api.defaults.baseURL || "").toString();
  if (!baseURL) return window.location.origin;
  try {
    return new URL(baseURL).origin;
  } catch {
    try {
      return new URL(baseURL, window.location.origin).origin;
    } catch {
      return window.location.origin;
    }
  }
};

const resolvePhotoUrl = (p?: string | null) => {
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const origin = getBackendOrigin();
  if (p.startsWith("/storage/")) return `${origin}${p}`;
  const normalized = p.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${origin}/storage/${normalized}`;
};

// Interface pour le formulaire d'édition
interface EditFormData {
  type: string;
  name: string;
  description: string;
  address: string;
  city: string;
  district: string;
  zip_code: string;
  surface: string;
  room_count: string;
  bedroom_count: string;
  bathroom_count: string;
  rent_amount: string;
  status: string;
  reference_code: string;
  terrace: boolean;
  balcony: boolean;
  garden: boolean;
  parking: boolean;
  floor: string;
  elevator: boolean;
  furnished: boolean;
  heating_type: string;
  energy_class: string;
}

const styles = `
  .view-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .view-badge {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .view-body {
    padding: 2rem;
  }

  .view-section {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .view-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .view-section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #111827;
  }

  .view-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .view-field {
    margin-bottom: 1rem;
  }

  .view-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 0.25rem;
    display: block;
  }

  .view-value {
    font-size: 1rem;
    color: #111827;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .feature-item.active {
    background: #dcfce7;
    color: #166534;
  }

  .feature-item.inactive {
    opacity: 0.6;
  }

  .view-photos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .view-photo {
    width: 100%;
    height: 150px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    transition: transform 0.2s;
  }

  .view-photo:hover {
    transform: scale(1.05);
  }

  .view-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .view-actions {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    border: 2px solid #d1d5db;
    background: white;
    color: #4b5563;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: #f3f4f6;
  }

  .btn-success {
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
  }

  .btn-success:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-1px);
  }

  /* ========= FORMULAIRE D'ÉDITION ========= */
  .edit-form {
    background: white;
    border-radius: 24px;
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .edit-header {
    background: linear-gradient(135deg, #667eea, #764ba2);
    padding: 2rem;
    color: white;
    border-radius: 24px 24px 0 0;
    position: relative;
  }

  .edit-header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .edit-title-section {
    flex: 1;
  }

  .edit-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: white;
  }

  .edit-subtitle {
    opacity: 0.9;
    margin: 0;
    color: white;
  }

  .edit-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .edit-badge {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .edit-body {
    padding: 2rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .form-section {
    background: rgba(255, 255, 255, 0.72);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid rgba(17, 24, 39, 0.08);
    box-shadow: 0 10px 30px rgba(17, 24, 39, 0.06);
  }

  .form-section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #111827;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid rgba(102, 126, 234, 0.28);
  }

  .form-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .form-required {
    color: #dc2626;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 0.95rem;
    color: #111827;
    background: white;
    transition: all 0.2s ease;
    outline: none;
  }

  .form-control:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .form-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 0.95rem;
    color: #111827;
    background: white;
    cursor: pointer;
    outline: none;
  }

  .form-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .form-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .form-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .form-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 0.95rem;
    color: #111827;
    background: white;
    min-height: 120px;
    resize: vertical;
    outline: none;
    font-family: inherit;
  }

  .form-textarea:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .form-error {
    color: #dc2626;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .form-actions {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .photos-section {
    margin-top: 1.5rem;
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid rgba(17, 24, 39, 0.08);
    background: rgba(249, 250, 251, 0.8);
  }

  .photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .photo-item {
    position: relative;
    width: 100%;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  }

  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
  }

  .photo-upload {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .photo-upload-btn {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: 2px dashed #d1d5db;
    background: white;
    color: #6b7280;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
  }

  .photo-upload-btn:hover {
    border-color: #6366f1;
    color: #6366f1;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
  }

  .modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .view-modal-content {
    background: white;
    border-radius: 24px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .view-header {
    background: linear-gradient(135deg, #667eea, #764ba2);
    padding: 2rem;
    color: white;
    border-radius: 24px 24px 0 0;
    position: relative;
  }

  .view-header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .view-title-section {
    flex: 1;
  }

  .view-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: white;
  }

  .view-subtitle {
    opacity: 0.9;
    margin: 0;
    color: white;
  }

  @media (max-width: 768px) {
    .properties-page {
      padding: 1.25rem;
    }
    .properties-actions {
      width: 100%;
    }
    .modal-content,
    .view-modal-content,
    .edit-form {
      width: 95%;
      max-height: 85vh;
    }
    .view-header,
    .edit-header {
      padding: 1.5rem;
    }
    .view-body,
    .edit-body {
      padding: 1.5rem;
    }
    .form-grid {
      grid-template-columns: 1fr;
    }
    .form-actions {
      flex-direction: column;
    }
    .btn-secondary,
    .btn-success {
      width: 100%;
      justify-content: center;
    }
  }
`;

const btnBase = {
  padding: "10px 20px",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: 700,
  fontFamily: "Manrope, sans-serif",
  cursor: "pointer",
  border: "none",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

// Composant "FICHE BIEN" — modale détail/édition d'un bien (à partir des données mockées)
function FicheBienModal({
  bien,
  onClose,
}: {
  bien: typeof biens[0];
  onClose: () => void;
}) {
  // Split adresse / ville from mock data
  const parts = bien.adresse.split(", ");
  const adresseInit = parts[0] || "";
  const villeInit = parts[1] || "";

  const [nom, setNom] = useState(bien.titre);
  const [statut, setStatut] = useState(bien.statut);
  const [type, setType] = useState(bien.type);
  const [adresse, setAdresse] = useState(adresseInit);
  const [ville, setVille] = useState(villeInit);
  const [codePostal, setCodePostal] = useState("00229");
  const [quartier, setQuartier] = useState("");
  const [surface, setSurface] = useState(bien.surface);
  const [loyer, setLoyer] = useState(bien.loyer.replace(/\./g, ""));
  const [photoUrl, setPhotoUrl] = useState(bien.image);

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // Pour l'instant, on ferme simplement la modale
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.38)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          width: "95%",
          maxWidth: 860,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "1.5rem 1.75rem 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                FICHE BIEN
              </p>
              <h2 style={{ fontFamily: "'Merriweather', serif", fontSize: "1.35rem", fontWeight: 800, margin: "6px 0 0 0", color: "#111" }}>
                {nom || "Sans titre"}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                padding: 4,
                borderRadius: 8,
                transition: "0.15s",
              }}
            >
              <X size={22} />
            </button>
          </div>

          <div style={{ borderBottom: "1.5px solid #e5e7eb", margin: "1rem 0 0" }} />
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "1.25rem 1.75rem 1.5rem" }}>

          {/* Photo principale */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 180,
              borderRadius: 16,
              overflow: "hidden",
              background: "linear-gradient(135deg, #e8eaf0 0%, #d5d8e0 100%)",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Photo principale"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={() => setPhotoUrl("")}
              />
            ) : (
              <ImageIcon size={48} color="#b0b5c0" />
            )}

            {/* Labels overlaid */}
            <span
              style={{
                position: "absolute",
                bottom: 12,
                left: 14,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#fff",
                background: "rgba(0,0,0,0.38)",
                borderRadius: 6,
                padding: "3px 10px",
              }}
            >
              Photo principale
            </span>
            <button
              onClick={() => photoInputRef.current?.click()}
              style={{
                position: "absolute",
                bottom: 12,
                right: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#374151",
                background: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "5px 12px",
                cursor: "pointer",
              }}
            >
              <ImageIcon size={14} />
              Changer la photo
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </div>

          {/* ── INFORMATIONS PRINCIPALES ── */}
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
            INFORMATIONS PRINCIPALES
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Nom / Titre du bien</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  border: "1.5px solid #d1d5db",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 500,
                  color: "#111",
                  outline: "none",
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Statut</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  border: "1.5px solid #d1d5db",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 500,
                  color: "#111",
                  outline: "none",
                  background: "#fff",
                  cursor: "pointer",
                  boxSizing: "border-box" as const,
                }}
              >
                <option value="Loué">Loué</option>
                <option value="Disponible">Disponible</option>
                <option value="En travaux">En travaux</option>
                <option value="Préavis">Préavis</option>
                <option value="Meublé">Meublé</option>
              </select>
            </div>
          </div>

          {/* Type (select matching images 2 & 3) */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                border: "1.5px solid #d1d5db",
                borderRadius: 10,
                fontSize: "0.85rem",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 500,
                color: "#111",
                outline: "none",
                background: "#fff",
                cursor: "pointer",
                boxSizing: "border-box" as const,
              }}
            >
              <option value="APPARTEMENT">Appartement</option>
              <option value="MAISON">Maison</option>
              <option value="BUREAU">Bureau</option>
              <option value="LOCAL COMMERCIAL">Local commercial</option>
              <option value="PARKING">Parking</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          {/* ── ADRESSE ── */}
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
            ADRESSE
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Adresse</label>
              <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Ville</label>
              <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Code postal</label>
              <input type="text" value={codePostal} onChange={(e) => setCodePostal(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Quartier</label>
              <input type="text" value={quartier} onChange={(e) => setQuartier(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* ── CARACTÉRISTIQUES ── */}
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
            CARACTÉRISTIQUES
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Surface (m²)</label>
              <input type="text" value={surface} onChange={(e) => setSurface(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 4 }}>Loyer mensuel (FCFA)</label>
              <input type="text" value={loyer} onChange={(e) => setLoyer(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "1rem 1.75rem 1.25rem",
            borderTop: "1.5px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              border: "1.5px solid #d1d5db",
              background: "#fff",
              fontFamily: "'Manrope', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              fontFamily: "'Manrope', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(124,58,237,0.25)",
            }}
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared input style for FicheBienModal
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  border: "1.5px solid #d1d5db",
  borderRadius: 10,
  fontSize: "0.85rem",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 500,
  color: "#111",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};

// Composant pour éditer un bien
const EditPropertyModal: React.FC<{
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}> = ({ property, onClose, onSuccess, notify }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    type: property.type || "apartment",
    name: property.name || "",
    description: property.description || "",
    address: property.address || "",
    city: property.city || "",
    district: property.district || "",
    zip_code: property.zip_code || "",
    surface: property.surface?.toString() || "",
    room_count: property.room_count?.toString() || "",
    bedroom_count: property.bedroom_count?.toString() || "",
    bathroom_count: property.bathroom_count?.toString() || "",
    rent_amount: property.rent_amount?.toString() || "",
    status: property.status || "available",
    reference_code: property.reference_code || "",
    terrace: property.meta?.terrace || false,
    balcony: property.meta?.balcony || false,
    garden: property.meta?.garden || false,
    parking: property.meta?.parking || false,
    floor: property.meta?.floor?.toString() || "",
    elevator: property.meta?.elevator || false,
    furnished: property.meta?.furnished || false,
    heating_type: property.meta?.heating_type || "",
    energy_class: property.meta?.energy_class || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<string[]>(property.photos || []);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const maxPhotos = 8 - photos.length - newPhotos.length;

    if (fileArray.length > maxPhotos) {
      notify?.(`Maximum ${maxPhotos} photos supplémentaires autorisées`, "error");
      return;
    }

    const newFiles = fileArray.slice(0, maxPhotos);
    setNewPhotos(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemovePhoto = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewPhotos(prev => prev.filter((_, i) => i !== index));
      setPhotoPreviews(prev => {
        const url = prev[index];
        URL.revokeObjectURL(url);
        return prev.filter((_, i) => i !== index);
      });
    } else {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Le nom du bien est requis";
    if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
    if (!formData.city.trim()) newErrors.city = "La ville est requise";
    if (!formData.zip_code.trim()) newErrors.zip_code = "Le code postal est requis";
    if (!formData.surface.trim()) newErrors.surface = "La surface est requise";
    else if (isNaN(Number(formData.surface)) || Number(formData.surface) <= 0) {
      newErrors.surface = "Surface invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      notify?.("Veuillez corriger les erreurs du formulaire", "error");
      return;
    }

    setIsLoading(true);

    try {
      let uploadedPhotoUrls: string[] = [];
      if (newPhotos.length > 0) {
        for (const file of newPhotos) {
          const res = await uploadService.uploadPhoto(file);
          uploadedPhotoUrls.push(res.path);
        }
      }

      const payload: any = {
        type: formData.type,
        title: formData.name.trim(),
        name: formData.name.trim(),
        description: formData.description || null,
        address: formData.address,
        district: formData.district || null,
        city: formData.city,
        zip_code: formData.zip_code || null,
        surface: formData.surface ? parseFloat(formData.surface) : null,
        room_count: formData.room_count ? parseInt(formData.room_count) : null,
        bedroom_count: formData.bedroom_count ? parseInt(formData.bedroom_count) : null,
        bathroom_count: formData.bathroom_count ? parseInt(formData.bathroom_count) : null,
        rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
        status: formData.status,
        reference_code: formData.reference_code || null,
        photos: [...photos, ...uploadedPhotoUrls],
        meta: {
          terrace: formData.terrace,
          balcony: formData.balcony,
          garden: formData.garden,
          parking: formData.parking,
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          elevator: formData.elevator,
          furnished: formData.furnished,
          heating_type: formData.heating_type || undefined,
          energy_class: formData.energy_class || undefined,
        },
      };

      await propertyService.updateProperty(property.id, payload);

      notify?.("✅ Le bien a été mis à jour avec succès !", "success");
      onSuccess();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      const errorMsg = error.response?.data?.message || "Une erreur est survenue";
      notify?.(errorMsg, "error");

      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};

        Object.keys(validationErrors).forEach(key => {
          formattedErrors[key] = validationErrors[key][0];
        });

        setErrors(formattedErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  return (
    <div className="edit-form">
      <div className="edit-header">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="edit-header-content">
          <div className="edit-title-section">
            <h2 className="edit-title">
              <Building2 size={24} />
              Modifier le bien
            </h2>
            <p className="edit-subtitle">
              Modifiez les informations de votre bien immobilier
            </p>
            <div className="edit-badges">
              <span className="edit-badge">
                {property.reference_code ? `Réf: ${property.reference_code}` : "Sans référence"}
              </span>
              <span className="edit-badge">
                {typeLabel[formData.type] || formData.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="edit-body">
        <div className="form-grid">
          {/* Informations générales */}
          <div className="form-section">
            <h3 className="form-section-title">
              <Home size={18} />
              Informations générales
            </h3>
            <div className="form-fields">
              <div className="form-field">
                <label className="form-label">
                  Type de bien <span className="form-required">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="apartment">Appartement</option>
                  <option value="house">Maison</option>
                  <option value="office">Bureau</option>
                  <option value="commercial">Local commercial</option>
                  <option value="parking">Parking</option>
                  <option value="land">Terrain</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Statut <span className="form-required">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="available">Disponible</option>
                  <option value="rented">Loué</option>
                  <option value="maintenance">En maintenance</option>
                  <option value="off_market">Retiré du marché</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Nom du bien <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: Appartement T3 centre-ville"
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Surface (m²) <span className="form-required">*</span>
                </label>
                <input
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: 65"
                  min="0"
                  step="0.01"
                />
                {errors.surface && <div className="form-error">{errors.surface}</div>}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="form-section">
            <h3 className="form-section-title">
              <MapPin size={18} />
              Adresse
            </h3>
            <div className="form-fields">
              <div className="form-field">
                <label className="form-label">
                  Adresse <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Numéro et rue"
                />
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Ville <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: Paris"
                />
                {errors.city && <div className="form-error">{errors.city}</div>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Code postal <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: 75000"
                />
                {errors.zip_code && <div className="form-error">{errors.zip_code}</div>}
              </div>

              <div className="form-field">
                <label className="form-label">Quartier / Arrondissement</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: Le Marais, 4ème"
                />
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="form-section">
            <h3 className="form-section-title">Caractéristiques</h3>
            <div className="form-fields">
              <div className="form-field">
                <label className="form-label">Nombre de pièces</label>
                <input
                  type="number"
                  name="room_count"
                  value={formData.room_count}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: 4"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Nombre de chambres</label>
                <input
                  type="number"
                  name="bedroom_count"
                  value={formData.bedroom_count}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: 3"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Nombre de salles de bain</label>
                <input
                  type="number"
                  name="bathroom_count"
                  value={formData.bathroom_count}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: 2"
                  min="0"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Étage</label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ex: 3"
                  min="0"
                />
              </div>
            </div>

            <div className="form-checkbox-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="terrace"
                  checked={formData.terrace}
                  onChange={handleChange}
                />
                <span>Terrasse</span>
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="balcony"
                  checked={formData.balcony}
                  onChange={handleChange}
                />
                <span>Balcon</span>
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="garden"
                  checked={formData.garden}
                  onChange={handleChange}
                />
                <span>Jardin</span>
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleChange}
                />
                <span>Parking</span>
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="elevator"
                  checked={formData.elevator}
                  onChange={handleChange}
                />
                <span>Ascenseur</span>
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="furnished"
                  checked={formData.furnished}
                  onChange={handleChange}
                />
                <span>Meublé</span>
              </label>
            </div>

            <div className="form-fields" style={{ marginTop: "1rem" }}>
              <div className="form-field">
                <label className="form-label">Type de chauffage</label>
                <select
                  name="heating_type"
                  value={formData.heating_type}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Sélectionner...</option>
                  <option value="electric">Électrique</option>
                  <option value="gas">Gaz</option>
                  <option value="oil">Fioul</option>
                  <option value="heat_pump">Pompe à chaleur</option>
                  <option value="solar">Solaire</option>
                  <option value="collective">Collectif</option>
                  <option value="none">Aucun</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Classe énergétique</label>
                <select
                  name="energy_class"
                  value={formData.energy_class}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Sélectionner...</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financier */}
          <div className="form-section">
            <h3 className="form-section-title">
              <Euro size={18} />
              Financier
            </h3>
            <div className="form-fields">
              <div className="form-field">
                <label className="form-label">Loyer mensuel (FCFA)</label>
                <input
                  type="number"
                  name="rent_amount"
                  value={formData.rent_amount}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Référence du bien</label>
                <input
                  type="text"
                  name="reference_code"
                  value={formData.reference_code}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      reference_code: e.target.value.toUpperCase()
                    }));
                  }}
                  className="form-control"
                  placeholder="Ex: APP-123"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-section" style={{ marginTop: "1.5rem" }}>
          <h3 className="form-section-title">Description</h3>
          <div className="form-field">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Décrivez le bien, ses points forts, son emplacement..."
              rows={4}
            />
          </div>
        </div>

        {/* Photos */}
        <div className="photos-section">
          <h3 className="form-section-title">
            <ImageIcon size={18} />
            Photos ({photos.length + newPhotos.length}/8)
          </h3>

          {(photos.length > 0 || photoPreviews.length > 0) && (
            <div className="photos-grid">
              {photos.map((photo, index) => {
                const photoUrl = resolvePhotoUrl(photo);
                return photoUrl ? (
                  <div className="photo-item" key={`existing-${index}`}>
                    <img src={photoUrl} alt={`Photo ${index + 1}`} />
                    <button
                      type="button"
                      className="photo-remove"
                      onClick={() => handleRemovePhoto(index, false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null;
              })}

              {photoPreviews.map((preview, index) => (
                <div className="photo-item" key={`new-${index}`}>
                  <img src={preview} alt={`Nouvelle photo ${index + 1}`} />
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => handleRemovePhoto(index, true)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="photo-upload">
            <label className="photo-upload-btn">
              <ImageIcon size={16} />
              Ajouter des photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
                disabled={photos.length + newPhotos.length >= 8}
              />
            </label>
            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              {8 - photos.length - newPhotos.length} photos restantes
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn-secondary"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            <ArrowLeft size={16} />
            Annuler
          </button>
          <button
            className="btn-success"
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="loading-icon" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function BienCard({ bien, onClick }: { bien: typeof biens[0]; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-green-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col group"
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-64 md:h-[280px] w-full overflow-hidden bg-gray-100">
        <img
          src={bien.image}
          alt={bien.titre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center -z-10">
          <Building2 size={48} className="text-green-300/50" />
        </div>

        {/* Status badge */}
        <span
          className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-sm text-white shadow-sm font-medium ${bien.statut === 'Disponible' ? 'bg-[#4ade80]' :
            bien.statut === 'Loué' ? 'bg-[#3b82f6]' :
              bien.statut === 'En travaux' ? 'bg-[#f59e0b]' :
                bien.statut === 'Préavis' ? 'bg-[#ef4444]' : 'bg-gray-500'
            }`}
        >
          {bien.statut}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Header Section */}
        <div className="p-5 flex flex-col gap-1.5">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
            {bien.type}
          </p>
          <h2 className="text-lg font-bold text-gray-900 leading-tight tracking-wide">
            {bien.titre}
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
            <span className="text-red-500 text-base leading-none">📍</span>
            <span className="line-clamp-1">{bien.adresse}</span>
          </p>
        </div>

        {/* Pricing & Surface Section */}
        <div className="px-5 py-4 border-t border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#4db038] tracking-tight">
              {bien.loyer}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              FCFA / mois
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
            <span>{bien.surface}</span>
            <span>m²</span>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-5 py-4 flex justify-between items-center bg-white mt-auto">
          <span className="text-sm text-gray-500 flex items-center gap-2 font-medium">
            <div className="w-7 h-7 bg-[#f0f4ff] rounded-full flex items-center justify-center">
              <ImageIcon size={14} className="text-[#a5b4fc]" />
            </div>
            {bien.photos} Photo{bien.photos > 1 ? "s" : ""}
          </span>
          <span className="text-xs text-gray-500 tracking-wide font-medium">
            {bien.ref}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MesBiens({ notify, currentUser }: MesBiensProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selectedBien, setSelectedBien] = useState<any | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const res = await propertyService.listProperties();
      const mappedResults = (res.data || []).map((p: any) => ({
        id: p.id,
        statut: STATUS_MAP[p.status] || p.status,
        type: (TYPE_MAP[p.type] || p.type).toUpperCase(),
        titre: p.name || p.title || "Sans titre",
        adresse: p.address,
        loyer: p.rent_amount ? parseInt(p.rent_amount).toLocaleString("fr-FR") : "0",
        surface: p.surface || "0",
        photos: p.photos ? p.photos.length : 0,
        ref: p.reference_code || `REF-${p.id}`,
        image: p.photos && p.photos.length > 0 ? resolvePhotoUrl(p.photos[0]) : "",
        raw: p // Garder l'objet original pour l'édition si besoin
      }));
      setProperties(mappedResults);
    } catch (error) {
      console.error("Erreur lors du chargement des biens:", error);
      notify?.("Impossible de charger vos biens", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filtered = properties.filter((b) => {
    const matchFilter = activeFilter === "Tous" || b.statut === activeFilter;
    const matchSearch =
      b.titre.toLowerCase().includes(search.toLowerCase()) ||
      b.adresse.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{styles}</style>

      {/* Top bar - Mobile First */}
      <div className="animate-slideInLeft flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Back button - Mobile First */}
        <div className="inline-flex items-center justify-center w-full sm:w-auto">
          <button
            onClick={() => navigate("/proprietaire/dashboard")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} className="flex-shrink-0" />
            <span className="font-medium text-sm">Retour</span>
          </button>
        </div>

        {/* Search and Add button - Mobile First */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search - Full width on mobile */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 opacity-60" />
            <input
              type="text"
              placeholder="Rechercher par nom, adresse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-transparent bg-transparent text-sm font-sans outline-none text-gray-700 placeholder-gray-500 focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-400/20 transition-all"
            />
          </div>

          {/* Add button - Full width on mobile */}
          <button
            className="animate-scaleIn animate-delay-200 bg-[#58a531] text-white rounded-lg px-6 py-2 font-semibold hover:bg-[#498828] transition-all transform active:scale-95 shadow-md w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={() => navigate("/proprietaire/ajouter-bien")}
          >
            <Plus size={18} className="flex-shrink-0" />
            <span className="text-sm">Ajouter un bien</span>
          </button>
        </div>
      </div>

      {/* Page title - Mobile First */}
      <div className="animate-fadeInUp animate-delay-100 mb-6 font-serif">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <img src="/Ressource_gestiloc/Home.png" alt="Mes biens" className="w-8 h-8" />
          <span className="break-words font-serif tracking-tight">Mes biens</span>
        </h1>
        <p className="text-sm sm:text-sm text-gray-500 leading-relaxed max-w-3xl font-sans mt-2">
          Gérez l'ensemble de vos biens : appartements, maisons, locaux professionnels...
        </p>
      </div>

      {/* Filters - Mobile First */}
      <div className="animate-fadeInUp animate-delay-200 flex flex-wrap gap-2 sm:gap-3 mb-8">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium font-sans cursor-pointer transition-all ${activeFilter === f
              ? "bg-[#80ca57] text-white shadow-md shadow-green-500/20 border border-[#80ca57]"
              : "bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid - Mobile First */}
      <div className="animate-fadeInUp animate-delay-300 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 max-w-[1400px]">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Chargement de vos biens...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((bien) => (
            <BienCard key={bien.id} bien={bien} onClick={() => setSelectedBien(bien)} />
          ))
        ) : (
          <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-3xl py-20 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <Home className="w-10 h-10 text-green-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun bien trouvé</h3>
            <p className="text-gray-500 mb-8 max-w-sm text-center">
              {search || activeFilter !== "Tous"
                ? "Aucun bien ne correspond à vos critères de recherche."
                : "Vous n'avez pas encore ajouté de bien immobilier. Commencez par en ajouter un pour le gérer."}
            </p>
            {!search && activeFilter === "Tous" && (
              <button
                onClick={() => navigate("/proprietaire/ajouter-bien")}
                className="bg-[#58a531] text-white rounded-xl px-8 py-3 font-bold hover:bg-[#498828] transition-all transform active:scale-95 shadow-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Ajouter maintenant
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal FICHE BIEN / ÉDITION */}
      {selectedBien && (
        <div className="modal-overlay" onClick={() => setSelectedBien(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <EditPropertyModal
              property={selectedBien.raw}
              onClose={() => setSelectedBien(null)}
              onSuccess={() => {
                setSelectedBien(null);
                fetchProperties();
              }}
              notify={notify}
            />
          </div>
        </div>
      )}
    </div>
  );
}