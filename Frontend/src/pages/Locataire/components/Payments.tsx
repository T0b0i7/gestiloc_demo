// src/pages/Locataire/components/Payments.tsx

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  Home,
  X,
  Loader2,
  Download,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar
} from 'lucide-react';
import { Card } from './ui/Card';
import api from '@/services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface PaymentsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
}

interface Lease {
  id: number;
  property_id: number;
  tenant_id: number;
  rent_amount: number;
  charges_amount: number;
  status: string;
  start_date: string;
  property?: Property;
}

interface Invoice {
  id: number;
  invoice_number: string;
  lease_id: number;
  amount_total: number;
  status: 'pending' | 'paid' | 'cancelled';
  due_date: string;
  period_start: string;
  period_end: string;
  lease?: {
    id: number;
    property?: Property;
  };
}

interface Payment {
  id: number;
  invoice_id: number | null;
  lease_id: number;
  tenant_id: number;
  amount_total: number;
  status: 'initiated' | 'pending' | 'approved' | 'cancelled' | 'failed' | 'declined';
  provider: string;
  checkout_url: string | null;
  paid_at: string | null;
  created_at: string;
  lease?: {
    id: number;
    property?: Property;
  };
  invoice?: Invoice;
}

interface PropertyPaymentStatus {
  lease: Lease;
  property: Property;
  current_month_paid: boolean;
  has_pending_payment: boolean;
  pending_payment_id?: number;
  pending_payment_status?: string;
  pending_checkout_url?: string | null;
  unpaid_count: number;
  total_unpaid: number;
  recent_payments: Array<{
    id: number;
    amount_total: number;
    status: string;
    paid_at: string | null;
    display_date: string;
    checkout_url: string | null;
  }>;
  rent_amount: number;
  charges: number;
  total_monthly: number;
}

interface FilterOptions {
  properties: Array<{id: number, name: string}>;
  months: Array<{value: number, label: string}>;
  years: number[];
}

interface ChartData {
  month: string;
  amount: number;
  count: number;
  formatted_amount: string;
}

export const Payments: React.FC<PaymentsProps> = ({ notify }) => {
  const [loading, setLoading] = useState(true);
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [propertiesStatus, setPropertiesStatus] = useState<PropertyPaymentStatus[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [hasChartData, setHasChartData] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    properties: [],
    months: [],
    years: []
  });

  const [stats, setStats] = useState({
    total_paid: 0,
    total_pending: 0,
    total_overdue: 0,
    payments_count: 0,
    invoices_count: 0,
    active_leases_count: 0
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'history'>('dashboard');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPropertyForPayment, setSelectedPropertyForPayment] = useState<PropertyPaymentStatus | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const [paymentPhone, setPaymentPhone] = useState('');
  const [useCustomPhone, setUseCustomPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const propertyDropdownRef = React.useRef<HTMLDivElement>(null);
  const monthDropdownRef = React.useRef<HTMLDivElement>(null);
  const yearDropdownRef = React.useRef<HTMLDivElement>(null);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);

  const PRIMARY_COLOR = '#70AE48';

  useEffect(() => {
    loadDashboard();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices') {
      loadInvoices();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, selectedProperty, selectedMonth, selectedYear, selectedStatus, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node)) setShowPropertyDropdown(false);
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) setShowMonthDropdown(false);
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) setShowYearDropdown(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) setShowStatusDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tenant/payments/dashboard');
      if (response.data.success) {
        setInvoices(response.data.data.invoices || []);
        setPayments(response.data.data.payments || []);
        setStats(response.data.data.stats);
        setChartData(response.data.data.chart_data || []);
        const hasData = response.data.data.chart_data?.some((item: any) => item.amount > 0) || false;
        setHasChartData(hasData);
        setPropertiesStatus(response.data.data.properties || []);
      }
    } catch (error) {
      notify?.('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('property_id', selectedProperty);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/tenant/payments/invoices?${params}`);
      if (response.data.success) setInvoices(response.data.data.data || []);
    } catch (error) {}
  };

  const loadHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('property_id', selectedProperty);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);
      const response = await api.get(`/tenant/payments/history?${params}`);
      if (response.data.success) setPayments(response.data.data.data || []);
    } catch (error) {}
  };

  const loadFilterOptions = async () => {
    try {
      const response = await api.get('/tenant/payments/filters/options');
      if (response.data.success) setFilterOptions(response.data.data);
    } catch (error) {}
  };

  const handlePayProperty = (propertyStatus: PropertyPaymentStatus) => {
    if (propertyStatus.has_pending_payment && propertyStatus.pending_checkout_url) {
      window.open(propertyStatus.pending_checkout_url, '_blank');
      notify?.('Reprise du paiement en cours...', 'info');
      return;
    }
    setSelectedPropertyForPayment(propertyStatus);
    setSelectedInvoice(null);
    setShowPayModal(true);
    setCheckoutUrl(null);
    setPaymentError(null);
    setPhoneError(null);
    setPaymentPhone('');
    setUseCustomPhone(false);
  };

  const handlePayClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSelectedPropertyForPayment(null);
    setShowPayModal(true);
    setCheckoutUrl(null);
    setPaymentError(null);
    setPhoneError(null);
    setPaymentPhone('');
    setUseCustomPhone(false);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const cleaned = phone.replace(/\s+/g, '');
    const phoneRegex = /^(\+229|229|00229)?[0-9]{8,10}$/;
    return phoneRegex.test(cleaned);
  };

  const handleConfirmPayment = async () => {
    setPaymentError(null);
    setPhoneError(null);
    if (useCustomPhone) {
      if (!paymentPhone.trim()) { setPhoneError('Veuillez saisir un numéro de téléphone'); return; }
      if (!validatePhone(paymentPhone)) { setPhoneError('Format de numéro invalide. Utilisez le format: +229 01 23 45 67 89'); return; }
    }
    setProcessingPayment(true);
    try {
      let response;
      const payload: any = {};
      if (useCustomPhone && paymentPhone) payload.phone_number = paymentPhone;
      if (selectedPropertyForPayment) {
        response = await api.post(`/tenant/payments/pay/${selectedPropertyForPayment.lease.id}`, payload);
      } else if (selectedInvoice) {
        response = await api.post(`/tenant/invoices/${selectedInvoice.id}/pay`, payload);
      } else return;
      if (response.data.success) {
        setCheckoutUrl(response.data.checkout_url);
        window.open(response.data.checkout_url, '_blank');
        notify?.('Redirection vers la page de paiement...', 'info');
        startPaymentStatusCheck(response.data.payment_id);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du paiement';
      setPaymentError(errorMessage);
      notify?.(errorMessage, 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const startPaymentStatusCheck = (paymentId: string) => {
    let attempts = 0;
    const maxAttempts = 24;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await api.get(`/tenant/payments/check-status/${paymentId}`);
        if (response.data.success) {
          const status = response.data.data.status;
          if (status === 'approved') {
            clearInterval(interval);
            notify?.('Paiement réussi !', 'success');
            setTimeout(() => { setShowPayModal(false); loadDashboard(); }, 2000);
          } else if (status === 'declined' || status === 'failed') {
            clearInterval(interval);
            notify?.('Le paiement a échoué', 'error');
          }
        }
      } catch (error) {}
      if (attempts >= maxAttempts) { clearInterval(interval); notify?.("Vérifiez le statut dans l'historique", 'info'); }
    }, 5000);
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      const response = await api.get(`/tenant/payments/receipt/${payment.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quittance_${payment.id}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 100);
      notify?.('Quittance téléchargée', 'success');
    } catch (error) {
      notify?.('Erreur lors du téléchargement', 'error');
    }
  };

  const handleContinuePayment = (checkoutUrl: string) => {
    window.open(checkoutUrl, '_blank');
    notify?.('Reprise du paiement...', 'info');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
          <CheckCircle size={11} /> Payé
        </span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
          <Clock size={11} /> En attente
        </span>;
      case 'initiated':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
          <Loader2 size={11} className="animate-spin" /> Initialisé
        </span>;
      case 'declined': case 'failed': case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
          <AlertTriangle size={11} /> Échoué
        </span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'paid', label: 'Payé' },
    { value: 'pending', label: 'En attente' },
  ];

  const getPieData = () => {
    const total = stats.total_paid + stats.total_pending + stats.total_overdue;
    if (total === 0) return [];
    return [
      { name: 'Payé', value: stats.total_paid, color: '#10b981' },
      { name: 'En attente', value: stats.total_pending, color: '#f59e0b' },
      { name: 'Impayés', value: stats.total_overdue, color: '#ef4444' }
    ].filter(item => item.value > 0);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-100 rounded-xl shadow-xl">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-base font-bold" style={{ color: PRIMARY_COLOR }}>{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{payload[0].payload.count} paiement{payload[0].payload.count > 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  // Custom bar shape with rounded top
  const RoundedBar = (props: any) => {
    const { x, y, width, height, fill } = props;
    if (!height || height <= 0) return null;
    const radius = 6;
    return (
      <path
        d={`M${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} L${x},${y + height} Z`}
        fill={fill}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-green-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#70AE48] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard size={22} style={{ color: PRIMARY_COLOR }} />
            </div>
          </div>
          <p className="text-gray-600 font-semibold tracking-wide">Chargement des paiements…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 p-4 sm:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .payments-page { font-family: 'DM Sans', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.28s cubic-bezier(.16,1,.3,1); }
        .animate-fadeIn  { animation: fadeIn  0.28s ease; }

        .stat-card:hover { transform: translateY(-2px); }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }

        .pay-row:hover .pay-action { opacity: 1; }
        .pay-action { transition: opacity 0.15s; }

        .custom-bar-hover:hover { filter: brightness(1.1); }
      `}</style>

      {/* ── MODAL PAIEMENT ── */}
      {showPayModal && (selectedInvoice || selectedPropertyForPayment) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp overflow-hidden">
            {/* Header modal */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #f0f9e8 0%, #fff 60%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: PRIMARY_COLOR }}>
                  <CreditCard size={17} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Paiement sécurisé</h2>
                  <p className="text-xs text-gray-400">Plateforme certifiée</p>
                </div>
              </div>
              <button onClick={() => { setShowPayModal(false); setSelectedInvoice(null); setSelectedPropertyForPayment(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Récapitulatif */}
              <div className="rounded-xl p-4 mb-5" style={{ background: 'linear-gradient(135deg, #f0f9e8, #fafff6)', border: '1px solid #d4edbb' }}>
                {selectedInvoice ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Facture</span><span className="font-semibold text-gray-800 mono">{selectedInvoice.invoice_number}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Bien</span><span className="font-semibold text-gray-800">{selectedInvoice.lease?.property?.name || '-'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Période</span><span className="font-semibold text-gray-800">{selectedInvoice.period_start ? formatDate(selectedInvoice.period_start) : '-'}</span></div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-100 mt-2">
                      <span className="text-sm font-semibold text-gray-700">Total</span>
                      <span className="text-xl font-bold mono" style={{ color: PRIMARY_COLOR }}>{formatCurrency(selectedInvoice.amount_total)}</span>
                    </div>
                  </div>
                ) : selectedPropertyForPayment && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Bien</span><span className="font-semibold text-gray-800">{selectedPropertyForPayment.property.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Mois</span><span className="font-semibold text-gray-800">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span></div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-100 mt-2">
                      <span className="text-sm font-semibold text-gray-700">Total</span>
                      <span className="text-xl font-bold mono" style={{ color: PRIMARY_COLOR }}>{formatCurrency(selectedPropertyForPayment.total_monthly)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Téléphone */}
              <div className="mb-4">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={useCustomPhone} onChange={(e) => { setUseCustomPhone(e.target.checked); if (!e.target.checked) setPaymentPhone(''); setPhoneError(null); }} className="w-4 h-4 rounded accent-[#70AE48]" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Utiliser un autre numéro de téléphone</span>
                </label>
                {useCustomPhone && (
                  <div className="mt-3">
                    <input type="tel" value={paymentPhone} onChange={(e) => { setPaymentPhone(e.target.value); setPhoneError(null); }} placeholder="+229 01 23 45 67 89"
                      className={`w-full px-4 py-2.5 border ${phoneError ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70AE48]/30 text-sm bg-gray-50`} />
                    {phoneError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{phoneError}</p>}
                    <p className="text-xs text-gray-400 mt-1.5">Format : +229 01 23 45 67 89</p>
                  </div>
                )}
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center gap-2"><AlertCircle size={14} />{paymentError}</p>
                </div>
              )}

              {checkoutUrl ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                  <p className="text-gray-900 font-bold mb-1">Paiement initialisé !</p>
                  <p className="text-sm text-gray-500 mb-4">Redirection vers la plateforme sécurisée.</p>
                  <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.01]"
                    style={{ background: PRIMARY_COLOR }}>
                    <ArrowUpRight size={16} />Aller au paiement
                  </a>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl mb-5" style={{ background: '#eef6ff', border: '1px solid #c3deff' }}>
                    <p className="text-xs text-blue-700 leading-relaxed">Vous allez être redirigé vers une plateforme de paiement sécurisée. Aucune information bancaire n'est stockée sur nos serveurs.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowPayModal(false); setSelectedInvoice(null); setSelectedPropertyForPayment(null); }}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                      Annuler
                    </button>
                    <button onClick={handleConfirmPayment} disabled={processingPayment || (useCustomPhone && !paymentPhone)}
                      className="flex-1 px-4 py-2.5 text-white rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: PRIMARY_COLOR }}>
                      {processingPayment ? <><Loader2 size={15} className="animate-spin" />Initialisation…</> : 'Payer maintenant'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 payments-page">
        {/* ── EN-TÊTE ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mes paiements</h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">Gérez vos loyers et factures en toute simplicité</p>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0">
                <Wallet size={19} />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold">Total payé</p>
                <p className="text-lg font-bold text-gray-900 mono">{formatCurrency(stats.total_paid)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-white shrink-0">
                <Clock size={19} />
              </div>
              <div>
                <p className="text-xs text-yellow-600 font-semibold">En attente</p>
                <p className="text-lg font-bold text-gray-900 mono">{formatCurrency(stats.total_pending)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0">
                <AlertTriangle size={19} />
              </div>
              <div>
                <p className="text-xs text-red-600 font-semibold">Impayés</p>
                <p className="text-lg font-bold text-gray-900 mono">{formatCurrency(stats.total_overdue)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shrink-0">
                <CheckCircle size={19} />
              </div>
              <div>
                <p className="text-xs text-green-600 font-semibold">Paiements effectués</p>
                <p className="text-lg font-bold text-gray-900 mono">{stats.payments_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {(['dashboard', 'invoices', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'dashboard' && 'Tableau de bord'}
              {tab === 'invoices' && 'Factures'}
              {tab === 'history' && 'Historique'}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* ── GRAPHIQUES ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Barres */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Évolution des paiements</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Montants par période</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f0f9e8' }}>
                    <TrendingUp size={16} style={{ color: PRIMARY_COLOR }} />
                  </div>
                </div>
                <div className="h-72 w-full">
                  {hasChartData && chartData.some(item => item.amount > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'DM Sans' }}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                          height={55}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'DM Sans' }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          width={45}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(112,174,72,0.06)', radius: 6 }} />
                        <Bar dataKey="amount" shape={<RoundedBar />} fill={PRIMARY_COLOR}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.amount > 0
                                ? `url(#barGradient)`
                                : '#e5e7eb'
                              }
                            />
                          ))}
                        </Bar>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#70AE48" stopOpacity={1} />
                            <stop offset="100%" stopColor="#a3d977" stopOpacity={0.85} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center flex-col">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                        <TrendingUp size={28} className="text-gray-200" />
                      </div>
                      <p className="text-gray-500 font-semibold text-sm">Aucune donnée disponible</p>
                      <p className="text-xs text-gray-400 mt-1">Les paiements effectués apparaîtront ici</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Donut */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Répartition</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Par statut de paiement</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50">
                    <DollarSign size={16} className="text-purple-500" />
                  </div>
                </div>
                <div className="h-72 w-full">
                  {getPieData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieData()}
                          cx="50%"
                          cy="42%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {getPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), 'Montant']}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: 'DM Sans' }}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans', paddingTop: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center flex-col">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                        <DollarSign size={28} className="text-gray-200" />
                      </div>
                      <p className="text-gray-500 font-semibold text-sm">Aucune répartition</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── MES LOCATIONS ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Mes locations</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Statut de paiement par bien</p>
                </div>
                <Home size={18} className="text-gray-300" />
              </div>

              <div className="space-y-4">
                {propertiesStatus.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <Home size={24} className="text-gray-200" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">Aucune location active</p>
                  </div>
                ) : (
                  propertiesStatus.map((item) => (
                    <div key={item.lease.id} className="border border-gray-100 rounded-xl p-5 hover:border-green-200 hover:shadow-sm transition-all duration-200">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                              <Home size={15} className="text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm">{item.property.name}</h3>
                            {item.current_month_paid ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">À jour</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                                {item.has_pending_payment ? 'En cours' : 'À payer'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-3 pl-10">{item.property.address}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-0">
                            {[
                              { label: 'Loyer', value: formatCurrency(item.rent_amount) },
                              { label: 'Charges', value: formatCurrency(item.charges) },
                              { label: 'Total/mois', value: formatCurrency(item.total_monthly), accent: true },
                              ...(item.unpaid_count > 0 ? [{ label: 'Impayés', value: `${item.unpaid_count} mois`, danger: true }] : [])
                            ].map((stat, i) => (
                              <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                                <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
                                <p className={`text-sm font-bold ${(stat as any).accent ? 'text-[#70AE48]' : (stat as any).danger ? 'text-red-600' : 'text-gray-900'} mono`}>
                                  {stat.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!item.current_month_paid && (
                            <button onClick={() => handlePayProperty(item)}
                              className="px-4 py-2 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] shadow-sm"
                              style={{ background: 'linear-gradient(135deg, #70AE48, #5a9038)' }}>
                              <CreditCard size={15} />
                              {item.has_pending_payment ? 'Reprendre' : 'Payer'}
                            </button>
                          )}
                        </div>
                      </div>

                      {item.recent_payments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Derniers paiements</p>
                          <div className="space-y-2">
                            {item.recent_payments.map((payment) => (
                              <div key={payment.id} className="pay-row flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-2.5">
                                  {getStatusBadge(payment.status)}
                                  <span className="text-xs text-gray-500">{formatDate(payment.display_date)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-gray-900 mono">{formatCurrency(payment.amount_total)}</span>
                                  {payment.status === 'approved' && (
                                    <button onClick={() => handleDownloadReceipt(payment as Payment)} className="pay-action opacity-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Télécharger">
                                      <Download size={13} className="text-gray-400" />
                                    </button>
                                  )}
                                  {(payment.status === 'initiated' || payment.status === 'pending') && payment.checkout_url && (
                                    <button onClick={() => handleContinuePayment(payment.checkout_url!)} className="pay-action opacity-0 p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                                      <CreditCard size={13} className="text-blue-400" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {(activeTab === 'invoices' || activeTab === 'history') && (
          <>
            {/* ── FILTRES ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Filtrer les résultats</p>
              <div className="flex flex-col md:flex-row gap-3">
                {/* Bien */}
                <div className="relative md:w-48" ref={propertyDropdownRef}>
                  <button onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 transition-colors"
                    >
                    <span className={selectedProperty ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {selectedProperty ? filterOptions.properties.find(p => p.id.toString() === selectedProperty)?.name || 'Tous' : 'Tous les biens'}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {showPropertyDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                      <button onClick={() => { setSelectedProperty(''); setShowPropertyDropdown(false); }} className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 text-sm text-gray-600 first:rounded-t-xl">Tous les biens</button>
                      {filterOptions.properties.map(p => (
                        <button key={p.id} onClick={() => { setSelectedProperty(p.id.toString()); setShowPropertyDropdown(false); }} className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 text-sm text-gray-700">{p.name}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Statut */}
                <div className="relative md:w-40" ref={statusDropdownRef}>
                  <button onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 transition-colors"
                    >
                    <span className={selectedStatus ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {selectedStatus ? statusOptions.find(s => s.value === selectedStatus)?.label : 'Statut'}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-10">
                      {statusOptions.map(o => (
                        <button key={o.value} onClick={() => { setSelectedStatus(o.value); setShowStatusDropdown(false); }} className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 text-sm text-gray-700 first:rounded-t-xl last:rounded-b-xl">{o.label}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mois */}
                <div className="relative md:w-36" ref={monthDropdownRef}>
                  <button onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 transition-colors"
                    >
                    <span className={selectedMonth ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {selectedMonth ? filterOptions.months.find(m => m.value.toString() === selectedMonth)?.label : 'Mois'}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {showMonthDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                      <button onClick={() => { setSelectedMonth(''); setShowMonthDropdown(false); }} className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 text-sm text-gray-600 first:rounded-t-xl">Tous les mois</button>
                      {filterOptions.months.map(m => (
                        <button key={m.value} onClick={() => { setSelectedMonth(m.value.toString()); setShowMonthDropdown(false); }} className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 text-sm text-gray-700">{m.label}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Année */}
                <div className="relative md:w-32" ref={yearDropdownRef}>
                  <button onClick={() => setShowYearDropdown(!showYearDropdown)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 transition-colors"
                    >
                    <span className={selectedYear ? 'text-gray-900 font-medium' : 'text-gray-400'}>{selectedYear || 'Année'}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {showYearDropdown && (
                    <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-10">
                      <button onClick={() => { setSelectedYear(''); setShowYearDropdown(false); }} className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 text-sm text-gray-600 first:rounded-t-xl">Toutes</button>
                      {filterOptions.years.map(y => (
                        <button key={y} onClick={() => { setSelectedYear(y.toString()); setShowYearDropdown(false); }} className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 text-sm text-gray-700 last:rounded-b-xl">{y}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recherche */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search size={14} className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Rechercher par numéro ou bien…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#70AE48]/20 focus:border-[#70AE48]/50 bg-white text-gray-900 placeholder:text-gray-400" />
                </div>
              </div>
            </div>

            {/* ── TABLE FACTURES ── */}
            {activeTab === 'invoices' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['N° Facture', 'Bien', 'Période', 'Montant', 'Statut', ''].map((h, i) => (
                          <th key={i} className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                            <FileText size={22} className="text-gray-200" />
                          </div>
                          <p className="text-gray-400 font-medium text-sm">Aucune facture trouvée</p>
                        </td></tr>
                      ) : invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-4 text-sm font-bold text-gray-900 mono">{invoice.invoice_number}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{invoice.lease?.property?.name || '-'}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{invoice.period_start ? formatDate(invoice.period_start) : '-'}</td>
                          <td className="px-5 py-4 text-sm font-bold text-gray-900 mono">{formatCurrency(invoice.amount_total)}</td>
                          <td className="px-5 py-4">{getStatusBadge(invoice.status)}</td>
                          <td className="px-5 py-4 text-right">
                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                              <button onClick={() => handlePayClick(invoice)}
                                className="px-3.5 py-1.5 text-white rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                                style={{ background: PRIMARY_COLOR }}>
                                Payer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* ── TABLE HISTORIQUE ── */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Date', 'Bien', 'Montant', 'Statut', ''].map((h, i) => (
                          <th key={i} className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                            <CreditCard size={22} className="text-gray-200" />
                          </div>
                          <p className="text-gray-400 font-medium text-sm">Aucun paiement trouvé</p>
                        </td></tr>
                      ) : payments.map((payment) => {
                        const displayDate = payment.paid_at || payment.created_at;
                        return (
                          <tr key={payment.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-5 py-4 text-sm text-gray-500">{displayDate ? formatDate(displayDate) : '-'}</td>
                            <td className="px-5 py-4 text-sm text-gray-600">{payment.lease?.property?.name || '-'}</td>
                            <td className="px-5 py-4 text-sm font-bold text-gray-900 mono">{formatCurrency(payment.amount_total)}</td>
                            <td className="px-5 py-4">{getStatusBadge(payment.status)}</td>
                            <td className="px-5 py-4 text-right">
                              {payment.status === 'approved' && (
                                <button onClick={() => handleDownloadReceipt(payment)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Télécharger la quittance">
                                  <Download size={15} className="text-gray-400" />
                                </button>
                              )}
                              {(payment.status === 'initiated' || payment.status === 'pending') && payment.checkout_url && (
                                <button onClick={() => handleContinuePayment(payment.checkout_url!)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                  <CreditCard size={15} className="text-blue-400" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {payments.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 font-medium">
                    {payments.length} paiement{payments.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;