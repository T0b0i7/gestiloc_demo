import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Card } from '../../Proprietaire/components/ui/Card';
import { Button } from '../../Proprietaire/components/ui/Button';

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

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Stocker le token et les infos utilisateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
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

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Lien invalide
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'Ce lien d\'activation n\'est pas valide ou a expiré.'}
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Compte activé !
            </h1>
            <p className="text-gray-600 mb-6">
              Votre compte co-propriétaire a été créé avec succès. 
              Vous allez être redirigé vers votre tableau de bord...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Activation du compte
          </h1>
          <p className="text-gray-600">
            Créez votre mot de passe pour activer votre compte co-propriétaire
          </p>
          {email && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <Mail className="w-4 h-4 inline mr-2" />
                {email}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="•••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 caractères
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="•••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activation en cours...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Activer mon compte</span>
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ? 
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium ml-1"
            >
              Se connecter
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};
