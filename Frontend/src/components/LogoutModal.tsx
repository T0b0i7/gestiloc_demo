import React from 'react';
import { X, LogOut, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all" style={{ animation: 'slideUp 0.3s ease-out forwards' }}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <LogOut size={28} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Merriweather', serif" }}>Déconnexion</h3>
              <p className="text-sm text-gray-500">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 flex items-start gap-3 leading-snug">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <span>Vous devrez vous reconnecter pour accéder à votre espace personnel. Toutes les modifications non enregistrées seront perdues.</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
