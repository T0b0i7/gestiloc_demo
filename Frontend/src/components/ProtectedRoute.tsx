import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'locataire' | 'proprietaire' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const authUserStr = localStorage.getItem('auth_user');

  if (!authUserStr) {
    // Pas d'utilisateur authentifié, redirection vers login
    return <Navigate to="/login" replace />;
  }

  try {
    const authUser = JSON.parse(authUserStr);

    // Vérifier le rôle requis si spécifié
    if (requiredRole && authUser.role !== requiredRole) {
      // Rôle non autorisé, redirection vers accueil
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch {
    // Erreur lors du parsing, redirection vers login
    localStorage.removeItem('auth_user');
    return <Navigate to="/login" replace />;
  }
};
