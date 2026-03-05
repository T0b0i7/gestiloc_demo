import React from 'react';
import {
  X,
  Building,
  MapPin,
  DollarSign,
  Home,
  Users,
  Calendar,
  Ruler,
  DoorOpen,
  Bath,
  Bed,
  Car,
  Sofa,
  CheckCircle,
  AlertCircle,
  Edit,
  ChevronRight,
  ChevronLeft,
  Star,
  Layers,
  Award,
  Shield,
  Globe,
  Maximize2,
  Camera,
  ExternalLink,
  Building2,
  Briefcase,
  Handshake,
} from 'lucide-react';

interface PropertyModalProps {
  property: any | null;
  isOpen: boolean;
  onClose: () => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
  onUpdate: () => void;
  isAgency?: boolean;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  notify,
  onUpdate,
  isAgency = false,
}) => {
  if (!isOpen || !property) return null;

  const formatCurrency = (amount?: string) => {
    if (!amount) return '—';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const getPropertyImage = () => {
    if (property.photos && property.photos.length > 0) {
      const firstPhoto = property.photos[0];
      if (typeof firstPhoto === 'string' && firstPhoto.startsWith('http')) {
        return firstPhoto;
      }
      if (typeof firstPhoto === 'string') {
        return `${import.meta.env.VITE_API_URL || 'https://wheat-skunk-120710.hostingersite.com'}/storage/${firstPhoto}`;
      }
    }
    return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200";
  };

  // Récupérer le titre adapté
  const getModalTitle = () => {
    return isAgency ? "Propriété Gérée" : "Propriété Déléguée";
  };

  // Récupérer la description adaptée
  const getModalDescription = () => {
    return isAgency 
      ? "Informations détaillées de la propriété que vous gérez"
      : "Informations détaillées de la propriété qui vous est déléguée";
  };

  // Obtenir l'icône en fonction du type
  const getHeaderIcon = () => {
    return isAgency ? <Briefcase size={24} /> : <Building2 size={24} />;
  };

  // Obtenir l'icône de gestion/délégation
  const getManagementIcon = () => {
    return isAgency ? <Briefcase size={16} /> : <Handshake size={16} />;
  };

  // Obtenir le titre de la section gestion/délégation
  const getManagementTitle = () => {
    return isAgency ? "Gestion" : "Délégation";
  };

  // Obtenir la couleur principale en fonction du type
  const getPrimaryColor = () => {
    return isAgency ? 'indigo' : 'purple';
  };

  // Obtenir les couleurs de gradient en fonction du type
  const getGradientColors = () => {
    if (isAgency) {
      return {
        gradA: '#4f46e5', // Indigo
        gradB: '#7c3aed', // Violet
      };
    }
    return {
      gradA: '#7c3aed', // Violet
      gradB: '#9333ea', // Violet plus foncé
    };
  };

  const gradientColors = getGradientColors();

  return (
    <>
      <style>{`
        :root{
          --gradA:${gradientColors.gradA};
          --gradB:${gradientColors.gradB};
          --primary:${isAgency ? '#4f46e5' : '#7c3aed'};
          --primary-light:${isAgency ? 'rgba(79,70,229,.1)' : 'rgba(124,58,237,.1)'};
          --primary-dark:${isAgency ? '#4338ca' : '#6d28d9'};
          --emerald:#10b981;
          --rose:#f43f5e;
          
          --bg:#ffffff;
          --ink:#0f172a;
          --muted:#64748b;
          --muted2:#94a3b8;

          --line: rgba(15,23,42,.08);
          --line2: rgba(15,23,42,.05);

          --shadow: 0 22px 70px rgba(0,0,0,.18);
          --shadow2: 0 12px 35px rgba(15,23,42,.10);
          --shadow3: 0 8px 18px rgba(15,23,42,.08);

          --ring: 0 0 0 4px var(--primary-light);
          --halo: 0 0 40px var(--primary-light);
        }

        *{ box-sizing:border-box; }

        .modal-overlay-premium{
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,.82);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 26px;
          z-index: 9999;
          opacity: 0;
          animation: fadeIn 0.25s ease forwards;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .modal-shell-premium{
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.3s ease 0.1s forwards;
        }

        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-card-premium{
          background: rgba(255,255,255,.96);
          border-radius: 24px;
          box-shadow: var(--shadow), 0 0 0 1px rgba(255,255,255,.4);
          overflow: hidden;
          position: relative;
          backdrop-filter: blur(20px);
          overflow-y: auto;
          max-height: 90vh;
        }

        .modal-card-premium::before{
          content:"";
          position:absolute;
          inset:0;
          pointer-events:none;
          background:
            radial-gradient(circle at 20% 10%, var(--primary-light), transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(102,126,234,.06), transparent 60%),
            radial-gradient(circle at 40% 90%, rgba(16,185,129,.04), transparent 60%);
          z-index: 0;
        }

        .modal-header-premium{
          background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
          padding: 2rem 2.5rem;
          color: #fff;
          position: relative;
          overflow:hidden;
          z-index: 1;
        }

        .modal-header-premium::before{
          content:"";
          position:absolute;
          inset:0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,.1) 50%, transparent 70%);
          animation: shine 3s infinite;
          z-index: 0;
        }

        @keyframes shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        .modal-header-art-premium{
          position:absolute;
          inset:0;
          pointer-events:none;
          z-index:0;
        }
        .modal-header-art-premium .blob{
          position:absolute;
          right:-120px;
          top:-140px;
          width: 480px;
          height: 480px;
          opacity: .22;
          filter: drop-shadow(0 18px 44px rgba(0,0,0,.18));
        }

        .modal-header-row-premium{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap: 14px;
          flex-wrap: wrap;
          position: relative;
          z-index: 2;
        }

        .modal-title-wrap-premium{ display:flex; flex-direction:column; gap: 8px; flex: 1; }

        .modal-title-premium{
          display:flex;
          align-items:center;
          gap: 12px;
          font-weight: 1000;
          letter-spacing: -0.025em;
          font-size: 26px;
          margin: 0;
          line-height: 1.1;
          color: white;
        }

        .modal-subtitle-premium{
          margin: 0;
          opacity: .94;
          font-weight: 650;
          font-size: 14px;
          max-width: 72ch;
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }

        .modal-badge-row-premium{
          display:flex;
          gap: .6rem;
          align-items:center;
          flex-wrap: wrap;
        }

        .modal-pill-head-premium{
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
          transition: 180ms ease;
        }
        .modal-pill-head-premium:hover{ transform: translateY(-1px); }

        .close-btn-premium{
          position: absolute;
          top: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 10;
          box-shadow: 0 8px 24px rgba(0,0,0,.12);
        }
        .close-btn-premium:hover{
          background: rgba(255,255,255,.28);
          transform: rotate(90deg) scale(1.05);
        }

        .modal-body-premium{
          padding: 2.25rem;
          position: relative;
          z-index: 1;
        }

        .property-image-container{
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 2rem;
          box-shadow: var(--shadow2), 0 0 0 1px rgba(15,23,42,.05);
          border: 1px solid rgba(255,255,255,.6);
        }

        .property-image{
          width: 100%;
          height: 320px;
          object-fit: cover;
          display: block;
        }

        .image-overlay{
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(15,23,42,.85));
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .image-badges{
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .image-badge{
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,.92);
          border-radius: 999px;
          font-weight: 850;
          font-size: .85rem;
          color: var(--ink);
          box-shadow: 0 4px 16px rgba(0,0,0,.12);
        }

        .grid-premium{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .section-premium{
          background: rgba(255,255,255,.85);
          padding: 1.5rem;
          border-radius: 18px;
          border: 1px solid rgba(17,24,39,.08);
          box-shadow: var(--shadow3);
          backdrop-filter: blur(10px);
          position: relative;
          overflow:hidden;
          transition: 200ms ease;
        }
        .section-premium:hover{
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(15,23,42,.12);
          border-color: var(--primary-light);
        }

        .section-premium::before{
          content:"";
          position:absolute;
          inset:0;
          background:
            radial-gradient(500px 200px at 90% 0%, var(--primary-light), transparent 62%),
            radial-gradient(500px 200px at 10% 0%, var(--primary-light), transparent 62%);
          pointer-events:none;
        }

        .section-head-premium{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 10px;
          margin-bottom: 1rem;
          padding-bottom: .75rem;
          border-bottom: 2px solid var(--primary-light);
        }

        .section-title-premium{
          display:flex;
          align-items:center;
          gap: 10px;
          font-weight: 950;
          font-size: 15px;
          margin: 0;
          letter-spacing: -0.01em;
          color: var(--ink);
        }

        .section-icon-premium{
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .pill-premium{
          display:inline-flex;
          align-items:center;
          gap: .45rem;
          padding: .4rem .8rem;
          border-radius: 999px;
          background: var(--primary-light);
          border: 1px solid rgba(var(--primary),.18);
         color: white;
          font-weight: 950;
          font-size: .78rem;
          white-space: nowrap;
          box-shadow: 0 4px 12px var(--primary-light);
        }

        .info-grid{
          display:grid;
          grid-template-columns: repeat(2, 1fr);
          gap: .75rem;
        }

        .info-item{
          display:flex;
          flex-direction:column;
          gap: 4px;
        }

        .info-label{
          font-size: 12px;
          font-weight: 850;
          color: #475569;
          letter-spacing: -0.005em;
          display:flex;
          align-items:center;
          gap: 6px;
        }

        .info-value{
          font-size: 14px;
          font-weight: 750;
          color: var(--ink);
          padding: 8px 12px;
          background: rgba(249,250,251,.8);
          border-radius: 10px;
          border: 1px solid rgba(226,232,240,.6);
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .info-value-highlight{
          background: var(--primary-light);
          border-color: rgba(var(--primary),.2);
          color: var(--primary);
          font-weight: 850;
        }

        .equipment-grid{
          display:flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .equipment-badge{
          display:inline-flex;
          align-items:center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(249,250,251,.8);
          border: 1px solid rgba(226,232,240,.6);
          border-radius: 999px;
          font-weight: 850;
          font-size: .85rem;
          color: var(--ink);
          transition: 180ms ease;
        }
        .equipment-badge:hover{
          transform: translateY(-1px);
          background: rgba(255,255,255,1);
          border-color: var(--primary-light);
          box-shadow: 0 6px 16px var(--primary-light);
        }

        .description-box{
          padding: 1rem;
          background: rgba(249,250,251,.8);
          border: 1px solid rgba(226,232,240,.6);
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--muted);
          font-weight: 650;
        }

        .footer-premium{
          display:flex;
          justify-content: space-between;
          gap: 12px;
          padding: 1.75rem 2.25rem;
          border-top: 1px solid rgba(15,23,42,.06);
          background: rgba(249,250,251,.92);
        }

        .btn-premium{
          border: 2px solid rgba(var(--primary-dark),.20);
          background: rgba(255,255,255,.92);
          color: var(--primary-dark);
          border-radius: 14px;
          padding: 12px 24px;
          font-weight: 950;
          font-size: 14px;
          display:inline-flex;
          align-items:center;
          gap: 10px;
          cursor: pointer;
          transition: 180ms ease;
          box-shadow: 0 8px 24px rgba(15,23,42,.06);
          white-space: nowrap;
          font-family: inherit;
        }
        .btn-premium:hover:not(:disabled){
          transform: translateY(-2px);
          background: rgba(var(--primary-dark),.06);
          box-shadow: 0 14px 32px rgba(15,23,42,.10);
        }

        .btn-premium-danger{
          color: #e11d48;
          border-color: rgba(225,29,72,.18);
        }
        .btn-premium-danger:hover:not(:disabled){ background: rgba(225,29,72,.06); }

        .btn-premium-primary{
          border: none;
          color:#fff;
          background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
          box-shadow: 0 14px 30px rgba(var(--primary),.22), 0 0 0 1px rgba(255,255,255,.2);
        }
        .btn-premium-primary:hover:not(:disabled){
          box-shadow: 0 18px 34px rgba(var(--primary),.28), 0 0 0 1px rgba(255,255,255,.3);
          transform: translateY(-2px);
        }

        .btn-premium-primary span{
          background: rgba(255,255,255,.12);
          padding: 4px 8px;
          border-radius: 6px;
          margin-left: 6px;
          font-size: .9em;
        }

        @media (max-width: 900px){
          .grid-premium{ grid-template-columns: 1fr; }
          .modal-overlay-premium{ padding: 16px; }
          .modal-header-premium{ padding: 1.5rem; }
          .modal-body-premium{ padding: 1.5rem; }
          .footer-premium{ padding: 1.5rem; flex-direction: column; }
          .btn-premium{ width: 100%; justify-content:center; }
          .modal-header-art-premium .blob{ right:-200px; top:-220px; }
          .info-grid{ grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="modal-overlay-premium" onClick={onClose}>
        <div className="modal-shell-premium" onClick={(e) => e.stopPropagation()}>
          <div className="modal-card-premium">
            {/* Header */}
            <div className="modal-header-premium">
              <div className="modal-header-art-premium" aria-hidden="true">
                <svg className="blob" viewBox="0 0 600 600" fill="none">
                  <path
                    d="M420 70C500 110 560 190 560 290C560 420 460 520 320 540C190 560 70 490 50 360C30 240 110 140 240 90C310 62 360 44 420 70Z"
                    fill="rgba(255,255,255,.15)"
                  />
                </svg>
              </div>

              <button className="close-btn-premium" onClick={onClose}>
                <X size={20} color="white" />
              </button>

              <div className="modal-header-row-premium">
                <div className="modal-title-wrap-premium">
                  <h1 className="modal-title-premium">
                    {getHeaderIcon()}
                    {property.name}
                    <span className="pill-premium">
                      <Star size={12} />
                      {property.reference_code || 'REF'}
                    </span>
                  </h1>
                  <p className="modal-subtitle-premium">
                    <MapPin size={16} />
                    {property.address}, {property.city} • {property.zip_code} • {property.country || 'France'}
                  </p>
                </div>

                <div className="modal-badge-row-premium">
                  <span className="modal-pill-head-premium">
                    <Home size={16} />
                    {property.property_type || 'Bien'}
                  </span>
                  <span className="modal-pill-head-premium">
                    <Award size={16} />
                    {getModalTitle()}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="modal-body-premium">
              {/* Image principale avec badges */}
              <div className="property-image-container">
                <img
                  src={getPropertyImage()}
                  alt={property.name}
                  className="property-image"
                />
                <div className="image-overlay">
                  <div className="image-badges">
                    <span className="image-badge">
                      <Ruler size={14} />
                      {property.surface || '—'} m²
                    </span>
                    <span className="image-badge">
                      <Bed size={14} />
                      {property.bedroom_count || '0'} chambres
                    </span>
                    <span className="image-badge">
                      <DollarSign size={14} />
                      {formatCurrency(property.rent_amount)}
                    </span>
                  </div>
                  <button className="modal-pill-head-premium">
                    <Camera size={14} />
                    {property.photos?.length || '0'} photos
                  </button>
                </div>
              </div>

              {/* Grid d'informations */}
              <div className="grid-premium">
                {/* Colonne gauche */}
                <div className="space-y-6">
                  {/* Informations générales */}
                  <div className="section-premium">
                    <div className="section-head-premium">
                      <h2 className="section-title-premium">
                        <div className="section-icon-premium">
                          <Building size={16} />
                        </div>
                        Informations générales
                      </h2>
                      <span className="pill-premium">Détails</span>
                    </div>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-label">
                          <Building size={12} />
                          Type
                        </div>
                        <div className="info-value">
                          {property.property_type || '—'}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Shield size={12} />
                          Statut
                        </div>
                        <div className={`info-value ${property.status === 'available' ? 'info-value-highlight' : ''}`}>
                          {property.status || '—'}
                        </div>
                      </div>
                      
                      <div className="info-item" style={{ gridColumn: 'span 2' }}>
                        <div className="info-label">
                          <Globe size={12} />
                          Description
                        </div>
                        <div className="description-box">
                          {property.description || 'Aucune description disponible'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div className="section-premium">
                    <div className="section-head-premium">
                      <h2 className="section-title-premium">
                        <div className="section-icon-premium">
                          <MapPin size={16} />
                        </div>
                        Localisation
                      </h2>
                      <span className="pill-premium">Adresse</span>
                    </div>
                    
                    <div className="info-grid">
                      <div className="info-item" style={{ gridColumn: 'span 2' }}>
                        <div className="info-label">
                          <Home size={12} />
                          Adresse complète
                        </div>
                        <div className="info-value info-value-highlight">
                          {property.address}, {property.city}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Layers size={12} />
                          Quartier
                        </div>
                        <div className="info-value">
                          {property.district || '—'}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <MapPin size={12} />
                          Code postal
                        </div>
                        <div className="info-value">
                          {property.zip_code || '—'}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Globe size={12} />
                          Pays
                        </div>
                        <div className="info-value">
                          {property.country || '—'}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Layers size={12} />
                          Région
                        </div>
                        <div className="info-value">
                          {property.state || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Composition */}
                  <div className="section-premium">
                    <div className="section-head-premium">
                      <h2 className="section-title-premium">
                        <div className="section-icon-premium">
                          <DoorOpen size={16} />
                        </div>
                        Composition
                      </h2>
                      <span className="pill-premium">Pièces</span>
                    </div>
                    
                    <div className="equipment-grid">
                      <span className="equipment-badge">
                        <DoorOpen size={14} />
                        {property.room_count || '0'} pièces
                      </span>
                      <span className="equipment-badge">
                        <Bed size={14} />
                        {property.bedroom_count || '0'} chambres
                      </span>
                      <span className="equipment-badge">
                        <Bath size={14} />
                        {property.bathroom_count || '0'} salles de bain
                      </span>
                      <span className="equipment-badge">
                        <DoorOpen size={14} />
                        {property.wc_count || '0'} WC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-6">
                  {/* Caractéristiques */}
                  <div className="section-premium">
                    <div className="section-head-premium">
                      <h2 className="section-title-premium">
                        <div className="section-icon-premium">
                          <Ruler size={16} />
                        </div>
                        Caractéristiques
                      </h2>
                      <span className="pill-premium">Dimensions</span>
                    </div>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-label">
                          <Maximize2 size={12} />
                          Surface
                        </div>
                        <div className="info-value info-value-highlight">
                          {property.surface || '—'} m²
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Layers size={12} />
                          Étage
                        </div>
                        <div className="info-value">
                          {property.floor || '—'}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Building size={12} />
                          Total étages
                        </div>
                        <div className="info-value">
                          {property.total_floors || '—'}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Calendar size={12} />
                          Année construction
                        </div>
                        <div className="info-value">
                          {property.construction_year || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarification */}
                  <div className="section-premium">
                    <div className="section-head-premium">
                      <h2 className="section-title-premium">
                        <div className="section-icon-premium">
                          <DollarSign size={16} />
                        </div>
                        Tarification
                      </h2>
                      <span className="pill-premium">Prix</span>
                    </div>
                    
                    <div className="info-grid">
                      <div className="info-item" style={{ gridColumn: 'span 2' }}>
                        <div className="info-label">
                          <DollarSign size={12} />
                          Loyer mensuel
                        </div>
                        <div className="info-value info-value-highlight">
                          {formatCurrency(property.rent_amount)}
                        </div>
                      </div>
                      
                      <div className="info-item" style={{ gridColumn: 'span 2' }}>
                        <div className="info-label">
                          <DollarSign size={12} />
                          Charges mensuelles
                        </div>
                        <div className="info-value">
                          {formatCurrency(property.charges_amount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Équipements */}
                  <div className="section-premium">
                    <div className="section-head-premium">
                      <h2 className="section-title-premium">
                        <div className="section-icon-premium">
                          <Sofa size={16} />
                        </div>
                        Équipements
                      </h2>
                      <span className="pill-premium">Confort</span>
                    </div>
                    
                    <div className="equipment-grid">
                      {property.has_garage && (
                        <span className="equipment-badge">
                          <Car size={14} /> Garage
                        </span>
                      )}
                      {property.has_parking && (
                        <span className="equipment-badge">
                          <Car size={14} /> Parking
                        </span>
                      )}
                      {property.is_furnished && (
                        <span className="equipment-badge">
                          <Sofa size={14} /> Meublé
                        </span>
                      )}
                      {property.has_elevator && (
                        <span className="equipment-badge">
                          <Building size={14} /> Ascenseur
                        </span>
                      )}
                      {property.has_balcony && (
                        <span className="equipment-badge">
                          <Home size={14} /> Balcon
                        </span>
                      )}
                      {property.has_terrace && (
                        <span className="equipment-badge">
                          <Home size={14} /> Terrasse
                        </span>
                      )}
                      {property.has_cellar && (
                        <span className="equipment-badge">
                          <Building size={14} /> Cave
                        </span>
                      )}
                    </div>

                    {/* Équipements supplémentaires */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <div className="info-label" style={{ marginBottom: '8px' }}>
                          <CheckCircle size={12} />
                          Équipements supplémentaires
                        </div>
                        <div className="equipment-grid">
                          {property.amenities.map((amenity: string, index: number) => (
                            <span key={index} className="equipment-badge">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gestion/Délégation */}
                  {property.delegation && (
                    <div className="section-premium">
                      <div className="section-head-premium">
                        <h2 className="section-title-premium">
                          <div className="section-icon-premium">
                            {getManagementIcon()}
                          </div>
                          {getManagementTitle()}
                        </h2>
                        <span className="pill-premium">
                          {isAgency ? 'Contrat' : 'Délégation'}
                        </span>
                      </div>
                      
                      <div className="info-grid">
                        <div className="info-item">
                          <div className="info-label">
                            <Shield size={12} />
                            Statut
                          </div>
                          <div className="info-value">
                            {property.delegation.status}
                          </div>
                        </div>
                        
                        <div className="info-item">
                          <div className="info-label">
                            <Calendar size={12} />
                            {isAgency ? 'Expire le' : 'Délégation expirant le'}
                          </div>
                          <div className="info-value">
                            {property.delegation.expires_at 
                              ? new Date(property.delegation.expires_at).toLocaleDateString('fr-FR')
                              : '—'}
                          </div>
                        </div>
                        
                        <div className="info-item" style={{ gridColumn: 'span 2' }}>
                          <div className="info-label">
                            <CheckCircle size={12} />
                            {isAgency ? 'Droits de gestion' : 'Permissions'}
                          </div>
                          <div className="info-value">
                            {property.delegation.permissions?.join(', ') || 'Aucune'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer-premium">
              <button
                className="btn-premium"
                onClick={onClose}
              >
                <X size={16} />
                Fermer
              </button>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {property.delegation?.permissions?.includes('edit') && (
                  <button
                    className="btn-premium btn-premium-light"
                    
                  >
                   
                  </button>
                )}
                
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};