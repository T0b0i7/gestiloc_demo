import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tenantService } from '@/services/api';

export const TenantActivation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token || !email) {
      setError('Lien invalide. Merci de vérifier votre email ou de demander une nouvelle invitation.');
      return;
    }

    if (!password || !passwordConfirmation) {
      setError('Merci de saisir et confirmer votre mot de passe.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);

    try {
      await tenantService.completeTenantRegistration({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess('Votre compte a été créé. Redirection vers votre espace locataire...');
      setTimeout(() => {
        navigate('/locataire'); // ou '/locataire/dashboard' selon tes routes
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      const apiError = err as { message?: string; error?: string; errors?: Record<string, string[]> };
      const msg =
        apiError?.message ||
        apiError?.error ||
        (apiError?.errors && Object.values(apiError.errors)[0]?.[0]) ||
        'Une erreur est survenue lors de la création de votre compte.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Création de votre compte locataire
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Choisissez un mot de passe pour activer votre espace locataire.
        </p>

        {email && (
          <div className="mb-4 text-sm">
            <span className="font-semibold text-slate-700">Email&nbsp;: </span>
            <span className="text-slate-600">{email}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmation du mot de passe
            </label>
            <input
              type="password"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Activation en cours...' : 'Activer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TenantActivation;
