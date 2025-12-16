import React, { useEffect, useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { leaseService } from "@/services/api";
import { DownloadContractButton } from "@/components/shared/DownloadContractButton";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: "actif" | "archive";
  leaseData?: LeaseContract;
}

interface LeaseContract {
  id: number;
  uuid: string;
  property_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string | null;
  rent_amount: string;
  deposit: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  property?: {
    address: string;
    city: string;
    postal_code: string;
  };
  tenant?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

interface DocumentsManagerProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const DocumentsManager: React.FC<DocumentsManagerProps> = ({ notify }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeasesAsDocuments = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const leases = await leaseService.listLeases();

      const leaseDocuments: DocumentItem[] = (leases || []).map((lease: LeaseContract) => ({
        id: `lease-${lease.id}`,
        name: `Contrat de location - ${lease.property?.address || "Sans adresse"}`,
        type: "PDF",
        uploadDate: new Date(lease.created_at).toLocaleDateString("fr-FR"),
        size: "PDF",
        status: "actif",
        leaseData: lease,
      }));

      setDocuments(leaseDocuments);
      if (leaseDocuments.length > 0) {
        notify("Contrats chargés avec succès", "success");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des baux:", err);
      setError("Impossible de charger les contrats de location");
      notify("Erreur lors du chargement des contrats", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger au montage (tu peux enlever si tu veux charger uniquement au clic)
  useEffect(() => {
    fetchLeasesAsDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Préparer les données pour le téléchargement
  const getContractData = (lease: LeaseContract) => {
    return {
      landlord: {
        name: "Nom du propriétaire", // TODO: remplacer par les données réelles
        address: "Adresse du propriétaire",
        phone: "0123456789",
        email: "proprietaire@example.com",
        id_type: "Carte d'identité",
        id_number: "123456789",
      },
      tenant: {
        name:
          `${lease.tenant?.first_name || ""} ${lease.tenant?.last_name || ""}`.trim() ||
          "Locataire inconnu",
        address: "Adresse du locataire",
        phone: lease.tenant?.phone || "",
        email: lease.tenant?.email || "",
        id_type: "Carte d'identité",
        id_number: "987654321",
      },
      property: {
        address: lease.property?.address || "Adresse non spécifiée",
        floor: "1er étage",
        type: "Appartement",
        area: "75",
        rooms: "3",
        has_parking: true,
        equipment: ["Cuisine équipée", "Lave-vaisselle", "Télévision", "Meublé"],
      },
      contract: {
        start_date: new Date(lease.start_date).toISOString().split("T")[0],
        end_date: lease.end_date ? new Date(lease.end_date).toISOString().split("T")[0] : null,
        rent_amount: Number.parseFloat(lease.rent_amount) || 0,
        deposit_amount: lease.deposit ? Number.parseFloat(lease.deposit) : 0,
        included_charges: ["Eau", "Charges d'immeuble"],
        payment_frequency: "monthly",
        payment_method: "bank_transfer",
        notice_period: 1,
        duration: "12 mois",
      },
    };
  };

  const handleDeleteDoc = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    notify("Document retiré de la liste", "info");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchLeasesAsDocuments}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">Gérez vos documents importants</p>
        </div>

        <button
          onClick={fetchLeasesAsDocuments}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          Charger / Actualiser
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contrat trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouveau bail de location.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <FileText className="flex-shrink-0 h-10 w-10 text-primary" aria-hidden="true" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      <div className="text-sm text-gray-500">
                        {doc.type} • Ajouté le {doc.uploadDate}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    {doc.leaseData && (
                      <DownloadContractButton
                        contractData={getContractData(doc.leaseData)}
                        buttonText="Télécharger"
                        variant="outline"
                        size="sm"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
