import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Building,
  MapPin,
  DollarSign,
  Save,
  Send,
  AlertCircle,
  Image as ImageIcon,
  Car,
  Sofa,
  Building2,
  Bath,
  Bed,
  DoorOpen,
  Ruler,
  Hash,
  Globe,
  Check,
  Calendar,
  Layers,
  Home,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Euro,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { coOwnerApi } from '../../../services/coOwnerApi';

interface PropertyEditModalProps {
  property: any | null;
  isOpen: boolean;
  onClose: () => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
  onUpdate: () => void;
}

export const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
  property,
  isOpen,
  onClose,
  notify,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ title: string; text?: string } | null>(null);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (property) {
      const initialData = {
        name: property.name || '',
        address: property.address || '',
        district: property.district || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        country: property.country || '',
        latitude: property.latitude || '',
        longitude: property.longitude || '',
        surface: property.surface || '',
        floor: property.floor || '',
        total_floors: property.total_floors || '',
        room_count: property.room_count || '',
        bedroom_count: property.bedroom_count || '',
        bathroom_count: property.bathroom_count || '',
        wc_count: property.wc_count || '',
        construction_year: property.construction_year || '',
        rent_amount: property.rent_amount || '',
        charges_amount: property.charges_amount || '',
        caution: property.caution || '',
        description: property.description || '',
        property_type: property.property_type || 'apartment',
        reference_code: property.reference_code || '',
        status: property.status || 'available',
        
        // Équipements
        has_garage: property.has_garage || false,
        has_parking: property.has_parking || false,
        is_furnished: property.is_furnished || false,
        has_elevator: property.has_elevator || false,
        has_balcony: property.has_balcony || false,
        has_terrace: property.has_terrace || false,
        has_cellar: property.has_cellar || false,
      };
      
      setFormData(initialData);
      
      // Initialiser les équipements
      if (property.amenities && Array.isArray(property.amenities)) {
        setAmenitiesList(property.amenities);
      }
      
      // Initialiser les images
      if (property.photos && property.photos.length > 0) {
        setPreviewImages(property.photos.map((photo: string) => 
          photo.startsWith('http') ? photo : `${import.meta.env.VITE_API_URL || 'https://wheat-skunk-120710.hostingersite.com'}/storage/${photo}`
        ));
      }
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value),
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value === '' ? null : value,
      }));
    }
    
    // Clear error when field is modified
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setNewImages(prev => [...prev, ...fileArray]);

    // Créer des URLs de prévisualisation
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    if (index < previewImages.length - newImages.length) {
      // C'est une image existante - juste la retirer de la prévisualisation
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // C'est une nouvelle image - la retirer des deux listes
      const newIndex = index - (previewImages.length - newImages.length);
      setNewImages(prev => prev.filter((_, i) => i !== newIndex));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addAmenity = () => {
    if (amenitiesInput.trim() && !amenitiesList.includes(amenitiesInput.trim())) {
      setAmenitiesList(prev => [...prev, amenitiesInput.trim()]);
      setAmenitiesInput('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenitiesList(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) errors.name = 'Le titre du bien est obligatoire';
    if (!formData.surface || Number(formData.surface) <= 0) errors.surface = 'La surface doit être > 0';
    if (!formData.address?.trim()) errors.address = 'L\'adresse est obligatoire';
    if (!formData.zip_code?.trim()) errors.zip_code = 'Le code postal est obligatoire';
    if (!formData.city?.trim()) errors.city = 'La ville est obligatoire';
    if (formData.rent_amount && Number(formData.rent_amount) < 0) errors.rent_amount = 'Le loyer doit être positif';
    if (formData.charges_amount && Number(formData.charges_amount) < 0) errors.charges_amount = 'Les charges doivent être positives';
    if (formData.caution && Number(formData.caution) < 0) errors.caution = 'La caution doit être positive';
    if (!formData.property_type) errors.property_type = 'Le type de bien est obligatoire';
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setBanner(null);
    const errors = validate();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const msg = Object.values(errors)[0] || 'Veuillez corriger les erreurs dans le formulaire';
      setBanner({ title: 'Formulaire incomplet', text: msg });
      notify(msg, 'error');
      return;
    }

    try {
      setLoading(true);

      // Préparer les données pour l'envoi
      const submissionData: any = {};
      
      // Liste des champs qui doivent être des strings
      const stringFields = [
        'name', 'address', 'district', 'city', 'state', 'zip_code', 
        'country', 'latitude', 'longitude', 'property_type', 
        'description', 'reference_code', 'status'
      ];
      
      // Liste des champs qui doivent être des nombres
      const numberFields = [
        'surface', 'floor', 'total_floors', 'room_count', 'bedroom_count',
        'bathroom_count', 'wc_count', 'construction_year', 
        'rent_amount', 'charges_amount', 'caution'
      ];
      
      // Liste des champs booléens
      const booleanFields = [
        'has_garage', 'has_parking', 'is_furnished', 'has_elevator', 
        'has_balcony', 'has_terrace', 'has_cellar'
      ];
      
      // Traiter tous les champs du formulaire
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        
        // Si la valeur est null, undefined ou vide, on ne l'envoie pas
        if (value === null || value === undefined || value === '') {
          // Sauf pour reference_code qui doit toujours être envoyé
          if (key === 'reference_code') {
            submissionData[key] = String(property.reference_code || `REF-${property.id}-${Date.now()}`).trim();
          }
          return;
        }
        
        // Traiter selon le type de champ
        if (stringFields.includes(key)) {
          // Convertir en string
          submissionData[key] = String(value);
        } 
        else if (numberFields.includes(key)) {
          // Convertir en nombre
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            submissionData[key] = numValue;
          }
        }
        else if (booleanFields.includes(key)) {
          // Convertir en booléen
          submissionData[key] = Boolean(value);
        }
        else {
          // Pour les autres champs, garder la valeur telle quelle
          submissionData[key] = value;
        }
      });
      
      // S'assurer que reference_code existe toujours
      if (!submissionData.reference_code || submissionData.reference_code.trim() === '') {
        submissionData.reference_code = String(property.reference_code || `REF-${property.id}-${Date.now()}`).trim();
      }
      
      // S'assurer que zip_code est une string (même si c'est un nombre)
      if (submissionData.zip_code !== undefined && submissionData.zip_code !== null) {
        submissionData.zip_code = String(submissionData.zip_code);
      }
      
      // Ajouter les équipements si existants
      if (amenitiesList.length > 0) {
        submissionData.amenities = amenitiesList;
      }
      
      console.log('Données envoyées:', JSON.stringify(submissionData, null, 2));

      // Appeler l'API pour mettre à jour la propriété
      await coOwnerApi.updateProperty(property.id, submissionData);

      // Si on a de nouvelles images, les uploader
      if (newImages.length > 0) {
        const formDataImages = new FormData();
        newImages.forEach(file => {
          formDataImages.append('photos[]', file);
        });
        
        await coOwnerApi.uploadPropertyPhotos(property.id, formDataImages);
      }

      notify('✅ Modification enregistrée et propriétaire notifié', 'success');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating property:', error);
      
      // Afficher les erreurs de validation détaillées
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        notify(`❌ Erreurs de validation:\n${errorMessages}`, 'error');
        setBanner({ title: 'Erreur de validation', text: 'Certains champs sont invalides. Vérifiez le formulaire.' });
      } else if (error.response?.data?.message) {
        notify(error.response.data.message, 'error');
        setBanner({ title: 'Erreur', text: error.response.data.message });
      } else {
        notify(error.message || 'Erreur lors de la mise à jour du bien', 'error');
        setBanner({ title: 'Erreur', text: 'Une erreur est survenue lors de la mise à jour' });
      }
    } finally {
      setLoading(false);
    }
  };

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'office', label: 'Bureau' },
    { value: 'commercial', label: 'Local commercial' },
    { value: 'warehouse', label: 'Entrepôt' },
    { value: 'parking', label: 'Parking' },
    { value: 'land', label: 'Terrain' },
    { value: 'other', label: 'Autre' },
  ];

  const propertyStatuses = [
    { value: 'available', label: 'Disponible' },
    { value: 'rented', label: 'Loué' },
    { value: 'maintenance', label: 'En maintenance' },
    { value: 'renovation', label: 'En rénovation' },
  ];

  const photosRemaining = useMemo(() => Math.max(0, 8 - previewImages.length), [previewImages.length]);

  if (!isOpen || !property) return null;

  return (
    <>
      <style>{`
        :root{
          --gradA: #70AE48;
          --gradB: #8BC34A;
          --indigo: #70AE48;
          --violet: #8BC34A;
          --emerald: #10b981;

          --bg:#ffffff;
          --ink:#0f172a;
          --muted:#64748b;
          --muted2:#94a3b8;

          --line: rgba(15,23,42,.10);
          --line2: rgba(15,23,42,.08);

          --shadow: 0 22px 70px rgba(0,0,0,.18);
          --shadow2: 0 12px 35px rgba(15,23,42,.10);
          --shadow3: 0 8px 18px rgba(15,23,42,.08);

          --ring: 0 0 0 4px rgba(112,174,72,.14);
        }

        *{ box-sizing:border-box; }

        .modal-overlay{
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,.72);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 26px;
          z-index: 9999;
          opacity: 0;
          animation: fadeIn 0.2s ease forwards;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .modal-shell{
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.3s ease 0.1s forwards;
        }

        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-card{
          background: rgba(255,255,255,.92);
          border-radius: 22px;
          box-shadow: var(--shadow);
          overflow: hidden;
          border: 1px solid rgba(112,174,72,.18);
          position: relative;
          backdrop-filter: blur(10px);
          overflow-y: auto;
          max-height: 90vh;
        }

        .modal-card::before{
          content:"";
          position:absolute;
          inset:0;
          pointer-events:none;
          background:
            radial-gradient(circle at 14% 18%, rgba(112,174,72,.10), rgba(112,174,72,0) 58%),
            radial-gradient(circle at 88% 30%, rgba(139,195,74,.10), rgba(139,195,74,0) 58%),
            radial-gradient(circle at 50% 95%, rgba(16,185,129,.08), rgba(16,185,129,0) 55%);
          z-index: 0;
        }

        .modal-header{
          background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
          padding: 2.25rem;
          color: #fff;
          position: relative;
          overflow:hidden;
          z-index: 1;
        }

        .modal-header-art{
          position:absolute;
          inset:0;
          pointer-events:none;
          z-index:0;
        }
        .modal-header-art .blob{
          position:absolute;
          right:-180px;
          top:-210px;
          width: 640px;
          height: 640px;
          opacity: .95;
          filter: drop-shadow(0 18px 44px rgba(0,0,0,.18));
        }
        .modal-header-art .ring{
          position:absolute;
          left:-140px;
          bottom:-180px;
          width: 520px;
          height: 520px;
          opacity: .55;
        }

        .modal-header-row{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap: 14px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .modal-title-wrap{ display:flex; flex-direction:column; gap: 8px; }

        .modal-title{
          display:flex;
          align-items:center;
          gap: 10px;
          font-weight: 1000;
          letter-spacing: -0.03em;
          font-size: 28px;
          margin: 0;
          line-height: 1.05;
          color: white;
        }

        .modal-subtitle{
          margin: 0;
          opacity: .94;
          font-weight: 650;
          font-size: 14px;
          max-width: 72ch;
          color: white;
        }

        .modal-badge-row{
          display:flex;
          gap: .6rem;
          align-items:center;
          flex-wrap: wrap;
        }

        .modal-pill-head{
          display:inline-flex;
          align-items:center;
          gap: .5rem;
          padding: .5rem .75rem;
          border-radius: 999px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(10px);
          font-weight: 850;
          font-size: .82rem;
          white-space: nowrap;
        }

        .modal-body{
          padding: 2.25rem;
          position: relative;
          z-index: 1;
        }

        .modal-banner{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          padding: 14px 16px;
          background:
            radial-gradient(700px 220px at 20% 0%, rgba(112,174,72,.10), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.74), rgba(255,255,255,0.50));
          border: 1px solid rgba(15,23,42,.10);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(17,24,39,.06);
          margin-bottom: 16px;
        }
        .modal-banner strong{
          display:block;
          font-weight: 950;
          font-size: 13px;
          letter-spacing: -0.01em;
        }
        .modal-banner p{
          margin: 2px 0 0 0;
          font-weight: 750;
          font-size: 13px;
          color: var(--muted);
          white-space: pre-line;
        }

        .modal-grid{
          display:grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 14px;
        }

        .modal-section{
          background: rgba(255,255,255,.72);
          padding: 1.25rem;
          border-radius: 16px;
          border: 1px solid rgba(17,24,39,.08);
          box-shadow: 0 10px 30px rgba(17,24,39,.06);
          backdrop-filter: blur(10px);
          position: relative;
          overflow:hidden;
        }
        .modal-section::before{
          content:"";
          position:absolute;
          inset:0;
          background:
            radial-gradient(900px 260px at 90% 0%, rgba(112,174,72,.06), transparent 62%),
            radial-gradient(900px 260px at 10% 0%, rgba(139,195,74,.07), transparent 62%);
          pointer-events:none;
        }
        .modal-section > *{ position: relative; }

        .modal-section-head{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(112,174,72,.28);
        }

        .modal-section-title{
          display:flex;
          align-items:center;
          gap: 8px;
          font-weight: 950;
          font-size: 14px;
          margin: 0;
          letter-spacing: -0.01em;
          color: var(--ink);
        }

        .modal-pill{
          display:inline-flex;
          align-items:center;
          gap: .45rem;
          padding: .25rem .6rem;
          border-radius: 999px;
          background: rgba(112,174,72,.10);
          border: 1px solid rgba(112,174,72,.18);
          color: #5d8f3a;
          font-weight: 950;
          font-size: .78rem;
          white-space: nowrap;
        }

        .modal-fields{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .modal-fields.one{ grid-template-columns: 1fr; }

        .modal-field{ display:flex; flex-direction:column; gap: 6px; }

        .modal-label{
          font-size: 12px;
          font-weight: 950;
          color: #334155;
          display:flex;
          align-items:center;
          gap: 6px;
          letter-spacing: -0.005em;
        }
        .modal-req{ color:#e11d48; }

        .modal-control{
          width: 100%;
          padding: 0.85rem 1rem;
          border: 2px solid rgba(148,163,184,.35);
          border-radius: 12px;
          font-size: 14px;
          color: var(--ink);
          background: rgba(255,255,255,.92);
          transition: all .2s ease;
          font-weight: 750;
          box-shadow: 0 2px 10px rgba(15,23,42,.04);
          outline:none;
          font-family: inherit;
        }
        .modal-control:hover{
          border-color: rgba(112,174,72,.30);
          background: rgba(255,255,255,.96);
        }
        .modal-control:focus{
          border-color: rgba(112,174,72,.75);
          box-shadow: var(--ring);
          background: rgba(255,255,255,1);
        }

        .modal-help{
          font-size: 12px;
          color: var(--muted);
          font-weight: 650;
        }

        .modal-error{
          display:flex;
          gap: 8px;
          align-items:flex-start;
          font-size: 12px;
          font-weight: 900;
          color: #be123c;
          background: rgba(255,241,242,.92);
          border: 1px solid rgba(244,63,94,.30);
          border-radius: 12px;
          padding: 8px 10px;
        }

        .modal-icon-input{ position: relative; }
        .modal-icon-input input{ padding-left: 2.85rem; }
        .modal-icon-left{
          position:absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events:none;
        }

        .modal-photos-row{
          margin-top: 14px;
          padding: 16px;
          border-top: 1px solid rgba(148,163,184,.35);
          background:
            radial-gradient(900px 220px at 12% 0%, rgba(112,174,72,.10), transparent 58%),
            linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,255,255,0.54));
          border-radius: 18px;
        }

        .modal-upload-row{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .modal-upload-label{
          display:inline-flex;
          align-items:center;
          gap: 8px;
          border: 1px dashed rgba(112,174,72,.35);
          border-radius: 999px;
          padding: 9px 12px;
          font-weight: 950;
          font-size: 13px;
          cursor:pointer;
          background: rgba(255,255,255,0.92);
          transition: 180ms ease;
          box-shadow: 0 14px 34px rgba(112,174,72,.14);
        }
        .modal-upload-label:hover{
          transform: translateY(-1px);
          border-color: rgba(112,174,72,.55);
          box-shadow: 0 18px 40px rgba(112,174,72,.18);
        }

        .modal-previews{ display:flex; flex-wrap: wrap; gap: 10px; }

        .modal-thumb{
          width: 128px;
          height: 92px;
          border-radius: 16px;
          overflow:hidden;
          border: 1px solid rgba(15,23,42,.12);
          background: rgba(255,255,255,0.90);
          position: relative;
          box-shadow: 0 14px 30px rgba(15,23,42,.10);
          transition: 180ms ease;
        }
        .modal-thumb:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(15,23,42,.14); }
        .modal-thumb img{ width:100%; height:100%; object-fit: cover; }

        .modal-remove{
          position:absolute;
          right: 8px;
          top: 8px;
          border: 1px solid rgba(15,23,42,.12);
          background: rgba(255,255,255,0.94);
          border-radius: 999px;
          width: 30px;
          height: 30px;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          transition: 180ms ease;
          box-shadow: 0 10px 22px rgba(15,23,42,.12);
        }
        .modal-remove:hover{ transform: scale(1.03); }

        .modal-footer{
          display:flex;
          justify-content:flex-end;
          gap: 10px;
          padding: 1.5rem 2.25rem;
          border-top: 1px solid rgba(15,23,42,.08);
          background: rgba(249,250,251,.92);
        }

        .modal-btn{
          border: 2px solid rgba(112,174,72,.20);
          background: rgba(255,255,255,.92);
          color: #5d8f3a;
          border-radius: 14px;
          padding: 10px 12px;
          font-weight: 950;
          font-size: 14px;
          display:inline-flex;
          align-items:center;
          gap: 8px;
          cursor: pointer;
          transition: 180ms ease;
          box-shadow: 0 2px 10px rgba(15,23,42,.04);
          white-space: nowrap;
          font-family: inherit;
        }
        .modal-btn:hover:not(:disabled){
          transform: translateY(-1px);
          background: rgba(112,174,72,.06);
        }
        .modal-btn:disabled{ opacity:.65; cursor:not-allowed; transform:none; }

        .modal-btn-danger{
          color: #e11d48;
          border-color: rgba(225,29,72,.18);
        }
        .modal-btn-danger:hover:not(:disabled){ background: rgba(225,29,72,.06); }

        .modal-btn-primary{
          border: none;
          color:#fff;
          background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
          box-shadow: 0 14px 30px rgba(112,174,72,.22);
        }
        .modal-btn-primary:hover:not(:disabled){
          box-shadow: 0 18px 34px rgba(112,174,72,.28);
        }

        .close-btn{
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 2;
        }
        .close-btn:hover{
          background: rgba(255,255,255,.25);
          transform: rotate(90deg);
        }

        @media (max-width: 980px){
          .modal-grid{ grid-template-columns: 1fr; }
          .modal-overlay{ padding: 16px; }
          .modal-btn{ width: 100%; justify-content:center; }
          .modal-footer .modal-btn{ width: 100%; }
          .modal-header{ padding: 1.5rem; }
          .modal-body{ padding: 1.25rem; }
          .modal-footer{ padding: 1.25rem; }
          .modal-header-art .blob{ right:-240px; top:-260px; width: 740px; height: 740px; opacity:.85; }
          .modal-header-art .ring{ left:-220px; bottom:-240px; width: 620px; height: 620px; opacity:.40; }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-shell" onClick={(e) => e.stopPropagation()}>
          <div className="modal-card">
            <button className="close-btn" onClick={onClose}>
              <X size={20} color="white" />
            </button>

            {/* Header */}
            <div className="modal-header">
              <div className="modal-header-art" aria-hidden="true">
                <svg className="blob" viewBox="0 0 600 600" fill="none">
                  <defs>
                    <linearGradient id="hb1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="rgba(255,255,255,.65)" />
                      <stop offset="1" stopColor="rgba(255,255,255,.08)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M420 70C500 110 560 190 560 290C560 420 460 520 320 540C190 560 70 490 50 360C30 240 110 140 240 90C310 62 360 44 420 70Z"
                    fill="url(#hb1)"
                    opacity="0.65"
                  />
                  <path
                    d="M455 140C505 175 530 235 520 295C505 390 410 450 320 460C230 470 150 420 130 340C110 260 155 190 235 150C315 110 395 105 455 140Z"
                    fill="rgba(255,255,255,.10)"
                  />
                </svg>

                <svg className="ring" viewBox="0 0 500 500" fill="none">
                  <defs>
                    <radialGradient
                      id="hb2"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(220 210) rotate(45) scale(240)"
                    >
                      <stop stopColor="rgba(255,255,255,.34)" />
                      <stop offset="1" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                  </defs>
                  <circle cx="240" cy="240" r="210" fill="url(#hb2)" />
                </svg>
              </div>

              <div className="modal-header-row">
                <div className="modal-title-wrap">
                  <h1 className="modal-title">
                    <Building2 size={22} />
                    Modifier le bien : {property.name}
                  </h1>
                  <p className="modal-subtitle">
                    Les modifications seront directement enregistrées et le propriétaire sera notifié par email
                  </p>
                </div>

                <div className="modal-badge-row">
                  <span className="modal-pill-head">
                    <Home size={16} />
                    Infos
                  </span>
                  <span className="modal-pill-head">
                    <MapPin size={16} />
                    Adresse
                  </span>
                  <span className="modal-pill-head">
                    <ImageIcon size={16} />
                    Photos
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="modal-body">
              {banner && (
                <div className="modal-banner">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>{banner.title}</strong>
                    {banner.text && <p>{banner.text}</p>}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="modal-grid">
                  {/* LEFT COLUMN */}
                  <div className="modal-section">
                    <div className="modal-section-head">
                      <h2 className="modal-section-title">
                        <Home size={16} />
                        Informations générales
                      </h2>
                      <span className="modal-pill">Essentiel</span>
                    </div>

                    <div className="modal-fields">
                      <div className="modal-field">
                        <label className="modal-label">
                          Type de bien <span className="modal-req">*</span>
                        </label>
                        <select
                          name="property_type"
                          value={formData.property_type || 'apartment'}
                          onChange={handleChange}
                          required
                          className="modal-control"
                        >
                          {propertyTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.property_type && (
                          <div className="modal-error">{formErrors.property_type}</div>
                        )}
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">
                          Statut <span className="modal-req">*</span>
                        </label>
                        <select
                          name="status"
                          value={formData.status || 'available'}
                          onChange={handleChange}
                          className="modal-control"
                        >
                          {propertyStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="modal-fields one" style={{ marginTop: 12 }}>
                      <div className="modal-field">
                        <label className="modal-label">
                          Nom du bien <span className="modal-req">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          required
                          placeholder="Ex: Appartement T3 centre-ville"
                          className="modal-control"
                        />
                        {formErrors.name && <div className="modal-error">{formErrors.name}</div>}
                      </div>
                    </div>

                    <div className="modal-fields" style={{ marginTop: 12 }}>
                      <div className="modal-field">
                        <label className="modal-label">
                          Surface (m²) <span className="modal-req">*</span>
                        </label>
                        <div className="modal-icon-input">
                          <span className="modal-icon-left">
                            <Ruler size={16} />
                          </span>
                          <input
                            type="number"
                            name="surface"
                            value={formData.surface || ''}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            placeholder="Ex: 65"
                            className="modal-control"
                          />
                        </div>
                        {formErrors.surface && <div className="modal-error">{formErrors.surface}</div>}
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">Étage</label>
                        <input
                          type="number"
                          name="floor"
                          value={formData.floor || ''}
                          onChange={handleChange}
                          min="0"
                          placeholder="Ex: 3"
                          className="modal-control"
                        />
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">Total étages</label>
                        <input
                          type="number"
                          name="total_floors"
                          value={formData.total_floors || ''}
                          onChange={handleChange}
                          min="0"
                          placeholder="Ex: 8"
                          className="modal-control"
                        />
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">Année construction</label>
                        <input
                          type="number"
                          name="construction_year"
                          value={formData.construction_year || ''}
                          onChange={handleChange}
                          min="1800"
                          max={new Date().getFullYear()}
                          placeholder="Ex: 2015"
                          className="modal-control"
                        />
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">Pièces totales</label>
                        <input
                          type="number"
                          name="room_count"
                          value={formData.room_count || ''}
                          onChange={handleChange}
                          min="0"
                          placeholder="Ex: 4"
                          className="modal-control"
                        />
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">Chambres</label>
                        <input
                          type="number"
                          name="bedroom_count"
                          value={formData.bedroom_count || ''}
                          onChange={handleChange}
                          min="0"
                          placeholder="Ex: 3"
                          className="modal-control"
                        />
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">Salles de bain</label>
                        <input
                          type="number"
                          name="bathroom_count"
                          value={formData.bathroom_count || ''}
                          onChange={handleChange}
                          min="0"
                          placeholder="Ex: 2"
                          className="modal-control"
                        />
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">WC</label>
                        <input
                          type="number"
                          name="wc_count"
                          value={formData.wc_count || ''}
                          onChange={handleChange}
                          min="0"
                          placeholder="Ex: 1"
                          className="modal-control"
                        />
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">Référence</label>
                        <input
                          type="text"
                          name="reference_code"
                          value={formData.reference_code || ''}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            setFormData((p: any) => ({ ...p, reference_code: v }));
                            setFormErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.reference_code;
                              return newErrors;
                            });
                          }}
                          placeholder="Ex: APP-123"
                          className="modal-control"
                        />
                        {formErrors.reference_code && (
                          <div className="modal-error">{formErrors.reference_code}</div>
                        )}
                        <div className="modal-help">Optionnel • Lettres MAJ, chiffres et tirets</div>
                      </div>
                    </div>

                    <div className="modal-fields one" style={{ marginTop: 12 }}>
                      <div className="modal-field">
                        <label className="modal-label">Description</label>
                        <textarea
                          name="description"
                          value={formData.description || ''}
                          onChange={handleChange}
                          placeholder="Décrivez le bien (optionnel)…"
                          className="modal-control"
                          style={{ minHeight: 110, resize: "vertical" }}
                        />
                        <div className="modal-help">Points forts, emplacement, spécificités…</div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="modal-section">
                    <div className="modal-section-head">
                      <h2 className="modal-section-title">
                        <MapPin size={16} />
                        Adresse
                      </h2>
                      <span className="modal-pill">Obligatoire</span>
                    </div>

                    <div className="modal-fields one">
                      <div className="modal-field">
                        <label className="modal-label">
                          Adresse <span className="modal-req">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleChange}
                          required
                          placeholder="N° et nom de la rue"
                          className="modal-control"
                        />
                        {formErrors.address && <div className="modal-error">{formErrors.address}</div>}
                      </div>
                    </div>

                    <div className="modal-fields" style={{ marginTop: 12 }}>
                      <div className="modal-field">
                        <label className="modal-label">
                          Code postal <span className="modal-req">*</span>
                        </label>
                        <input
                          type="text"
                          name="zip_code"
                          value={formData.zip_code || ''}
                          onChange={handleChange}
                          required
                          placeholder="Ex: 75000"
                          className="modal-control"
                        />
                        {formErrors.zip_code && <div className="modal-error">{formErrors.zip_code}</div>}
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">
                          Ville <span className="modal-req">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city || ''}
                          onChange={handleChange}
                          required
                          placeholder="Ex: Paris"
                          className="modal-control"
                        />
                        {formErrors.city && <div className="modal-error">{formErrors.city}</div>}
                      </div>
                    </div>

                    <div className="modal-fields" style={{ marginTop: 12 }}>
                      <div className="modal-field">
                        <label className="modal-label">Quartier</label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district || ''}
                          onChange={handleChange}
                          placeholder="Ex: Le Marais"
                          className="modal-control"
                        />
                      </div>

                      <div className="modal-field">
                        <label className="modal-label">Pays</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country || ''}
                          onChange={handleChange}
                          placeholder="Ex: France"
                          className="modal-control"
                        />
                      </div>
                    </div>

                    <div className="modal-fields one" style={{ marginTop: 12 }}>
                      <div className="modal-field">
                        <label className="modal-label">État / Région</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state || ''}
                          onChange={handleChange}
                          placeholder="Ex: Île-de-France"
                          className="modal-control"
                        />
                      </div>
                    </div>

                    {/* Tarification */}
                    <div style={{ marginTop: 14 }}>
                      <div className="modal-section-head">
                        <h2 className="modal-section-title">
                          <Euro size={16} />
                          Tarification
                        </h2>
                        <span className="modal-pill">Optionnel</span>
                      </div>

                      <div className="modal-fields" style={{ marginTop: 12 }}>
                        <div className="modal-field">
                          <label className="modal-label">Loyer mensuel (FCFA)</label>
                          <div className="modal-icon-input">
                            <span className="modal-icon-left">
                              <Euro size={16} />
                            </span>
                            <input
                              type="number"
                              name="rent_amount"
                              value={formData.rent_amount || ''}
                              onChange={handleChange}
                              placeholder="0,00"
                              className="modal-control"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          {formErrors.rent_amount && (
                            <div className="modal-error">{formErrors.rent_amount}</div>
                          )}
                        </div>

                        <div className="modal-field">
                          <label className="modal-label">Charges mensuelles (FCFA)</label>
                          <div className="modal-icon-input">
                            <span className="modal-icon-left">
                              <DollarSign size={16} />
                            </span>
                            <input
                              type="number"
                              name="charges_amount"
                              value={formData.charges_amount || ''}
                              onChange={handleChange}
                              placeholder="0,00"
                              className="modal-control"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          {formErrors.charges_amount && (
                            <div className="modal-error">{formErrors.charges_amount}</div>
                          )}
                        </div>
                      </div>

                      {/* Nouveau champ Caution */}
                      <div className="modal-fields" style={{ marginTop: 12 }}>
                        <div className="modal-field">
                          <label className="modal-label">Caution (FCFA)</label>
                          <div className="modal-icon-input">
                            <span className="modal-icon-left">
                              <DollarSign size={16} />
                            </span>
                            <input
                              type="number"
                              name="caution"
                              value={formData.caution || ''}
                              onChange={handleChange}
                              placeholder="0,00"
                              className="modal-control"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          {formErrors.caution && (
                            <div className="modal-error">{formErrors.caution}</div>
                          )}
                          <div className="modal-help">
                            Montant de la caution déposée par le locataire
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Équipements */}
                <div className="modal-section" style={{ marginTop: 14 }}>
                  <div className="modal-section-head">
                    <h2 className="modal-section-title">
                      <Sofa size={16} />
                      Équipements
                    </h2>
                    <span className="modal-pill">Optionnel</span>
                  </div>

                  <div className="modal-fields" style={{ marginTop: 12 }}>
                    <div className="modal-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                          type="checkbox"
                          name="has_garage"
                          checked={formData.has_garage || false}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Garage</span>
                      </label>
                    </div>

                    <div className="modal-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                          type="checkbox"
                          name="has_parking"
                          checked={formData.has_parking || false}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Parking</span>
                      </label>
                    </div>

                    <div className="modal-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                          type="checkbox"
                          name="is_furnished"
                          checked={formData.is_furnished || false}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Meublé</span>
                      </label>
                    </div>

                    <div className="modal-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                          type="checkbox"
                          name="has_elevator"
                          checked={formData.has_elevator || false}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Ascenseur</span>
                      </label>
                    </div>

                    <div className="modal-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                          type="checkbox"
                          name="has_balcony"
                          checked={formData.has_balcony || false}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Balcon</span>
                      </label>
                    </div>

                    <div className="modal-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                          type="checkbox"
                          name="has_terrace"
                          checked={formData.has_terrace || false}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Terrasse</span>
                      </label>
                    </div>

                    <div className="modal-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                          type="checkbox"
                          name="has_cellar"
                          checked={formData.has_cellar || false}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Cave</span>
                      </label>
                    </div>
                  </div>

                  {/* Équipements supplémentaires */}
                  <div style={{ marginTop: 16 }}>
                    <h3 className="modal-section-title" style={{ fontSize: '13px', marginBottom: '8px' }}>
                      Équipements supplémentaires
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={amenitiesInput}
                        onChange={(e) => setAmenitiesInput(e.target.value)}
                        placeholder="Ajouter un équipement..."
                        className="modal-control"
                        style={{ flex: 1 }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAmenity();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addAmenity}
                        className="modal-btn"
                        style={{ padding: '8px 12px' }}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                      {amenitiesList.map((amenity, index) => (
                        <span
                          key={index}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'rgba(112,174,72,.10)',
                            border: '1px solid rgba(112,174,72,.18)',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#5d8f3a',
                          }}
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '0',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div className="modal-photos-row">
                  <div className="modal-upload-row">
                    <div>
                      <div style={{ fontWeight: 950, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <ImageIcon size={16} />
                        Photos du bien
                      </div>
                      <div className="modal-help">Optionnel • Max 8 photos • 5MB max • Reste: {photosRemaining}</div>
                    </div>

                    <label className="modal-upload-label">
                      <ImageIcon size={16} />
                      Ajouter des photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  {previewImages.length > 0 ? (
                    <div className="modal-previews">
                      {previewImages.map((src, index) => (
                        <div className="modal-thumb" key={index}>
                          <img src={src} alt={`Photo ${index + 1}`} />
                          <button
                            type="button"
                            className="modal-remove"
                            onClick={() => removeImage(index)}
                            aria-label="Supprimer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="modal-help">Aucune photo ajoutée.</div>
                  )}
                </div>

                {/* Informations techniques */}
                <div className="modal-section" style={{ marginTop: 14 }}>
                  <div className="modal-section-head">
                    <h2 className="modal-section-title">
                      <Layers size={16} />
                      Informations techniques
                    </h2>
                    <span className="modal-pill">Avancé</span>
                  </div>

                  <div className="modal-fields" style={{ marginTop: 12 }}>
                    <div className="modal-field">
                      <label className="modal-label">Latitude</label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude || ''}
                        onChange={handleChange}
                        placeholder="Ex: 48.8566"
                        className="modal-control"
                      />
                    </div>

                    <div className="modal-field">
                      <label className="modal-label">Longitude</label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude || ''}
                        onChange={handleChange}
                        placeholder="Ex: 2.3522"
                        className="modal-control"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-btn modal-btn-danger"
                    onClick={onClose}
                    disabled={loading}
                  >
                    <X size={16} />
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="modal-btn modal-btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};