import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Lease } from '../types';
import { apiService } from '@/services/api';

interface EmitInvoiceProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const EmitInvoice: React.FC<EmitInvoiceProps> = ({ notify }) => {
  const navigate = useNavigate();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>('');
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [invoiceType, setInvoiceType] = useState<'rent' | 'deposit' | 'charge' | 'repair'>('rent');
  const [billingMonth, setBillingMonth] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('virement');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeases, setIsLoadingLeases] = useState(true);

  // Charger les locations du propriétaire
  useEffect(() => {
    const loadLeases = async () => {
      try {
        const leasesData = await apiService.getLeases();
        setLeases((leasesData || []) as unknown as Lease[]);
      } catch (error) {
        console.error('Erreur lors du chargement des locations:', error);
        notify('Erreur lors du chargement des locations', 'error');
      } finally {
        setIsLoadingLeases(false);
      }
    };

    loadLeases();
  }, [notify]);

  // Mettre à jour les informations de la location sélectionnée
  useEffect(() => {
    if (selectedLeaseId) {
      const lease = leases.find(l => l.id === selectedLeaseId);
      setSelectedLease(lease || null);

      // Pré-remplir le montant si c'est un loyer
      if (lease && invoiceType === 'rent') {
        setAmount((lease.rent_amount + (lease.charges_amount || 0)).toString());
      }
    } else {
      setSelectedLease(null);
    }
  }, [selectedLeaseId, leases, invoiceType]);

  // Générer automatiquement la date d'échéance basée sur le mois sélectionné
  useEffect(() => {
    if (billingMonth) {
      const [year, month] = billingMonth.split('-');
      // Date d'échéance = 5ème jour du mois suivant
      const dueDateObj = new Date(parseInt(year), parseInt(month), 5);
      setDueDate(dueDateObj.toISOString().split('T')[0]);
    }
  }, [billingMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLeaseId || !amount || !dueDate) {
      notify('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (paymentMethod === 'mobile_money' && !mobileNumber) {
      notify('Veuillez renseigner le numéro Mobile pour Mobile Money', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const invoiceData = {
        lease_id: selectedLeaseId,
        type: invoiceType,
        due_date: dueDate,
        amount_total: parseFloat(amount),
        payment_method: paymentMethod,
        period_start: billingMonth ? `${billingMonth}-01` : undefined,
        period_end: billingMonth ? new Date(parseInt(billingMonth.split('-')[0]), parseInt(billingMonth.split('-')[1]), 0).toISOString().split('T')[0] : undefined,
        mobile_number: paymentMethod === 'mobile_money' ? mobileNumber : undefined,
      };

      const response = await apiService.createInvoice(invoiceData);

      notify('Facture créée avec succès', 'success');

      // Redirection après 1.5 secondes
      setTimeout(() => {
        navigate('/proprietaire/factures');
      }, 1500);

    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      notify('Erreur lors de la création de la facture', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 7);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Émettre une facture</h1>
      </div>

      <Card title="Nouvelle facture">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélecteur de location */}
          <div>
            <Label htmlFor="lease">Location *</Label>
            <Select value={selectedLeaseId} onValueChange={setSelectedLeaseId} disabled={isLoadingLeases}>
              <SelectTrigger id="lease">
                <SelectValue placeholder={isLoadingLeases ? 'Chargement...' : 'Sélectionnez une location'} />
              </SelectTrigger>
              <SelectContent>
                {leases.map((lease) => (
                  <SelectItem key={lease.id} value={lease.id.toString()}>
                    {lease.property?.address}, {lease.property?.city} - {lease.tenant?.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Affichage automatique des informations */}
          {selectedLease && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-gray-900">Informations de la location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Locataire:</span> {selectedLease.tenant?.full_name}
                </div>
                <div>
                  <span className="font-medium">Bien:</span> {selectedLease.property?.address}, {selectedLease.property?.city}
                </div>
                <div>
                  <span className="font-medium">Loyer:</span> {selectedLease.rent_amount} FCFA
                </div>
                <div>
                  <span className="font-medium">Charges:</span> {selectedLease.charges_amount || 0} FCFA
                </div>
              </div>
            </div>
          )}

          {/* Type de facture */}
          <div>
            <Label htmlFor="type">Type de facture *</Label>
            <Select value={invoiceType} onValueChange={(value: string) => setInvoiceType(value as 'rent' | 'deposit' | 'charge' | 'repair')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Loyer</SelectItem>
                <SelectItem value="deposit">Dépôt de garantie</SelectItem>
                <SelectItem value="charge">Charge</SelectItem>
                <SelectItem value="repair">Réparation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sélecteur de mois de facturation */}
          <div>
            <Label htmlFor="billingMonth">Mois de facturation</Label>
            <Input
              id="billingMonth"
              type="month"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              min={currentMonth}
            />
          </div>

          {/* Date d'échéance */}
          <div>
            <Label htmlFor="dueDate">Date d'échéance *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          {/* Montant */}
          <div>
            <Label htmlFor="amount">Montant total (FCFA) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Moyen de paiement */}
          <div>
            <Label htmlFor="paymentMethod">Moyen de paiement préféré</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Carte bancaire</SelectItem>
                <SelectItem value="mobile_money">Argent mobile</SelectItem>
                <SelectItem value="virement">Virement bancaire</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="fedapay">Fedapay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Champ numéro mobile si Mobile Money choisi */}
          {paymentMethod === 'mobile_money' && (
            <div>
              <Label htmlFor="mobileNumber">Numéro Mobile (à débiter)</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Ex: 221770000000"
                required
              />
            </div>
          )}

          {/* Bouton de soumission */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || !selectedLeaseId}
            >
              {isLoading ? 'Création en cours...' : 'Émettre la facture'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};