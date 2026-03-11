import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#8CCC63]" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info': return <div className="p-1 bg-green-50 rounded-lg"><Bell className="w-4 h-4 text-[#529D21]" /></div>;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyle = () => {
    switch (toast.type) {
      case 'success': return "border-l-4 border-l-[#8CCC63] bg-white/90";
      case 'error': return "border-l-4 border-l-red-500 bg-white/90";
      default: return "border-l-4 border-l-[#529D21] bg-white/90";
    }
  };

  return (
    <div
      className={`
        flex items-center gap-4 p-4 pr-3 
        rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] 
        border border-gray-100/50 backdrop-blur-md 
        animate-slide-in-right min-w-[320px] max-w-md
        group transition-all hover:translate-y-[-2px]
        ${getStyle()}
      `}
      style={{ fontFamily: "'Merriweather', serif" }}
    >
      <div className="shrink-0 drop-shadow-sm">{getIcon()}</div>

      <div className="flex-1 flex flex-col gap-0.5">
        <span className="text-[0.8rem] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
          {toast.type === 'success' ? 'Succès' : toast.type === 'error' ? 'Alerte' : 'Notification'}
        </span>
        <p className="text-[0.95rem] font-bold text-gray-800 leading-tight">
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full opacity-20" />
    </div>
  );
};
