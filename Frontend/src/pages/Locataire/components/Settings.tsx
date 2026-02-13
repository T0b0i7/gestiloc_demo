import React, { useState } from 'react';
import { 
  Lock, 
  Shield, 
  Lightbulb, 
  Globe, 
  Bell, 
  Download, 
  Trash2, 
  AlertTriangle,
  ChevronRight,
  Moon,
  Smartphone
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface SettingsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const Settings: React.FC<SettingsProps> = ({ notify }) => {
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  
  // Preferences states
  const [darkMode, setDarkMode] = useState(false);
  
  // Notifications states
  const [notifications, setNotifications] = useState({
    ownerMessages: true,
    paymentReminders: true,
    receiptsAvailable: true,
    interventions: true,
    browserNotifications: false,
  });
  
  // Privacy states
  const [dataSharing, setDataSharing] = useState(true);

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      notify?.('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (newPassword.length < 8) {
      notify?.('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }
    notify?.('Mot de passe changé avec succès', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    notify?.('Fonctionnalité non disponible dans la démo', 'info');
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="text-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-lg mt-2 text-gray-600">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* 1. Compte et sécurité */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Compte et sécurité</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez votre mot de passe et la sécurité de votre compte</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Nouveau mot de passe + Confirmation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conseil de sécurité */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 text-sm">Conseil de sécurité</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Utilisez un mot de passe fort contenant des lettres majuscules et minuscules, des chiffres et des caractères spéciaux.
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton changer mot de passe */}
            <Button onClick={handlePasswordChange} className="w-full md:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>

            {/* Authentification 2FA */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Authentification à deux facteurs</h3>
                  <p className="text-sm text-gray-500 mt-1">Activer l'authentification 2FA</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                </div>
                <ToggleSwitch checked={twoFAEnabled} onChange={() => setTwoFAEnabled(!twoFAEnabled)} />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Préférences */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Préférences</h2>
            <p className="text-sm text-gray-500 mt-1">Personnalisez votre expérience Gestiloc</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Langue */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-gray-700">Langue</span>
              <button className="flex items-center gap-2 text-green-600 font-medium hover:text-green-700">
                Français 🇫🇷
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Fuseau horaire */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-gray-700">Fuseau horaire</span>
              <span className="text-green-600 font-medium">Europe/Paris (UTC+1)</span>
            </div>

            {/* Format de date */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-gray-700">Format de date</span>
              <span className="text-green-600 font-medium">JJ/MM/AAAA</span>
            </div>

            {/* Devise */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-gray-700">Devise</span>
              <span className="text-green-600 font-medium">Euro (€)</span>
            </div>

            {/* Mode sombre */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium text-gray-900">Mode sombre</p>
                <p className="text-sm text-gray-500">Activez le thème sombre pour l'interface</p>
              </div>
              <ToggleSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </div>
          </div>
        </Card>

        {/* 3. Notifications */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500 mt-1">Choisissez comment vous souhaitez être notifié</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Notifications par email */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Notifications par email</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Messages du propriétaire</p>
                    <p className="text-xs text-gray-500">Recevez un email pour chaque nouveau message</p>
                  </div>
                  <ToggleSwitch 
                    checked={notifications.ownerMessages} 
                    onChange={() => toggleNotification('ownerMessages')} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Rappels de paiement</p>
                    <p className="text-xs text-gray-500">Recevez un rappel avant la date d'échéance du loyer</p>
                  </div>
                  <ToggleSwitch 
                    checked={notifications.paymentReminders} 
                    onChange={() => toggleNotification('paymentReminders')} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Quittances disponibles</p>
                    <p className="text-xs text-gray-500">Notification quand une nouvelle quittance est disponible</p>
                  </div>
                  <ToggleSwitch 
                    checked={notifications.receiptsAvailable} 
                    onChange={() => toggleNotification('receiptsAvailable')} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Interventions</p>
                    <p className="text-xs text-gray-500">Mises à jour sur vos demandes d'intervention</p>
                  </div>
                  <ToggleSwitch 
                    checked={notifications.interventions} 
                    onChange={() => toggleNotification('interventions')} 
                  />
                </div>
              </div>
            </div>

            {/* Notifications push */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-4">Notifications push</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Notifications sur navigateur</p>
                  <p className="text-xs text-gray-500">Recevez des notifications directement dans votre navigateur</p>
                </div>
                <ToggleSwitch 
                  checked={notifications.browserNotifications} 
                  onChange={() => toggleNotification('browserNotifications')} 
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 4. Confidentialité et données */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Confidentialité et données</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez vos données et votre confidentialité</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Partage des données */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Partage des données d'utilisation</p>
                <p className="text-xs text-gray-500 mt-0.5">Aidez-nous à améliorer Gestiloc en partageant des données anonymes</p>
              </div>
              <ToggleSwitch checked={dataSharing} onChange={() => setDataSharing(!dataSharing)} />
            </div>

            {/* Gestion des données */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Gestion des données</h3>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                <Download className="h-4 w-4" />
                Télécharger mes données
              </button>
              <p className="text-xs text-gray-500 mt-2">Téléchargez une copie de toutes vos données personnelles</p>
            </div>

            {/* Zone de danger */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-medium text-red-600 mb-3">Zone de danger</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 text-sm">Attention</p>
                    <p className="text-sm text-red-700 mt-1">
                      La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="danger" onClick={handleDeleteAccount} className="w-full md:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer mon compte
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Settings;
