import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileSignature,
  Calendar,
  DollarSign,
  UserCheck,
  Clock,
  Shield,
  Download,
  Loader2,
  Home,
  MapPin,
  Ruler,
  Bed,
  Bath,
  AlertCircle,
} from 'lucide-react';

import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

import tenantApi, { TenantLease } from '../services/tenantApi';
import { formatDate, formatCurrency } from '@/lib/utils';

interface LeaseProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Lease: React.FC<LeaseProps> = ({ notify }) => {
  const [lease, setLease] = useState<TenantLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // refs pour éviter re-render / dépendances
  const notifyRef = useRef(notify);
  const isFetching = useRef(false);
  const didFetch = useRef(false); // évite double fetch en StrictMode (dev)
  const controllerRef = useRef<AbortController | null>(null);

  // Mettre à jour la référence quand notify change
  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  const fetchLeaseData = useCallback(async () => {
    // Ne pas relancer si déjà en cours
    if (isFetching.current) return;

    // Annule la requête précédente si elle est en cours
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);

      // Récupérer les baux de l'utilisateur connecté
      // ⚠️ Nécessite que tenantApi.getLeases accepte { signal }
      const response = await tenantApi.getLeases({ signal: controller.signal });

      // S'assurer que la réponse est bien un tableau
      const leases = Array.isArray(response) ? response : [];

      if (leases.length > 0) {
        // Vérifier que le bail a bien un ID
        if (!leases[0].id) {
          throw new Error("Format de données invalide: ID manquant");
        }
        setLease(leases[0]);
      } else {
        const errorMsg = 'Aucun bail trouvé pour votre compte.';
        setLease(null);
        setError(errorMsg);
        notifyRef.current(errorMsg, 'info');
      }
    } catch (err: any) {
      // Ignorer les erreurs d'annulation (AbortController / axios cancel)
      const aborted =
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED';

      if (!aborted) {
        let errorMessage = 'Impossible de charger les informations du bail.';
        if (err?.response?.status === 404) {
          errorMessage = 'Aucun bail trouvé pour votre compte.';
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }

        setLease(null);
        setError(errorMessage);
        notifyRef.current(errorMessage, 'error');
      }
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, []);

  // Chargement initial (une seule fois)
  useEffect(() => {
    // évite double exécution en dev (React 18 StrictMode)
    if (didFetch.current) return;
    didFetch.current = true;

    fetchLeaseData();

    return () => {
      controllerRef.current?.abort();
      isFetching.current = false;
    };
  }, [fetchLeaseData]);

  const handleDownload = async () => {
    if (!lease) return;

    try {
      // Télécharger le PDF du contrat de bail
      const pdfBlob = await tenantApi.downloadLeaseContract(lease.uuid);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;

      const safeAddress =
        lease.property?.address?.replace(/\s+/g, '-').toLowerCase() || 'adresse';
      a.download = `bail-${safeAddress}-${new Date().toISOString().split('T')[0]}.pdf`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      notify('Votre bail a été téléchargé avec succès', 'success');
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors du téléchargement du bail';
      notify(errorMsg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="text-gray-600">Chargement des informations du bail...</span>
        <p className="text-sm text-gray-500">Veuillez patienter</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={fetchLeaseData}
                disabled={isFetching.current}
                className="inline-flex items-center text-sm"
              >
                {isFetching.current ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  'Réessayer'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <FileSignature className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun bail actif</h3>
        <p className="mt-2 text-sm text-gray-500">
          Vous n&apos;avez pas encore de bail actif. Contactez votre propriétaire pour plus
          d&apos;informations.
        </p>
        <div className="mt-6">
          <Button
            onClick={fetchLeaseData}
            disabled={isFetching.current}
            className="inline-flex items-center"
          >
            {isFetching.current ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier à nouveau'
            )}
          </Button>
        </div>
      </div>
    );
  }

  const { property } = lease;
  const endDate = lease.end_date ? new Date(lease.end_date) : null;
  const rentAmount = typeof lease.rent_amount === 'number' ? lease.rent_amount : parseFloat(lease.rent_amount || '0');
  const chargesAmount = typeof lease.charges_amount === 'number' ? lease.charges_amount : parseFloat(lease.charges_amount || '0');
  const depositAmount = typeof lease.deposit === 'number' ? lease.deposit : parseFloat(lease.deposit || '0');

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Bail</h1>
          <p className="text-slate-500 text-sm">
            Contrat N° {`BL-${lease.id.toString().padStart(4, '0')}`} •{' '}
            {lease.status === 'active' ? 'Actif' : 'Inactif'}
          </p>
        </div>

        <Button icon={<Download size={18} />} onClick={handleDownload}>
          Télécharger le PDF
        </Button>
      </div>

      {/* Carte du bien */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="bg-slate-100 rounded-lg h-48 flex items-center justify-center text-slate-400">
              <Home className="w-12 h-12" />
            </div>
          </div>

          <div className="md:w-2/3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.address}</h3>
            <p className="text-slate-600 flex items-center gap-1 mb-4">
              <MapPin className="w-4 h-4" />
              {property.zip_code} {property.city}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4 text-slate-500" />
                <span>{property.surface} m²</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Bed className="w-4 h-4 text-slate-500" />
                <span>
                  {property.room_count} pièce{property.room_count > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Bath className="w-4 h-4 text-slate-500" />
                <span>
                  {(property.bathroom_count ?? 0)} salle{(property.bathroom_count ?? 0) > 1 ? 's' : ''} de bain
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline Visuelle */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
        <div className="p-2">
          <h3 className="text-lg font-bold mb-6 pl-2">Chronologie du contrat</h3>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-8 md:gap-0">
            {/* Line connector */}
            <div className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10 transform translate-y-2"></div>

            {/* Signature */}
            <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-4 border-white shadow-sm">
                <FileSignature size={18} />
              </div>
              <div className="text-left md:text-center">
                <p className="font-bold text-sm text-slate-900">Signature</p>
                <p className="text-xs text-slate-500">{formatDate(lease.created_at)}</p>
              </div>
            </div>

            {/* Entrée */}
            <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-blue-50">
                <UserCheck size={18} />
              </div>
              <div className="text-left md:text-center">
                <p className="font-bold text-sm text-blue-600">Entrée</p>
                <p className="text-xs text-slate-500">{formatDate(lease.start_date)}</p>
              </div>
            </div>

            {/* Fin ou renouvellement */}
            <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white">
                <Clock size={18} />
              </div>
              <div className="text-left md:text-center">
                <p className="font-bold text-sm text-slate-400">
                  {endDate ? 'Fin du bail' : 'Bail en cours'}
                </p>
                <p className="text-xs text-slate-500">
                  {endDate ? formatDate(lease.end_date) : 'Sans date de fin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Conditions Financières">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <DollarSign size={18} />
                </div>
                <span className="text-slate-600 font-medium">Loyer Mensuel HC</span>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(rentAmount)}</span>
            </div>

            {chargesAmount > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Calendar size={18} />
                  </div>
                  <span className="text-slate-600 font-medium">Charges (Provision)</span>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(chargesAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 bg-slate-50 px-3 rounded-lg">
              <span className="text-slate-800 font-bold">Total Mensuel</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(rentAmount + chargesAmount)}
              </span>
            </div>

            {depositAmount > 0 && (
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Shield size={18} />
                  </div>
                  <span className="text-slate-600 font-medium">Dépôt de garantie</span>
                </div>
                <Badge variant={lease.status === 'active' ? 'success' : 'warning'}>
                  {lease.status === 'active' ? 'Payé' : 'En attente'} ({formatCurrency(depositAmount)})
                </Badge>
              </div>
            )}
          </div>
        </Card>

        <Card title="Informations Complémentaires">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></span>
              <div>
                <p className="font-medium text-slate-800 text-sm">Durée du bail</p>
                <p className="text-slate-500 text-xs">
                  {endDate
                    ? `Du ${formatDate(lease.start_date)} au ${formatDate(lease.end_date)}`
                    : `À partir du ${formatDate(lease.start_date)} (sans date de fin)`}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></span>
              <div>
                <p className="font-medium text-slate-800 text-sm">Référence du bien</p>
                <p className="text-slate-500 text-xs">{(property as any).reference_code || 'Non spécifiée'}</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></span>
              <div>
                <p className="font-medium text-slate-800 text-sm">Type de location</p>
                <p className="text-slate-500 text-xs">
                  {lease.type === 'meuble' ? 'Meublé' : 'Non meublé'}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></span>
              <div>
                <p className="font-medium text-slate-800 text-sm">État du bail</p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      lease.status === 'active'
                        ? 'success'
                        : lease.status === 'terminated'
                        ? 'error'
                        : 'neutral'
                    }
                  >
                    {lease.status === 'active'
                      ? 'Actif'
                      : lease.status === 'terminated'
                      ? 'Résilié'
                      : lease.status === 'draft'
                      ? 'Brouillon'
                      : 'Inconnu'}
                  </Badge>
                </div>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
