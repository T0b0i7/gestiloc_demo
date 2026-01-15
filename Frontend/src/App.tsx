import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface User {
  id?: number;
  email?: string;
  role?: string;
  roles?: string[];
  first_name?: string;
  last_name?: string;
}
import { AppShell } from "@/components/layout/AppShell";
import { authService } from "@/services/api";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Tour from "./pages/Tour";
import Pricing from "./pages/Pricing";
import Help from "./pages/Help";
import HelpCategory from "./pages/HelpCategory";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import About from "./pages/About";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";
import LocataireApp from "./pages/Locataire/App";
import ProprietaireApp from "./pages/Proprietaire/App";
import AdminApp from "./pages/Admin/App";
import TenantActivation from "./pages/Proprietaire/components/LocataireActivation";
import PayLinkPage from "./pages/Locataire/components/PayLinkPage";

const queryClient = new QueryClient();

// Composant pour les routes protégées
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('useAuth - Token:', token ? 'présent' : 'absent');
        console.log('useAuth - User string:', userStr);
        
        if (token && userStr) {
          const userData = JSON.parse(userStr);
          console.log('useAuth - User data:', userData);
          
          // Normalisation des rôles
          if (userData.roles && !userData.role) {
            // Si l'utilisateur a des rôles mais pas de rôle par défaut
            userData.role = userData.roles[0];
          }
          setUser(userData);
        } else {
          // Si pas de token ou d'utilisateur, s'assurer que l'état est cohérent
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur de vérification de l\'authentification:', error);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const isAuthenticated = !!(user?.id && localStorage.getItem('token'));
  
  // Log pour le débogage
  if (isAuthenticated) {
    console.log('Utilisateur authentifié:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      roles: user?.roles,
      hasToken: !!localStorage.getItem('token')
    });
  } else {
    console.log('Utilisateur non authentifié');
  }
  
  return { user, isAuthenticated, isLoading };
};

const ProtectedRoute = ({ children, roles = [] }: { children: JSX.Element, roles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('=== ProtectedRoute Debug ===');
  console.log('isLoading:', isLoading);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('User:', user);
  console.log('Roles requis:', roles);

  if (isLoading) {
    console.log('Chargement en cours...');
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log('Non authentifié, redirection vers /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si aucun rôle n'est requis, on laisse passer
  if (roles.length === 0) {
    console.log('Aucun rôle requis, accès autorisé');
    return children;
  }

  // Normalisation des rôles pour la comparaison (en minuscules)
  const normalizedRoles = roles.map(role => role.toLowerCase());
  
  // Récupération des rôles de l'utilisateur
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r: string) => r.toLowerCase())
    : [];
  
  const userRole = user?.role?.toLowerCase();
  
  console.log('Rôles utilisateur:', { userRoles, userRole });
  console.log('Rôles requis (normalisés):', normalizedRoles);

  // Vérification des rôles
  const hasRequiredRole = 
    normalizedRoles.some(role => 
      userRoles.includes(role) || 
      userRole === role ||
      (role === 'locataire' && userRole === 'tenant') ||
      (role === 'proprietaire' && userRole === 'landlord')
    );
  
  if (!hasRequiredRole) {
    console.warn('Accès refusé : rôles insuffisants');
    console.warn('Rôles disponibles:', { userRoles, userRole });
    console.warn('Rôles requis:', normalizedRoles);
    
    // Redirection vers la page par défaut en fonction du rôle de l'utilisateur
    let defaultPath = '/';

    if (userRole === 'admin') {
      defaultPath = '/admin';
    } else if (userRole && ['proprietaire', 'landlord'].includes(userRole)) {
      defaultPath = '/proprietaire';
    } else if (userRole && ['locataire', 'tenant'].includes(userRole)) {
      defaultPath = '/locataire';
    }
    
    console.log('Redirection vers:', defaultPath);
    return <Navigate to={defaultPath} replace />;
  }

  console.log('Accès autorisé');
  return children;
};

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">Chargement de l'application...</p>
    </div>
  </div>
);

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AppContent mounted');
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  console.log('Rendering AppContent');
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/activation/locataire" element={<TenantActivation />} />
      <Route path="/pay-link/:token" element={<PayLinkPage />} />


      {/* Pages marketing avec AppShell */}
      <Route path="/" element={<AppShell><Home /></AppShell>} />
      <Route path="/tour" element={<AppShell><Tour /></AppShell>} />
      <Route path="/pricing" element={<AppShell><Pricing /></AppShell>} />
      <Route path="/help" element={<AppShell><Help /></AppShell>} />
      <Route path="/help/:category" element={<AppShell><HelpCategory /></AppShell>} />
      <Route path="/help/faq" element={<AppShell><FAQ /></AppShell>} />
      <Route path="/blog" element={<AppShell><Blog /></AppShell>} />
      <Route path="/blog/:slug" element={<AppShell><BlogPost /></AppShell>} />
      <Route path="/contact" element={<AppShell><Contact /></AppShell>} />
      <Route path="/terms" element={<AppShell><Terms /></AppShell>} />
      <Route path="/privacy" element={<AppShell><Privacy /></AppShell>} />
      <Route path="/cookies" element={<AppShell><Cookies /></AppShell>} />
      <Route path="/about" element={<AppShell><About /></AppShell>} />
      <Route path="/demo" element={<AppShell><Demo /></AppShell>} />

      {/* Tableau de bord Locataire */}
      <Route path="/locataire/*" element={
        <ProtectedRoute roles={['locataire']}>
          <LocataireApp />
        </ProtectedRoute>
      } />

      {/* Tableau de bord Propriétaire */}
      <Route path="/proprietaire" element={
        <ProtectedRoute roles={['proprietaire', 'landlord']}>
          <Navigate to="dashboard" replace />
        </ProtectedRoute>
      } />
      <Route path="/proprietaire/*" element={
        <ProtectedRoute roles={['proprietaire', 'landlord']}>
          <ProprietaireApp />
        </ProtectedRoute>
      } />

      {/* Tableau de bord Admin */}
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <AdminApp />
        </ProtectedRoute>
      } />

      {/* 404 - Page non trouvée */}
      <Route path="*" element={<AppShell><NotFound /></AppShell>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
        <Toaster />
        <Sonner position="top-right" />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
