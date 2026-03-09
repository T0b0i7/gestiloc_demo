import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Wallet, UserPlus, AlertTriangle, FileText, Loader, Check } from 'lucide-react';

interface Notification {
  id: string;
  icon: 'payment' | 'tenant' | 'alert' | 'info';
  iconType: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Simuler un appel API
      setTimeout(() => {
        const mockNotifications: Notification[] = [
          {
            id: '1',
            icon: 'payment',
            iconType: 'wallet',
            title: 'Paiement en attente',
            message: 'Un locataire a un paiement en retard',
            time: 'Il y a 2 heures',
            unread: true
          },
          {
            id: '2',
            icon: 'tenant',
            iconType: 'user-plus',
            title: 'Nouveau locataire',
            message: 'Un nouveau locataire a été ajouté à un de vos biens',
            time: 'Hier',
            unread: true
          },
          {
            id: '3',
            icon: 'alert',
            iconType: 'alert-triangle',
            title: 'Préavis de départ',
            message: 'Un locataire a soumis un préavis de départ',
            time: 'Il y a 3 jours',
            unread: false
          },
          {
            id: '4',
            icon: 'info',
            iconType: 'file-text',
            title: 'Quittance disponible',
            message: 'Une nouvelle quittance a été générée',
            time: 'La semaine dernière',
            unread: false
          }
        ];
        setNotifications(mockNotifications);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'payment': return <Wallet className="w-4 h-4" />;
      case 'tenant': return <UserPlus className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <FileText className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getIconClass = (icon: string) => {
    switch (icon) {
      case 'payment': return 'bg-blue-100 text-blue-600';
      case 'tenant': return 'bg-green-100 text-green-600';
      case 'alert': return 'bg-red-100 text-red-600';
      case 'info': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.unread).length;

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
            <Bell className="w-4 h-4 text-green-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-600 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Loader className="w-8 h-8 text-gray-300 animate-spin mb-3" />
              <p className="text-xs text-gray-500">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <BellOff className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-xs text-gray-500 text-center">Aucune notification</p>
            </div>
          ) : (
            <>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`flex items-start gap-3 p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                    notif.unread ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconClass(notif.icon)}`}>
                    {getIconComponent(notif.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                  {notif.unread && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && !loading && (
          <div className="p-3 border-t border-gray-200 text-center">
            <button
              onClick={markAllAsRead}
              className="text-xs text-green-600 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <Check className="w-3.5 h-3.5" />
              Tout marquer comme lu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsModal;