import React, { useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, Search, FileText, ChevronDown, MoreVertical } from "lucide-react";
import { tenantRentReceiptService, RentReceipt } from "../services/tenantRentReceiptService";

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function RentReceiptsPage() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RentReceipt[]>([]);
  const [q, setQ] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState('100');
  const [periode, setPeriode] = useState('');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [showPeriodeDropdown, setShowPeriodeDropdown] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await tenantRentReceiptService.list();
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Impossible de charger les quittances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Générer dynamiquement les options de période à partir des données
  const periodeOptions = useMemo(() => {
    const options = new Set<string>();
    options.add('Tous');
    
    items.forEach(item => {
      if (item.issued_date) {
        const date = new Date(item.issued_date);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        options.add(monthYear);
      }
    });
    
    return Array.from(options);
  }, [items]);

  const filtered = useMemo(() => {
    let filtered = items;
    
    // Filtre par recherche textuelle
    const needle = q.trim().toLowerCase();
    if (needle) {
      filtered = filtered.filter((r) => {
        const blob = [
          r.reference,
          r.paid_month,
          r.property?.address,
          r.property?.city,
          r.type,
          r.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(needle);
      });
    }
    
    // Filtre par période
    if (periode && periode !== 'Tous') {
      filtered = filtered.filter((r) => {
        if (!r.issued_date) return false;
        const date = new Date(r.issued_date);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return monthYear === periode;
      });
    }
    
    return filtered;
  }, [items, q, periode]);

  const handleDownload = async (r: RentReceipt) => {
    setBusyId(r.id);
    setError(null);
    try {
      const blob = await tenantRentReceiptService.downloadPdf(r.id);
      const name = (r.reference || `quittance-${r.id}`) + ".pdf";
      downloadBlob(blob, name);
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "PDF indisponible pour cette quittance.");
    } finally {
      setBusyId(null);
    }
  };

  // Fonction pour formater le montant en FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrer les quittances</h2>
        
        <div className="flex flex-col gap-4">
          {/* First row - Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Items per page */}
            <div className="relative sm:w-48">
              <button
                onClick={() => setShowItemsDropdown(!showItemsDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-[#529D21] rounded-lg text-gray-700 hover:border-[#529D21]/80 transition-colors bg-white"
              >
                <span>{itemsPerPage} lignes</span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              {showItemsDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {['10', '25', '50', '100'].map((n) => (
                    <button
                      key={n}
                      onClick={() => { setItemsPerPage(n); setShowItemsDropdown(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {n} lignes
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Period - Dynamique */}
            <div className="relative sm:w-48">
              <button
                onClick={() => setShowPeriodeDropdown(!showPeriodeDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-[#529D21] rounded-lg text-gray-700 hover:border-[#529D21]/80 transition-colors bg-white"
              >
                <span>{periode || 'Période'}</span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              {showPeriodeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {periodeOptions.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPeriode(p === 'Tous' ? '' : p); setShowPeriodeDropdown(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Second row - Search and Total */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-[#529D21]" />
              </div>
              <input
                type="text"
                placeholder="Rechercher"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#529D21] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#529D21]/20 focus:border-[#529D21] bg-white"
              />
            </div>

            {/* Total */}
            <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
              Total: {filtered.length} quittance{filtered.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-[#529D21]" size={32} />
            <p className="text-gray-600">Chargement des quittances...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State with Illustration */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Illustration */}
            <div className="mb-8">
              <svg width="280" height="200" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Calendar */}
                <rect x="100" y="30" width="80" height="70" rx="8" fill="#E8F4FD" stroke="#2196F3" strokeWidth="2"/>
                <rect x="110" y="42" width="60" height="8" rx="2" fill="#2196F3"/>
                <rect x="118" y="58" width="12" height="12" rx="2" fill="#64B5F6"/>
                <rect x="134" y="58" width="12" height="12" rx="2" fill="#64B5F6"/>
                <rect x="150" y="58" width="12" height="12" rx="2" fill="#64B5F6"/>
                <rect x="118" y="76" width="12" height="12" rx="2" fill="#64B5F6"/>
                <rect x="134" y="76" width="12" height="12" rx="2" fill="#64B5F6"/>
                
                {/* People */}
                <circle cx="60" cy="130" r="20" fill="#FFCCBC"/>
                <ellipse cx="60" cy="165" rx="25" ry="30" fill="#FFCCBC"/>
                
                <circle cx="220" cy="130" r="20" fill="#C8E6C9"/>
                <ellipse cx="220" cy="165" rx="25" ry="30" fill="#C8E6C9"/>
                
                {/* Money/Dollar */}
                <circle cx="230" cy="60" r="25" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2"/>
                <text x="230" y="68" textAnchor="middle" fill="#FF9800" fontSize="24" fontWeight="bold">$</text>
                
                {/* Decorative elements */}
                <circle cx="40" cy="50" r="8" fill="#E1BEE7"/>
                <circle cx="250" cy="150" r="10" fill="#B2DFDB"/>
                <rect x="30" y="90" width="20" height="20" rx="4" fill="#FFEBEE" transform="rotate(15 40 100)"/>
              </svg>
            </div>
            
            <p className="text-gray-500 text-center max-w-md">
              Aucune quittance disponible pour le moment.
            </p>
            <button
              onClick={fetchAll}
              className="mt-4 px-4 py-2 text-[#529D21] hover:bg-[#529D21]/10 rounded-lg transition-colors"
            >
              Actualiser
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Bien</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Montant</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Description</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Statut</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const propLine = [r.property?.address, r.property?.city].filter(Boolean).join(", ");
                  
                  // FORCER le statut à "Active" pour TOUTES les lignes
                  const statusInfo = { 
                    label: 'Active', 
                    className: 'bg-green-100 text-green-800' 
                  };
                  
                  return (
                    <tr key={r.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {r.issued_date ? new Date(r.issued_date).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {propLine || <span className="text-gray-400">Non renseigné</span>}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#529D21]">
                        {r.amount_paid != null ? formatFCFA(Number(r.amount_paid)) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {r.reference || `Quittance #${r.id}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDownload(r)}
                          disabled={busyId === r.id}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Télécharger la quittance"
                        >
                          {busyId === r.id ? (
                            <Loader2 size={18} className="animate-spin text-[#529D21]" />
                          ) : (
                            <Download size={18} className="text-[#529D21]" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}