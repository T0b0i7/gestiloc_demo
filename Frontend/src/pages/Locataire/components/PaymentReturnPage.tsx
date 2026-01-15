import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/services/api";

type UiState = "loading" | "success" | "failed" | "pending";

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function PaymentReturnPage() {
  const q = useQuery();
  const navigate = useNavigate();

  const statusParam = (q.get("status") || "").toLowerCase(); // success | cancel
  const invoiceId = q.get("invoice_id"); // ✅ recommandé

  const [state, setState] = useState<UiState>("loading");
  const [message, setMessage] = useState("Vérification du paiement…");
  const [details, setDetails] = useState<any>(null);

  const inferStateFromVerify = (data: any): UiState => {
    const s = String(
      data?.status ||
        data?.payment_status ||
        data?.invoice_status ||
        data?.payment?.status ||
        ""
    ).toLowerCase();

    if (["paid", "approved", "completed", "success"].includes(s)) return "success";
    if (["failed", "declined", "canceled", "cancelled"].includes(s)) return "failed";
    if (s.includes("pending") || s.includes("initiated")) return "pending";

    // si on ne sait pas, on considère en attente
    return "pending";
  };

  const verify = async () => {
    // Si annulation => écran échec direct (sans appeler l'API)
    if (statusParam === "cancel") {
      setState("failed");
      setMessage("Paiement annulé.");
      return;
    }

    if (!invoiceId) {
      setState("pending");
      setMessage("Retour reçu, mais impossible de vérifier (invoice_id manquant).");
      return;
    }

    setState("loading");
    setMessage("Vérification du paiement…");

    try {
      // ✅ Ton endpoint existant
      const { data } = await api.get(`/invoices/${invoiceId}/payment/verify`);
      setDetails(data);

      const s = inferStateFromVerify(data);

      if (s === "success") setMessage("Paiement confirmé. Merci !");
      if (s === "failed") setMessage("Paiement refusé ou annulé.");
      if (s === "pending") setMessage("Paiement en cours de confirmation…");

      setState(s);
    } catch (e: any) {
      setState("pending");
      setMessage(
        e?.response?.data?.message ||
          e?.message ||
          "Vérification impossible pour le moment (réessaie)."
      );
    }
  };

  useEffect(() => {
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam, invoiceId]);

  const badge = useMemo(() => {
    if (state === "success")
      return { label: "Succès", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (state === "failed")
      return { label: "Échec", cls: "bg-red-50 text-red-700 border-red-200" };
    if (state === "pending")
      return { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    return { label: "Vérification…", cls: "bg-slate-100 text-slate-700 border-slate-200" };
  }, [state]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Retour de paiement</h1>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
            {invoiceId && (
              <div className="mt-2 text-xs text-slate-500">
                Facture: <span className="font-semibold">#{invoiceId}</span>
              </div>
            )}
          </div>

          <span
            className={cx(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
              badge.cls
            )}
          >
            {badge.label}
          </span>
        </div>

        {state === "pending" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Le paiement peut prendre quelques secondes à se confirmer (webhook/traitement).
            Clique sur “Rafraîchir”.
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={verify}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Rafraîchir
          </button>

          <button
            type="button"
            onClick={() => navigate("/locataire")}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            Retour au tableau de bord
          </button>
        </div>

        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Debug</summary>
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-800 border border-slate-200">
{JSON.stringify({ statusParam, invoiceId, details }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
