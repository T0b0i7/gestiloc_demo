import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setShowModal(false), 300); // Wait for animation
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Content */}
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all duration-300 border border-blue-200 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        <div className="flex justify-between items-center p-6 border-b border-blue-100">
          <h3 className="font-bold text-xl text-black tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-blue-50 rounded-full transition-colors text-gray-500 hover:text-gray-700" aria-label="Fermer la modale">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};