import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Plus, Eye, Download, Trash2 } from "lucide-react";
import { apiService, Invoice } from "@/services/api";

interface InvoicesListProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const InvoicesList: React.FC<InvoicesListProps> = ({ notify }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "rent" | "deposit" | "charge" | "repair"
  >("all");

  // Charger les factures
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.listInvoices();
        // S'assurer que c'est un tableau
        setInvoices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur lors du chargement des factures:", error);
        setInvoices([]);
        notify("Erreur lors du chargement des factures", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, [notify]);

  // Filtrer les factures
  const filteredInvoices =
    filter === "all" ? invoices : invoices.filter((inv) => inv.type === filter);

  // Mapper les types de factures
  const getInvoiceTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      rent: "Loyer",
      deposit: "Dépôt de garantie",
      charge: "Charge",
      repair: "Réparation",
    };
    return typeMap[type] || type;
  };

  // Formater la date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Formater le montant
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos factures émises
          </p>
        </div>
        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={() => navigate("/proprietaire/émettre-facture")}
        >
          <Plus size={20} />
          Nouvelle facture
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {(["all", "rent", "deposit", "charge", "repair"] as const).map(
          (type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === type
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "all"
                ? "Toutes les factures"
                : getInvoiceTypeLabel(type)}
            </button>
          ),
        )}
      </div>

      {/* Liste des factures */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <Card title="Aucune facture">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Aucune facture n'a été créée pour le moment.
            </p>
            <Button
              variant="default"
              className="inline-flex items-center gap-2"
              onClick={() => navigate("/proprietaire/émettre-facture")}
            >
              <Plus size={20} />
              Créer une facture
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Informations */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Facture #{invoice.id}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {getInvoiceTypeLabel(invoice.type)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Montant</p>
                        <p className="font-semibold text-gray-900">
                          {formatAmount(invoice.amount_total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date d'échéance</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(invoice.due_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">N° Location</p>
                        <p className="font-semibold text-gray-900">
                          {invoice.lease_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Statut</p>
                        <p className="font-semibold text-gray-900">Créée</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Eye size={18} />
                      <span className="hidden sm:inline">Voir</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                      <Download size={18} />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
