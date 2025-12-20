import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Mail, ArrowUpRight, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Payment, PaymentStatus } from '../types';

const initialPayments: Payment[] = [
  { id: '1', month: 'Novembre 2025', amount: 850, status: PaymentStatus.PAID, datePaid: '28/11/2025', dueDate: '05/11/2025' },
  { id: '2', month: 'Octobre 2025', amount: 850, status: PaymentStatus.PAID, datePaid: '03/10/2025', dueDate: '05/10/2025' },
  { id: '3', month: 'Septembre 2025', amount: 850, status: PaymentStatus.PAID, datePaid: '01/09/2025', dueDate: '05/09/2025' },
  { id: '4', month: 'Août 2025', amount: 850, status: PaymentStatus.PAID, datePaid: '04/08/2025', dueDate: '05/08/2025' },
];

interface PaymentsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Payments: React.FC<PaymentsProps> = ({ notify }) => {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const data = payments.map(p => ({
    name: p.month.split(' ')[0],
    amount: p.amount,
    status: p.status
  })).slice(-7);

  // DELETE
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setPayments(payments.filter(p => p.id !== deleteId));
      notify('Paiement supprimé', 'success');
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // UPDATE
  const handleEditClick = (payment: Payment) => {
    setEditingId(payment.id);
    setEditAmount(payment.amount.toString());
  };

  const handleSaveEdit = (id: string) => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      notify('Le montant doit être valide', 'error');
      return;
    }
    setPayments(payments.map(p =>
      p.id === id ? { ...p, amount: newAmount } : p
    ));
    notify('Paiement modifié', 'success');
    setEditingId(null);
    setEditAmount('');
  };

  const handlePay = () => {
    notify('Initialisation du paiement sécurisé...', 'info');
  };
  
  const handleDownload = () => {
    notify('Téléchargement de la quittance en cours...', 'success');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Mes Paiements</h1>
        <Button variant="primary" icon={<ArrowUpRight size={18} />} onClick={handlePay}>Effectuer un virement</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase">Solde Actuel</span>
            <div className="mt-1 flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">0,00 FCFA</span>
                <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">À jour</span>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase">Dernier Paiement</span>
            <div className="mt-1 flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">850,00 FCFA</span>
                <span className="ml-2 text-sm text-gray-500">le 28/11</span>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase">Prochain Loyer</span>
            <div className="mt-1 flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">01 Déc</span>
                <span className="ml-2 text-sm text-gray-500">850 FCFA</span>
            </div>
        </div>
      </div>

      {/* Chart */}
      <Card title="Évolution des loyers" className="hidden md:block">
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#2563eb' : '#93c5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Table */}
      <Card title="Historique des transactions">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.month}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === payment.id ? (
                      <input 
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Montant"
                        aria-label="Montant de paiement"
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{payment.amount} FCFA</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success">{payment.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.datePaid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                        {editingId === payment.id ? (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-700 transition-colors"
                              onClick={() => handleSaveEdit(payment.id)}
                            >
                              Enregistrer
                            </button>
                            <button 
                              className="text-gray-600 hover:text-gray-700 transition-colors"
                              onClick={() => setEditingId(null)}
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="text-gray-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Éditer"
                              onClick={() => handleEditClick(payment)}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              className="text-gray-400 group-hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Supprimer"
                              onClick={() => handleDeleteClick(payment.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-blue-600 transition-colors" 
                              title="Télécharger"
                              onClick={handleDownload}
                            >
                              <Download size={18} />
                            </button>
                            <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Envoyer par email">
                              <Mail size={18} />
                            </button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Supprimer le paiement">
        <div className="space-y-4">
          <p className="text-gray-700">Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Supprimer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
