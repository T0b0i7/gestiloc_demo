import React from 'react';
import { X, LogOut } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Icone */}
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6 border-4 border-amber-500">
          <LogOut className="w-10 h-10 text-amber-600" />
        </div>

        {/* Titre */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Déconnexion
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>

        {/* Boutons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 border-2 border-gray-300"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;