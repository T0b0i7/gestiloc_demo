import React, { useEffect } from 'react';
import { X, Sparkles, User } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userRole?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ 
  isOpen, 
  onClose, 
  userName = "Utilisateur",
  userRole = "propriétaire"
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fermer automatiquement après 3 secondes
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roleMessages: Record<string, string> = {
    admin: "Administrateur",
    proprietaire: "Propriétaire",
    locataire: "Locataire", 
    coproprietaire: "Co-propriétaire"
  };

  const roleDisplay = roleMessages[userRole] || userRole;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-80 border border-slate-200 dark:border-slate-700 transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bienvenue !
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {roleDisplay}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Bon retour, {userName} !
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Heureux de vous revoir parmi nous
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full animate-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes progress-bar {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
  
  .animate-progress-bar {
    animation: progress-bar 3s linear;
  }
`;
document.head.appendChild(style);
