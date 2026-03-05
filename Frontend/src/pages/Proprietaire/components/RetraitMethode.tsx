// src/pages/Proprietaire/Finance/WithdrawalMethod.tsx
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

import {
  landlordPayments,
  type LandlordFedapayProfile,
  type PayoutType,
  type UpsertSubaccountPayload,
} from "@/services/landlordPayments";

type CountryOption = { code: string; name: string; currencies: string[] };
type ProviderOption = { id: string; label: string };

const COUNTRIES: CountryOption[] = [
  { code: "BJ", name: "Bénin", currencies: ["XOF"] },
  { code: "CI", name: "Côte d’Ivoire", currencies: ["XOF"] },
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
    m.includes("vendor/") ||
    m.includes("laravel") ||
    m.includes("symfony")
  );
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

  if (backendMsg && !looksTechnical(backendMsg)) return backendMsg;

  return fallback;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-extrabold tracking-wide text-gray-600 uppercase">{children}</div>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-extrabold text-gray-700">
      {children}
    </span>
  );
}

function StatusPill({ configured }: { configured: boolean }) {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold border";
  if (configured) {
    return (
      <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}>
        <CheckCircle2 size={14} /> Configuré
      </span>
    );
  }
  return (
    <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>
      <AlertTriangle size={14} /> À configurer
    </span>
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

function AlertBox({
  tone,
  children,
}: {
  tone: "info" | "error" | "ok";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-blue-200 bg-blue-50 text-blue-800";
  return <div className={cx("rounded-3xl border p-5 font-bold", cls)}>{children}</div>;
}

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

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

/** ---------------------------------------
 *   Current method extraction
 *   ✅ IMPORTANT: if fedapay_meta is missing but is_ready=true, we still show "Subaccount FedaPay"
 * -------------------------------------- */
type CurrentMethod = {
  payout_type: PayoutType | null;
  country: string | null;
  currency: string | null;
  account_name: string | null;

  provider: string | null;
  phone: string | null;

  bank_name: string | null;
  iban: string | null;
  account_number: string | null;

  card_brand: string | null;
  card_last4: string | null;
  card_exp_month: string | null;
  card_exp_year: string | null;

  subaccount_reference: string | null;
  is_ready: boolean | null;
};

function extractCurrentMethod(p: LandlordFedapayProfile | null): CurrentMethod {
  const anyP: any = p as any;
  const meta: any = anyP?.fedapay_meta;

  const subRefRaw = safeString(anyP?.fedapay_subaccount_id || anyP?.subaccount_reference || "");
  const subRef = subRefRaw ? subRefRaw : null;

  const isReady = typeof anyP?.is_ready === "boolean" ? (anyP.is_ready as boolean) : null;

  // If no meta, return minimal (but keep is_ready + subaccount)
  if (!meta || typeof meta !== "object") {
    return {
      payout_type: null,
      country: null,
      currency: null,
      account_name: null,
      provider: null,
      phone: null,
      bank_name: null,
      iban: null,
      account_number: null,
      card_brand: null,
      card_last4: null,
      card_exp_month: null,
      card_exp_year: null,
      subaccount_reference: subRef,
      is_ready: isReady,
    };
  }

  const t = safeString(meta.payout_type || meta.payoutType || meta?.payout?.type || meta?.withdrawal?.type);
  const payout_type: PayoutType | null =
    t === "bank" || t === "mobile_money" || t === "bank_card" ? (t as PayoutType) : null;

  const country = safeString(meta.country || meta?.payout?.country || meta?.withdrawal?.country) || null;
  const currency = safeString(meta.currency || meta?.payout?.currency || meta?.withdrawal?.currency) || null;
  const account_name = safeString(meta.account_name || meta?.payout?.account_name || meta?.withdrawal?.account_name) || null;

  const mm = meta.mobile_money || meta?.payout?.mobile_money || meta?.withdrawal?.mobile_money || null;
  const bk = meta.bank || meta?.payout?.bank || meta?.withdrawal?.bank || null;
  const bc = meta.bank_card || meta?.payout?.bank_card || meta?.withdrawal?.bank_card || null;

  const subaccount_reference =
    safeString(meta.subaccount_reference || meta?.payout?.subaccount_reference || meta?.withdrawal?.subaccount_reference) ||
    subRef ||
    null;

  return {
    payout_type,
    country,
    currency,
    account_name,
    provider: mm?.provider ? String(mm.provider) : null,
    phone: mm?.phone ? String(mm.phone) : null,
    bank_name: bk?.bank_name ? String(bk.bank_name) : null,
    iban: bk?.iban ? String(bk.iban) : null,
    account_number: bk?.account_number ? String(bk.account_number) : null,
    card_brand: bc?.card_brand ? String(bc.card_brand) : null,
    card_last4: bc?.card_last4 ? String(bc.card_last4) : null,
    card_exp_month: bc?.card_exp_month ? String(bc.card_exp_month) : null,
    card_exp_year: bc?.card_exp_year ? String(bc.card_exp_year) : null,
    subaccount_reference,
    is_ready: isReady,
  };
}

const WithdrawalMethod: React.FC<{ notify?: (msg: string, type: NotifyType) => void }> = ({ notify }) => {
  const pushNotify = (msg: string, type: NotifyType) => {
    if (notify) notify(msg, type);
    else alert(msg);
  };

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [profile, setProfile] = useState<LandlordFedapayProfile | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modal
  const [openEditor, setOpenEditor] = useState(false);

  // backend required
  const [subaccountReference, setSubaccountReference] = useState<string>("");

  // Form fields
  const [payoutType, setPayoutType] = useState<PayoutType>("mobile_money");
  const [country, setCountry] = useState<string>("BJ");
  const [currency, setCurrency] = useState<string>(defaultCurrencyForCountry("BJ"));
  const [currencyAuto, setCurrencyAuto] = useState<boolean>(true);

  const [accountName, setAccountName] = useState<string>("");

  // Mobile money
  const [provider, setProvider] = useState<string>("mtn");
  const [phone, setPhone] = useState<string>("");

  // Bank
  const [bankName, setBankName] = useState<string>("");
  const [iban, setIban] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");

  // Card
  const [cardToken, setCardToken] = useState<string>("");
  const [cardBrand, setCardBrand] = useState<string>("");
  const [cardLast4, setCardLast4] = useState<string>("");
  const [cardExpMonth, setCardExpMonth] = useState<string>("");
  const [cardExpYear, setCardExpYear] = useState<string>("");

  const countryObj = useMemo(() => COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0], [country]);
  const currencyOptions = useMemo(() => {
    const base = new Set<string>(countryObj.currencies || []);
    if (isNonEmpty(currency)) base.add(currency.toUpperCase());
    return Array.from(base);
  }, [countryObj, currency]);

  const current = useMemo(() => extractCurrentMethod(profile), [profile]);

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
      const p = await landlordPayments.getFedapayProfile();
      setProfile(p);

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

        const ctry = safeString(meta.country || meta?.payout?.country || meta?.withdrawal?.country) || "BJ";
        const curr =
          safeString(meta.currency || meta?.payout?.currency || meta?.withdrawal?.currency) ||
          defaultCurrencyForCountry(ctry);
        const name = safeString(meta.account_name || meta?.payout?.account_name || meta?.withdrawal?.account_name);

        setCountry(ctry);

        if (isNonEmpty(curr)) {
          setCurrency(curr.toUpperCase());
          setCurrencyAuto(false);
        } else {
          setCurrency(defaultCurrencyForCountry(ctry));
          setCurrencyAuto(true);
        }

        setAccountName(name || "");
        if (normalized) setPayoutType(normalized);

        const mm = meta.mobile_money || meta?.payout?.mobile_money || meta?.withdrawal?.mobile_money;
        setProvider(mm?.provider ? String(mm.provider) : "mtn");
        setPhone(mm?.phone ? String(mm.phone) : "");

        const bk = meta.bank || meta?.payout?.bank || meta?.withdrawal?.bank;
        setBankName(bk?.bank_name ? String(bk.bank_name) : "");
        setIban(bk?.iban ? String(bk.iban) : "");
        setAccountNumber(bk?.account_number ? String(bk.account_number) : "");

        const bc = meta.bank_card || meta?.payout?.bank_card || meta?.withdrawal?.bank_card;
        setCardToken(bc?.card_token ? String(bc.card_token) : "");
        setCardBrand(bc?.card_brand ? String(bc.card_brand) : "");
        setCardLast4(bc?.card_last4 ? String(bc.card_last4) : "");
        setCardExpMonth(bc?.card_exp_month ? String(bc.card_exp_month) : "");
        setCardExpYear(bc?.card_exp_year ? String(bc.card_exp_year) : "");
      } else {
        // keep defaults but ensure currency matches country if auto
        if (currencyAuto) setCurrency(defaultCurrencyForCountry(country));
      }
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Impossible de charger le profil FedaPay du bailleur.");
      setPageError(msg);
      pushNotify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currencyAuto) return;
    setCurrency(defaultCurrencyForCountry(country));
  }, [country, currencyAuto]);

  const openAddOrEdit = () => {
    setPageError(null);

    // ✅ when opening, if current has meta, prefill editor from current values
    // (useful if profile got updated elsewhere)
    if (current.payout_type) setPayoutType(current.payout_type);
    if (current.country) setCountry(current.country);
    if (current.currency) {
      setCurrency(current.currency.toUpperCase());
      setCurrencyAuto(false);
    }
    if (current.account_name) setAccountName(current.account_name);

    if (current.payout_type === "mobile_money") {
      if (current.provider) setProvider(current.provider);
      if (current.phone) setPhone(current.phone);
    } else if (current.payout_type === "bank") {
      if (current.bank_name) setBankName(current.bank_name);
      if (current.iban) setIban(current.iban);
      if (current.account_number) setAccountNumber(current.account_number);
    } else if (current.payout_type === "bank_card") {
      if (current.card_brand) setCardBrand(current.card_brand);
      if (current.card_last4) setCardLast4(current.card_last4);
      if (current.card_exp_month) setCardExpMonth(current.card_exp_month);
      if (current.card_exp_year) setCardExpYear(current.card_exp_year);
    }

    setOpenEditor(true);
  };

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

    if (!isNonEmpty(country)) return "Choisis un pays.";
    if (!isNonEmpty(currency)) return "Renseigne la devise.";
    if (!isNonEmpty(accountName)) return "Renseigne le nom du bénéficiaire.";

    if (payoutType === "mobile_money") {
      if (!isNonEmpty(provider)) return "Choisis l’opérateur Mobile Money.";
      if (!isNonEmpty(phone)) return "Renseigne le numéro Mobile Money.";
    }

    if (payoutType === "bank") {
      if (!isNonEmpty(bankName)) return "Renseigne le nom de la banque.";
      if (!isNonEmpty(iban) && !isNonEmpty(accountNumber)) return "Renseigne soit l’IBAN, soit le numéro de compte.";
    }

    if (payoutType === "bank_card") {
      if (!isNonEmpty(cardToken)) return "Renseigne le token/ID carte (fourni par FedaPay).";
    }

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
      await landlordPayments.createOrUpdateSubaccount(payload);

      pushNotify("Moyen de retrait enregistré ✅", "success");
      setOpenEditor(false);
      await loadProfile();
    } catch (e: any) {
      const msg = normalizeApiError(e as ApiErr, "Erreur lors de l’enregistrement du moyen de retrait.");
      setPageError(msg);
      pushNotify(msg, "error");
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

  const detailsTitle = useMemo(() => {
    if (!isConfigured) return "Aucun moyen de retrait n’est enregistré.";
    if (current.payout_type === "mobile_money") return "Mobile Money";
    if (current.payout_type === "bank") return "Banque";
    if (current.payout_type === "bank_card") return "Carte (token)";
    return "Configuré";
  }, [isConfigured, current.payout_type]);

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
            <Wallet size={14} />
            Retraits
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Moyen de retrait</h1>

          <p className="mt-1 text-sm font-semibold text-gray-600">
            Configure où recevoir tes paiements (Mobile Money, Banque ou Carte tokenisée).
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={loadProfile}
            disabled={busy}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-blue-200 bg-white px-4 py-3
              text-sm font-extrabold text-gray-800
              hover:bg-blue-50 hover:text-blue-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
            "
            type="button"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Actualiser
          </button>

          <button
            onClick={openAddOrEdit}
            disabled={busy}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl bg-blue-600 px-4 py-3
              text-sm font-extrabold text-white
              hover:bg-blue-700 transition
              disabled:opacity-60 disabled:cursor-not-allowed
            "
            type="button"
          >
            {isConfigured ? <Pencil size={18} /> : <Plus size={18} />}
            {isConfigured ? "Modifier" : "Ajouter"}
          </button>

          <StatusPill configured={isConfigured} />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-4xl">
          {pageError && (
            <div className="mb-4">
              <AlertBox tone="error">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span>{pageError}</span>
                </div>
              </AlertBox>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-blue-200 bg-white p-8">
              <div className="flex items-center gap-3 text-gray-700 font-bold">
                <Loader2 className="animate-spin" /> Chargement…
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-blue-200 bg-white shadow-sm hover:shadow-md transition p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2">
                      {methodIcon}
                      <h2 className="text-lg md:text-xl font-extrabold text-gray-900">{methodTitle}</h2>
                    </div>
                    <Chip>FedaPay</Chip>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                        <Globe size={14} /> Pays & devise
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-gray-900">
                        {current.country ? `${isoCountryName(current.country)} (${current.country})` : "—"}{" "}
                        <span className="text-gray-500">·</span>{" "}
                        {current.currency || "—"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                        <User size={14} /> Bénéficiaire
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-gray-900">
                        {current.account_name || "—"}
                      </div>
                    </div>
                  </div>

                  {/* ✅ If configured but meta missing, explain nicely */}
                  {isConfigured && !current.payout_type && (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                      Les détails du moyen ne sont pas encore disponibles (fedapay_meta non renseigné).
                      <div className="mt-1 text-xs font-bold text-amber-800">
                        Clique sur <span className="underline">“Modifier”</span> puis <span className="underline">“Enregistrer”</span> pour enregistrer le détail.
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-[360px] space-y-3">
                  <div className="rounded-3xl border border-blue-200 bg-white p-4">
                    <FieldLabel>Détails</FieldLabel>

                    <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-gray-800">
                      {!isConfigured ? (
                        <div className="text-gray-700">
                          Aucun moyen de retrait n’est enregistré.
                          <div className="mt-2 text-xs font-bold text-gray-500">
                            Clique sur <span className="text-gray-700">“Ajouter”</span> pour configurer.
                          </div>
                        </div>
                      ) : current.payout_type === "mobile_money" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Smartphone size={16} className="text-blue-700" />
                            <span className="font-extrabold text-gray-900">{detailsTitle}</span>
                          </div>
                          <div>
                            Opérateur :{" "}
                            <span className="font-extrabold text-gray-900">{current.provider || "—"}</span>
                          </div>
                          <div>
                            Numéro :{" "}
                            <span className="font-extrabold text-gray-900">{current.phone || "—"}</span>
                          </div>
                        </div>
                      ) : current.payout_type === "bank" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-blue-700" />
                            <span className="font-extrabold text-gray-900">{detailsTitle}</span>
                          </div>
                          <div>
                            Banque :{" "}
                            <span className="font-extrabold text-gray-900">{current.bank_name || "—"}</span>
                          </div>
                          <div>
                            IBAN :{" "}
                            <span className="font-extrabold text-gray-900">{current.iban || "—"}</span>
                          </div>
                          <div>
                            Compte :{" "}
                            <span className="font-extrabold text-gray-900">{current.account_number || "—"}</span>
                          </div>
                        </div>
                      ) : current.payout_type === "bank_card" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-blue-700" />
                            <span className="font-extrabold text-gray-900">{detailsTitle}</span>
                          </div>
                          <div>
                            Marque :{" "}
                            <span className="font-extrabold text-gray-900">{current.card_brand || "—"}</span>
                          </div>
                          <div>
                            4 derniers :{" "}
                            <span className="font-extrabold text-gray-900">{current.card_last4 || "—"}</span>
                          </div>
                          <div>
                            Expiration :{" "}
                            <span className="font-extrabold text-gray-900">
                              {current.card_exp_month && current.card_exp_year
                                ? `${current.card_exp_month}/${current.card_exp_year}`
                                : "—"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-700">
                          Configuré.
                          <div className="mt-2 text-xs font-bold text-gray-500">
                            Détails disponibles après enregistrement du formulaire.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ✅ Always show subaccount when present (this solves "on ne voit pas le moyen actuel") */}
                    {current.subaccount_reference ? (
                      <div className="mt-3 text-xs font-bold text-gray-500 flex items-center gap-2">
                        <BadgeCent size={14} className="text-blue-700" />
                        Subaccount FedaPay :{" "}
                        <span className="text-gray-700">{current.subaccount_reference}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL */}
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
                          // keep cardToken? we clear to be safe
                          setCardToken("");
                          setCardBrand("");
                          setCardLast4("");
                          setCardExpMonth("");
                          setCardExpYear("");
                        } else if (next === "bank") {
                          setProvider("mtn");
                          setPhone("");
                          setCardToken("");
                          setCardBrand("");
                          setCardLast4("");
                          setCardExpMonth("");
                          setCardExpYear("");
                        } else if (next === "bank_card") {
                          setProvider("mtn");
                          setPhone("");
                          setBankName("");
                          setIban("");
                          setAccountNumber("");
                        }
                      }}
                      options={[
                        { value: "mobile_money", label: "Mobile Money" },
                        { value: "bank", label: "Compte bancaire" },
                        { value: "bank_card", label: "Carte bancaire (token)" },
                      ]}
                    />
                  </div>
                  <div className="mt-2 text-xs font-bold text-gray-500">
                    Carte = token/ID uniquement, jamais numéro carte / CVC.
                  </div>
                </div>

                <div>
                  <FieldLabel>Pays</FieldLabel>
                  <div className="mt-2">
                    <Select
                      value={country}
                      onChange={(v) => {
                        setCountry(v);
                        if (currencyAuto) setCurrency(defaultCurrencyForCountry(v));
                      }}
                      options={COUNTRIES.map((c) => ({
                        value: c.code,
                        label: `${c.name} (${c.code})`,
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Nom du bénéficiaire</FieldLabel>
                  <div className="mt-2">
                    <Input value={accountName} onChange={setAccountName} placeholder="Ex: Jean Dupont" />
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <FieldLabel>Devise</FieldLabel>
                      <div className="mt-1 text-xs font-bold text-gray-500">
                        Auto selon pays, ou sélection manuelle.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrencyAuto((v) => !v)}
                      className={cx(
                        "rounded-full border px-3 py-1 text-xs font-extrabold",
                        currencyAuto
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-gray-50 text-gray-700"
                      )}
                    >
                      {currencyAuto ? "Auto" : "Manuel"}
                    </button>
                  </div>

                  <div className="mt-3">
                    <FieldLabel>Choix devise</FieldLabel>
                    <div className="mt-2">
                      <Select
                        value={currency}
                        onChange={(v) => setCurrency(v.toUpperCase())}
                        disabled={currencyAuto}
                        options={currencyOptions.map((cur) => ({ value: cur, label: cur }))}
                      />
                    </div>

                    {currencyAuto && (
                      <div className="mt-2 text-xs font-bold text-gray-500">
                        Devise auto : <span className="text-gray-700">{defaultCurrencyForCountry(country)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MOBILE MONEY */}
              {payoutType === "mobile_money" && (
                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                    <Smartphone size={14} /> Mobile Money
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Opérateur</FieldLabel>
                      <div className="mt-2">
                        <Select
                          value={provider}
                          onChange={setProvider}
                          options={MOBILE_MONEY_PROVIDERS.map((p) => ({ value: p.id, label: p.label }))}
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Numéro wallet</FieldLabel>
                      <div className="mt-2">
                        <Input value={phone} onChange={setPhone} placeholder="Ex: +229 97 00 00 00" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BANK */}
              {payoutType === "bank" && (
                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                    <Building2 size={14} /> Compte bancaire
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <FieldLabel>Nom de la banque</FieldLabel>
                      <div className="mt-2">
                        <Input value={bankName} onChange={setBankName} placeholder="Ex: Ecobank / SG / ..." />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>IBAN (si disponible)</FieldLabel>
                      <div className="mt-2">
                        <Input value={iban} onChange={setIban} placeholder="Ex: FR76..." />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Numéro de compte (sinon)</FieldLabel>
                      <div className="mt-2">
                        <Input value={accountNumber} onChange={setAccountNumber} placeholder="Ex: 0123456789" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD TOKEN */}
              {payoutType === "bank_card" && (
                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-blue-700 uppercase">
                    <CreditCard size={14} /> Carte (token sécurisé)
                  </div>
                  <div className="mt-2 text-xs font-bold text-gray-500">
                    Tu ne saisis jamais le numéro de carte. Tu renseignes un token/ID fourni par FedaPay.
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <FieldLabel>Token / ID carte</FieldLabel>
                      <div className="mt-2">
                        <Input value={cardToken} onChange={setCardToken} placeholder="Ex: card_**** / pm_****" />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Marque (optionnel)</FieldLabel>
                      <div className="mt-2">
                        <Input value={cardBrand} onChange={setCardBrand} placeholder="Visa / Mastercard" />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>4 derniers chiffres (optionnel)</FieldLabel>
                      <div className="mt-2">
                        <Input value={cardLast4} onChange={setCardLast4} placeholder="1234" />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Mois exp. (optionnel)</FieldLabel>
                      <div className="mt-2">
                        <Input value={cardExpMonth} onChange={setCardExpMonth} placeholder="08" />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Année exp. (optionnel)</FieldLabel>
                      <div className="mt-2">
                        <Input value={cardExpYear} onChange={setCardExpYear} placeholder="2029" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-blue-100 pt-5">
                <button
                  type="button"
                  onClick={() => setOpenEditor(false)}
                  disabled={busy}
                  className="
                    rounded-2xl border border-blue-200 bg-white px-4 py-3
                    text-sm font-extrabold text-gray-800
                    hover:bg-blue-50
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition
                  "
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={busy}
                  className="
                    inline-flex items-center gap-2 rounded-2xl
                    bg-blue-600 px-4 py-3 text-sm font-extrabold text-white
                    hover:bg-blue-700
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition
                  "
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalMethod;
