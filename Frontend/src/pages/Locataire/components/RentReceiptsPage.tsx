import React, { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Search, ChevronDown } from "lucide-react";
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

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrer les quittances</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
            <div className="flex-1 relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-[#529D21]" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#529D21] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#529D21]/20 focus:border-[#529D21] bg-white text-[#529D21]"
              />
            </div>
            <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
              Total: {filtered.length} quittance{filtered.length > 1 ? 's' : ''}
            </div>
          </div>
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
                    <td className="px-6 py-4 text-sm text-gray-900">{[r.property?.address, r.property?.city].filter(Boolean).join(", ") || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#529D21]">{r.amount_paid != null ? formatFCFA(Number(r.amount_paid)) : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.reference || `Quittance #${r.id}`}</td>
                    <td className="px-6 py-4"><span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span></td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDownload(r)} disabled={busyId === r.id} className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
                        {busyId === r.id ? <Loader2 size={18} className="animate-spin text-[#529D21]" /> : <Download size={18} className="text-[#529D21]" />}
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