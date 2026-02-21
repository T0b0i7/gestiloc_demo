import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Home,
  Users
} from 'lucide-react';
import { Button } from '../../Proprietaire/components/ui/Button';

// Couleur primaire personnalisée - VERT (identique à la page auth)
const PRIMARY_COLOR = "#70AE48";

export const CoOwnerActivation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Vérifier si les paramètres sont présents
    if (!token || !email) {
      setError('Lien d\'activation invalide. Paramètres manquants.');
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token, email]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error on input
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Le mot de passe est requis');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/co-owner/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          email: email,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        })
      });

      // Vérifier si la réponse est OK avant d'essayer de parser le JSON
      const text = await response.text();
      
      if (!text) {
        if (response.ok) {
          // Si la réponse est vide mais OK, on considère que c'est un succès
          setSuccess(true);
          
          // Rediriger vers le dashboard co-propriétaire après 2 secondes
          setTimeout(() => {
            navigate('/coproprietaire/dashboard');
          }, 2000);
          return;
        } else {
          throw new Error('Erreur lors de l\'activation');
        }
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        if (response.ok) {
          // Si la réponse est OK mais le JSON est invalide, on considère quand même que c'est un succès
          setSuccess(true);
          setTimeout(() => {
            navigate('/coproprietaire/dashboard');
          }, 2000);
          return;
        } else {
          throw new Error('Erreur lors de l\'activation');
        }
      }

      if (response.ok) {
        setSuccess(true);
        
        // Stocker le token et les infos utilisateur si présents
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Rediriger vers le dashboard co-propriétaire après 2 secondes
        setTimeout(() => {
          navigate('/coproprietaire/dashboard');
        }, 2000);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'activation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'activation');
    } finally {
      setLoading(false);
    }
  };

  // Style pour le bouton avec la couleur verte
  const buttonStyle = {
    backgroundColor: PRIMARY_COLOR,
    color: "white",
  };

  const linkStyle = {
    color: PRIMARY_COLOR,
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto" style={{ borderColor: PRIMARY_COLOR }}></div>
          <p className="mt-4 text-slate-600">Vérification du lien...</p>
        </motion.div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mx-auto mb-6"
            >
              <AlertCircle className="w-10 h-10 text-red-600" />
            </motion.div>
            
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-slate-800 mb-3"
            >
              Lien invalide
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 mb-8"
            >
              {error || 'Ce lien d\'activation n\'est pas valide ou a expiré.'}
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => navigate('/login')}
                style={buttonStyle}
                className="w-full h-12 text-base font-medium border-0"
              >
                Retour à la connexion
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-slate-800 mb-3"
            >
              Compte activé !
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 mb-6"
            >
              Votre compte co-propriétaire a été créé avec succès. 
              Vous allez être redirigé vers votre tableau de bord...
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2" style={{ borderColor: PRIMARY_COLOR }}></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Logo centré - identique à la page auth */}
        <motion.div 
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
            Gestiloc
          </h1>
          <p className="text-sm text-slate-600 max-w-xs mx-auto">
            Créer de meilleures relations entre les propriétaires et les locataires !
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
        >
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4"
              style={{ backgroundColor: `${PRIMARY_COLOR}20` }}
            >
              <Users className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Activation du compte
            </h1>
            <p className="text-slate-600">
              Créez votre mot de passe pour activer votre compte co-propriétaire
            </p>
            
            {email && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <p className="text-sm text-slate-600 flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" style={{ color: PRIMARY_COLOR }} />
                  <span className="font-medium">{email}</span>
                </p>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
              >
                <AlertCircle size={20} className="text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mot de passe */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    borderColor: formData.password ? PRIMARY_COLOR : undefined,
                    '--tw-ring-color': `${PRIMARY_COLOR}20`,
                  } as React.CSSProperties}
                  placeholder="•••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Minimum 8 caractères
              </p>
            </motion.div>

            {/* Confirmation mot de passe */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    borderColor: formData.password_confirmation ? PRIMARY_COLOR : undefined,
                    '--tw-ring-color': `${PRIMARY_COLOR}20`,
                  } as React.CSSProperties}
                  placeholder="•••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Bouton d'activation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-medium relative overflow-hidden border-0"
                style={buttonStyle}
              >
                <motion.div
                  className="flex items-center justify-center gap-2"
                  animate={loading ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1.5, repeat: loading ? Infinity : 0 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Activation en cours...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Activer mon compte</span>
                    </>
                  )}
                </motion.div>
              </Button>
            </motion.div>
          </form>

          {/* Lien vers connexion */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <p className="text-sm text-slate-600">
              Vous avez déjà un compte ?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium hover:underline"
                style={linkStyle}
                type="button"
              >
                Se connecter
              </button>
            </p>
          </motion.div>
        </motion.div>

        {/* Lien retour accueil */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm hover:text-[#70AE48] font-medium transition-colors text-slate-500"
            type="button"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};