import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Home, Users, FileText, BarChart3, Zap } from 'lucide-react';
import { authService } from '@/services/api';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'login' | 'demo-proprietaire' | 'demo-locataire' | 'demo-admin'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await authService.login(email, password);
      
      if (response && response.data && response.data.user) {
        const { user } = response.data;
        toast.success('Connexion réussie !');
        
        // Stocker le token et les informations utilisateur
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Vérifier les rôles disponibles
        const roles = user.roles || [];
        
        // Déterminer la route de redirection en fonction du rôle
        let redirectPath = '/';
        let userRole = '';
        
        // Vérifier d'abord si admin
        if (roles.includes('admin')) {
          redirectPath = '/admin';
          userRole = 'admin';
        } 
        // Ensuite vérifier si propriétaire/bailleur
        else if (roles.includes('landlord') || roles.includes('proprietaire')) {
          redirectPath = '/proprietaire';
          userRole = 'proprietaire';
        } 
        // Enfin, par défaut, rediriger vers l'espace locataire
        else if (roles.includes('tenant') || roles.includes('locataire')) {
          redirectPath = '/locataire';
          userRole = 'locataire';
        }
        
        // Mettre à jour le rôle de l'utilisateur dans le stockage local
        const updatedUser = { ...user, role: userRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Rediriger vers la page appropriée
        navigate(redirectPath, { replace: true });
        
      } else {
        throw new Error('Réponse du serveur invalide');
      }
      
    } catch (error: unknown) {
      console.error('Erreur de connexion :', error);
      let errorMessage = 'Email ou mot de passe incorrect';

      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; request?: unknown; message?: string };

      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join('\n');
        }
      } else if (err.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const DemoCard = ({ title, description, features, icon: Icon, color }: { title: string; description: string; features: string[]; icon: React.ReactNode; color: string }) => (
    <div className={`${color} rounded-2xl p-6 text-white`}>
      <div className="flex items-center gap-3 mb-4">
        {Icon}
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-sm opacity-90 mb-4">{description}</p>
      <div className="space-y-2">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">GestiLoc</h1>
          <p className="text-blue-100 text-lg">Gestion Immobilière Intelligente</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          {[
            { id: 'login', label: '🔐 Connexion' },
            { id: 'demo-proprietaire', label: '🏠 Propriétaire' },
            { id: 'demo-locataire', label: '👤 Locataire' },
            { id: 'demo-admin', label: '⚙️ Admin' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTab === tab.id
                  ? 'bg-white text-primary shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* Formulaire de connexion */}
          {selectedTab === 'login' && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Connexion</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.fr"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bouton Connexion */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-disabled mt-6"
                >
                  {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </form>

              {/* Retour */}
              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                >
                  ← Retour à l'accueil
                </button>
              </div>
            </div>
          )}

          {/* Demo Propriétaire */}
          {selectedTab === 'demo-proprietaire' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DemoCard
                title="Mes Biens"
                description="Gérez tous vos propriétés"
                features={[
                  '📸 Galerie photos détaillée',
                  '💰 Suivi des loyers',
                  '📍 Localisation GPS',
                  '⚡ Statut en temps réel',
                ]}
                icon={<Home size={24} />}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <DemoCard
                title="Mes Locataires"
                description="Gestion complète des locataires"
                features={[
                  '👥 Profils détaillés',
                  '📄 Contrats de bail',
                  '✉️ Communications',
                  '🔗 Liaisons propriété',
                ]}
                icon={<Users size={24} />}
                color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              />
              <DemoCard
                title="Finances"
                description="Suivi des loyers et charges"
                features={[
                  '💵 Historique loyers',
                  '📊 Rapports mensuels',
                  '🧾 Factures automati',
                  '📈 Statistiques',
                ]}
                icon={<BarChart3 size={24} />}
                color="bg-gradient-to-br from-amber-500 to-amber-600"
              />
              <DemoCard
                title="Documents"
                description="Archivage numérique sécurisé"
                features={[
                  '📁 Contrats signés',
                  '📸 Photos diagnostics',
                  '📋 États des lieux',
                  '🔐 Sécurisé & accessible',
                ]}
                icon={<FileText size={24} />}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <DemoCard
                title="Interventions"
                description="Suivi des maintenance"
                features={[
                  '🔧 Demandes de travaux',
                  '✅ Suivi progression',
                  '💰 Devis & factures',
                  '🎯 Historique complet',
                ]}
                icon={<Zap size={24} />}
                color="bg-gradient-to-br from-rose-500 to-rose-600"
              />
              <DemoCard
                title="Tableau de Bord"
                description="Vue d'ensemble complète"
                features={[
                  '📊 Statistiques clés',
                  '🎯 Revenus totaux',
                  '⚠️ Alertes importantes',
                  '📅 Événements à venir',
                ]}
                icon={<BarChart3 size={24} />}
                color="bg-gradient-to-br from-indigo-500 to-indigo-600"
              />
            </div>
          )}

          {/* Demo Locataire */}
          {selectedTab === 'demo-locataire' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DemoCard
                title="Mon Bail"
                description="Consultation du contrat"
                features={[
                  '📄 Téléchargement PDF',
                  '📅 Durée & dates',
                  '💰 Montant du loyer',
                  '✍️ Signataires',
                ]}
                icon={<FileText size={24} />}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <DemoCard
                title="Mes Paiements"
                description="Historique et suivi des loyers"
                features={[
                  '💳 Paiements effectués',
                  '📊 Calendrier de paiement',
                  '✅ Quittances PDF',
                  '⏰ Prochaines échéances',
                ]}
                icon={<BarChart3 size={24} />}
                color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              />
              <DemoCard
                title="Ma Propriété"
                description="Informations du logement"
                features={[
                  '🏠 Description complète',
                  '📸 Photos & plan',
                  '📍 Localisation',
                  '📋 Caractéristiques',
                ]}
                icon={<Home size={24} />}
                color="bg-gradient-to-br from-amber-500 to-amber-600"
              />
              <DemoCard
                title="Demandes d'Intervention"
                description="Signaler des problèmes"
                features={[
                  '🔧 Créer des demandes',
                  '✅ Suivre progressio',
                  '💬 Communiquer',
                  '📸 Photos & pièces jointes',
                ]}
                icon={<Zap size={24} />}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <DemoCard
                title="Documents"
                description="États des lieux & diagnostics"
                features={[
                  '📁 États des lieux',
                  '🔍 Photos diagnostics',
                  '📋 Checklists",
                  '🔐 Accès sécurisé',
                ]}
                icon={<FileText size={24} />}
                color="bg-gradient-to-br from-rose-500 to-rose-600"
              />
              <DemoCard
                title="Tableau de Bord"
                description="Informations essentielles"
                features={[
                  '📊 Résumé du bail',
                  '💰 Solde dues',
                  '⚠️ Alertes importantes',
                  '📞 Contact propriétaire',
                ]}
                icon={<BarChart3 size={24} />}
                color="bg-gradient-to-br from-indigo-500 to-indigo-600"
              />
            </div>
          )}

          {/* Demo Admin */}
          {selectedTab === 'demo-admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DemoCard
                title="Gestion Utilisateurs"
                description="Créer et gérer tous les comptes"
                features={[
                  '👥 Liste utilisateurs",
                  '⚙️ Rôles & permissions',
                  '✏️ Modifier profils',
                  '🚫 Désactiver comptes',
                ]}
                icon={<Users size={24} />}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <DemoCard
                title="Tableau de Bord"
                description="Statistiques globales"
                features={[
                  '📊 Utilisateurs actifs',
                  '💰 Revenus totaux',
                  '🏠 Propriétés enregistrées',
                  '📈 Graphiques',
                ]}
                icon={<BarChart3 size={24} />}
                color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              />
              <DemoCard
                title="Support Tickets"
                description="Gérer les demandes d'aide"
                features={[
                  '🎫 Tickets en attente',
                  '🏷️ Catégorisation',
                  '💬 Messages & réponses',
                  '✅ Clôturer tickets',
                ]}
                icon={<Zap size={24} />}
                color="bg-gradient-to-br from-amber-500 to-amber-600"
              />
              <DemoCard
                title="Rapports"
                description="Analyses détaillées"
                features={[
                  '📄 Rapports PDF',
                  '📊 Statistiques mensuel',
                  '🎯 Tendances',
                  '📥 Export données',
                ]}
                icon={<FileText size={24} />}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <DemoCard
                title="Paramètres"
                description="Configuration système"
                features={[
                  '⚙️ Paramètres généraux',
                  '🔐 Sécurité',
                  '📧 E-mails & notifications',
                  '💾 Sauvegardes',
                ]}
                icon={<Zap size={24} />}
                color="bg-gradient-to-br from-rose-500 to-rose-600"
              />
              <DemoCard
                title="Audit & Logs"
                description="Suivi des actions"
                features={[
                  '📋 Historique complet',
                  '👤 Qui a fait quoi',
                  '⏰ Quand & où',
                  '🔍 Recherche avancée',
                ]}
                icon={<FileText size={24} />}
                color="bg-gradient-to-br from-indigo-500 to-indigo-600"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
