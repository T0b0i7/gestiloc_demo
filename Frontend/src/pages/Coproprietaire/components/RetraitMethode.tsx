// Copie exacte du composant propriétaire adapté pour co-propriétaire
import React, { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  RefreshCw,
  Plus,
  Pencil,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Building2,
  CreditCard,
  User,
  Globe,
  BadgeCent,
  X,
  Save,
} from "lucide-react";

import { coOwnerApi } from "@/services/coOwnerApi";

/** Modal (responsive, scrollable, avoids cut top/bottom) */
function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-blue-200 bg-white shadow-2xl overflow-hidden max-h-[calc(100vh-2rem)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blue-100 bg-white px-6 py-5">
              <div className="flex items-center gap-2">
                <Wallet className="text-blue-700" size={18} />
                <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl p-2 text-gray-600 hover:bg-blue-50 transition"
                type="button"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-2rem-92px)]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CountryOption = { code: string; name: string; currencies: string[] };
type ProviderOption = { id: string; label: string };

const COUNTRIES: CountryOption[] = [
  { code: "BJ", name: "Bénin", currencies: ["XOF"] },
  { code: "CI", name: "Côte d'Ivoire", currencies: ["XOF"] },
  { code: "SN", name: "Sénégal", currencies: ["XOF"] },
  { code: "TG", name: "Togo", currencies: ["XOF"] },
  { code: "BF", name: "Burkina Faso", currencies: ["XOF"] },
  { code: "ML", name: "Mali", currencies: ["XOF"] },
  { code: "NE", name: "Niger", currencies: ["XOF"] },
  { code: "CM", name: "Cameroun", currencies: ["XAF"] },
  { code: "GA", name: "Gabon", currencies: ["XAF"] },
  { code: "CD", name: "RDC", currencies: ["CDF", "USD"] },
  { code: "GH", name: "Ghana", currencies: ["GHS"] },
  { code: "NG", name: "Nigeria", currencies: ["NGN"] },
  { code: "KE", name: "Kenya", currencies: ["KES"] },
  { code: "UG", name: "Ouganda", currencies: ["UGX"] },
  { code: "TZ", name: "Tanzanie", currencies: ["TZS"] },
  { code: "ZA", name: "Afrique du Sud", currencies: ["ZAR"] },
  { code: "MA", name: "Maroc", currencies: ["MAD"] },
  { code: "TN", name: "Tunisie", currencies: ["TND"] },
  { code: "DZ", name: "Algérie", currencies: ["DZD"] },
  { code: "FR", name: "France", currencies: ["EUR"] },
  { code: "BE", name: "Belgique", currencies: ["EUR"] },
  { code: "CH", name: "Suisse", currencies: ["CHF", "EUR"] },
];

const MOBILE_MONEY_PROVIDERS: ProviderOption[] = [
  { id: "mtn", label: "MTN Mobile Money" },
  { id: "moov", label: "Moov Money" },
  { id: "orange", label: "Orange Money" },
  { id: "wave", label: "Wave" },
  { id: "free", label: "Free Money" },
  { id: "airtel", label: "Airtel Money" },
  { id: "vodacom", label: "Vodacom M-Pesa" },
  { id: "tigo", label: "Tigo Cash" },
];

const isoCountryName = (code?: string) =>
  COUNTRIES.find((c) => c.code === code)?.name || (code ? code : "—");

const defaultCurrencyForCountry = (code: string) =>
  COUNTRIES.find((c) => c.code === code)?.currencies?.[0] ?? "XOF";

const cx = (...classes: Array<string | false | undefined | null>) =>
  classes.filter(Boolean).join(" ");

const safeString = (v: any) => (typeof v === "string" ? v : v == null ? "" : String(v));
const isNonEmpty = (s?: string) => typeof s === "string" && s.trim().length > 0;

// backend regex: ^acc_[A-Za-z0-9]+$
const ACC_REF_REGEX = /^acc_[A-Za-z0-9]+$/;
const normalizeAccRef = (raw: string) => {
  const v = String(raw ?? "").trim();
  if (ACC_REF_REGEX.test(v)) return v;
  const only = v.replace(/[^A-Za-z0-9]/g, "");
  const token = only.length ? only : Date.now().toString(36);
  return `acc_${token}`;
};

type NotifyType = "success" | "info" | "error";
type ApiErr = { response?: { status?: number; data?: any }; request?: unknown; message?: string };

function looksTechnical(msg?: string) {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("sql") ||
    m.includes("exception") ||
    m.includes("stack") ||
    m.includes("trace") ||
    m.includes("undefined") ||
    m.includes("timeout") ||
    m.includes("connection")
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">{children}</div>;
}

function Input({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      className="
        w-full rounded-2xl bg-white text-gray-900
        border border-blue-200
        px-4 py-3
        text-sm font-semibold
        placeholder:text-gray-400
        outline-none
        focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400
        disabled:opacity-60 disabled:cursor-not-allowed
        transition
      "
    />
  );
}

function Select({
  value,
  onChange,
  disabled,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full appearance-none rounded-2xl
          bg-white text-gray-900
          border border-blue-200
          px-4 py-3 pr-10
          text-sm font-semibold
          outline-none
          focus:ring-4 focus:ring-blue-200/60 focus:border-blue-400
          disabled:opacity-60 disabled:cursor-not-allowed
          transition
        "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">▾</div>
    </div>
  );
}

// Types pour le co-propriétaire (adaptés du propriétaire)
type PayoutType = "bank" | "mobile_money" | "bank_card";
type UpsertSubaccountPayload = {
  subaccount_reference?: string;
  payout_type?: PayoutType | null;
  country?: string | null;
  currency?: string | null;
  account_name?: string | null;
  bank_name?: string | null;
  iban?: string | null;
  account_number?: string | null;
  provider?: string | null;
  phone?: string | null;
  card_token?: string | null;
  card_last4?: string | null;
  card_brand?: string | null;
  card_exp_month?: string | null;
  card_exp_year?: string | null;
};

type CoOwnerFedapayProfile = {
  fedapay_subaccount_id: string | null;
  fedapay_meta: any;
  is_ready: boolean | null;
};

type CurrentMethod = {
  payout_type: PayoutType | null;
  account_name: string | null;
  account_number: string | null;
  bank_name: string | null;
  iban: string | null;
  provider: string | null;
  phone: string | null;
  card_token: string | null;
  card_last4: string | null;
  card_brand: string | null;
  card_exp_month: string | null;
  card_exp_year: string | null;
  subaccount_reference: string | null;
  is_ready: boolean | null;
};

function extractCurrentMethod(p: CoOwnerFedapayProfile | null): CurrentMethod {
  const anyP: any = p as any;
  const subRefRaw = safeString(anyP?.fedapay_subaccount_id || anyP?.subaccount_reference || "");
  const subRef = subRefRaw ? subRefRaw : null;

  const isReady = typeof anyP?.is_ready === "boolean" ? (anyP.is_ready as boolean) : null;

  // If no meta, return minimal (but keep is_ready + subaccount)
  if (!anyP?.fedapay_meta || typeof anyP.fedapay_meta !== "object") {
    return {
      payout_type: null,
      account_name: null,
      account_number: null,
      bank_name: null,
      iban: null,
      provider: null,
      phone: null,
      card_token: null,
      card_last4: null,
      card_brand: null,
      card_exp_month: null,
      card_exp_year: null,
      subaccount_reference: subRef,
      is_ready: isReady,
    };
  }

  const meta = anyP.fedapay_meta;
  const bc = typeof meta === "object" ? meta : {};

  return {
    payout_type: safeString(bc.payout_type),
    account_name: safeString(bc.account_name),
    account_number: safeString(bc.account_number),
    bank_name: safeString(bc.bank_name),
    iban: safeString(bc.iban),
    provider: safeString(bc.provider),
    phone: safeString(bc.phone),
    card_token: safeString(bc.card_token),
    card_last4: bc?.card_last4 ? String(bc.card_last4) : null,
    card_brand: safeString(bc.card_brand),
    card_exp_month: bc?.card_exp_month ? String(bc.card_exp_month) : null,
    card_exp_year: bc?.card_exp_year ? String(bc.card_exp_year) : null,
    subaccount_reference: subRef,
    is_ready: isReady,
  };
}

function normalizeApiError(err: ApiErr, fallback: string) {
  if (err?.request && !err?.response) return "Le serveur ne répond pas. Vérifie ta connexion puis réessaie.";
  const status = err?.response?.status;

  if (status === 401) return "Session expirée. Reconnecte-toi.";
  if (status === 403) return "Accès refusé.";
  if (status === 413) return "Fichiers trop volumineux.";
  if (status === 422) return "Certains champs sont invalides. Vérifie le formulaire.";
  if (status && status >= 500) return "Problème serveur. Réessaie dans quelques instants.";

  const backendMsg =
    String(err?.response?.data?.message ?? "").trim() ||
    String(err?.response?.data?.error ?? "").trim() ||
    String(err?.message ?? "").trim();

  if (backendMsg) return backendMsg;

  return fallback;
}

function AlertBox({ tone, children }: { tone: "error" | "warning"; children: React.ReactNode }) {
  const bgColor = tone === "error" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200";
  const textColor = tone === "error" ? "text-red-800" : "text-yellow-800";
  const iconColor = tone === "error" ? "text-red-600" : "text-yellow-600";

  return (
    <div className={`rounded-xl p-4 ${bgColor} ${textColor}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

type Props = {
  onNavigate: (tab: string) => void;
  notify: (msg: string, type: "success" | "info" | "error") => void;
};

export const RetraitMethode: React.FC<Props> = ({ onNavigate, notify }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoOwnerFedapayProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [openEditor, setOpenEditor] = useState(false);
  const [subaccountReference, setSubaccountReference] = useState<string>("");

  // Form fields
  const [payoutType, setPayoutType] = useState<PayoutType | "">("bank");
  const [country, setCountry] = useState<string>("CI");
  const [currency, setCurrency] = useState<string>("XOF");
  const [accountName, setAccountName] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [iban, setIban] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [cardToken, setCardToken] = useState<string>("");
  const [cardBrand, setCardBrand] = useState<string>("");
  const [cardLast4, setCardLast4] = useState<string>("");
  const [cardExpMonth, setCardExpMonth] = useState<string>("");
  const [cardExpYear, setCardExpYear] = useState<string>("");

  const current = extractCurrentMethod(profile);

  const isConfigured = useMemo(() => {
    const anyP: any = profile as any;
    if (anyP?.is_ready === true) return true;
    const acc = safeString(anyP?.fedapay_subaccount_id || anyP?.subaccount_reference || "");
    return ACC_REF_REGEX.test(acc);
  }, [profile]);

  const loadProfile = async () => {
    setLoading(true);
    setPageError(null);

    try {
      const p = await coOwnerApi.getWithdrawalMethods();
      
      // internal ref for POST (stable)
      const anyP: any = p as any;
      const already = safeString(anyP?.fedapay_subaccount_id || anyP?.subaccount_reference || "");
      const computed = normalizeAccRef(already || `acc_${Date.now().toString(36)}`);
      setSubaccountReference(computed);

      // Prefill editor from meta (if exists)
      const meta: any = (p as any)?.fedapay_meta;
      if (meta && typeof meta === "object") {
        const t = safeString(meta.payout_type || meta.payoutType || meta?.payout?.type || meta?.withdrawal?.type);
        const normalized: PayoutType | "" =
          t === "bank" || t === "mobile_money" || t === "bank_card" ? (t as PayoutType) : "";

        const ctry = safeString(meta.country || meta?.payout?.country || meta?.withdrawal?.country) || "CI";
        const curr =
          safeString(meta.currency || meta?.payout?.currency || meta?.withdrawal?.currency) ||
          defaultCurrencyForCountry(ctry);
        const name = safeString(meta.account_name || meta?.payout?.account_name || meta?.withdrawal?.account_name);

        setPayoutType(normalized || "bank");
        setCountry(ctry);
        setCurrency(curr);
        setAccountName(name);
        setBankName(safeString(meta.bank_name || meta?.payout?.bank_name || meta?.withdrawal?.bank_name));
        setIban(safeString(meta.iban || meta?.payout?.iban || meta?.withdrawal?.iban));
        setAccountNumber(safeString(meta.account_number || meta?.payout?.account_number || meta?.withdrawal?.account_number));
        setProvider(safeString(meta.provider || meta?.payout?.provider || meta?.withdrawal?.provider));
        setPhone(safeString(meta.phone || meta?.payout?.phone || meta?.withdrawal?.phone));
        setCardToken(safeString(meta.card_token || meta?.payout?.card_token || meta?.withdrawal?.card_token));
        setCardBrand(safeString(meta.card_brand || meta?.payout?.card_brand || meta?.withdrawal?.card_brand));
        setCardLast4(safeString(meta.card_last4 || meta?.payout?.card_last4 || meta?.withdrawal?.card_last4));
        setCardExpMonth(safeString(meta.card_exp_month || meta?.payout?.card_exp_month || meta?.withdrawal?.card_exp_month));
        setCardExpYear(safeString(meta.card_exp_year || meta?.payout?.card_exp_year || meta?.withdrawal?.card_exp_year));
      }

      // Map profile to expected format
      const mappedProfile: CoOwnerFedapayProfile = {
        fedapay_subaccount_id: anyP?.fedapay_subaccount_id || null,
        fedapay_meta: anyP?.fedapay_meta || null,
        is_ready: anyP?.is_ready || null,
      };

      setProfile(mappedProfile);
    } catch (err: any) {
      const nice = normalizeApiError(err as ApiErr, "Erreur lors du chargement du profil.");
      setPageError(nice);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const buildPayload = (): UpsertSubaccountPayload => {
    const base: UpsertSubaccountPayload = {
      subaccount_reference: subaccountReference,
      payout_type: payoutType,
      country,
      currency,
      account_name: accountName,
    };

    if (payoutType === "mobile_money") return { ...base, provider, phone };
    if (payoutType === "bank") {
      return { ...base, bank_name: bankName, iban: iban || undefined, account_number: accountNumber || undefined };
    }

    return {
      ...base,
      card_token: cardToken,
      card_brand: cardBrand || undefined,
      card_last4: cardLast4 || undefined,
      card_exp_month: cardExpMonth || undefined,
      card_exp_year: cardExpYear || undefined,
    };
  };

  const validateBeforeSave = (): string | null => {
    const ref = normalizeAccRef(subaccountReference);
    if (!isNonEmpty(ref)) return "Référence interne manquante.";
    if (!ACC_REF_REGEX.test(ref)) return "Référence interne invalide.";

    if (payoutType === "mobile_money") {
      if (!isNonEmpty(provider)) return "Fournisseur requis.";
      if (!isNonEmpty(phone)) return "Numéro de téléphone requis.";
    }

    if (payoutType === "bank") {
      if (!isNonEmpty(bankName)) return "Nom de la banque requis.";
      if (!isNonEmpty(accountNumber)) return "Numéro de compte requis.";
    }

    if (payoutType === "bank_card") {
      if (!isNonEmpty(cardToken)) return "Token de la carte requis.";
    }

    if (!isNonEmpty(accountName)) return "Nom du titulaire requis.";
    if (!isNonEmpty(country)) return "Pays requis.";
    if (!isNonEmpty(currency)) return "Devise requise.";

    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError(null);

    const err = validateBeforeSave();
    if (err) {
      setPageError(err);
      return;
    }

    setBusy(true);
    try {
      // ✅ ensure ref normalized
      const normalizedRef = normalizeAccRef(subaccountReference);
      setSubaccountReference(normalizedRef);

      const payload = { ...buildPayload(), subaccount_reference: normalizedRef };
      await coOwnerApi.createWithdrawalMethod(payload);

      notify("Moyen de retrait enregistré ✅", "success");
      setOpenEditor(false);
      await loadProfile();
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Erreur lors de l'enregistrement du moyen de retrait.");
      setPageError(msg);
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  // UI helper
  const methodTitle = useMemo(() => {
    if (!isConfigured) return "Aucun moyen enregistré";
    if (current.payout_type === "mobile_money") return "Mobile Money";
    if (current.payout_type === "bank") return "Compte bancaire";
    if (current.payout_type === "bank_card") return "Carte (token)";
    // ✅ key fix: if configured but no meta, still show "FedaPay subaccount"
    if (current.subaccount_reference) return "Subaccount FedaPay";
    return "Moyen actuel";
  }, [isConfigured, current.payout_type, current.subaccount_reference]);

  const methodIcon = useMemo(() => {
    if (!isConfigured) return <Wallet size={18} className="text-blue-700" />;
    if (current.payout_type === "mobile_money") return <Smartphone size={18} className="text-blue-700" />;
    if (current.payout_type === "bank") return <Building2 size={18} className="text-blue-700" />;
    if (current.payout_type === "bank_card") return <CreditCard size={18} className="text-blue-700" />;
    return <Wallet size={18} className="text-blue-700" />;
  }, [isConfigured, current.payout_type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
            <CreditCard size={14} />
            Méthodes de retrait
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Méthodes de retrait</h1>
          <p className="mt-1 text-sm font-semibold text-gray-600">
            Gère tes méthodes de retrait pour recevoir tes paiements.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={() => setOpenEditor(true)}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl bg-blue-600 px-4 py-3
              text-sm font-extrabold text-white
              hover:bg-blue-700
              transition
            "
            type="button"
          >
            <Plus size={18} />
            Ajouter une méthode
          </button>
        </div>
      </div>

      {/* Current Method Summary */}
      <div className="mt-6 rounded-3xl border border-blue-200 bg-white shadow-sm p-5 md:p-6">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">{methodTitle}</h2>
        {isConfigured ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className={cx("w-10 h-10 rounded-full flex items-center justify-center", methodIcon)}>
                  {methodIcon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {current.payout_type === "mobile_money" && current.provider && `${MOBILE_MONEY_PROVIDERS.find(p => p.id === current.provider)?.label} - `}
                    {current.account_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {current.payout_type === "mobile_money" && current.phone && `Phone: ${current.phone}`}
                    {current.payout_type === "bank" && current.bank_name && `Bank: ${current.bank_name}`}
                    {current.payout_type === "bank" && current.iban && `IBAN: ${current.iban}`}
                    {current.payout_type === "bank" && current.account_number && `Account: ****${current.account_number.slice(-4)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                {current.is_ready === true ? (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-medium">Prêt pour les paiements</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">En attente de validation</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setOpenEditor(true)}
                className="p-2 text-blue-600 hover:text-blue-700 transition"
                title="Modifier"
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Aucune méthode de retrait configurée</p>
            <p className="text-gray-500 text-sm mt-2">
              Configure une méthode pour pouvoir recevoir tes fonds.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={openEditor}
        title={isConfigured ? "Modifier le moyen de retrait" : "Ajouter un moyen de retrait"}
        onClose={() => setOpenEditor(false)}
      >
        {pageError && (
          <div className="mb-4">
            <AlertBox tone="error">{pageError}</AlertBox>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* hidden backend required */}
          <input type="hidden" value={subaccountReference} readOnly />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Type de retrait</FieldLabel>
              <div className="mt-2">
                <Select
                  value={payoutType}
                  onChange={(v) => {
                    const next = v as PayoutType;
                    setPayoutType(next);

                    // ✅ when switching payout type, clear irrelevant inputs (avoid overwriting saved meta with null/old)
                    if (next === "mobile_money") {
                      setBankName("");
                      setIban("");
                      setAccountNumber("");
                      setCardToken("");
                      setCardBrand("");
                      setCardLast4("");
                      setCardExpMonth("");
                      setCardExpYear("");
                    } else if (next === "bank") {
                      setProvider("");
                      setPhone("");
                      setCardToken("");
                      setCardBrand("");
                      setCardLast4("");
                      setCardExpMonth("");
                      setCardExpYear("");
                    } else if (next === "bank_card") {
                      setBankName("");
                      setIban("");
                      setProvider("");
                      setPhone("");
                    }
                  }}
                  disabled={!!profile}
                  options={[
                    { value: "bank", label: "Compte bancaire" },
                    { value: "mobile_money", label: "Mobile Money" },
                    { value: "bank_card", label: "Carte (token)" },
                  ]}
                />
              </div>
            </div>

            {/* Country + Currency */}
            <div>
              <FieldLabel>Pays</FieldLabel>
              <div className="mt-2">
                <Select
                  value={country}
                  onChange={setCountry}
                  disabled={!!profile}
                  options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }))}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Devise</FieldLabel>
              <div className="mt-2">
                <Select
                  value={currency}
                  onChange={setCurrency}
                  disabled={!!profile}
                  options={COUNTRIES.find((c) => c.code === country)?.currencies?.map((cur) => ({ value: cur, label: cur })) || [{ value: "XOF", label: "XOF" }]}
                />
              </div>
            </div>

            {/* Account Name */}
            <div>
              <FieldLabel>Nom du titulaire</FieldLabel>
              <div className="mt-2">
                <Input
                  value={accountName}
                  onChange={setAccountName}
                  placeholder="Ex: Jean Dupont"
                  disabled={!!profile}
                />
              </div>
            </div>

            {/* Conditional fields */}
            {payoutType === "mobile_money" && (
              <>
                <div>
                  <FieldLabel>Fournisseur</FieldLabel>
                  <div className="mt-2">
                    <Select
                      value={provider}
                      onChange={setProvider}
                      disabled={!!profile}
                      options={MOBILE_MONEY_PROVIDERS}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Numéro de téléphone</FieldLabel>
                  <div className="mt-2">
                    <Input
                      value={phone}
                      onChange={setPhone}
                      placeholder="Ex: +2250700000000"
                      disabled={!!profile}
                    />
                  </div>
                </div>
              </>
            )}

            {payoutType === "bank" && (
              <>
                <div>
                  <FieldLabel>Nom de la banque</FieldLabel>
                  <div className="mt-2">
                    <Input
                      value={bankName}
                      onChange={setBankName}
                      placeholder="Ex: Ecobank, BIAO, SGBCI"
                      disabled={!!profile}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Numéro de compte</FieldLabel>
                  <div className="mt-2">
                    <Input
                      value={accountNumber}
                      onChange={setAccountNumber}
                      placeholder="Ex: CI12345678901234567890"
                      disabled={!!profile}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>IBAN (optionnel)</FieldLabel>
                  <div className="mt-2">
                    <Input
                      value={iban}
                      onChange={setIban}
                      placeholder="Ex: FR7630006000011234567890189"
                      disabled={!!profile}
                    />
                  </div>
                </div>
              </>
            )}

            {payoutType === "bank_card" && (
              <>
                <div>
                  <FieldLabel>Token de la carte</FieldLabel>
                  <div className="mt-2">
                    <Input
                      value={cardToken}
                      onChange={setCardToken}
                      placeholder="Token fourni par la banque"
                      disabled={!!profile}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Derniers 4 chiffres</FieldLabel>
                    <div className="mt-2">
                      <Input
                        value={cardLast4}
                        onChange={setCardLast4}
                        placeholder="1234"
                        maxLength={4}
                        disabled={!!profile}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Marque</FieldLabel>
                    <div className="mt-2">
                      <Input
                        value={cardBrand}
                        onChange={setCardBrand}
                        placeholder="Ex: Visa, Mastercard"
                        disabled={!!profile}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Mois d'expiration</FieldLabel>
                    <div className="mt-2">
                      <Input
                        value={cardExpMonth}
                        onChange={setCardExpMonth}
                        placeholder="MM"
                        maxLength={2}
                        disabled={!!profile}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Année d'expiration</FieldLabel>
                    <div className="mt-2">
                      <Input
                        value={cardExpYear}
                        onChange={setCardExpYear}
                        placeholder="AAAA"
                        maxLength={4}
                        disabled={!!profile}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpenEditor(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
            >
              Annuler
            </button>
            <div className="flex items-center gap-2">
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-2xl bg-blue-600 px-4 py-3
                  text-sm font-extrabold text-white
                  hover:bg-blue-700
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition
                "
              >
                <Save size={18} />
                {profile ? "Mettre à jour" : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
