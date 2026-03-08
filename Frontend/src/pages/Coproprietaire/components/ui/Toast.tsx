import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-emerald-50 border-emerald-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-emerald-800';
      default:
        return 'text-emerald-800';
    }
  };

  return (
    <div className={`flex items-center p-4 rounded-lg border ${getBgColor()} shadow-lg max-w-sm`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="ml-3 flex-1">
        <p className={`text-sm font-medium ${getTextColor()}`}>
          {message}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={onClose}
          className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
