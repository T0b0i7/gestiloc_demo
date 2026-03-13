import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import './responsive.css';
import { Layout } from './components/Layout';
import Bureau from './components/Bureau';
import Dashboard from './components/Dashboard';
import { Payments } from './components/Payments';
import { Messages } from './components/Messages';
import { Interventions } from './components/Interventions';
import { Documents } from './components/Documents';
import { Property } from './components/Property';
import { Profile } from './components/Profile';
import { AjouterBien } from './components/AjouterBien';
import AjouterLocataire from './components/AjouterLocataire';
import NouvelleLocation from './components/NouvelleLocation';
import { Settings } from './components/Settings';
import { Lots } from './components/Lots';
import { Immeubles } from './components/Immeubles';
import { TenantsList } from './components/TenantsList';
import { Onboarding } from './components/Onboarding';
import MesBiens from './components/MesBiens';
import { Lease } from "./components/Lease";
import EtatsLieux from './components/EtatsLieux';
import { InviteCoOwner } from './components/InviteCoOwner';
import { CoOwnersList } from './components/CoOwnersList';
import {
  Biens, Locataires, Locations, Inventaires, EtatDesLieux,
  Finances, Carnet, Candidats, Outils, Corbeille,
} from './components/SectionPages';
import { Tab, ToastMessage } from './types';
import { authService } from '@/services/api';
import { DocumentsManager } from './components/DocumentsManager';
import PreavisList from './components/PreavisList';
import QuittancesIndependants from './components/QuittancesLoyers';
import LandlordIncidentsPage from './components/LandlordIncidentsPage';
import { EmitInvoice } from './components/EmitInvoice';
import { InvoicesList } from './components/InvoicesList';
import CreatePaymentRequest from './components/EmettrePaiement';
import WithdrawalMethod from './components/RetraitMethode';
import ContratsBaux from './components/ContratsBaux';
import EtatsDesLieux from './components/EtatsDesLieux';
import AvisEcheance from './components/AvisEcheance';
import QuittancesLoyersPage from './components/QuittancesPage';
import FacturesDocs from './components/FacturesDocs';
import ArchivageDocs from './components/ArchivageDocs';
import ReparationsTravaux from './components/ReparationsTravaux';
import ComptabilitePage from './components/ComptabilitePage';
import ParametresPage from './components/ParametresPage';
import MonCompte from './components/MonCompte';
import { LogoutModal } from '@/components/LogoutModal';


const ProprietaireApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastIdCounter, setToastIdCounter] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          // MODE DÉMO : Ne pas rediriger, laisser l'accès libre mais sans données réelles
          // On set simplement l'onglet actif et on termine le loader
          const path = location.pathname.split('/').pop() || 'dashboard';
          setActiveTab(path as Tab);
          setIsLoading(false);
          return;
        }

        // Vérifier que l'utilisateur a le bon rôle
        const user = JSON.parse(userStr);
        const roles = Array.isArray(user.roles) ? user.roles.map((r: string) => r.toLowerCase()) : [];
        const mainRole = (user.role || '').toLowerCase();
        const isProprietaire = roles.includes('proprietaire') || roles.includes('landlord') ||
          mainRole === 'proprietaire' || mainRole === 'landlord';

        if (!isProprietaire) {
          // Redirections pour les autres rôles
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
        // En cas d'erreur de parsage du state local par exemple, on active quand même le mode démo
        const path = location.pathname.split('/').pop() || 'dashboard';
        setActiveTab(path as Tab);
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

  const handleLogout = () => {
    // Afficher la modal de confirmation
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      notify('Erreur lors de la déconnexion', 'error');
    } finally {
      setShowLogoutModal(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleNavigation = (tab: Tab | string) => {
    // Si c'est un chemin complet (absolu), on l'utilise directement
    if (typeof tab === 'string' && tab.startsWith('/')) {
      navigate(tab);
    } else {
      // Toujours utiliser un chemin ABSOLU pour éviter les boucles de redirection
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
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <Dashboard onNavigate={handleNavigation} notify={notify} />
          </Layout>
        } />
        <Route path="biens/*" element={
          <Layout
            activeTab="biens"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
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
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
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
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <Bureau notify={notify} />
          </Layout>
        } />

        <Route path="emettre-paiement" element={
          <Layout
            activeTab="finances"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <CreatePaymentRequest />
          </Layout>
        } />

        <Route path="retrait-methode" element={
          <Layout
            activeTab="finances"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <WithdrawalMethod />
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
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <AjouterBien />
          </Layout>
        } />

        <Route path="incidents" element={
          <Layout
            activeTab="incidents"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <ReparationsTravaux notify={notify} />
          </Layout>
        } />

        <Route path="ajouter-locataire" element={
          <Layout
            activeTab="bureau"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <AjouterLocataire />
          </Layout>
        } />

        <Route path="quittances" element={
          <Layout
            activeTab="quittances"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <QuittancesLoyersPage notify={notify} />
          </Layout>
        } />


        <Route path="liste-locations" element={
          <Layout
            activeTab="locations"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <Lease notify={notify} />
          </Layout>
        } />

        <Route path="avis-echeance" element={
          <Layout
            activeTab="avis-echeance"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <AvisEcheance notify={notify} />
          </Layout>
        } />

        <Route path="preavis" element={
          <Layout
            activeTab="avis-echeance"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <PreavisList notify={notify} />
          </Layout>
        } />

        <Route path="nouvelle-location" element={
          <Layout
            activeTab="bureau"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
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
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
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
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <Payments notify={notify} />
          </Layout>
        } />

        <Route path="etats-lieux/*" element={
          <Layout
            activeTab="etats-lieux"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <EtatsDesLieux notify={notify} />
          </Layout>
        } />

        {/* Route pour les baux - aligne avec le menu */}
        <Route path="baux/*" element={
          <Layout
            activeTab="baux"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <ContratsBaux notify={notify} />
          </Layout>
        } />

        {/* Routes documents - plus spécifique avant générale */}
        <Route path="documents/baux/*" element={
          <Layout
            activeTab="baux"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <DocumentsManager notify={notify} />
          </Layout>
        } />

        <Route path="documents/*" element={
          <Layout
            activeTab="documents"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <Documents notify={notify} />
          </Layout>
        } />

        <Route path="émettre-facture" element={
          <Layout
            activeTab="émettre-facture"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <EmitInvoice notify={notify} />
          </Layout>
        } />

        <Route path="factures" element={
          <Layout
            activeTab="factures"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <FacturesDocs notify={notify} />
          </Layout>
        } />

        <Route path="archives" element={
          <Layout
            activeTab="archives"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <ArchivageDocs notify={notify} />
          </Layout>
        } />


        <Route path="comptabilite" element={
          <Layout
            activeTab="comptabilite"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <ComptabilitePage notify={notify} />
          </Layout>
        } />

        <Route path="parametres" element={
          <Layout
            activeTab="parametres"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <ParametresPage notify={notify} />
          </Layout>
        } />
        <Route path="profil" element={
          <Layout
            activeTab="profil"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <MonCompte notify={notify} />
          </Layout>
        } />
        <Route path="mes-biens" element={
          <Layout
            activeTab="biens"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <MesBiens notify={notify} />
          </Layout>
        } />

        {/* Routes co-propriétaires */}
        <Route path="coproprietaires" element={
          <Layout
            activeTab="coproprietaires"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <CoOwnersList notify={notify} />
          </Layout>
        } />

        <Route path="inviter-coproprietaire" element={
          <Layout
            activeTab="inviter-coproprietaire"
            onNavigate={handleNavigation}
            toasts={toasts}
            removeToast={removeToast}
            onLogout={handleLogout}
            isDarkMode={false}
            toggleTheme={() => { }}
            notify={notify}
          >
            <InviteCoOwner notify={notify} />
          </Layout>
        } />

        <Route path="*" element={<Navigate to="/proprietaire/dashboard" replace />} />
      </Routes>

      {/* Modal de déconnexion */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
};

export default ProprietaireApp;
