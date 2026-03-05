// src/pages/Locataire/components/PayLinkPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tenantPayments, type PayLinkInfo } from "@/services/tenantPayments";

const cx = (...classes: Array<string | false | undefined | null>) => classes.filter(Boolean).join(" ");

const prettyJson = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

const formatMoney = (amount: any, currency?: string) => {
  const n = Number(amount ?? 0);
  const cur = (currency || "XOF").toUpperCase();
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur }).format(n);
  } catch {
    return `${n.toFixed(0)} ${cur}`;
  }
};

const Pill = ({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "idle" | "error";
  children: React.ReactNode;
}) => {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : tone === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={cx("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", cls)}>
      {children}
    </span>
  );
};

const Alert = ({
  tone,
  children,
}: {
  tone: "info" | "ok" | "error";
  children: React.ReactNode;
}) => {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return <div className={cx("rounded-xl border p-3 text-sm", cls)}>{children}</div>;
};

export default function PayLinkPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token?: string }>(); // ✅ token optionnel
  const [tokenInput, setTokenInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<PayLinkInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);

  const status = useMemo(() => {
    const usedAt = info?.used_at;
    const expiresAt = info?.expires_at;

    const now = Date.now();
    const exp = expiresAt ? new Date(expiresAt).getTime() : null;

    if (usedAt) return { label: "Déjà payé", tone: "ok" as const };
    if (exp && exp < now) return { label: "Expiré", tone: "error" as const };
    return { label: "Disponible", tone: "idle" as const };
  }, [info]);

  const invoice = info?.invoice ?? null;
  const amount = invoice?.amount_total ?? 0;

  const currency =
    invoice?.currency ||
    invoice?.meta?.currency ||
    info?.invoice?.currency ||
    "XOF";

  const dueDate = invoice?.due_date || null;

  const load = async () => {
    if (!token) return;

    setLoading(true);
    setErr(null);
    try {
      const data = await tenantPayments.getPayLink(token);
      setInfo(data);
    } catch (e: any) {
      setErr(e?.message || "Impossible de charger ce lien de paiement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handlePay = async () => {
    if (!token) return;

    setPayErr(null);

    if (status.label === "Déjà payé") {
      setPayErr("Ce lien a déjà été utilisé.");
      return;
    }
    if (status.label === "Expiré") {
      setPayErr("Ce lien a expiré. Demande un nouveau lien au propriétaire.");
      return;
    }

    setPaying(true);
    try {
      const res: any = await tenantPayments.initPayment(token);
      const checkoutUrl = res?.checkout_url || res?.url || res?.checkoutUrl;
      if (!checkoutUrl) throw new Error("URL de paiement introuvable.");
      window.location.href = checkoutUrl;
    } catch (e: any) {
      setPayErr(e?.message || "Erreur lors de l'initialisation du paiement.");
    } finally {
      setPaying(false);
    }
  };

  // ✅ CAS MENU: /locataire/pay-link (sans token)
  if (!token) {
    return (
      <div className="mx-auto w-full max-w-xl p-4 md:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xl font-extrabold text-slate-900">Paiement</div>
          <div className="mt-2 text-sm text-slate-600">
            Colle le token reçu (ou ouvre le lien complet) pour accéder au paiement.
          </div>

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Ex: 9f3a1b2c... (token)"
            />

            <button
              type="button"
              onClick={() => {
                const t = tokenInput.trim();
                if (!t) return;
                navigate(`/locataire/pay-link/${t}`);
              }}
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              Continuer
            </button>

            <div className="text-xs text-slate-500">
              Exemple : si tu as un lien <span className="font-semibold">/pay-link/ABC123</span>, le token est{" "}
              <span className="font-semibold">ABC123</span>.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ CAS TOKEN OK: /pay-link/:token OU /locataire/pay-link/:token
  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-extrabold tracking-tight">Paiement du loyer</div>
            <div className="mt-1 text-sm text-white/80">Règle ton paiement en toute sécurité via FedaPay.</div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={status.tone}>{status.label}</Pill>
            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {loading && <Alert tone="info">Chargement du lien de paiement…</Alert>}
        {err && <Alert tone="error">{err}</Alert>}

        {!loading && !err && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900">Récapitulatif</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {dueDate ? (
                      <>
                        Échéance : <span className="font-semibold">{String(dueDate)}</span>
                      </>
                    ) : (
                      "Échéance non précisée"
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Montant</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {formatMoney(amount, currency)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">Bien / Location</div>
                  <div className="mt-1 text-sm text-slate-900">
                    {info?.property?.title || info?.property?.name || info?.lease?.property_title || "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {info?.property?.address || info?.lease?.property_address || ""}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">Locataire</div>
                  <div className="mt-1 text-sm text-slate-900">
                    {info?.tenant?.name || info?.tenant?.full_name || "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{info?.tenant?.email || ""}</div>
                </div>
              </div>

              {info?.expires_at && (
                <div className="mt-4 text-xs text-slate-500">
                  Expire le : <span className="font-semibold">{String(info.expires_at)}</span>
                </div>
              )}
            </div>

            {payErr && <Alert tone="error">{payErr}</Alert>}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={handlePay}
                disabled={paying || status.label !== "Disponible"}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying ? "Redirection…" : "Payer maintenant"}
              </button>

              <div className="text-xs text-slate-500">Paiement sécurisé · FedaPay Checkout</div>
            </div>

            <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">Debug pay-link</summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-800 border border-slate-200">
{prettyJson(info)}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
