import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  RefreshCw,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
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
  const invoiceId = q.get("invoice_id");

  const [state, setState] = useState<UiState>("loading");
  const [message, setMessage] = useState("Vérification du paiement…");

  const inferStateFromVerify = (data: any): UiState => {
    const s = String(
      data?.status || data?.payment_status || data?.invoice_status || data?.payment?.status || ""
    ).toLowerCase();

    if (["paid", "approved", "completed", "success"].includes(s)) return "success";
    if (["failed", "declined", "canceled", "cancelled"].includes(s)) return "failed";
    if (s.includes("pending") || s.includes("initiated")) return "pending";

    return "pending";
  };

  const verify = async () => {
    // Si annulation => écran échec direct
    if (statusParam === "cancel") {
      setState("failed");
      setMessage("Paiement annulé. Aucun montant n’a été débité.");
      return;
    }

    if (!invoiceId) {
      setState("pending");
      setMessage("Nous avons bien reçu ton retour, mais nous ne pouvons pas confirmer le paiement pour le moment.");
      return;
    }

    setState("loading");
    setMessage("Vérification du paiement…");

    try {
      const { data } = await api.get(`/invoices/${invoiceId}/payment/verify`);
      const s = inferStateFromVerify(data);

      if (s === "success") setMessage("Paiement confirmé. Merci !");
      if (s === "failed") setMessage("Le paiement n’a pas pu être confirmé.");
      if (s === "pending") setMessage("Paiement en cours de confirmation…");

      setState(s);
    } catch {
      setState("pending");
      setMessage("Paiement en cours de confirmation… Réessaie dans quelques instants.");
    }
  };

  useEffect(() => {
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam, invoiceId]);

  const ui = useMemo(() => {
    if (state === "success") {
      return {
        badge: { label: "Paiement confirmé", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        box: "border-emerald-200 bg-emerald-50 text-emerald-800",
        icon: <CheckCircle2 size={18} className="text-emerald-700" />,
      };
    }
    if (state === "failed") {
      return {
        badge: { label: "Paiement annulé", cls: "bg-red-50 text-red-700 border-red-200" },
        box: "border-red-200 bg-red-50 text-red-800",
        icon: <XCircle size={18} className="text-red-700" />,
      };
    }
    if (state === "pending") {
      return {
        badge: { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
        box: "border-amber-200 bg-amber-50 text-amber-900",
        icon: <Clock3 size={18} className="text-amber-700" />,
      };
    }
    return {
      badge: { label: "Vérification…", cls: "bg-blue-50 text-blue-700 border-blue-200" },
      box: "border-blue-200 bg-blue-50 text-blue-800",
      icon: <Loader2 size={18} className="animate-spin text-blue-700" />,
    };
  }, [state]);

  return (
    <div className="py-10">
      <div className="flex justify-center px-4">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                <CreditCard size={14} />
                Paiements
              </div>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Retour de paiement</h1>

              <p className="mt-1 text-sm font-semibold text-gray-600">
                {invoiceId ? (
                  <>
                    Facture <span className="font-extrabold text-gray-900">#{invoiceId}</span>
                  </>
                ) : (
                  "Nous finalisons la vérification de ton paiement."
                )}
              </p>
            </div>

            <span
              className={cx(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold",
                ui.badge.cls
              )}
            >
              {ui.badge.label}
            </span>
          </div>

          {/* Card */}
          <div className="mt-6 rounded-3xl border border-blue-200 bg-white shadow-sm hover:shadow-md transition p-5 md:p-6">
            <div className={cx("rounded-3xl border p-4", ui.box)}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{ui.icon}</div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold">{message}</div>

                  {state === "pending" && (
                    <div className="mt-1 text-xs font-bold opacity-90">
                      Si le paiement vient d’être effectué, il peut apparaître dans quelques instants.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <button
                type="button"
                onClick={verify}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-2xl border border-blue-200 bg-white px-4 py-3
                  text-sm font-extrabold text-gray-800
                  hover:bg-blue-50 hover:text-blue-700
                  transition
                "
              >
                <RefreshCw size={18} />
                Rafraîchir
              </button>

              <button
                type="button"
                onClick={() => navigate("/locataire")}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-2xl bg-blue-600 px-4 py-3
                  text-sm font-extrabold text-white
                  hover:bg-blue-700
                  transition
                "
              >
                <ArrowLeft size={18} />
                Retour au tableau de bord
              </button>
            </div>
          </div>

          {/* Petite note (non technique) */}
          {state === "failed" && (
            <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm font-semibold text-gray-700">
              Tu peux relancer le paiement depuis tes factures si besoin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
