import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Payments } from './components/Payments';
import { Messages } from './components/Messages';
import { Interventions } from './components/Interventions';
import { Documents } from './components/Documents';
import { Property } from './components/Property';
import { Profile } from './components/Profile';
import { Bureau } from './components/Bureau';
import { AjouterBien } from './components/AjouterBien';
import { AjouterLocataire } from './components/AjouterLocataire';
import { NouvelleLocation } from './components/NouvelleLocation';
import { Settings } from './components/Settings';
import { Lots } from './components/Lots';
import { Immeubles } from './components/Immeubles';
import { TenantsList } from './components/TenantsList';
import { Onboarding } from './components/Onboarding';
import { MesBiens } from './components/MesBiens';
import { Lease } from './components/Lease';
import EtatsLieux from '../Admin/components/EtatsLieux';
import { 
  Biens, Locataires, Locations, Inventaires, EtatDesLieux, 
  Finances, Carnet, Candidats, Outils, Corbeille 
} from './components/SectionPages';
import { Tab, ToastMessage } from './types';
import { authService } from '@/services/api';

const ProprietaireApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const isProprietaire = user.roles?.includes('proprietaire') || user.roles?.includes('landlord');
        
        if (!isProprietaire) {
          // Rediriger vers le tableau de bord approprié en fonction du rôle
          if (user.roles?.includes('admin')) {
            navigate('/admin');
          } else if (user.roles?.includes('locataire') || user.roles?.includes('tenant')) {
            navigate('/locataire');
          } else {
            navigate('/');
          }
          return;
        }

        // Mettre à jour l'onglet actif en fonction de l'URL
        const path = location.pathname.split('/').pop() || 'dashboard';
        setActiveTab(path as Tab);
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
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
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
    // Si c'est un chemin complet, on l'utilise directement
    if (typeof tab === 'string' && tab.startsWith('/')) {
      navigate(tab);
    } else {
      // Sinon, on utilise l'ancien comportement
      setActiveTab(tab as Tab);
      navigate(`/proprietaire/${tab}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si l'utilisateur est sur la racine, on le redirige vers le tableau de bord
  if (location.pathname === '/proprietaire') {
    return <Navigate to="/proprietaire/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <Layout
            activeTab="dashboard"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Dashboard onNavigate={setActiveTab} notify={notify} />
          </Layout>
        } />
        <Route path="biens/*" element={
          <Layout
            activeTab="biens"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Biens notify={notify} />
          </Layout>
        } />
        <Route path="locataires/*" element={
          <Layout
            activeTab="locataires"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <TenantsList notify={notify} />
          </Layout>
        } />
        <Route path="bureau" element={
          <Layout
            activeTab="bureau"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Bureau notify={notify} />
          </Layout>
        } />
        
        {/* Nouvelles routes pour les actions rapides */}
        <Route path="ajouter-bien" element={
          <Layout
            activeTab="bureau"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <AjouterBien />
          </Layout>
        } />
        
        <Route path="ajouter-locataire" element={
          <Layout
            activeTab="bureau"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <AjouterLocataire />
          </Layout>
        } />
        
        <Route path="liste-locations" element={
          <Layout
            activeTab="locations"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Lease notify={notify} />
          </Layout>
        } />
        
        <Route path="nouvelle-location" element={
          <Layout
            activeTab="bureau"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <NouvelleLocation />
          </Layout>
        } />
        <Route path="locations/*" element={
          <Layout
            activeTab="locations"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Locations notify={notify} />
          </Layout>
        } />
        <Route path="paiements/*" element={
          <Layout
            activeTab="paiements"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Payments notify={notify} />
          </Layout>
        } />

        <Route path="etats-des-lieux/*" element={
          <Layout
            activeTab="etats-des-lieux"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <EtatsLieux notify={notify} />
          </Layout>
        } />

        <Route path="documents/*" element={
          <Layout
            activeTab="documents"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Documents notify={notify} />
          </Layout>
        } />
        <Route path="parametres" element={
          <Layout
            activeTab="parametres"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Settings notify={notify} />
          </Layout>
        } />
        <Route path="profil" element={
          <Layout
            activeTab="profil"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <Profile notify={notify} />
          </Layout>
        } />
        <Route path="mes-biens" element={
          <Layout
            activeTab="biens"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
          >
            <MesBiens />
          </Layout>
        } />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default ProprietaireApp;
