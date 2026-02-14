import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PayLinkPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setError('Lien invalide');
        return;
      }

      try {
        const resp = await axios.post(`https://wheat-skunk-120710.hostingersite.com/api/pay-links/${token}/init`);
        const url = resp.data.checkout_url;
        if (url) {
          window.location.href = url;
        } else {
          setError('Impossible d\'obtenir l\'URL de paiement');
        }
      } catch (e: unknown) {
        const error = e as { response?: { data?: { message?: string } } };
        setError(error?.response?.data?.message || 'Erreur lors de l\'initialisation du paiement');
      }
    };
    init();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl p-6 shadow">
        <h1 className="text-xl font-bold mb-4">Lien de paiement</h1>
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div>Redirection vers le portail de paiement…</div>
        )}
        <div className="mt-4">
          <button onClick={() => navigate('/')} className="text-sm text-gray-600">Retour</button>
        </div>
      </div>
    </div>
  );
}
