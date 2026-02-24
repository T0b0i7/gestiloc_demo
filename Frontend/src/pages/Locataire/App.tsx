import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Payments } from './components/Payments';
import { Messages } from './components/Messages';
import { Interventions } from './components/Interventions';
import { Documents } from './components/Documents';
import Property from './components/Property';
import { Lease } from './components/Lease';
import { Profile } from './components/Profile';
import { Tab, ToastMessage } from '@/pages/Locataire/types';
import { Toaster } from '@/components/ui/toaster';
import TenantPreavisPage from './components/TenantPreavisPage';
import RentReceiptsPage from './components/RentReceiptsPage';
import PaymentPage from './components/PaymentPage';
import PaymentConfirmationPage from './components/PaymentConfirmationPage';
import PayLinkPage from './components/PayLinkPage';
import TenantInvoicesPage from './components/TenantInvoicesPage';
import PaymentReturnPage from './components/PaymentReturnPage';
import { Location } from './components/Location';
import { Tasks } from './components/Tasks';
import { Notes } from './components/Notes';
import { Settings } from './components/Settings';
import { Landlord } from './components/Landlord';
import { mockUserData } from '@/services';

// Wrapper pour gérer la navigation et les états partagés
interface UserData {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  roles: string[];
  default_role: string | null;
}

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  // Récupère l'onglet actif à partir de l'URL
  const getActiveTab = useCallback((): Tab => {
    const segments = location.pathname.split('/').filter(segment => segment);
    const locataireIndex = segments.indexOf('locataire');
    
    // Si pas de 'locataire' dans l'URL ou URL malformée, retourner 'home'
    if (locataireIndex === -1 || locataireIndex >= segments.length - 1) {
      return 'home';
    }
    
    const nextSegment = segments[locataireIndex + 1];
    
    // Ignorer les segments qui sont des routes valides mais pas des onglets
    const ignoredSegments = ['dashboard', 'payer', 'paiement'];
    if (ignoredSegments.includes(nextSegment)) {
      return 'home';
    }
    
    const validTabs: Tab[] = [
      'home',
      'payments',
      'messages',
      'interventions',
      'documents',
      'lease',
      'property',
      'profile',
      'factures',
      'paiement',
      'landlord',
      'help',
      'receipts',
      'notice',
      'location',
      'tasks',
      'notes',
      'settings',
    ];

    return validTabs.includes(nextSegment as Tab) ? (nextSegment as Tab) : 'home';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const newActiveTab = getActiveTab();
    if (newActiveTab !== activeTab) setActiveTab(newActiveTab);
  }, [getActiveTab]); // Supprimé activeTab pour éviter la boucle

  const handleNavigation = useCallback(
    (tab: Tab) => {
      const currentTabFromUrl = getActiveTab();
      // Si on clique sur le même onglet (déterminé par l'URL), forcer le re-render
      if (tab === currentTabFromUrl) {
        setRefreshKey(prev => prev + 1);
      }
      navigate(`/locataire/${tab}`, { replace: true });
    },
    [navigate, getActiveTab]
  );

  useEffect(() => {
    // Utiliser les données mockées au lieu de localStorage
    setUser(mockUserData);
  }, []);

  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Toast System
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = toastIdCounter + 1;
    setToasts(prev => [...prev, { id, message, type }]);
    setToastIdCounter(id);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = () => {
    notify('Déconnexion en cours...', 'info');
    // En mode standalone, on ne fait que réinitialiser l'état
    setUser(null);
    
    setTimeout(() => {
      notify('Vous êtes maintenant déconnecté', 'info');
      // En mode standalone, on reste sur la page actuelle
    }, 1000);
  };

  return (
    <Layout
      activeTab={activeTab}
      onNavigate={handleNavigation}
      toasts={toasts}
      removeToast={removeToast}
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      user={user}
      notify={notify}
    >
 <Routes>
  <Route index element={<Dashboard key={refreshKey} activeTab="home" notify={notify} onNavigate={handleNavigation} />} />
  <Route path="home" element={<Dashboard key={refreshKey} activeTab="home" notify={notify} onNavigate={handleNavigation} />} />
  <Route path="payments" element={<Payments notify={notify} />} />
  <Route path="messages" element={<Messages notify={notify} />} />
  <Route path="interventions" element={<Interventions notify={notify} />} />
  <Route path="documents" element={<Documents notify={notify} />} />
  {/* CORRECTION ICI - Utiliser RentReceiptsPage au lieu de Dashboard */}
  <Route path="receipts" element={<RentReceiptsPage notify={notify} />} />
  <Route path="landlord" element={<Landlord notify={notify} />} />
  <Route path="property" element={<Property notify={notify} />} />
  <Route path="notice" element={<TenantPreavisPage notify={notify} />} />
  <Route path="profile" element={<Profile notify={notify} onLogout={handleLogout} />} />
  <Route path="factures" element={<TenantInvoicesPage />} />
  <Route path="payer/:invoiceId" element={<PaymentPage />} />
  <Route path="paiement/retour" element={<PaymentReturnPage />} />
  <Route path="paiement/confirmation/:invoiceId/:transactionId" element={<PaymentConfirmationPage />} />
  <Route path="help" element={<Dashboard activeTab="help" notify={notify} />} />
  <Route path="location" element={<Location notify={notify} />} />
  <Route path="tasks" element={<Tasks notify={notify} />} />
  <Route path="notes" element={<Notes notify={notify} />} />
  <Route path="settings" element={<Settings notify={notify} />} />
</Routes>

      {/* Si tu utilises shadcn toaster, garde-le ici */}
      <Toaster />
    </Layout>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
