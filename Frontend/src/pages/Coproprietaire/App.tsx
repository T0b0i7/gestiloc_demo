import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Tab, ToastMessage } from './types';
import { authService } from '@/services/api';

// Components spécifiques aux co-propriétaires
import { CoOwnerDashboard } from './components/CoOwnerDashboard';
import { DelegatedProperties } from './components/DelegatedProperties';
import { DelegationsManagement } from './components/DelegationsManagement';
import { InviteLandlord } from './components/InviteLandlord';
import { DelegationAudit } from './components/DelegationAudit';
import { TenantsList } from './components/TenantsList';
import { LeasesList } from './components/LeasesList';
import { RentReceiptsList } from './components/RentReceiptsList';
import { Finances } from './components/Finances';
import { CoOwnerDocuments } from './components/Documents';
import { Profile } from './components/Profile';
import { EmettrePaiement } from './components/EmettrePaiement';
import { RetraitMethode } from './components/RetraitMethode';

const CoproprietaireApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  // Liste des routes Laravel qui ne doivent pas être gérées par React
  const laravelRoutes = [
    '/coproprietaire/tenants',
    '/coproprietaire/assign-property',
    '/test-laravel',
    '/test-laravel-page'
  ];

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          navigate('/login');
          return;
        }

        // Vérifier que l'utilisateur a le bon rôle
        const user = JSON.parse(userStr);
        const isCoproprietaire = user && (user.roles?.includes('coproprietaire') || user.roles?.includes('co_owner'));

        if (!isCoproprietaire) {
          // Rediriger vers le tableau de bord approprié en fonction du rôle
          if (user?.roles?.includes('admin')) {
            navigate('/admin');
          } else if (user?.roles?.includes('locataire') || user?.roles?.includes('tenant')) {
            navigate('/locataire');
          } else if (user?.roles?.includes('proprietaire') || user?.roles?.includes('landlord')) {
            navigate('/proprietaire');
          }
          return;
        }

        // Mettre à jour l'onglet actif en fonction de l'URL
        // Ignorer si c'est une route Laravel
        const currentPath = location.pathname;
        const isLaravelRoute = laravelRoutes.some(route => currentPath.startsWith(route));

        if (!isLaravelRoute) {
          const path = currentPath.split('/').pop() || 'dashboard';
          setActiveTab(path as Tab);
        }
      } catch (error) {
        console.error('Erreur de vérification de l\'authentification:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  // Toast System
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = toastIdCounter + 1;
    setToasts(prev => [...prev, { id, message, type }]);
    setToastIdCounter(id);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      notify('Erreur lors de la déconnexion', 'error');
    }
  };

  const handleNavigation = (tab: Tab | string) => {
    console.log('App handleNavigation called with:', tab);

    // Vérifier si c'est une route Laravel
    const isLaravelRoute = laravelRoutes.some(route =>
      typeof tab === 'string' && tab.startsWith(route)
    );

    if (isLaravelRoute) {
      // Pour les routes Laravel, rediriger directement
      console.log('Redirecting to Laravel route:', tab);
      window.location.href = tab as string;
      return;
    }

    if (typeof tab === 'string' && tab.startsWith('/')) {
      // Si c'est déjà une URL absolue, naviguer directement
      console.log('Navigating to absolute URL:', tab);
      navigate(tab);
    } else {
      // Sinon, construire l'URL relative
      const tabValue = tab as Tab;
      console.log('Navigating to relative tab:', tabValue);
      setActiveTab(tabValue);
      navigate(`/coproprietaire/${tabValue}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si on est sur une route Laravel, ne pas rendre l'app React
  const isLaravelRoute = laravelRoutes.some(route => location.pathname.startsWith(route));
  if (isLaravelRoute) {
    return null; // Laisser Laravel gérer cette route
  }

  if (location.pathname === '/coproprietaire') {
    return <Navigate to="/coproprietaire/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />

        {/* Dashboard spécifique co-propriétaire */}
        <Route path="dashboard" element={
          <Layout
            activeTab="dashboard"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <CoOwnerDashboard onNavigate={handleNavigation} notify={notify} />
          </Layout>
        } />

        {/* Délégations */}
        <Route path="delegations" element={
          <Layout
            activeTab="delegations"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <DelegationsManagement notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Audit des délégations */}
        <Route path="audit" element={
          <Layout
            activeTab="audit"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <DelegationAudit notify={notify} />
          </Layout>
        } />

        {/* Inviter un propriétaire */}
        <Route path="inviter-proprietaire" element={
          <Layout
            activeTab="inviter-proprietaire"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <InviteLandlord notify={notify} />
          </Layout>
        } />

        {/* Biens délégués (réutilisation du composant propriétaire) */}
        <Route path="biens" element={
          <Layout
            activeTab="biens"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <DelegatedProperties notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Locataires - React */}
        <Route path="locataires" element={
          <Layout
            activeTab="locataires"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <TenantsList notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Baux */}
        <Route path="baux" element={
          <Layout
            activeTab="baux"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <LeasesList notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Quittances */}
        <Route path="quittances" element={
          <Layout
            activeTab="quittances"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <RentReceiptsList notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Finances */}
        <Route path="finances" element={
          <Layout
            activeTab="finances"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <Finances notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Émettre un paiement */}
        <Route path="emettre-paiement" element={
          <Layout
            activeTab="emettre-paiement"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <EmettrePaiement notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Méthodes de retrait */}
        <Route path="retrait-methode" element={
          <Layout
            activeTab="retrait-methode"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <RetraitMethode notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Documents */}
        <Route path="documents" element={
          <Layout
            activeTab="documents"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <CoOwnerDocuments notify={notify} onNavigate={handleNavigation} />
          </Layout>
        } />

        {/* Profil */}
        <Route path="profile" element={
          <Layout
            activeTab="profile"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <Profile onNavigate={handleNavigation} notify={notify} />
          </Layout>
        } />

        {/* Paramètres */}
        <Route path="parametres" element={
          <Layout
            activeTab="parametres"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
          >
            <Profile onNavigate={handleNavigation} notify={notify} />
          </Layout>
        } />

        {/* Redirection pour toute autre route */}
        <Route path="*" element={<Navigate to="/coproprietaire/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default CoproprietaireApp;