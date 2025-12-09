import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authService } from '@/services/api';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">GestiLoc</h1>
          <p className="text-blue-100">
            Gestion Immobilière Intelligente
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Connexion
          </h2>

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
        </div>

        {/* Retour */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-blue-100 text-sm font-medium transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
