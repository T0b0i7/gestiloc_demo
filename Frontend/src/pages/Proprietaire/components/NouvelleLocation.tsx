import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NouvelleLocation = () => {
  const navigate = useNavigate();
  const [typeBail, setTypeBail] = useState("nu");
  const [statutBail, setStatutBail] = useState("actif");
  const [renouvellement, setRenouvellement] = useState(true);
  const [loyer, setLoyer] = useState("");
  const [depot, setDepot] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [duree, setDuree] = useState("");
  const [datePaiement, setDatePaiement] = useState("1");
  const [periodicite, setPeriodicite] = useState("Mensuel");
  const [modePaiement, setModePaiement] = useState("Espèce");
  const [details, setDetails] = useState("");
  const [bien, setBien] = useState("");
  const [locataire, setLocataire] = useState("");

  const statuts = [
    { value: "actif", label: "Actif", color: "#22c55e" },
    { value: "en_attente", label: "En attente", color: "#94a3b8" },
    { value: "resilié", label: "Résilié", color: "#f97316" },
    { value: "expiré", label: "Expiré", color: "#ef4444" },
  ];

  const BOLD_FONT = "'Merriweather', Georgia, serif";
  const SMALL_FONT = "'Manrope', sans-serif";

  const styles: Record<string, React.CSSProperties> = {
    page: {
      fontFamily: SMALL_FONT,
      background: "#f8faf8",
      minHeight: "100vh",
      padding: "0",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 32px",
      marginBottom: "8px",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "white",
      border: "1.5px solid #d1d5db",
      borderRadius: "8px",
      padding: "9px 18px",
      fontSize: "13px",
      color: "#374151",
      cursor: "pointer",
      fontWeight: 500,
      fontFamily: SMALL_FONT,
      transition: "all 0.15s",
    },
    topActions: {
      display: "flex",
      gap: "12px",
    },
    cancelBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "white",
      border: "1.5px solid #ef4444",
      borderRadius: "8px",
      padding: "9px 20px",
      fontSize: "13px",
      color: "#ef4444",
      cursor: "pointer",
      fontWeight: 600,
      fontFamily: SMALL_FONT,
      transition: "all 0.15s",
    },
    createBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "#16a34a",
      border: "none",
      borderRadius: "8px",
      padding: "9px 22px",
      fontSize: "13px",
      color: "white",
      cursor: "pointer",
      fontWeight: 600,
      fontFamily: SMALL_FONT,
      transition: "all 0.15s",
      boxShadow: "0 2px 8px rgba(22,163,74,0.25)",
    },
    headerSection: {
      padding: "0 32px 20px",
    },
    title: {
      fontSize: "26px",
      fontWeight: 800,
      color: "#111827",
      margin: "0 0 4px 0",
      fontFamily: BOLD_FONT,
      letterSpacing: "-0.3px",
    },
    subtitle: {
      fontSize: "16px",
      color: "#6b7280",
      margin: 0,
      fontFamily: SMALL_FONT,
    },
    card: {
      background: "white",
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      padding: "32px",
      margin: "0 32px 32px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    },
    cardTitle: {
      fontSize: "17px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "28px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontFamily: BOLD_FONT,
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "28px 40px",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#374151",
      fontFamily: SMALL_FONT,
    },
    select: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1.5px solid #d1d5db",
      fontSize: "13px",
      color: "#6b7280",
      background: "white",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      cursor: "pointer",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: SMALL_FONT,
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1.5px solid #d1d5db",
      fontSize: "13px",
      color: "#111827",
      background: "white",
      boxSizing: "border-box",
      outline: "none",
      transition: "border-color 0.15s",
      fontFamily: SMALL_FONT,
    },
    radioGroup: {
      display: "flex",
      gap: "20px",
      alignItems: "center",
      marginTop: "4px",
    },
    radioLabel: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#374151",
      cursor: "pointer",
      fontWeight: 500,
      fontFamily: SMALL_FONT,
    },
    statutGroup: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      marginTop: "4px",
    },
    checkboxRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "6px",
    },
    checkboxLabel: {
      fontSize: "12px",
      color: "#6b7280",
      cursor: "pointer",
      fontFamily: SMALL_FONT,
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1.5px solid #d1d5db",
      fontSize: "13px",
      color: "#111827",
      background: "white",
      boxSizing: "border-box",
      outline: "none",
      resize: "vertical",
      minHeight: "110px",
      fontFamily: SMALL_FONT,
      transition: "border-color 0.15s",
    },
    note: {
      fontSize: "12px",
      color: "#9ca3af",
      marginTop: "12px",
      fontFamily: SMALL_FONT,
    },
    bottomActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "24px",
      paddingTop: "20px",
      borderTop: "1px solid #f3f4f6",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;800;900&family=Manrope:wght@400;500;600&display=swap');
      `}</style>
      <div style={styles.page} className="animate-fadeInUp">
        {/* Top Action Bar */}
        <div style={styles.topBar} className="animate-slideInLeft">
          <button 
            style={styles.backBtn}
            onClick={() => navigate("/proprietaire/dashboard")}
          >
            ← Retour au tableau de bord
          </button>
          <div style={styles.topActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/biens")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={() => {
                // Logique de création du contrat ici
                console.log("Création du contrat de location");
              }}
            >
              Créer le contrat
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={styles.headerSection} className="animate-fadeInUp animate-delay-100">
          <h1 style={styles.title}>Nouveau contrat de location</h1>
          <p style={styles.subtitle}>Créez un nouveau contrat entre un bien et un locataire</p>
        </div>

        {/* Main Card */}
        <div style={styles.card} className="animate-scaleIn animate-delay-200">
          <div style={styles.cardTitle}>
            <span>🏠</span> Informations de location
          </div>

          <div style={styles.grid2}>

            {/* Bien à louer */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Bien à louer</label>
              <select 
                style={styles.select} 
                value={bien} 
                onChange={e => setBien(e.target.value)}
              >
                <option value="">Sélectionner un bien</option>
                <option value="bien1">Appartement T3 - Centre ville</option>
                <option value="bien2">Villa - Quartier résidentiel</option>
              </select>
            </div>

            {/* Locataire */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Locataire</label>
              <select 
                style={styles.select} 
                value={locataire} 
                onChange={e => setLocataire(e.target.value)}
              >
                <option value="">Sélectionner un locataire</option>
                <option value="loc1">Jean Dupont</option>
                <option value="loc2">Marie Martin</option>
              </select>
            </div>

            {/* Type de bail */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Type de bail</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="typeBail" 
                    value="nu" 
                    checked={typeBail === "nu"} 
                    onChange={() => setTypeBail("nu")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Bail nu
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="typeBail" 
                    value="meuble" 
                    checked={typeBail === "meuble"} 
                    onChange={() => setTypeBail("meuble")} 
                    style={{ accentColor: "#16a34a" }} 
                  />
                  Bail meublé
                </label>
              </div>
            </div>

            {/* Statut du bail */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Statut du bail</label>
              <div style={styles.statutGroup}>
                {statuts.map(s => (
                  <label key={s.value} style={{ ...styles.radioLabel, fontSize: "13px" }}>
                    <input
                      type="radio"
                      name="statutBail"
                      value={s.value}
                      checked={statutBail === s.value}
                      onChange={() => setStatutBail(s.value)}
                      style={{ accentColor: s.color }}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Loyer mensuel */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Loyer mensuel (FCFA)</label>
              <input 
                type="number" 
                style={styles.input} 
                placeholder="40.000" 
                value={loyer} 
                onChange={e => setLoyer(e.target.value)} 
              />
            </div>

            {/* Date de début */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Date de début</label>
              <input 
                type="date" 
                style={styles.input} 
                value={dateDebut} 
                onChange={e => setDateDebut(e.target.value)} 
              />
            </div>

            {/* Dépôt de garantie */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Dépôt de garantie (FCFA)</label>
              <input 
                type="number" 
                style={styles.input} 
                placeholder="20.000" 
                value={depot} 
                onChange={e => setDepot(e.target.value)} 
              />
            </div>

            {/* Durée du bail */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Durée du bail</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="Ex: 2 ans" 
                value={duree} 
                onChange={e => setDuree(e.target.value)} 
              />
              <div style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  id="renouvellement"
                  checked={renouvellement}
                  onChange={e => setRenouvellement(e.target.checked)}
                  style={{ accentColor: "#16a34a", width: "14px", height: "14px" }}
                />
                <label htmlFor="renouvellement" style={styles.checkboxLabel}>
                  Renouvellement par tacite · cochez la case
                </label>
              </div>
            </div>

            {/* Date de paiement */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Date de paiement</label>
              <select 
                style={styles.select} 
                value={datePaiement} 
                onChange={e => setDatePaiement(e.target.value)}
              >
                {Array.from({ length: 28 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                ))}
              </select>
            </div>

            {/* Périodicité */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Périodicité</label>
              <select 
                style={styles.select} 
                value={periodicite} 
                onChange={e => setPeriodicite(e.target.value)}
              >
                <option>Mensuel</option>
                <option>Trimestriel</option>
                <option>Annuel</option>
              </select>
            </div>

            {/* Mode de paiement */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Mode de paiement</label>
              <select 
                style={styles.select} 
                value={modePaiement} 
                onChange={e => setModePaiement(e.target.value)}
              >
                <option>Espèce</option>
                <option>Virement bancaire</option>
                <option>Chèque</option>
                <option>Mobile Money</option>
              </select>
            </div>

            {/* Détails / conditions particulières */}
            <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Détails / conditions particulières</label>
              <textarea
                style={styles.textarea}
                placeholder="Ex: Charges comprises, Interdictions de fumer etc.."
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
            </div>

          </div>

          <p style={styles.note}>Ces informations seront envoyées dans le champ termes du bail.</p>

          {/* Bottom actions */}
          <div style={styles.bottomActions}>
            <button 
              style={styles.cancelBtn}
              onClick={() => navigate("/proprietaire/biens")}
            >
              ✕ Annuler
            </button>
            <button 
              style={styles.createBtn}
              onClick={() => {
                // Logique de création du contrat ici
                console.log("Création du contrat de location");
              }}
            >
              Créer le contrat
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NouvelleLocation;
