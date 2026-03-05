import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Loader2,
  AlertOctagon,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  User,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Home,
  Key,
  Users,
  Share2,
  Shield as ShieldIcon,
  Bell as BellIcon,
  Moon as MoonIcon,
  Sun,
  Languages,
  Globe2,
  CalendarDays,
  DollarSign,
  Database,
  Download as DownloadIcon,
  Trash,
  AlertCircle,
  Info,
  Check,
  Copy,
  ExternalLink,
  Settings as SettingsIcon,
  Palette,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone as SmartphoneIcon,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Speaker,
  Mic,
  Camera,
  Video,
  Film,
  Music,
  Radio,
  Podcast,
  Gamepad,
  Keyboard,
  Mouse,
  Printer,
  Phone as PhoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Watch as WatchIcon,
  Headphones as HeadphonesIcon,
  Speaker as SpeakerIcon,
  Mic as MicIcon,
  Camera as CameraIcon,
  Video as VideoIcon,
  Film as FilmIcon,
  Music as MusicIcon,
  Radio as RadioIcon,
  Podcast as PodcastIcon,
  Gamepad as GamepadIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Printer as PrinterIcon,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import api from '@/services/api';

// ... rest of the code remains the same ...
interface SettingsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface UserSettings {
  user: {
    id: number;
    email: string;
    phone: string | null;
    created_at: string;
  };
  security: {
    two_factor_enabled: boolean;
    last_password_change: string | null;
    last_login_at: string | null;
    last_login_ip: string | null;
  };
  preferences: {
    language: string;
    timezone: string;
    date_format: string;
    currency: string;
    dark_mode: boolean;
  };
  notifications: {
    owner_messages: boolean;
    payment_reminders: boolean;
    receipts_available: boolean;
    interventions: boolean;
    browser_notifications: boolean;
  };
  privacy: {
    data_sharing: boolean;
  };
}

// Dictionnaire de traduction
const translations = {
  fr: {
    title: 'Paramètres',
    subtitle: 'Gérez vos préférences et paramètres de compte',
    account_security: 'Compte et sécurité',
    account_security_desc: 'Gérez votre mot de passe et la sécurité de votre compte',
    current_password: 'Mot de passe actuel',
    new_password: 'Nouveau mot de passe',
    confirm_password: 'Confirmer le mot de passe',
    password_min: 'Minimum 8 caractères',
    security_tip: 'Conseil de sécurité',
    security_tip_text: 'Utilisez un mot de passe fort contenant des lettres majuscules et minuscules, des chiffres et des caractères spéciaux.',
    change_password: 'Changer le mot de passe',
    two_factor: 'Authentification à deux facteurs',
    two_factor_desc: 'Activer l\'authentification 2FA',
    two_factor_subdesc: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
    last_password_change: 'Dernier changement de mot de passe',
    preferences: 'Préférences',
    preferences_desc: 'Personnalisez votre expérience Gestiloc',
    language: 'Langue',
    timezone: 'Fuseau horaire',
    date_format: 'Format de date',
    currency: 'Devise',
    dark_mode: 'Mode sombre',
    dark_mode_desc: 'Activez le thème sombre pour l\'interface',
    notifications: 'Notifications',
    notifications_desc: 'Choisissez comment vous souhaitez être notifié',
    email_notifications: 'Notifications par email',
    owner_messages: 'Messages du propriétaire',
    owner_messages_desc: 'Recevez un email pour chaque nouveau message',
    payment_reminders: 'Rappels de paiement',
    payment_reminders_desc: 'Recevez un rappel avant la date d\'échéance du loyer',
    receipts_available: 'Quittances disponibles',
    receipts_available_desc: 'Notification quand une nouvelle quittance est disponible',
    interventions: 'Interventions',
    interventions_desc: 'Mises à jour sur vos demandes d\'intervention',
    push_notifications: 'Notifications push',
    browser_notifications: 'Notifications sur navigateur',
    browser_notifications_desc: 'Recevez des notifications directement dans votre navigateur',
    privacy_data: 'Confidentialité et données',
    privacy_data_desc: 'Gérez vos données et votre confidentialité',
    data_sharing: 'Partage des données d\'utilisation',
    data_sharing_desc: 'Aidez-nous à améliorer Gestiloc en partageant des données anonymes',
    data_management: 'Gestion des données',
    download_data: 'Télécharger mes données',
    download_data_desc: 'Téléchargez une copie de toutes vos données personnelles',
    danger_zone: 'Zone de danger',
    danger_title: 'Attention',
    danger_desc: 'La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.',
    delete_account: 'Supprimer mon compte',
    confirm_delete: 'Supprimer le compte',
    confirm_delete_desc: 'Cette action est irréversible',
    confirm_delete_text: 'Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront définitivement effacées.',
    cancel: 'Annuler',
    delete: 'Supprimer',
    saving: 'Enregistrement...',
    save: 'Enregistrer',
    loading: 'Chargement de vos paramètres...',
    error_loading: 'Impossible de charger les paramètres',
    retry: 'Réessayer',
    two_factor_activate: 'Activer l\'authentification 2FA',
    two_factor_secret: 'Scannez ce code QR avec votre application d\'authentification',
    recovery_codes: 'Codes de récupération',
    recovery_codes_desc: 'Conservez ces codes en lieu sûr. Ils vous permettront de récupérer l\'accès à votre compte si vous perdez votre téléphone.',
    confirm: 'Confirmer',
  },
  en: {
    title: 'Settings',
    subtitle: 'Manage your preferences and account settings',
    account_security: 'Account & Security',
    account_security_desc: 'Manage your password and account security',
    current_password: 'Current password',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    password_min: 'Minimum 8 characters',
    security_tip: 'Security tip',
    security_tip_text: 'Use a strong password with uppercase and lowercase letters, numbers and special characters.',
    change_password: 'Change password',
    two_factor: 'Two-factor authentication',
    two_factor_desc: 'Enable 2FA',
    two_factor_subdesc: 'Add an extra layer of security to your account',
    last_password_change: 'Last password change',
    preferences: 'Preferences',
    preferences_desc: 'Customize your Gestiloc experience',
    language: 'Language',
    timezone: 'Timezone',
    date_format: 'Date format',
    currency: 'Currency',
    dark_mode: 'Dark mode',
    dark_mode_desc: 'Enable dark theme for the interface',
    notifications: 'Notifications',
    notifications_desc: 'Choose how you want to be notified',
    email_notifications: 'Email notifications',
    owner_messages: 'Owner messages',
    owner_messages_desc: 'Receive an email for each new message',
    payment_reminders: 'Payment reminders',
    payment_reminders_desc: 'Receive a reminder before the rent due date',
    receipts_available: 'Receipts available',
    receipts_available_desc: 'Notification when a new receipt is available',
    interventions: 'Interventions',
    interventions_desc: 'Updates on your maintenance requests',
    push_notifications: 'Push notifications',
    browser_notifications: 'Browser notifications',
    browser_notifications_desc: 'Receive notifications directly in your browser',
    privacy_data: 'Privacy & Data',
    privacy_data_desc: 'Manage your data and privacy',
    data_sharing: 'Usage data sharing',
    data_sharing_desc: 'Help us improve Gestiloc by sharing anonymous data',
    data_management: 'Data management',
    download_data: 'Download my data',
    download_data_desc: 'Download a copy of all your personal data',
    danger_zone: 'Danger zone',
    danger_title: 'Warning',
    danger_desc: 'Deleting your account is irreversible. All your data will be permanently deleted.',
    delete_account: 'Delete my account',
    confirm_delete: 'Delete account',
    confirm_delete_desc: 'This action is irreversible',
    confirm_delete_text: 'Are you sure you want to delete your account? All your data will be permanently erased.',
    cancel: 'Cancel',
    delete: 'Delete',
    saving: 'Saving...',
    save: 'Save',
    loading: 'Loading your settings...',
    error_loading: 'Unable to load settings',
    retry: 'Retry',
    two_factor_activate: 'Enable two-factor authentication',
    two_factor_secret: 'Scan this QR code with your authenticator app',
    recovery_codes: 'Recovery codes',
    recovery_codes_desc: 'Keep these codes safe. They will allow you to recover access to your account if you lose your phone.',
    confirm: 'Confirm',
  },
  es: {
    title: 'Configuración',
    subtitle: 'Administre sus preferencias y configuración de cuenta',
    account_security: 'Cuenta y seguridad',
    account_security_desc: 'Administre su contraseña y la seguridad de su cuenta',
    current_password: 'Contraseña actual',
    new_password: 'Nueva contraseña',
    confirm_password: 'Confirmar contraseña',
    password_min: 'Mínimo 8 caracteres',
    security_tip: 'Consejo de seguridad',
    security_tip_text: 'Utilice una contraseña segura con letras mayúsculas y minúsculas, números y caracteres especiales.',
    change_password: 'Cambiar contraseña',
    two_factor: 'Autenticación de dos factores',
    two_factor_desc: 'Activar 2FA',
    two_factor_subdesc: 'Agregue una capa adicional de seguridad a su cuenta',
    last_password_change: 'Último cambio de contraseña',
    preferences: 'Preferencias',
    preferences_desc: 'Personalice su experiencia en Gestiloc',
    language: 'Idioma',
    timezone: 'Zona horaria',
    date_format: 'Formato de fecha',
    currency: 'Moneda',
    dark_mode: 'Modo oscuro',
    dark_mode_desc: 'Active el tema oscuro para la interfaz',
    notifications: 'Notificaciones',
    notifications_desc: 'Elija cómo desea ser notificado',
    email_notifications: 'Notificaciones por correo',
    owner_messages: 'Mensajes del propietario',
    owner_messages_desc: 'Reciba un correo por cada nuevo mensaje',
    payment_reminders: 'Recordatorios de pago',
    payment_reminders_desc: 'Reciba un recordatorio antes de la fecha de vencimiento del alquiler',
    receipts_available: 'Recibos disponibles',
    receipts_available_desc: 'Notificación cuando hay un nuevo recibo disponible',
    interventions: 'Intervenciones',
    interventions_desc: 'Actualizaciones sobre sus solicitudes de mantenimiento',
    push_notifications: 'Notificaciones push',
    browser_notifications: 'Notificaciones del navegador',
    browser_notifications_desc: 'Reciba notificaciones directamente en su navegador',
    privacy_data: 'Privacidad y datos',
    privacy_data_desc: 'Administre sus datos y privacidad',
    data_sharing: 'Compartir datos de uso',
    data_sharing_desc: 'Ayúdenos a mejorar Gestiloc compartiendo datos anónimos',
    data_management: 'Gestión de datos',
    download_data: 'Descargar mis datos',
    download_data_desc: 'Descargue una copia de todos sus datos personales',
    danger_zone: 'Zona de peligro',
    danger_title: 'Atención',
    danger_desc: 'Eliminar su cuenta es irreversible. Todos sus datos serán eliminados permanentemente.',
    delete_account: 'Eliminar mi cuenta',
    confirm_delete: 'Eliminar cuenta',
    confirm_delete_desc: 'Esta acción es irreversible',
    confirm_delete_text: '¿Está seguro de que desea eliminar su cuenta? Todos sus datos serán eliminados permanentemente.',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    saving: 'Guardando...',
    save: 'Guardar',
    loading: 'Cargando su configuración...',
    error_loading: 'No se puede cargar la configuración',
    retry: 'Reintentar',
    two_factor_activate: 'Activar autenticación de dos factores',
    two_factor_secret: 'Escanee este código QR con su aplicación de autenticación',
    recovery_codes: 'Códigos de recuperación',
    recovery_codes_desc: 'Guarde estos códigos en un lugar seguro. Le permitirán recuperar el acceso a su cuenta si pierde su teléfono.',
    confirm: 'Confirmar',
  },
};

const PRIMARY_COLOR = '#70AE48';

export const Settings: React.FC<SettingsProps> = ({ notify }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  
  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showTwoFAConfirm, setShowTwoFAConfirm] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACodes, setTwoFACodes] = useState<string[]>([]);
  
  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load settings
  useEffect(() => {
    fetchSettings();
  }, []);

  // Appliquer le mode sombre
  useEffect(() => {
    if (settings?.preferences.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.preferences.dark_mode]);

  // Obtenir la traduction courante
  const t = translations[settings?.preferences.language as keyof typeof translations] || translations.fr;

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tenant/settings');
      setSettings(response.data);
      setTwoFAEnabled(response.data.security.two_factor_enabled);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      notify?.('Erreur lors du chargement des paramètres', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    const errors: {[key: string]: string} = {};
    
    if (!currentPassword) {
      errors.currentPassword = t.current_password + ' est requis';
    }
    
    if (!newPassword) {
      errors.newPassword = t.new_password + ' est requis';
    } else if (newPassword.length < 8) {
      errors.newPassword = t.new_password + ' doit contenir au moins 8 caractères';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = t.confirm_password + ' est requise';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t.confirm_password + ' ne correspondent pas';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;

    setSaving(true);
    try {
      await api.put('/tenant/settings/password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      notify?.(t.change_password + ' avec succès', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
      await fetchSettings();
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      const message = error.response?.data?.message || 'Erreur lors du changement';
      
      if (error.response?.data?.errors) {
        setPasswordErrors(error.response.data.errors);
      } else {
        notify?.(message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTwoFA = async () => {
    if (twoFAEnabled) {
      // Désactiver 2FA
      setSaving(true);
      try {
        await api.post('/tenant/settings/2fa/disable');
        setTwoFAEnabled(false);
        notify?.(t.two_factor + ' désactivée', 'success');
        await fetchSettings();
      } catch (error) {
        notify?.('Erreur lors de la désactivation', 'error');
      } finally {
        setSaving(false);
      }
    } else {
      // Activer 2FA
      setSaving(true);
      try {
        const response = await api.post('/tenant/settings/2fa/enable');
        setTwoFASecret(response.data.secret);
        setTwoFACodes(response.data.recovery_codes);
        setShowTwoFAConfirm(true);
      } catch (error) {
        notify?.('Erreur lors de l\'activation', 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleConfirmTwoFA = async () => {
    setTwoFAEnabled(true);
    setShowTwoFAConfirm(false);
    notify?.(t.two_factor + ' activée', 'success');
    await fetchSettings();
  };

  const handleToggleNotification = async (key: keyof UserSettings['notifications']) => {
    if (!settings) return;

    const newValue = !settings.notifications[key];
    setSaving(true);
    
    try {
      await api.put('/tenant/settings/notifications', {
        [key]: newValue
      });
      
      setSettings({
        ...settings,
        notifications: {
          ...settings.notifications,
          [key]: newValue
        }
      });
      
      notify?.(t.preferences + ' mise à jour', 'success');
    } catch (error) {
      notify?.('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDarkMode = async () => {
    if (!settings) return;

    const newValue = !settings.preferences.dark_mode;
    setSaving(true);
    
    try {
      await api.put('/tenant/settings/preferences', {
        dark_mode: newValue
      });
      
      setSettings({
        ...settings,
        preferences: {
          ...settings.preferences,
          dark_mode: newValue
        }
      });
      
      notify?.(t.dark_mode + ' ' + (newValue ? 'activé' : 'désactivé'), 'success');
    } catch (error) {
      notify?.('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDataSharing = async () => {
    if (!settings) return;

    const newValue = !settings.privacy.data_sharing;
    setSaving(true);
    
    try {
      await api.put('/tenant/settings/privacy', {
        data_sharing: newValue
      });
      
      setSettings({
        ...settings,
        privacy: {
          ...settings.privacy,
          data_sharing: newValue
        }
      });
      
      notify?.('Préférence de partage mise à jour', 'success');
    } catch (error) {
      notify?.('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await api.get('/tenant/settings/download-data');
      
      // Créer un fichier JSON à télécharger
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `gestiloc-data-${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      notify?.('Données téléchargées avec succès', 'success');
    } catch (error) {
      notify?.('Erreur lors du téléchargement', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/tenant/settings/account');
      notify?.('Compte supprimé avec succès', 'success');
      // Déconnecter l'utilisateur
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      notify?.('Erreur lors de la suppression du compte', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChangePreference = async (field: string, value: string) => {
    if (!settings) return;

    setSaving(true);
    try {
      await api.put('/tenant/settings/preferences', {
        [field]: value
      });
      
      setSettings({
        ...settings,
        preferences: {
          ...settings.preferences,
          [field]: value
        }
      });
      
      notify?.(t.preferences + ' mise à jour', 'success');
    } catch (error) {
      notify?.('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      onClick={onChange}
      disabled={disabled || saving}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#70AE48]' : 'bg-gray-300'} ${disabled || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: PRIMARY_COLOR }} />
          <p className="text-gray-600 dark:text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t.error_loading}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      {/* Modal 2FA */}
      {showTwoFAConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.two_factor_activate}</h3>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                {t.two_factor_secret}
              </p>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="font-mono text-sm break-all text-gray-800 dark:text-gray-200">{twoFASecret}</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t.recovery_codes} :</p>
                <div className="grid grid-cols-2 gap-2">
                  {twoFACodes.map((code, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-center font-mono text-sm text-gray-700 dark:text-gray-300">
                      {code}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t.recovery_codes_desc}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTwoFAConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmTwoFA}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertOctagon size={28} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.confirm_delete}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.confirm_delete_desc}</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {t.confirm_delete_text}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  t.delete
                )}
              </button>
            </div>
          </div>
        </div>
      )}

  

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* 1. Compte et sécurité */}
        <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.account_security}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.account_security_desc}</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.current_password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-[#70AE48] focus:border-transparent pr-10 dark:bg-gray-700 dark:text-white`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* Nouveau mot de passe + Confirmation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.new_password}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-[#70AE48] focus:border-transparent dark:bg-gray-700 dark:text-white`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.password_min}</p>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.confirm_password}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-[#70AE48] focus:border-transparent dark:bg-gray-700 dark:text-white`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Conseil de sécurité */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">{t.security_tip}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    {t.security_tip_text}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton changer mot de passe */}
            <button 
              onClick={handlePasswordChange} 
              disabled={saving}
              className="w-full md:w-auto px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors disabled:bg-white flex items-center justify-center gap-2"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {t.change_password}
                </>
              )}
            </button>

            {/* Authentification 2FA */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t.two_factor}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.two_factor_desc}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t.two_factor_subdesc}</p>
                </div>
                <ToggleSwitch 
                  checked={twoFAEnabled} 
                  onChange={handleToggleTwoFA}
                  disabled={saving}
                />
              </div>
              {settings.security.last_password_change && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                  {t.last_password_change} : {new Date(settings.security.last_password_change).toLocaleDateString(settings.preferences.language === 'fr' ? 'fr-FR' : settings.preferences.language === 'es' ? 'es-ES' : 'en-US')}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* 2. Préférences */}
        <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.preferences}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.preferences_desc}</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Langue */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">{t.language}</span>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleChangePreference('language', e.target.value)}
                disabled={saving}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#70AE48] dark:bg-gray-700 dark:text-white"
              >
                <option value="fr">Français 🇫🇷</option>
                <option value="en">English 🇬🇧</option>
                <option value="es">Español 🇪🇸</option>
              </select>
            </div>

            {/* Fuseau horaire */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">{t.timezone}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{settings.preferences.timezone}</span>
            </div>

            {/* Format de date */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">{t.date_format}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {settings.preferences.date_format === 'd/m/Y' ? 'JJ/MM/AAAA' : 
                 settings.preferences.date_format === 'm/d/Y' ? 'MM/JJ/AAAA' : 'AAAA-MM-JJ'}
              </span>
            </div>

            {/* Devise */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">{t.currency}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{settings.preferences.currency}</span>
            </div>

            {/* Mode sombre */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t.dark_mode}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.dark_mode_desc}</p>
              </div>
              <ToggleSwitch 
                checked={settings.preferences.dark_mode} 
                onChange={handleToggleDarkMode}
                disabled={saving}
              />
            </div>
          </div>
        </Card>

        {/* 3. Notifications */}
        <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.notifications}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.notifications_desc}</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Notifications par email */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">{t.email_notifications}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t.owner_messages}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.owner_messages_desc}</p>
                  </div>
                  <ToggleSwitch 
                    checked={settings.notifications.owner_messages} 
                    onChange={() => handleToggleNotification('owner_messages')}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t.payment_reminders}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.payment_reminders_desc}</p>
                  </div>
                  <ToggleSwitch 
                    checked={settings.notifications.payment_reminders} 
                    onChange={() => handleToggleNotification('payment_reminders')}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t.receipts_available}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.receipts_available_desc}</p>
                  </div>
                  <ToggleSwitch 
                    checked={settings.notifications.receipts_available} 
                    onChange={() => handleToggleNotification('receipts_available')}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t.interventions}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.interventions_desc}</p>
                  </div>
                  <ToggleSwitch 
                    checked={settings.notifications.interventions} 
                    onChange={() => handleToggleNotification('interventions')}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Notifications push */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">{t.push_notifications}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t.browser_notifications}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.browser_notifications_desc}</p>
                </div>
                <ToggleSwitch 
                  checked={settings.notifications.browser_notifications} 
                  onChange={() => handleToggleNotification('browser_notifications')}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 4. Confidentialité et données */}
        <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.privacy_data}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.privacy_data_desc}</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Partage des données */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t.data_sharing}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.data_sharing_desc}</p>
              </div>
              <ToggleSwitch 
                checked={settings.privacy.data_sharing} 
                onChange={handleToggleDataSharing}
                disabled={saving}
              />
            </div>

            {/* Gestion des données */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t.data_management}</h3>
              <button 
                onClick={handleDownloadData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                <Download className="h-4 w-4" />
                {t.download_data}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t.download_data_desc}</p>
            </div>

     {/* Zone de danger */}
<div className="pt-8 border-t border-gray-200/60 dark:border-gray-700/60">

  <h3 className="text-sm font-semibold tracking-wide text-red-600 dark:text-red-400 uppercase mb-4">
    {t.danger_zone}
  </h3>

  <div className="relative bg-red-50/60 dark:bg-red-900/10 
                  border border-red-200/60 dark:border-red-800/50 
                  border-l-4 border-l-red-600
                  rounded-2xl p-5">

    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
          {t.danger_title}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1 leading-relaxed">
          {t.danger_desc}
        </p>
      </div>
    </div>

    <div className="mt-6">
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="group inline-flex items-center gap-2 px-5 py-2.5 
                   bg-red-600 hover:bg-red-700 
                   text-white text-sm font-medium
                   rounded-xl transition-all duration-200
                   shadow-sm hover:shadow-md active:scale-95"
      >
        <Trash2 className="h-4 w-4 transition-transform group-hover:rotate-6" />
        {t.delete_account}
      </button>
    </div>

  </div>
</div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Settings;