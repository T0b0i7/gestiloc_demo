import React, { useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, Search, FileText } from "lucide-react";
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

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await tenantRentReceiptService.list();
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Impossible de charger les quittances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((r) => {
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
  }, [items, q]);

  const handleDownload = async (r: RentReceipt) => {
    setBusyId(r.id);
    setError(null);
    try {
      const blob = await tenantRentReceiptService.downloadPdf(r.id);
      const name = (r.reference || `quittance-${r.id}`) + ".pdf";
      downloadBlob(blob, name);
    } catch (e: any) {
      setError(e?.response?.data?.message || "PDF indisponible pour cette quittance.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="py-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
            <FileText size={14} />
            Quittances
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
            Mes quittances
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-600">
            Consulte et télécharge les quittances délivrées par ton propriétaire.
          </p>
        </div>

        <button
          onClick={fetchAll}
          className="mt-4 md:mt-0 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-extrabold text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition"
          type="button"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          Actualiser
        </button>
      </div>

      <div className="mt-6">
        <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">
          Recherche
        </div>
        <div className="mt-2 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Référence, mois, adresse…"
            className="w-full rounded-2xl bg-white text-gray-900 border border-blue-200 pl-12 pr-4 py-3 text-sm font-semibold placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400 transition"
          />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-3xl border border-blue-200 bg-white p-8">
            <div className="flex items-center gap-3 text-gray-700 font-bold">
              <Loader2 className="animate-spin" /> Chargement…
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 font-bold">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-blue-200 bg-white p-8">
            <div className="text-gray-900 font-extrabold">Aucune quittance</div>
            <div className="mt-1 text-sm font-semibold text-gray-600">
              Si tu viens de payer, elle apparaîtra ici dès qu’elle est générée.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((r) => {
              const propLine = [r.property?.address, r.property?.city].filter(Boolean).join(" • ");
              const labelMonth = r.paid_month ? r.paid_month : "—";

              return (
                <div
                  key={r.id}
                  className="rounded-3xl border border-blue-200 bg-white shadow-sm hover:shadow-md transition p-5 md:p-6"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="text-lg md:text-xl font-extrabold text-gray-900 truncate">
                        {r.reference || `Quittance #${r.id}`}
                      </div>

                      <div className="mt-2 text-sm font-semibold text-gray-600">
                        {propLine ? propLine : <span className="text-gray-400">Bien non renseigné</span>}
                      </div>

                      <div className="mt-1 text-sm font-semibold text-gray-600">
                        Mois payé : <span className="text-gray-900 font-extrabold">{labelMonth}</span>
                        {r.amount_paid != null ? (
                          <span className="text-gray-500"> • Montant : {String(r.amount_paid)}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-full md:w-[260px]">
                      <button
                        type="button"
                        onClick={() => handleDownload(r)}
                        disabled={busyId === r.id}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        {busyId === r.id ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Téléchargement…
                          </>
                        ) : (
                          <>
                            <Download size={18} />
                            Télécharger PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-xs font-bold text-gray-500">
                    ID #{r.id}
                    {r.issued_date ? <span> • Émise le {String(r.issued_date).slice(0, 10)}</span> : null}
                    {r.type ? <span> • Type: {r.type}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
