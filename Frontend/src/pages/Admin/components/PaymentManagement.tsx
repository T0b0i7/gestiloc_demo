import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, RotateCcw, Download, Plus, TrendingUp, AlertCircle, Clock, CheckCheck } from 'lucide-react';

// Styles pour les animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-in-out;
  }
`;

interface Payment {
  id: string;
  invoice_number: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  paid_at?: string;
  tenant_name: string;
  property_name: string;
  email: string;
}

export default function PaymentManagement() {
  // Données mock
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      invoice_number: 'INV-2024-001',
      transaction_id: 'TXN-001',
      amount: 150000,
      currency: 'XOF',
      status: 'completed',
      payment_method: 'FedaPay',
      created_at: '2024-01-15T10:30:00',
      paid_at: '2024-01-15T10:35:00',
      tenant_name: 'Marc Leroy',
      property_name: 'Appartement 5B - Rue de la Paix',
      email: 'marc.leroy@example.com',
    },
    {
      id: '2',
      invoice_number: 'INV-2024-002',
      transaction_id: 'TXN-002',
      amount: 200000,
      currency: 'XOF',
      status: 'pending',
      payment_method: 'FedaPay',
      created_at: '2024-01-14T14:20:00',
      tenant_name: 'Alice Dupont',
      property_name: 'Studio - Avenue des Champs',
      email: 'alice.dupont@example.com',
    },
    {
      id: '3',
      invoice_number: 'INV-2024-003',
      transaction_id: 'TXN-003',
      amount: 175000,
      currency: 'XOF',
      status: 'failed',
      payment_method: 'FedaPay',
      created_at: '2024-01-13T09:15:00',
      tenant_name: 'Jean Michel',
      property_name: 'Maison 3 pièces - Zone Est',
      email: 'jean.michel@example.com',
    },
    {
      id: '4',
      invoice_number: 'INV-2024-004',
      transaction_id: 'TXN-004',
      amount: 120000,
      currency: 'XOF',
      status: 'refunded',
      payment_method: 'FedaPay',
      created_at: '2024-01-12T11:45:00',
      paid_at: '2024-01-12T11:50:00',
      tenant_name: 'Sophie Bernard',
      property_name: 'T2 - Quartier Centre',
      email: 'sophie.bernard@example.com',
    },
    {
      id: '5',
      invoice_number: 'INV-2024-005',
      transaction_id: 'TXN-005',
      amount: 250000,
      currency: 'XOF',
      status: 'completed',
      payment_method: 'FedaPay',
      created_at: '2024-01-11T16:00:00',
      paid_at: '2024-01-11T16:05:00',
      tenant_name: 'Paul Moreau',
      property_name: 'Villa 4 chambres - Banlieue',
      email: 'paul.moreau@example.com',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');

  // État pour le nouveau paiement
  const [newPayment, setNewPayment] = useState({
    invoice_number: '',
    amount: '',
    tenant_name: '',
    property_name: '',
    email: '',
  });

  const handleConfirmPayment = (id: string) => {
    if (!window.confirm('Confirmer ce paiement?')) return;
    setPayments(payments.map(p => 
      p.id === id ? { ...p, status: 'completed', paid_at: new Date().toISOString() } : p
    ));
  };

  const handleRejectPayment = (id: string) => {
    if (!window.confirm('Rejeter ce paiement?')) return;
    setPayments(payments.map(p => 
      p.id === id ? { ...p, status: 'failed' } : p
    ));
  };

  const handleRefundPayment = (id: string) => {
    if (!window.confirm('Rembourser ce paiement?')) return;
    setPayments(payments.map(p => 
      p.id === id ? { ...p, status: 'refunded' } : p
    ));
  };

  const handleDownloadReceipt = (payment: Payment) => {
    alert(`Téléchargement du reçu pour ${payment.invoice_number}`);
  };

  const handleAddPayment = () => {
    if (!newPayment.invoice_number || !newPayment.amount || !newPayment.tenant_name) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      invoice_number: newPayment.invoice_number,
      transaction_id: `TXN-${Date.now()}`,
      amount: parseInt(newPayment.amount),
      currency: 'XOF',
      status: 'pending',
      payment_method: 'FedaPay',
      created_at: new Date().toISOString(),
      tenant_name: newPayment.tenant_name,
      property_name: newPayment.property_name || 'Propriété non spécifiée',
      email: newPayment.email,
    };

    setPayments([payment, ...payments]);
    setNewPayment({
      invoice_number: '',
      amount: '',
      tenant_name: '',
      property_name: '',
      email: '',
    });
    setShowAddModal(false);
    alert('Paiement ajouté avec succès!');
  };

  const handleInputChange = (field: string, value: string) => {
    setNewPayment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredPayments = payments
    .filter(payment => {
      if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.invoice_number.toLowerCase().includes(searchLower) ||
        payment.transaction_id.toLowerCase().includes(searchLower) ||
        payment.tenant_name.toLowerCase().includes(searchLower) ||
        payment.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_at_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_at_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'amount_asc':
          return a.amount - b.amount;
        case 'amount_desc':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
    };
    const statusLabels = {
      pending: 'En attente',
      completed: 'Complété',
      failed: 'Échoué',
      refunded: 'Remboursé',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedCount = filteredPayments.filter(p => p.status === 'completed').length;
  const pendingCount = filteredPayments.filter(p => p.status === 'pending').length;

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestion des Paiements</h1>
          <p className="text-gray-500 mt-1">Gérez et suivez tous les paiements des locataires</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus size={20} />
          Nouveau Paiement
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Total Paiements</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{filteredPayments.length}</p>
            </div>
            <div className="bg-blue-600 text-white p-3 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold uppercase tracking-wider">Montant Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{(totalAmount / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-green-600 text-white p-3 rounded-lg">
              <span className="text-xl font-bold">XOF</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wider">Complétés</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{completedCount}</p>
            </div>
            <div className="bg-emerald-600 text-white p-3 rounded-lg">
              <CheckCheck size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4 border-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-semibold uppercase tracking-wider">En Attente</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCount}</p>
            </div>
            <div className="bg-amber-600 text-white p-3 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 space-y-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres et Recherche</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par facture, locataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">⏳ En attente</option>
            <option value="completed">✅ Complétés</option>
            <option value="failed">❌ Échoués</option>
            <option value="refunded">🔄 Remboursés</option>
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white md:col-span-2"
          >
            <option value="created_at_desc">Plus récents d'abord</option>
            <option value="created_at_asc">Plus anciens d'abord</option>
            <option value="amount_desc">Montant décroissant</option>
            <option value="amount_asc">Montant croissant</option>
          </select>
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Historique des Paiements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Locataire</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Bien</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-gray-500 text-lg font-medium">Aucun paiement trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-blue-50 transition-colors duration-150 group">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{payment.invoice_number}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{payment.tenant_name}</div>
                      <div className="text-xs text-gray-500">{payment.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.property_name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">
                      {payment.amount.toLocaleString()} {payment.currency}
                    </td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowModal(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-all transform hover:scale-110"
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmPayment(payment.id)}
                              className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition-all transform hover:scale-110"
                              title="Confirmer"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all transform hover:scale-110"
                              title="Rejeter"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => handleRefundPayment(payment.id)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 p-2 rounded-lg transition-all transform hover:scale-110"
                            title="Rembourser"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadReceipt(payment)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-lg transition-all transform hover:scale-110"
                          title="Télécharger reçu"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal des détails */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Détails du Paiement</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedPayment.invoice_number}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 space-y-6">
              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Référence Facture */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">Référence Facture</label>
                  <p className="text-xl font-bold text-gray-900">{selectedPayment.invoice_number}</p>
                </div>

                {/* Transaction ID */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <label className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-2">ID Transaction</label>
                  <p className="text-xl font-bold text-gray-900">{selectedPayment.transaction_id}</p>
                </div>

                {/* Locataire */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 col-span-2">
                  <label className="text-xs font-bold text-green-600 uppercase tracking-wider block mb-2">Locataire</label>
                  <p className="text-lg font-bold text-gray-900">{selectedPayment.tenant_name}</p>
                  <p className="text-sm text-gray-600">{selectedPayment.email}</p>
                </div>

                {/* Propriété */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 col-span-2">
                  <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">Propriété</label>
                  <p className="text-lg font-bold text-gray-900">{selectedPayment.property_name}</p>
                </div>

                {/* Montant */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-300">
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">Montant</label>
                  <p className="text-3xl font-bold text-blue-600">{selectedPayment.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedPayment.currency}</p>
                </div>

                {/* Méthode */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <label className="text-xs font-bold text-orange-600 uppercase tracking-wider block mb-2">Méthode</label>
                  <p className="text-lg font-bold text-gray-900 capitalize">{selectedPayment.payment_method}</p>
                </div>

                {/* Statut */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">Statut</label>
                  <p className="mt-2">{getStatusBadge(selectedPayment.status)}</p>
                </div>

                {/* Date */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">Créé le</label>
                  <p className="text-sm text-gray-900 font-semibold">
                    {new Date(selectedPayment.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(selectedPayment.created_at).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all"
              >
                Fermer
              </button>
              <button
                onClick={() => handleDownloadReceipt(selectedPayment)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download size={18} />
                Télécharger Reçu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter Nouveau Paiement */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Nouveau Paiement</h2>
                <p className="text-sm text-gray-600 mt-1">Ajouter un nouveau paiement</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 space-y-6">
              {/* Formulaire */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Numéro de facture */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Numéro de Facture *</label>
                  <input
                    type="text"
                    value={newPayment.invoice_number}
                    onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                    placeholder="Ex: INV-2024-001"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Montant (XOF) *</label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Ex: 150000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Locataire */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom du Locataire *</label>
                  <input
                    type="text"
                    value={newPayment.tenant_name}
                    onChange={(e) => handleInputChange('tenant_name', e.target.value)}
                    placeholder="Ex: Marc Leroy"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Propriété */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Propriété</label>
                  <input
                    type="text"
                    value={newPayment.property_name}
                    onChange={(e) => handleInputChange('property_name', e.target.value)}
                    placeholder="Ex: Appartement 5B - Rue de la Paix"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email du Locataire</label>
                  <input
                    type="email"
                    value={newPayment.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Ex: marc.leroy@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPayment}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus size={18} />
                Ajouter le Paiement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
