import React, { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Search, ChevronDown, Home } from "lucide-react";
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
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [showPeriodeDropdown, setShowPeriodeDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);

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

  const propertyOptions = useMemo(() => {
    const options = new Set<string>();
    options.add('Tous les biens');
    items.forEach(item => {
      if (item.property?.name) {
        options.add(item.property.name);
      } else if (item.property?.address) {
        options.add(item.property.address);
      }
    });
    return Array.from(options);
  }, [items]);

  const filtered = useMemo(() => {
    let filtered = items;
    const needle = q.trim().toLowerCase();
    
    // Filtre par recherche
    if (needle) {
      filtered = filtered.filter((r) => {
        const blob = [
          r.reference,
          r.paid_month,
          r.property?.address,
          r.property?.city,
          r.property?.name,
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

    // Filtre par bien
    if (selectedProperty && selectedProperty !== 'all' && selectedProperty !== 'Tous les biens') {
      filtered = filtered.filter((r) => {
        const propertyName = r.property?.name || r.property?.address || '';
        return propertyName === selectedProperty;
      });
    }
    
    return filtered;
  }, [items, q, periode, selectedProperty]);

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

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  return (
    <div className="animate-fadeIn">
      {/* ── EN-TÊTE ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mes quittances</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Téléchargez vos quittances de loyer</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrer les quittances</h2>
        
        {/* Ligne unique pour tous les filtres */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtre Nombre de lignes */}
          <div className="relative w-32">
            <button
              onClick={() => setShowItemsDropdown(!showItemsDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 border border-[#529D21] rounded-lg text-gray-700 hover:border-[#529D21]/80 transition-colors bg-white text-sm"
            >
              <span>{itemsPerPage}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            {showItemsDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {['10', '25', '50', '100'].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setItemsPerPage(n); setShowItemsDropdown(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtre Période */}
          <div className="relative w-40">
            <button
              onClick={() => setShowPeriodeDropdown(!showPeriodeDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 border border-[#529D21] rounded-lg text-gray-700 hover:border-[#529D21]/80 transition-colors bg-white text-sm"
            >
              <span className="truncate">{periode || 'Période'}</span>
              <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
            </button>
            {showPeriodeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {periodeOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriode(p === 'Tous' ? '' : p); setShowPeriodeDropdown(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtre Par bien */}
          <div className="relative w-48">
            <button
              onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 border border-[#529D21] rounded-lg text-gray-700 hover:border-[#529D21]/80 transition-colors bg-white text-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <Home size={14} className="text-[#529D21] flex-shrink-0" />
                <span className="truncate">{selectedProperty === 'all' ? 'Tous les biens' : selectedProperty}</span>
              </div>
              <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
            </button>
            {showPropertyDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <button
                  onClick={() => { setSelectedProperty('all'); setShowPropertyDropdown(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg"
                >
                  Tous les biens
                </button>
                {propertyOptions.filter(p => p !== 'Tous les biens').map((prop) => (
                  <button
                    key={prop}
                    onClick={() => { setSelectedProperty(prop); setShowPropertyDropdown(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 last:rounded-b-lg"
                  >
                    {prop}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-[#529D21]" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par référence, mois, adresse..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#529D21] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#529D21]/20 focus:border-[#529D21] bg-white text-sm"
            />
          </div>
        </div>

        {/* Indicateur de résultat (optionnel mais utile) */}
        <div className="mt-3 text-xs text-gray-500">
          {filtered.length} quittance{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <p className="text-gray-500 text-center max-w-md">Aucune quittance disponible pour le moment.</p>
            <button onClick={fetchAll} className="mt-4 px-4 py-2 text-[#529D21] hover:bg-[#529D21]/10 rounded-lg transition-colors">Actualiser</button>
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
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-gray-900">{r.issued_date ? new Date(r.issued_date).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Home size={14} className="text-[#529D21] flex-shrink-0" />
                        <span>{r.property?.name || r.property?.address?.split(',')[0] || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#529D21]">{r.amount_paid != null ? formatFCFA(Number(r.amount_paid)) : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.reference || `Quittance #${r.id}`}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {r.status === 'paid' ? 'Payée' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDownload(r)} 
                        disabled={busyId === r.id} 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Télécharger la quittance"
                      >
                        {busyId === r.id ? 
                          <Loader2 size={18} className="animate-spin text-[#529D21]" /> : 
                          <Download size={18} className="text-[#529D21]" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}