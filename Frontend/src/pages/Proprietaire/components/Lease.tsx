import React, { useEffect, useState } from 'react';
import {
  FileSignature,
  Calendar,
  DollarSign,
  UserCheck,
  Clock,
  Shield,
  Download,
  XCircle,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { leaseService, Lease } from '@/services/api';

interface LeaseProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Lease: React.FC<LeaseProps> = ({ notify }) => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminatingId, setTerminatingId] = useState<number | null>(null);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const data = await leaseService.listLeases();
      setLeases(data);
      if (data.length > 0) {
        setSelectedLease(data[0]);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des baux :', error);
      notify(
        "Impossible de charger vos baux pour le moment. Veuillez réessayer.",
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const handleDownload = () => {
    // À brancher sur un endpoint /leases/{id}/download si tu l'ajoutes
    notify(
      'Téléchargement du bail à venir (brancher sur un endpoint PDF plus tard).',
      'info'
    );
  };

  const handleTerminate = async (lease: Lease) => {
    if (!lease.uuid) {
      notify("Impossible de terminer ce bail (UUID manquant).", 'error');
      return;
    }

    const ok = window.confirm(
      `Voulez-vous vraiment terminer le bail n° ${lease.id} ?`
    );
    if (!ok) return;

    try {
      setTerminatingId(lease.id);
      await leaseService.terminateLease(lease.uuid);
      notify('Le bail a été terminé avec succès.', 'success');
      await fetchLeases();
    } catch (error: any) {
      console.error('Erreur lors de la terminaison du bail :', error);
      notify(
        "Une erreur est survenue lors de la terminaison du bail.",
        'error'
      );
    } finally {
      setTerminatingId(null);
    }
  };

  const handleEdit = (lease: Lease) => {
    // À adapter si tu as une page / route d’édition
    // ex: navigate(`/proprietaire/baux/${lease.id}/edit`);
    notify(
      'Fonction d’édition à brancher (par ex. ouverture d’une modale ou navigation vers une page d’édition).',
      'info'
    );
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'terminated':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'terminated':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      default:
        return status || 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-slate-500 text-sm">Chargement de vos baux…</p>
      </div>
    );
  }

  if (!loading && leases.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Mes Baux</h1>
        <Card>
          <p className="text-slate-500 text-sm">
            Vous n’avez encore aucun bail enregistré. Créez un premier bail
            depuis l’écran “Nouveau bail”.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Baux</h1>
          <p className="text-slate-500 text-sm">
            {leases.length} bail{leases.length > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des baux */}
        <div className="lg:col-span-1 space-y-3">
          {leases.map((lease) => (
            <Card
              key={lease.id}
              className={`cursor-pointer transition-all ${
                selectedLease?.id === lease.id
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedLease(lease)}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileSignature className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm text-slate-900">
                      Bail n° {lease.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Du {formatDate(lease.start_date)} au{' '}
                    {lease.end_date ? formatDate(lease.end_date) : '∞'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Loyer :{' '}
                    <span className="font-semibold">
                      {lease.rent_amount} FCFA / mois
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={getStatusVariant(lease.status)}>
                    {getStatusLabel(lease.status)}
                  </Badge>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">
                    {lease.type}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Détails du bail sélectionné */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedLease ? (
            <Card>
              <p className="text-slate-500 text-sm">
                Sélectionnez un bail dans la liste de gauche pour voir les
                détails.
              </p>
            </Card>
          ) : (
            <>
              {/* Header actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Bail n° {selectedLease.id}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Créé le {formatDate(selectedLease.created_at)} • Statut :{' '}
                    <span className="font-semibold">
                      {getStatusLabel(selectedLease.status)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    icon={<FileSignature size={16} />}
                    onClick={() => handleEdit(selectedLease)}
                  >
                    Éditer
                  </Button>
                  <Button
                    variant="outline"
                    icon={<Download size={16} />}
                    onClick={handleDownload}
                  >
                    Télécharger le PDF
                  </Button>
                  {selectedLease.status !== 'terminated' && (
                    <Button
                      variant="destructive"
                      icon={<XCircle size={16} />}
                      onClick={() => handleTerminate(selectedLease)}
                      disabled={terminatingId === selectedLease.id}
                    >
                      {terminatingId === selectedLease.id
                        ? 'Terminaison...'
                        : 'Terminer le bail'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Timeline / chronologie */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="p-2">
                  <h3 className="text-lg font-bold mb-6 pl-2">
                    Chronologie du contrat
                  </h3>

                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-8 md:gap-0">
                    <div className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10 transform translate-y-2" />

                    {/* Signature */}
                    <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-4 border-white shadow-sm">
                        <FileSignature size={18} />
                      </div>
                      <div className="text-left md:text-center">
                        <p className="font-bold text-sm text-slate-900">
                          Signature
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(selectedLease.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Entrée */}
                    <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-blue-50">
                        <UserCheck size={18} />
                      </div>
                      <div className="text-left md:text-center">
                        <p className="font-bold text-sm text-primary">Entrée</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(selectedLease.start_date)}
                        </p>
                      </div>
                    </div>

                    {/* Fin */}
                    <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white">
                        <Clock size={18} />
                      </div>
                      <div className="text-left md:text-center">
                        <p className="font-bold text-sm text-slate-400">
                          Fin / Renouvellement
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedLease.end_date
                            ? formatDate(selectedLease.end_date)
                            : 'Sans date de fin'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Grille infos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Conditions financières */}
                <Card title="Conditions Financières">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <DollarSign size={18} />
                        </div>
                        <span className="text-slate-600 font-medium">
                          Loyer Mensuel
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {selectedLease.rent_amount} FCFA
                      </span>
                    </div>

                    {/* À adapter si tu ajoutes charges_amount à l’API */}
                    {/* <div className="flex justify-between items-center py-3 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                          <Calendar size={18} />
                        </div>
                        <span className="text-slate-600 font-medium">
                          Charges (Provision)
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {selectedLease.charges_amount ?? '—'} FCFA
                      </span>
                    </div> */}

                    <div className="flex justify-between items-center py-3 bg-slate-50 px-3 rounded-lg">
                      <span className="text-slate-800 font-bold">
                        Type de bail
                      </span>
                      <span className="font-bold text-primary text-sm uppercase">
                        {selectedLease.type}
                      </span>
                    </div>

                    {/* Dépôt / garantie si tu l’utilises */}
                    {/* <div className="flex justify-between items-center py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <Shield size={18} />
                        </div>
                        <span className="text-slate-600 font-medium">
                          Dépôt de garantie
                        </span>
                      </div>
                      <Badge variant="success">
                        {selectedLease.deposit
                          ? `Payé (${selectedLease.deposit} FCFA)`
                          : 'Non renseigné'}
                      </Badge>
                    </div> */}
                  </div>
                </Card>

                {/* Informations complémentaires */}
                <Card title="Informations Complémentaires">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          Période
                        </p>
                        <p className="text-slate-500 text-xs">
                          Du {formatDate(selectedLease.start_date)} au{' '}
                          {selectedLease.end_date
                            ? formatDate(selectedLease.end_date)
                            : 'date de fin non définie'}
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          Statut
                        </p>
                        <p className="text-slate-500 text-xs">
                          {getStatusLabel(selectedLease.status)}
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          Conditions particulières
                        </p>
                        <p className="text-slate-500 text-xs">
                          {/* terms peut être une string ou un tableau selon ton backend */}
                          {Array.isArray((selectedLease as any).terms)
                            ? (selectedLease as any).terms.join(' • ')
                            : selectedLease.terms || 'Aucune condition ajoutée'}
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

