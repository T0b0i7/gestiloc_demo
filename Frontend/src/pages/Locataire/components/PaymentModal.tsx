import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, notify }) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Simulate API call
    setTimeout(() => {
      setStep('success');
      notify('Paiement effectué avec succès', 'success');
      
      // Close modal after seeing success message
      setTimeout(() => {
        onClose();
        // Reset state after modal close animation
        setTimeout(() => setStep('form'), 300);
      }, 2000);
    }, 2000);
  };

  // Format card number with spaces
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts: string[] = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(v);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 'success' ? 'Paiement réussi' : 'Régler mon loyer'}>
      {step === 'form' && (
        <form onSubmit={handlePayment} className="space-y-5 animate-fade-in">
          <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center mb-4 border border-blue-100">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Montant à régler</p>
              <p className="text-2xl font-bold text-blue-900">{amount.toFixed(2)} FCFA</p>
            </div>
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Lock size={20} className="text-blue-500" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de carte</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  maxLength={19}
                  value={cardNumber}
                  onChange={handleCardChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date d'expiration</label>
                <input 
                  type="text" 
                  placeholder="MM/AA" 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CVC</label>
                <input 
                  type="text" 
                  placeholder="123" 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  maxLength={3}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulaire de la carte</label>
               <input 
                  type="text" 
                  placeholder="Nom Prénom" 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  required
                />
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full py-3 shadow-lg shadow-blue-500/20" size="lg">
              Payer {amount.toFixed(2)} FCFA
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Lock size={10} /> Paiement chiffré SSL 256-bit
            </p>
          </div>
        </form>
      )}

      {step === 'processing' && (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Lock size={20} className="text-primary" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">Traitement en cours</h4>
            <p className="text-sm text-gray-500">Veuillez ne pas fermer cette fenêtre...</p>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-bounce-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">Paiement Confirmé !</h4>
            <p className="text-sm text-gray-500 mt-1">Une quittance a été envoyée à votre email.</p>
          </div>
        </div>
      )}
    </Modal>
  );
};