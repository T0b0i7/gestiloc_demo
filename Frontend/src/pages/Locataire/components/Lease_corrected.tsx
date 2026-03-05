import React, { useState, useEffect, useRef } from 'react';
import { FileSignature, Calendar, DollarSign, Download, Home, MapPin, Ruler, Shield, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import tenantApi, { TenantLease } from '../services/tenantApi';
import { formatDate, formatCurrency } from '@/lib/utils';

interface LeaseProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Lease: React.FC<LeaseProps> = ({ notify }) => {
  const [lease, setLease] = useState<TenantLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  
  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      if (!isMounted.current) return;
      
      try {
        console.log('Début du chargement des données...');
        setLoading(true);
        setError(null);
        
        const leases = await tenantApi.getLeases();
        
        if (!isMounted.current) return;
        
        console.log('Baux reçus:', leases);
        
        if (leases && leases.length > 0) {
          console.log('Baux trouvés :', leases.length);
          setLease(leases[0]);
        } else {
          console.log('Aucun bail trouvé');
          const errorMsg = 'Aucun bail trouvé pour votre compte.';
          setError(errorMsg);
          notify(errorMsg, 'info');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du bail:', err);
        if (isMounted.current) {
          const errorMsg = 'Impossible de charger les informations du bail.';
          setError(errorMsg);
          notify(errorMsg, 'error');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted.current = false;
    };
  }, [notify]);

  const handleDownload = async () => {
    if (!lease) return;
    
    try {
      // Télécharger le PDF du contrat de bail
      const pdfBlob = await tenantApi.downloadLeaseContract(lease.uuid);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bail-${lease.property?.address?.replace(/\s+/g, '-').toLowerCase() || 'bail'}-${new Date().toISOString().split('T')[0]}.pdf`;
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="text-gray-600">Chargement des informations du bail...</span>
        <p className="text-sm text-gray-500">Veuillez patienter</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur de chargement</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun bail trouvé pour votre compte.</p>
      </div>
    );
  }
      
  // Rendu principal du composant
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mon Bail</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      {/* Informations principales */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du bien</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Home className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">
                    {lease.property?.address || 'Non spécifiée'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Ville</p>
                  <p className="font-medium">
                    {lease.property?.city || 'Non spécifiée'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Ruler className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Surface</p>
                  <p className="font-medium">
                    {lease.property?.surface ? `${lease.property.surface} m²` : 'Non spécifiée'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du bail</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FileSignature className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Référence</p>
                  <p className="font-medium">{lease.uuid || 'Non spécifiée'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Début du bail</p>
                  <p className="font-medium">
                    {lease.start_date ? formatDate(lease.start_date) : 'Non spécifié'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Loyer mensuel</p>
                  <p className="font-medium">
                    {lease.rent_amount ? formatCurrency(lease.rent_amount) : 'Non spécifié'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents associés */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileSignature className="h-5 w-5 text-gray-400 mr-3" />
              <span>Contrat de bail</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <span>État des lieux d'entrée</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => {}}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
