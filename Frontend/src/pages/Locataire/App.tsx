import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Payments } from './components/Payments';
import { Messages } from './components/Messages';
import { Interventions } from './components/Interventions';
import { Documents } from './components/Documents';
import Property from './components/Property'; // ✅ FIX ICI
import { Lease } from './components/Lease';
import { Profile } from './components/Profile';
import { Tab, ToastMessage } from './types';
import { Toaster } from '@/components/ui/toaster';
import TenantPreavisPage from './components/TenantPreavisPage';
import RentReceiptsPage from './components/RentReceiptsPage';
import PaymentPage from './components/PaymentPage';
import PaymentConfirmationPage from './components/PaymentConfirmationPage';
import PayLinkPage from './components/PayLinkPage';
import TenantInvoicesPage from './components/TenantInvoicesPage'; // ✅ ajoute
import PaymentReturnPage from './components/PaymentReturnPage'; // ✅ ajoute

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

  // Récupère l'onglet actif à partir de l'URL
  const getActiveTab = useCallback((): Tab => {
    const segments = location.pathname.split('/').filter(segment => segment);
    const locataireIndex = segments.indexOf('locataire');
    const lastSegment =
      locataireIndex >= 0 && locataireIndex < segments.length - 1
        ? segments[locataireIndex + 1]
        : 'home';

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
    ];

    return validTabs.includes(lastSegment as Tab) ? (lastSegment as Tab) : 'home';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState<Tab>(getActiveTab());

  useEffect(() => {
    const newActiveTab = getActiveTab();
    if (newActiveTab !== activeTab) setActiveTab(newActiveTab);
  }, [getActiveTab, activeTab]);

  const handleNavigation = useCallback(
    (tab: Tab) => {
      navigate(`/locataire/${tab}`);
    },
    [navigate]
  );

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Erreur lors de la lecture des données utilisateur:', error);
    }
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
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = () => {
    notify('Déconnexion en cours...', 'info');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);

    setTimeout(() => {
      navigate('/login');
      notify('Vous êtes maintenant déconnecté', 'success');
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
    >
      <Routes>
        <Route index element={<Dashboard onNavigate={handleNavigation} notify={notify} />} />
        <Route path="home" element={<Dashboard onNavigate={handleNavigation} notify={notify} />} />
        <Route path="payments" element={<Payments notify={notify} />} />
        <Route path="messages" element={<Messages notify={notify} />} />
        <Route path="interventions" element={<Interventions notify={notify} />} />
        <Route path="documents" element={<Documents notify={notify} />} />
        <Route path="receipts" element={<RentReceiptsPage />} />
        <Route path="lease" element={<Lease notify={notify} />} />
        <Route path="property" element={<Property notify={notify} />} />
        <Route path="notice" element={<TenantPreavisPage notify={notify} />} />
        <Route path="profile" element={<Profile notify={notify} onLogout={handleLogout} />} />
        <Route path="factures" element={<TenantInvoicesPage />} />
        <Route path="payer/:invoiceId" element={<PaymentPage />} />
        <Route path="paiement/retour" element={<PaymentReturnPage />} />
        <Route path="paiement/confirmation/:invoiceId/:transactionId" element={<PaymentConfirmationPage />} />
        <Route path="*" element={<Navigate to="home" replace />} />
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
