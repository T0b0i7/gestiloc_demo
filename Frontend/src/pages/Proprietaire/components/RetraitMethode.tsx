// src/pages/Proprietaire/Finance/WithdrawalMethod.tsx
import React, { useEffect, useMemo, useState } from "react";
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

const cx = (...classes: Array<string | false | undefined | null>) => classes.filter(Boolean).join(" ");
const safeString = (v: any) => (typeof v === "string" ? v : v == null ? "" : String(v));
const isNonEmpty = (s?: string) => typeof s === "string" && s.trim().length > 0;

const prettyJson = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

const maskPhone = (phone: string) => {
  const p = phone.replace(/\s+/g, "");
  if (p.length <= 4) return p;
  return `${p.slice(0, 3)}***${p.slice(-3)}`;
};

const maskIban = (iban: string) => {
  const v = iban.replace(/\s+/g, "");
  if (v.length <= 8) return v;
  return `${v.slice(0, 4)}****${v.slice(-4)}`;
};

const maskAccountNumber = (num: string) => {
  const v = num.replace(/\s+/g, "");
  if (v.length <= 6) return v;
  return `${v.slice(0, 2)}****${v.slice(-2)}`;
};

const getCountry = (code: string) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
const defaultCurrencyForCountry = (code: string) => getCountry(code)?.currencies?.[0] ?? "XOF";

/**
 * Backend requires: /^acc_[A-Za-z0-9]+$/
 * We generate acc_<alnum> stable-ish (user.id preferred)
 * IMPORTANT: this is only used for POST when needed.
 * For "existing", we MUST rely on profile.fedapay_subaccount_id (returned by backend).
 */
const buildAccReference = (profile?: any) => {
  const metaRef =
    safeString(profile?.fedapay_meta?.subaccount_reference) ||
    safeString(profile?.fedapay_meta?.payout?.subaccount_reference) ||
    safeString(profile?.fedapay_meta?.withdrawal?.subaccount_reference) ||
    "";

  if (/^acc_[A-Za-z0-9]+$/.test(metaRef)) return metaRef;

  const direct = safeString(profile?.fedapay_subaccount_id || profile?.subaccount_reference || "");
  if (/^acc_[A-Za-z0-9]+$/.test(direct)) return direct;

  const alnum = (s: string) => (s || "").replace(/[^A-Za-z0-9]/g, "");
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      const id = u?.id ? alnum(String(u.id)) : "";
      const email = u?.email ? alnum(String(u.email)) : "";
      const base = id || email;
      if (base) return `acc_${base.slice(0, 24)}`;
    }
  } catch {}

  return `acc_${alnum(String(Date.now()))}`;
};

const Pill = ({ tone, children }: { tone: "ok" | "warn" | "idle"; children: React.ReactNode }) => {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={cx("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", cls)}>
      {children}
    </span>
  );
};

const Alert = ({ tone, children }: { tone: "ok" | "error" | "info"; children: React.ReactNode }) => {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-slate-200 bg-slate-50 text-slate-700";
  return <div className={cx("rounded-xl border p-3 text-sm", cls)}>{children}</div>;
};

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
    {children}
    {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
  </div>
);

/** Modal scrollable (fix cut top/bottom) */
const Modal = ({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* container: scroll for small screens */}
      <div className="absolute inset-0 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[calc(100vh-2rem)] overflow-hidden">
            {/* header sticky */}
            <div className="sticky top-0 z-10 bg-white p-5 flex items-start justify-between gap-3 border-b border-slate-100">
              <div>
                <div className="text-lg font-bold text-slate-900">{title}</div>
                {subtitle ? <div className="mt-1 text-sm text-slate-600">{subtitle}</div> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>

            {/* body scroll */}
            <div className="p-5 overflow-y-auto max-h-[calc(100vh-2rem-88px)]">{children}</div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

const WithdrawalMethod: React.FC = () => {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [profile, setProfile] = useState<LandlordFedapayProfile | null>(null);

  // Modal
  const [openEditor, setOpenEditor] = useState(false);

  // subaccount_reference (fixed, auto, NOT displayed in cards)
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

  const countryObj = useMemo(() => getCountry(country), [country]);
  const currencyOptions = useMemo(() => {
    const base = new Set<string>(countryObj.currencies || []);
    if (isNonEmpty(currency)) base.add(currency.toUpperCase());
    return Array.from(base);
  }, [countryObj, currency]);

  const meta = useMemo(() => (profile as any)?.fedapay_meta ?? null, [profile]);

  /**
   * ✅ IMPORTANT FIX:
   * Your backend currently stores ONLY one thing: fedapay_subaccount_id (acc_xxx).
   * fedapay_meta might be null => existingSummary null => nothing displayed.
   *
   * So:
   * - "hasExisting" must be based on profile.fedapay_subaccount_id OR profile.is_ready
   * - "ExistingCard" must display at least the subaccount id even if meta is empty
   */
  const existingSummary = useMemo(() => {
    const m = meta;
    if (!m || typeof m !== "object") return null;

    const t = (m.payout_type || m.payoutType || m?.payout?.type || m?.withdrawal?.type || "") as string;
    const normalizedType: PayoutType | "" = t === "bank" || t === "mobile_money" || t === "bank_card" ? (t as PayoutType) : "";

    const existingCountry = safeString(m.country || m?.payout?.country || m?.withdrawal?.country);
    const existingCurrency = safeString(m.currency || m?.payout?.currency || m?.withdrawal?.currency);
    const existingName = safeString(m.account_name || m?.payout?.account_name || m?.withdrawal?.account_name);

    const mm = m.mobile_money || m?.payout?.mobile_money || m?.withdrawal?.mobile_money || null;
    const bk = m.bank || m?.payout?.bank || m?.withdrawal?.bank || null;
    const bc = m.bank_card || m?.payout?.bank_card || m?.withdrawal?.bank_card || null;

    const ref = safeString(m.subaccount_reference || m?.payout?.subaccount_reference || m?.withdrawal?.subaccount_reference);

    return {
      payout_type: (normalizedType || "mobile_money") as PayoutType,
      country: existingCountry || "",
      currency: existingCurrency || "",
      account_name: existingName || "",
      mobile_money: mm,
      bank: bk,
      bank_card: bc,
      subaccount_reference: ref || "",
    };
  }, [meta]);

  const existingAcc = safeString((profile as any)?.fedapay_subaccount_id || (profile as any)?.subaccount_reference || "");
  const hasExisting = useMemo(() => {
    if ((profile as any)?.is_ready === true) return true;
    return /^acc_[A-Za-z0-9]+$/.test(existingAcc);
  }, [profile, existingAcc]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const p: any = await landlordPayments.getFedapayProfile();
      setProfile(p);

      // set fixed ref (acc_...) used for POST
      // If backend already has one, we reuse it to avoid creating new acc each time.
      const already = safeString(p?.fedapay_subaccount_id || p?.subaccount_reference || "");
      const computed = buildAccReference(p);
      const refToUse = /^acc_[A-Za-z0-9]+$/.test(already) ? already : computed;
      setSubaccountReference(refToUse);

      // Prefill from meta if exists (optional)
      const m: any = p?.fedapay_meta;
      if (m && typeof m === "object") {
        const t = (m.payout_type || m.payoutType || m?.payout?.type || m?.withdrawal?.type || "") as string;
        const normalizedType: PayoutType | "" =
          t === "bank" || t === "mobile_money" || t === "bank_card" ? (t as PayoutType) : "";

        const ctry = safeString(m.country || m?.payout?.country || m?.withdrawal?.country) || "BJ";
        const curr = safeString(m.currency || m?.payout?.currency || m?.withdrawal?.currency) || defaultCurrencyForCountry(ctry);
        const name = safeString(m.account_name || m?.payout?.account_name || m?.withdrawal?.account_name);

        setCountry(ctry);

        if (isNonEmpty(curr)) {
          setCurrency(curr.toUpperCase());
          setCurrencyAuto(false);
        } else {
          setCurrency(defaultCurrencyForCountry(ctry));
          setCurrencyAuto(true);
        }

        setAccountName(name || "");
        if (normalizedType) setPayoutType(normalizedType);

        const mm = m.mobile_money || m?.payout?.mobile_money || m?.withdrawal?.mobile_money;
        setProvider(mm?.provider ? String(mm.provider) : "mtn");
        setPhone(mm?.phone ? String(mm.phone) : "");

        const bk = m.bank || m?.payout?.bank || m?.withdrawal?.bank;
        setBankName(bk?.bank_name ? String(bk.bank_name) : "");
        setIban(bk?.iban ? String(bk.iban) : "");
        setAccountNumber(bk?.account_number ? String(bk.account_number) : "");

        const bc = m.bank_card || m?.payout?.bank_card || m?.withdrawal?.bank_card;
        setCardToken(bc?.card_token ? String(bc.card_token) : "");
        setCardBrand(bc?.card_brand ? String(bc.card_brand) : "");
        setCardLast4(bc?.card_last4 ? String(bc.card_last4) : "");
        setCardExpMonth(bc?.card_exp_month ? String(bc.card_exp_month) : "");
        setCardExpYear(bc?.card_exp_year ? String(bc.card_exp_year) : "");
      } else {
        // defaults
        setCountry("BJ");
        setCurrency(defaultCurrencyForCountry("BJ"));
        setCurrencyAuto(true);
        setPayoutType("mobile_money");
        setProvider("mtn");
        setPhone("");
        setAccountName("");
        setBankName("");
        setIban("");
        setAccountNumber("");
        setCardToken("");
        setCardBrand("");
        setCardLast4("");
        setCardExpMonth("");
        setCardExpYear("");
      }
    } catch (e: any) {
      setProfileError(e?.message || "Impossible de charger le profil FedaPay du bailleur.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!currencyAuto) return;
    setCurrency(defaultCurrencyForCountry(country));
  }, [country, currencyAuto]);

  const openAddOrEdit = () => {
    setSaveOk(null);
    setSaveErr(null);
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
    if (!isNonEmpty(subaccountReference)) return "subaccount_reference est requis.";
    if (!/^acc_[A-Za-z0-9]+$/.test(subaccountReference)) return "subaccount_reference invalide (format acc_xxx).";

    // NOTE: backend currently ignores these fields, but we keep UI validation
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
    setSaveOk(null);
    setSaveErr(null);

    const err = validateBeforeSave();
    if (err) {
      setSaveErr(err);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      await landlordPayments.createOrUpdateSubaccount(payload);

      setSaveOk("Moyen de retrait enregistré ✅");
      setSaveErr(null);

      await loadProfile();
      setOpenEditor(false);
    } catch (e: any) {
      setSaveErr(e?.message || "Erreur lors de l’enregistrement du moyen de retrait.");
    } finally {
      setSaving(false);
    }
  };

  const StatusHeader = () => {
    const statusPill = hasExisting ? <Pill tone="ok">Configuré</Pill> : <Pill tone="warn">À configurer</Pill>;

    return (
      <div className="mb-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-extrabold tracking-tight">Moyens de retrait</div>
            <div className="mt-1 text-sm text-white/80">Voir le moyen actuel, puis ajouter/modifier via une fenêtre.</div>
          </div>
          <div className="flex items-center gap-2">
            {statusPill}
            <button
              type="button"
              onClick={loadProfile}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ExistingCard = () => {
    // ✅ SHOW EXISTING based on backend stored value (acc_xxx)
    if (!hasExisting) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-slate-900">Aucun moyen enregistré</div>
              <div className="mt-1 text-sm text-slate-600">Ajoute un moyen de retrait pour recevoir tes paiements.</div>
            </div>
            <button
              type="button"
              onClick={openAddOrEdit}
              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Ajouter
            </button>
          </div>

          {/* ✅ removed: "Référence auto: acc_1" */}
        </div>
      );
    }

    // If meta exists, display detailed. Otherwise, show minimal current (subaccount id)
    if (!existingSummary) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-slate-900">Moyen actuel</div>
              <div className="mt-1 text-sm text-slate-600">
                Subaccount FedaPay: <span className="font-semibold">{existingAcc || subaccountReference || "—"}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">(Les détails du moyen ne sont pas encore fournis par l’API.)</div>
            </div>

            <div className="flex items-center gap-2">
              <Pill tone="ok">Configuré</Pill>
              <button
                type="button"
                onClick={openAddOrEdit}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Modifier
              </button>
            </div>
          </div>

          <details className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">Voir fedapay_meta</summary>
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-800 border border-slate-200">
{prettyJson(meta)}
            </pre>
          </details>
        </div>
      );
    }

    const t = existingSummary.payout_type;
    const ctry = existingSummary.country || "—";
    const curr = existingSummary.currency || "—";
    const name = existingSummary.account_name || "—";
    const ref = existingSummary.subaccount_reference || existingAcc || subaccountReference || "—";

    const mm = existingSummary.mobile_money;
    const bk = existingSummary.bank;
    const bc = existingSummary.bank_card;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-slate-900">Moyen actuel</div>
            <div className="mt-1 text-sm text-slate-600">
              Pays <span className="font-semibold">{ctry}</span> · Devise <span className="font-semibold">{curr}</span> · Bénéficiaire{" "}
              <span className="font-semibold">{name}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Ref: <span className="font-semibold">{ref}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Pill tone="ok">{t === "mobile_money" ? "Mobile Money" : t === "bank" ? "Banque" : "Carte (token)"}</Pill>
            <button
              type="button"
              onClick={openAddOrEdit}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Modifier
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-800">
          {t === "mobile_money" && mm && (
            <div className="space-y-1">
              <div>
                <span className="font-semibold">Opérateur:</span> {safeString(mm.provider || "—")}
              </div>
              <div>
                <span className="font-semibold">Numéro:</span> {mm.phone ? maskPhone(String(mm.phone)) : "—"}
              </div>
            </div>
          )}

          {t === "bank" && bk && (
            <div className="space-y-1">
              <div>
                <span className="font-semibold">Banque:</span> {safeString(bk.bank_name || "—")}
              </div>
              <div>
                <span className="font-semibold">IBAN:</span> {bk.iban ? maskIban(String(bk.iban)) : "—"}
              </div>
              <div>
                <span className="font-semibold">Compte:</span> {bk.account_number ? maskAccountNumber(String(bk.account_number)) : "—"}
              </div>
            </div>
          )}

          {t === "bank_card" && bc && (
            <div className="space-y-1">
              <div>
                <span className="font-semibold">Carte:</span> {safeString(bc.card_brand || "Carte")} {bc.card_last4 ? `•••• ${bc.card_last4}` : ""}
              </div>
              <div>
                <span className="font-semibold">Token:</span> {bc.card_token ? "✅ enregistré" : "—"}
              </div>
              {(bc.card_exp_month || bc.card_exp_year) && (
                <div>
                  <span className="font-semibold">Expiration:</span> {safeString(bc.card_exp_month)}/{safeString(bc.card_exp_year)}
                </div>
              )}
            </div>
          )}
        </div>

        <details className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Voir fedapay_meta</summary>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-800 border border-slate-200">
{prettyJson(meta)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl">
      <StatusHeader />

      {loadingProfile && <Alert tone="info">Chargement du profil...</Alert>}
      {profileError && <Alert tone="error">{profileError}</Alert>}
      {!loadingProfile && !profileError && (
        <div className="space-y-4">
          <ExistingCard />
          {(saveOk || saveErr) && (
            <>
              {saveOk && <Alert tone="ok">{saveOk}</Alert>}
              {saveErr && <Alert tone="error">{saveErr}</Alert>}
            </>
          )}
        </div>
      )}

      {/* MODAL FORM */}
      <Modal
        open={openEditor}
        title={hasExisting ? "Modifier le moyen de retrait" : "Ajouter un moyen de retrait"}
        subtitle="Renseigne les informations. La référence est automatique (non modifiable)."
        onClose={() => setOpenEditor(false)}
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* ✅ keep reference hidden (no need to show it) */}
          <input type="hidden" value={subaccountReference} readOnly />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Type de retrait" hint="Carte = token/ID uniquement, jamais numéro carte/CVC.">
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={payoutType}
                onChange={(e) => setPayoutType(e.target.value as PayoutType)}
              >
                <option value="mobile_money">Mobile Money</option>
                <option value="bank">Compte bancaire</option>
                <option value="bank_card">Carte bancaire (token FedaPay)</option>
              </select>
            </Field>

            <Field label="Pays">
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={country}
                onChange={(e) => {
                  const c = e.target.value;
                  setCountry(c);
                  if (currencyAuto) setCurrency(defaultCurrencyForCountry(c));
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nom du bénéficiaire">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Ex: Jean Dupont"
              />
            </Field>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Devise</div>
                  <div className="mt-1 text-xs text-slate-600">Auto selon le pays, ou sélection manuelle.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrencyAuto((v) => !v)}
                  className={cx(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    currencyAuto ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700"
                  )}
                >
                  {currencyAuto ? "Auto" : "Manuel"}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3">
                <Field label="Choix devise">
                  <select
                    className={cx(
                      "w-full rounded-xl border px-3 py-2 text-sm outline-none",
                      currencyAuto
                        ? "border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                        : "border-slate-200 bg-white focus:border-slate-400"
                    )}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    disabled={currencyAuto}
                  >
                    {currencyOptions.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </Field>

                {currencyAuto && (
                  <div className="text-xs text-slate-600">
                    Devise auto pour {countryObj.name}: <span className="font-semibold">{defaultCurrencyForCountry(country)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {payoutType === "mobile_money" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
              <div className="text-sm font-bold text-slate-900">Mobile Money</div>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Opérateur">
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  >
                    {MOBILE_MONEY_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Numéro wallet">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +229 97 00 00 00"
                  />
                </Field>
              </div>
            </div>
          )}

          {payoutType === "bank" && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
              <div className="text-sm font-bold text-slate-900">Compte bancaire</div>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Nom de la banque">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Ex: Ecobank / Société Générale / ..."
                    />
                  </Field>
                </div>

                <Field label="IBAN (si disponible)">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="Ex: FR76...."
                  />
                </Field>

                <Field label="Numéro de compte (sinon)">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Ex: 0123456789"
                  />
                </Field>
              </div>
            </div>
          )}

          {payoutType === "bank_card" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="text-sm font-bold text-slate-900">Carte bancaire (token sécurisé)</div>
              <div className="mt-1 text-xs text-slate-600">
                Tu ne saisis jamais le numéro carte/CVC. Tu renseignes un token/ID issu de FedaPay.
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Token / ID carte">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={cardToken}
                      onChange={(e) => setCardToken(e.target.value)}
                      placeholder="Ex: card_**** / pm_****"
                    />
                  </Field>
                </div>

                <Field label="Marque (optionnel)">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    placeholder="Visa / Mastercard"
                  />
                </Field>

                <Field label="4 derniers chiffres (optionnel)">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    placeholder="1234"
                  />
                </Field>

                <Field label="Mois exp. (optionnel)">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={cardExpMonth}
                    onChange={(e) => setCardExpMonth(e.target.value)}
                    placeholder="08"
                  />
                </Field>

                <Field label="Année exp. (optionnel)">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={cardExpYear}
                    onChange={(e) => setCardExpYear(e.target.value)}
                    placeholder="2029"
                  />
                </Field>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>

            {/* ✅ removed: showing ref in modal footer */}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WithdrawalMethod;
