import React, { useEffect, useState, useMemo } from "react";
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
  AlertTriangle,
  Bed,
  Bath,
  Layers,
  Thermometer,
  Zap,
  Check,
} from "lucide-react";
import {
  propertyService,
  Property,
  PaginatedResponse,
  uploadService,
} from "@/services/api";
import api from "@/services/api";

// ✅ STYLES CSS COMPLETS (inchangés)
const styles = `
.properties-page {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 2rem;
}

.properties-container {
  max-width: 1200px;
  margin: 0 auto;
}

.properties-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.properties-title-block {
  flex: 1;
  min-width: 220px;
}

.properties-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #000000ff;
}

.properties-subtitle {
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.properties-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 260px;
}

.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.5rem;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: white;
  font-size: 0.9rem;
  color: #111827;
  outline: none;
  transition: all 0.15s ease;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.button {
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-family: inherit;
  justify-content: center;
}

.button-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.5);
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.property-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
}

.property-image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  display: flex;
  align-items: center;
  justify-content: center;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.property-status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-available {
  background: #16a34a;
}

.status-rented {
  background: #2563eb;
}

.status-maintenance {
  background: #ea580c;
}

.status-off_market {
  background: #6b7280;
}

.property-body {
  padding: 1.25rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.property-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.property-type {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  font-weight: 600;
}

.property-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #4b5563;
  margin-top: 0.25rem;
}

.property-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #4b5563;
}

.property-rent {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-weight: 700;
  color: #111827;
}

.property-rent span {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
}

.property-surface {
  font-size: 0.85rem;
  color: #4b5563;
}

.property-footer {
  padding: 0.85rem 1.5rem 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6b7280;
}

.property-photos-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.badge-muted {
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
}

.property-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem 1rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-view {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-view:hover {
  background: #e5e7eb;
}

.btn-edit {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.empty-state,
.error-state,
.loading-state {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  margin-top: 1rem;
}

.empty-title,
.error-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #111827;
}

.empty-text,
.error-text {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1.25rem;
}

.empty-text-margin {
  margin-top: 0.75rem;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========= BADGES DE DÉLÉGATION ========= */
.delegation-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
}

.badge-agency {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.badge-coowner {
  background: rgba(59, 130, 246, 0.95);
  color: white;
}

.badge-owner {
  background: rgba(16, 185, 129, 0.95);
  color: white;
}

/* ========= MODALES ========= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

/* ========= VUE DÉTAILS ========= */
.view-modal-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 900px;
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
  transition: transform 0.2s ease;
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

// Fonctions utilitaires
const formatPrice = (value: string | null) => {
  if (!value) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("fr-FR", { minimumFractionDigits: 0 }) + " FCFA";
};

const formatSurface = (value: string | null) => {
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

interface MesBiensProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
  currentUser?: {
    id: number;
    email: string;
    role: "landlord" | "co_owner" | "admin";
  };
}

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

// Composant pour afficher les détails d'un bien
const PropertyDetailsModal: React.FC<{
  property: Property;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}> = ({ property, onClose, onEdit, canEdit }) => {
  const firstPhoto = resolvePhotoUrl(property.photos?.[0] ?? null);
  const statusKey = property.status ?? "available";
  const typeText = typeLabel[property.type] ?? property.type;
  const meta = property.meta || {};
  
  // Caractéristiques
  const features = [
    { key: 'terrace', label: 'Terrasse', icon: <Home size={16} />, active: meta.terrace },
    { key: 'balcony', label: 'Balcon', icon: <Home size={16} />, active: meta.balcony },
    { key: 'garden', label: 'Jardin', icon: <Home size={16} />, active: meta.garden },
    { key: 'parking', label: 'Parking', icon: <Home size={16} />, active: meta.parking },
    { key: 'elevator', label: 'Ascenseur', icon: <Layers size={16} />, active: meta.elevator },
    { key: 'furnished', label: 'Meublé', icon: <Home size={16} />, active: meta.furnished },
  ];

  return (
    <div className="view-modal-content">
      <div className="view-header">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="view-header-content">
          <div className="view-title-section">
            <h2 className="view-title">{property.name || "Bien sans titre"}</h2>
            <p className="view-subtitle">
              {property.address}
              {property.district ? `, ${property.district}` : ""}
              {property.city ? `, ${property.city}` : ""}
              {property.zip_code ? ` ${property.zip_code}` : ""}
            </p>
            <div className="view-badges">
              <span className="view-badge">
                {typeText}
              </span>
              <span className="view-badge">
                {statusLabel[statusKey] ?? property.status}
              </span>
              {property.reference_code && (
                <span className="view-badge">
                  Réf. {property.reference_code}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="view-body">
        {/* Informations générales */}
        <div className="view-section">
          <h3 className="view-section-title">
            <Home size={20} />
            Informations générales
          </h3>
          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Type</span>
              <span className="view-value">{typeText}</span>
            </div>
            <div className="view-field">
              <span className="view-label">Statut</span>
              <span className="view-value">{statusLabel[statusKey] ?? property.status}</span>
            </div>
            <div className="view-field">
              <span className="view-label">Surface</span>
              <span className="view-value">
                <Ruler size={16} />
                {formatSurface(property.surface)}
              </span>
            </div>
            <div className="view-field">
              <span className="view-label">Loyer mensuel</span>
              <span className="view-value">
                <Euro size={16} />
                {formatPrice(property.rent_amount)}
              </span>
            </div>
            {property.room_count && (
              <div className="view-field">
                <span className="view-label">Nombre de pièces</span>
                <span className="view-value">{property.room_count}</span>
              </div>
            )}
            {property.bedroom_count && (
              <div className="view-field">
                <span className="view-label">Nombre de chambres</span>
                <span className="view-value">
                  <Bed size={16} />
                  {property.bedroom_count}
                </span>
              </div>
            )}
            {property.bathroom_count && (
              <div className="view-field">
                <span className="view-label">Nombre de salles de bain</span>
                <span className="view-value">
                  <Bath size={16} />
                  {property.bathroom_count}
                </span>
              </div>
            )}
            {property.floor && (
              <div className="view-field">
                <span className="view-label">Étage</span>
                <span className="view-value">
                  <Layers size={16} />
                  {property.floor}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Adresse complète */}
        <div className="view-section">
          <h3 className="view-section-title">
            <MapPin size={20} />
            Adresse
          </h3>
          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Adresse</span>
              <span className="view-value">{property.address || "-"}</span>
            </div>
            <div className="view-field">
              <span className="view-label">Ville</span>
              <span className="view-value">{property.city || "-"}</span>
            </div>
            <div className="view-field">
              <span className="view-label">Code postal</span>
              <span className="view-value">{property.zip_code || "-"}</span>
            </div>
            <div className="view-field">
              <span className="view-label">Quartier/Arrondissement</span>
              <span className="view-value">{property.district || "-"}</span>
            </div>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="view-section">
          <h3 className="view-section-title">Caractéristiques</h3>
          <div className="features-grid">
            {features.map((feature) => (
              <div 
                key={feature.key} 
                className={`feature-item ${feature.active ? 'active' : 'inactive'}`}
              >
                {feature.icon}
                <span>{feature.label}</span>
                {feature.active && <Check size={14} />}
              </div>
            ))}
          </div>
          
          {(meta.heating_type || meta.energy_class) && (
            <div className="view-grid" style={{ marginTop: "1.5rem" }}>
              {meta.heating_type && (
                <div className="view-field">
                  <span className="view-label">Type de chauffage</span>
                  <span className="view-value">
                    <Thermometer size={16} />
                    {heatingTypeLabel[meta.heating_type] || meta.heating_type}
                  </span>
                </div>
              )}
              {meta.energy_class && (
                <div className="view-field">
                  <span className="view-label">Classe énergétique</span>
                  <span className="view-value">
                    <Zap size={16} />
                    {meta.energy_class}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <div className="view-section">
            <h3 className="view-section-title">Description</h3>
            <p style={{ 
              color: "#4b5563", 
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              backgroundColor: "#f9fafb",
              padding: "1rem",
              borderRadius: "8px"
            }}>
              {property.description}
            </p>
          </div>
        )}

        {/* Photos */}
        {property.photos && property.photos.length > 0 && (
          <div className="view-section">
            <h3 className="view-section-title">
              <ImageIcon size={20} />
              Photos ({property.photos.length})
            </h3>
            <div className="view-photos">
              {property.photos.map((photo, index) => {
                const photoUrl = resolvePhotoUrl(photo);
                return photoUrl ? (
                  <div className="view-photo" key={index}>
                    <img 
                      src={photoUrl} 
                      alt={`Photo ${index + 1}`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Informations de délégation */}
        {property.delegation_type && (
          <div className="view-section">
            <h3 className="view-section-title">Délégation</h3>
            <div className="view-grid">
              <div className="view-field">
                <span className="view-label">Type de délégation</span>
                <span className="view-value">
                  {property.delegation_type === 'agency' ? (
                    <>
                      <Lock size={16} />
                      Géré par agence
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      Partagé avec co-propriétaire
                    </>
                  )}
                </span>
              </div>
              {property.delegation_info?.co_owner_name && (
                <div className="view-field">
                  <span className="view-label">Nom</span>
                  <span className="view-value">{property.delegation_info.co_owner_name}</span>
                </div>
              )}
              {property.delegation_info?.co_owner_company && (
                <div className="view-field">
                  <span className="view-label">Société</span>
                  <span className="view-value">{property.delegation_info.co_owner_company}</span>
                </div>
              )}
              {property.delegation_info?.delegated_at && (
                <div className="view-field">
                  <span className="view-label">Délégué depuis</span>
                  <span className="view-value">
                    {new Date(property.delegation_info.delegated_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="view-actions">
        <button
          className="btn-secondary"
          type="button"
          onClick={onClose}
        >
          <X size={16} />
          Fermer
        </button>
        {canEdit && (
          <button
            className="btn-success"
            type="button"
            onClick={onEdit}
          >
            <Edit size={16} />
            Modifier
          </button>
        )}
      </div>
    </div>
  );
};

// Composant pour éditer un bien (inchangé, déjà complet)
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

export const MesBiens: React.FC<MesBiensProps> = ({ notify, currentUser }) => {
  const [data, setData] = useState<PaginatedResponse<Property> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  // États pour les modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await propertyService.listProperties();
      setData(response);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error("Erreur chargement propriétés:", err);
      setError(
        e?.message ||
          "Impossible de charger vos biens. Veuillez réessayer dans quelques instants."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const properties = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return properties;
    const term = search.toLowerCase();
    return (properties ?? []).filter((p) => {
      return (
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.address && p.address.toLowerCase().includes(term)) ||
        (p.city && p.city.toLowerCase().includes(term)) ||
        (p.reference_code && p.reference_code.toLowerCase().includes(term))
      );
    });
  }, [properties, search]);

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setShowAddModal(true);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  const handleOpenProperty = (property: Property) => {
    if (property.can_edit === false) {
      handleViewProperty(property);
      return;
    }
    handleEditProperty(property);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setShowAddModal(false);
    setSelectedProperty(null);
  };

  const handlePropertyUpdated = () => {
    fetchProperties();
    handleCloseModal();
    if (notify) {
      notify("✅ Le bien a été mis à jour avec succès !", "success");
    }
  };

  const handlePropertyAdded = () => {
    fetchProperties();
    handleCloseModal();
    if (notify) {
      notify("✅ Le bien a été ajouté avec succès !", "success");
    }
  };

  const getButtonText = (property: Property) => {
    const canEdit = property.can_edit !== false;
    const delegationType = property.delegation_type;
    
    if (!canEdit) {
      if (delegationType === 'agency') {
        return "Voir (Géré par agence)";
      } else if (delegationType === 'co_owner') {
        return "Voir (Partagé)";
      }
      return "Voir les détails";
    }
    return "Modifier";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="properties-page">
        <div className="properties-container">
          <div className="properties-header">
            <div className="properties-title-block">
              <div className="properties-title">
                <Home size={28} />
                <span>Mes biens</span>
              </div>
              <p className="properties-subtitle">
                Gérez l'ensemble de vos biens : appartements, maisons, locaux professionnels…
              </p>
            </div>

            <div className="properties-actions">
              <div className="search-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher par nom, adresse, ville ou référence…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {currentUser?.role === "landlord" && (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={handleAddProperty}
                >
                  <Plus size={18} />
                  Ajouter un bien
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="loading-state">
              <Loader2 className="loading-icon" size={32} />
              <p className="empty-text empty-text-margin">
                Chargement de vos biens en cours...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="error-state">
              <AlertCircle size={28} color="#b91c1c" />
              <p className="error-title">Une erreur est survenue</p>
              <p className="error-text">{error}</p>
              <button
                className="button button-primary"
                type="button"
                onClick={fetchProperties}
              >
                Réessayer
              </button>
            </div>
          )}

          {!isLoading && !error && properties.length === 0 && (
            <div className="empty-state">
              <Home size={32} color="#9ca3af" />
              <p className="empty-title">
                Vous n'avez encore aucun bien enregistré
              </p>
              <p className="empty-text">
                Ajoutez votre premier bien pour commencer à suivre vos
                locations, loyers et locataires dans Gestiloc.
              </p>
              {currentUser?.role === "landlord" && (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={handleAddProperty}
                >
                  <Plus size={18} />
                  Ajouter mon premier bien
                </button>
              )}
            </div>
          )}

          {!isLoading &&
            !error &&
            properties.length > 0 &&
            filtered.length === 0 && (
              <div className="empty-state">
                <Search size={28} color="#9ca3af" />
                <p className="empty-title">
                  Aucun bien ne correspond à votre recherche
                </p>
                <p className="empty-text">
                  Essayez avec un autre nom, une adresse ou une ville.
                </p>
              </div>
            )}

          {!isLoading && !error && filtered.length > 0 && (
            <div className="properties-grid">
              {filtered.map((property) => {
                const firstPhoto = resolvePhotoUrl(property.photos?.[0] ?? null);
                const statusKey = property.status ?? "available";
                const statusClass = `property-status-badge status-${statusKey}`;
                const canEdit = property.can_edit !== false;
                const delegationType = property.delegation_type;
                
                let badgeConfig = null;
                if (delegationType === 'agency') {
                  badgeConfig = delegationLabel.agency;
                } else if (delegationType === 'co_owner') {
                  badgeConfig = delegationLabel.co_owner;
                }

                return (
                  <div className="property-card" key={property.id}>
                    <div
                      className="property-image-wrapper"
                      onClick={() =>
                        canEdit
                          ? handleOpenProperty(property)
                          : handleViewProperty(property)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {firstPhoto ? (
                        <img
                          src={firstPhoto}
                          alt={property.name || "Photo du bien"}
                          className="property-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <ImageIcon size={40} color="#9ca3af" />
                      )}
                      <div className={statusClass}>
                        {statusLabel[statusKey] ?? property.status}
                      </div>
                      
                      {badgeConfig && (
                        <div className={`delegation-badge badge-${delegationType}`}>
                          {badgeConfig.icon}
                          {badgeConfig.label}
                        </div>
                      )}

                      {!delegationType && currentUser?.role === "landlord" && (
                        <div className="delegation-badge badge-owner">
                          <ShieldCheck size={11} />
                          En propriété directe
                        </div>
                      )}
                    </div>

                    <div
                      className="property-body"
                      onClick={() =>
                        canEdit
                          ? handleOpenProperty(property)
                          : handleViewProperty(property)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <p className="property-type">
                        {typeLabel[property.type] ?? property.type}
                      </p>
                      <h3 className="property-title">
                        {property.name ||
                          property.reference_code ||
                          "Bien sans titre"}
                      </h3>
                      <div className="property-location">
                        <MapPin size={15} />
                        <span>
                          {property.address}
                          {property.city ? `, ${property.city}` : ""}
                        </span>
                      </div>

                      <div className="property-meta">
                        <div className="property-rent">
                          <Euro size={14} />
                          <span>{formatPrice(property.rent_amount)}</span>
                          <span>/ mois</span>
                        </div>
                        <div className="property-surface">
                          {formatSurface(property.surface)}
                        </div>
                      </div>
                    </div>

                    <div className="property-footer">
                      <div className="property-photos-count">
                        <ImageIcon size={14} />
                        <span>
                          {property.photos?.length
                            ? `${property.photos.length} photo${
                                property.photos.length > 1 ? "s" : ""
                              }`
                            : "Aucune photo"}
                        </span>
                      </div>
                      {property.reference_code && (
                        <span className="badge-muted">
                          Réf. {property.reference_code}
                        </span>
                      )}
                    </div>

                    <div className="property-actions">
                      {canEdit ? (
                        <button
                          className="btn-edit"
                          type="button"
                          onClick={() => handleEditProperty(property)}
                        >
                          <Edit size={14} />
                          Modifier
                        </button>
                      ) : (
                        <button
                          className="btn-view"
                          type="button"
                          onClick={() => handleViewProperty(property)}
                        >
                          <Eye size={14} />
                          {getButtonText(property)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && selectedProperty && (
        <div className="modal-overlay">
          <EditPropertyModal
            property={selectedProperty}
            onClose={handleCloseModal}
            onSuccess={handlePropertyUpdated}
            notify={notify}
          />
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedProperty && (
        <div className="modal-overlay">
          <PropertyDetailsModal
            property={selectedProperty}
            onClose={handleCloseModal}
            onEdit={() => {
              setShowViewModal(false);
              handleEditProperty(selectedProperty);
            }}
            canEdit={selectedProperty.can_edit !== false}
          />
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal}>
              <X size={20} />
            </button>
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h3 style={{ marginBottom: "1rem" }}>Ajouter un bien</h3>
              <p>Le formulaire d'ajout sera intégré ici.</p>
              <button
                className="btn-success"
                onClick={handleCloseModal}
                style={{ marginTop: "1rem" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MesBiens;