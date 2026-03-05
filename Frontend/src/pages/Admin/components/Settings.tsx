
import React, { useState } from 'react';
import { Save, User, Bell, Shield, Camera } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppContext } from '../context/AppContext';

// Simple Toggle Component
const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <button 
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      title={`Toggle ${label}`}
      aria-label={`Toggle ${label}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out mt-1 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export const Settings: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Sophie Martin',
    email: 'sophie@gestiloc.com',
    role: 'Super Admin'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(t('settings.saved'), 'success');
      // Reset passwords if on security tab
      if (activeTab === 'security') {
        setPasswords({ current: '', new: '', confirm: '' });
      }
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: User },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('settings.tabs.security'), icon: Shield },
  ];

  return (
    <div className="p-6 space-y-6 pb-20">
      <div className="animate-slide-in">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('settings.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Sidebar */}
        <Card className="p-2 lg:w-64 h-fit flex-shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as unknown as string)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </Card>

        {/* Content Area */}
        <div className="flex-1 animate-fade-in-up">
          {activeTab === 'profile' && (
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                {t('settings.profile.header')}
              </h3>
              
              <div className="flex items-center gap-6 pb-6">
                <div className="relative group cursor-pointer">
                  <img 
                    src="https://picsum.photos/100/100?random=99" 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 group-hover:border-blue-100 dark:group-hover:border-blue-900 transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <div>
                   <Button variant="secondary">{t('settings.profile.changeAvatar')}</Button>
                   <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max 1MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label={t('settings.profile.name')} 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
                <Input 
                  label={t('settings.profile.email')} 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
                <Input 
                  label={t('settings.profile.role')} 
                  value={profile.role}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} isLoading={isLoading} icon={<Save size={16} />}>
                  {t('common.save')}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t('settings.notifications.header')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t('settings.notifications.desc')}
                </p>
              </div>
              
              <div className="space-y-3">
                <Toggle 
                  label={t('settings.notifications.emailNotif')} 
                  checked={notifications.email} 
                  onChange={() => setNotifications({...notifications, email: !notifications.email})} 
                />
                <Toggle 
                  label={t('settings.notifications.pushNotif')} 
                  checked={notifications.push} 
                  onChange={() => setNotifications({...notifications, push: !notifications.push})} 
                />
                <Toggle 
                  label={t('settings.notifications.marketing')} 
                  checked={notifications.marketing} 
                  onChange={() => setNotifications({...notifications, marketing: !notifications.marketing})} 
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} isLoading={isLoading} icon={<Save size={16} />}>
                  {t('common.save')}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                {t('settings.security.header')}
              </h3>

              <div className="space-y-4 max-w-md">
                <Input 
                  type="password"
                  label={t('settings.security.currentPwd')} 
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                />
                 <Input 
                  type="password"
                  label={t('settings.security.newPwd')} 
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                />
                 <Input 
                  type="password"
                  label={t('settings.security.confirmPwd')} 
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="danger" onClick={handleSave} isLoading={isLoading}>
                  {t('settings.security.updatePwd')}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
