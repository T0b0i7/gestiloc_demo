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

// Données mockées
const biens = [
  {
    id: 1,
    statut: "Loué",
    type: "APPARTEMENT",
    titre: "Appartement 12 - Agla",
    adresse: "Boulevard de la marina, Cotonou",
    loyer: "60.000",
    surface: "65",
    photos: 1,
    ref: "PR-WZ6WHU",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
  {
    id: 2,
    statut: "Disponible",
    type: "MAISON",
    titre: "Villa moderne - Fidjrossè",
    adresse: "Rue des Cocotiers, Cotonou",
    loyer: "150.000",
    surface: "120",
    photos: 5,
    ref: "PR-ABC123",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
  },
  {
    id: 3,
    statut: "Loué",
    type: "STUDIO",
    titre: "Studio cosy - Centre-ville",
    adresse: "Avenue Steinmetz, Cotonou",
    loyer: "35.000",
    surface: "28",
    photos: 3,
    ref: "PR-XYZ78",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
];

const filters = ["Tous", "Loué", "Disponible", "En travaux", "Préavis", "Meublé"];

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
      className="bg-white border border-green-500/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:scale-95 group"
    >
      {/* Image - Mobile First */}
      <div className="relative h-48 sm:h-52 lg:h-56 overflow-hidden">
        <img
          src={bien.image}
          alt={bien.titre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = "none";
          }}
        />
        {/* Fallback placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
          <Building2 size={48} className="text-green-500/30" />
        </div>
        
        {/* Status badge */}
        <span 
          className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold font-sans text-white shadow-lg ${
            bien.statut === 'Disponible' ? 'bg-green-500' :
            bien.statut === 'Loué' ? 'bg-blue-500' :
            bien.statut === 'En travaux' ? 'bg-orange-500' :
            bien.statut === 'Préavis' ? 'bg-red-500' : 'bg-gray-500'
          }`}
        >
          {bien.statut}
        </span>
      </div>

      {/* Content - Mobile First */}
      <div className="p-4 sm:p-5">
        {/* Type */}
        <p className="text-xs font-bold text-gray-400 tracking-wider mb-2 font-sans uppercase">
          {bien.type}
        </p>
        
        {/* Title */}
        <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
          {bien.titre}
        </h2>
        
        {/* Address */}
        <p className="text-sm text-gray-600 mb-4 flex items-start gap-2 leading-relaxed">
          <MapPin size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{bien.adresse}</span>
        </p>

        {/* Price + Surface */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold text-green-500 leading-tight">
              {bien.loyer}
            </span>
            <span className="text-xs text-gray-400 font-sans mt-1">FCFA/mois</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 font-sans">
            <Ruler size={14} className="flex-shrink-0" />
            <span>{bien.surface} m²</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <span className="text-xs text-gray-400 flex items-center gap-1 font-sans">
            <ImageIcon size={12} className="flex-shrink-0" />
            {bien.photos} Photo{bien.photos > 1 ? "s" : ""}
          </span>
          <span className="text-xs text-gray-400 font-sans font-mono">
            Réf. {bien.ref}
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
  const [selectedBien, setSelectedBien] = useState<typeof biens[0] | null>(null);

  const filtered = biens.filter((b) => {
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
      <div className="animate-slideInLeft flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        {/* Back button - Mobile First */}
        <div className="bg-white border border-green-500 rounded-2xl p-4 inline-flex items-center justify-center w-full sm:w-auto">
          <button
            onClick={() => navigate("/proprietaire/dashboard")}
            className="flex items-center gap-2 text-gray-700 bg-transparent border-none cursor-pointer hover:text-green-600 transition-colors"
          >
            <ArrowLeft size={20} className="flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Retour au tableau de bord</span>
          </button>
        </div>
        
        {/* Search and Add button - Mobile First */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search - Full width on mobile */}
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par nom, adresse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-green-500/50 bg-white/90 text-sm sm:text-base font-sans outline-none text-gray-700 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>
          
          {/* Add button - Full width on mobile */}
          <button
            className="animate-scaleIn animate-delay-200 bg-green-500 text-white rounded-xl px-4 py-2.5 font-semibold hover:bg-green-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20 w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={() => navigate("/proprietaire/ajouter-bien")}
          >
            <Plus size={18} className="flex-shrink-0" />
            <span className="text-sm sm:text-base">Ajouter un bien</span>
          </button>
        </div>
      </div>

      {/* Page title - Mobile First */}
      <div className="animate-fadeInUp animate-delay-100 mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <span className="text-2xl sm:text-3xl">🏘️</span>
          <span className="break-words">Mes biens</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
          Gérez l'ensemble de vos biens : appartements, maisons, locaux professionnels...
        </p>
      </div>

      {/* Filters - Mobile First */}
      <div className="animate-fadeInUp animate-delay-200 flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
        {["Tous", "Disponible", "Loué", "En travaux", "Préavis"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold font-sans cursor-pointer transition-all transform active:scale-95 ${
              activeFilter === f 
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                : "bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid - Mobile First */}
      <div className="animate-fadeInUp animate-delay-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map((bien) => (
          <BienCard key={bien.id} bien={bien} onClick={() => setSelectedBien(bien)} />
        ))}
      </div>

      {/* Modal FICHE BIEN */}
      {selectedBien && (
        <FicheBienModal
          bien={selectedBien}
          onClose={() => setSelectedBien(null)}
        />
      )}
    </div>
  );
}