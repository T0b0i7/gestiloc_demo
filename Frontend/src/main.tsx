import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppProviders } from "./providers/AppProviders";

// Fonction pour afficher l'écran d'erreur
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h1>
        <p className="text-gray-700 mb-6">Désolé, une erreur inattendue s'est produite.</p>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-left">
          <p className="font-medium">Erreur :</p>
          <pre className="mt-2 text-sm overflow-auto">{error.message}</pre>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Recharger la page
        </button>
      </div>
    </div>
  );
}

// Composant de chargement
function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Chargement de l'application...</p>
      </div>
    </div>
  );
}

// Enveloppe d'erreur pour l'application
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Rendu de l'application avec gestion des erreurs
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("L'élément racine 'root' est introuvable dans le DOM");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingScreen />}>
        <AppProviders>
          <App />
        </AppProviders>
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
