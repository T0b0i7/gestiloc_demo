import React, { useState } from 'react';
import { X, HelpCircle, Mail, Bot, ChevronDown, Search, Rocket, Home, Users, Wallet } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqItems: FaqItem[] = [
    {
      question: 'Comment ajouter un nouveau bien ?',
      answer: 'Pour ajouter un nouveau bien, cliquez sur "Ajouter un bien" dans le menu "GESTIONS DES BIENS". Remplissez ensuite les informations demandées et validez.',
      category: 'getting-started'
    },
    {
      question: 'Comment créer une location ?',
      answer: 'Allez dans "Nouvelle location" depuis le menu "GESTION LOCATIVE". Sélectionnez le bien et le locataire, puis définissez les conditions du bail.',
      category: 'properties'
    },
    {
      question: 'Comment enregistrer un paiement ?',
      answer: 'Dans "Gestion des paiements", cliquez sur "Enregistrer un paiement". Remplissez le montant, la date et sélectionnez le locataire concerné.',
      category: 'payments'
    },
    {
      question: 'Comment générer une quittance ?',
      answer: 'Dans la liste des paiements, cliquez sur l\'icône PDF à côté du paiement concerné pour générer et télécharger la quittance.',
      category: 'payments'
    },
    {
      question: 'Comment inviter un autre gestionnaire ?',
      answer: 'Dans le menu "GESTION DES COPROPRIÉTAIRES", cliquez sur "Inviter un gestionnaire". Choisissez le type et remplissez ses informations.',
      category: 'tenants'
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (category: string) => {
    console.log('Catégorie sélectionnée:', category);
    // Filtrer les FAQs par catégorie
    // À implémenter selon vos besoins
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-green-600" />
            Centre d'aide
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Recherche */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Rechercher dans l'aide..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

  

          {/* FAQ */}
          <div className="space-y-1">
            {filteredFaqs.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-900">{item.question}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                      expandedItems.includes(index) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedItems.includes(index) && (
                  <div className="px-3 pb-3 text-gray-600 text-xs leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-200 text-center">
            <p className="text-xs text-gray-700 mb-3">
              Vous ne trouvez pas ce que vous cherchez ?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.href = 'mailto:support@gestiloc.com'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Nous contacter
              </button>
              <button
                onClick={() => alert('Assistant IA - Fonctionnalité à venir')}
                className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                Assistant IA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;