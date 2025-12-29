import React, { useEffect, useState } from "react";
import { Plus, Search, Settings, Users, Trash2, MoreVertical, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

// ⚠️ Adapter le chemin selon ton architecture projet
import { tenantService, TenantApi, TenantIndexResponse } from "@/services/api";

interface Locataire {
  id: string;
  nom: string;
  type: string;
  bien: string;
  telephone: string;
  email: string;
  solde: number;
  etat: "actif" | "inactif" | "suspendu";
  modeles: string[];
}

interface LocatairesProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

export const TenantsList: React.FC<LocatairesProps> = ({ notify }) => {
  const navigate = useNavigate();

  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"actifs" | "archives">("actifs");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [searchTerm, setSearchTerm] = useState("");
  const [linesPerPage, setLinesPerPage] = useState("100");

  // ============================
  // Mapper TenantApi vers Locataire UI
  // ============================
  const mapTenantApiToLocataire = (tenant: TenantApi): Locataire => {
    const nom = [tenant.first_name, tenant.last_name].filter(Boolean).join(" ") || tenant.email;

    const bien = tenant.property
      ? `${tenant.property.name ?? "Bien"} – ${tenant.property.address}${tenant.property.city ? ` (${tenant.property.city})` : ""}`
      : "Aucun bien assigné";

    return {
      id: String(tenant.id),
      nom,
      type: "Personne physique",
      bien,
      telephone: tenant.phone || "Non renseigné",
      email: tenant.email,
      solde: 0,
      etat: (tenant.status as Locataire["etat"]) || "actif",
      modeles: [],
    };
  };

  // ============================
  // FETCH tenants API
  // ============================
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);

        const res: TenantIndexResponse = await tenantService.listTenants();
        const mapped = (res.tenants || []).map(mapTenantApiToLocataire);

        setLocataires(mapped);
      } catch (err: any) {
        console.error("Erreur chargement locataires:", err);
        const message = err?.message || "Impossible de charger les locataires";
        setError(message);
        notify(message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================
  // Filters
  // ============================
  const filteredLocataires = locataires.filter((locataire) => {
    const matchesSearch =
      locataire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locataire.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBien = filterBien === "Tous les biens" || locataire.bien.includes(filterBien);

    // (tab archives pas branchée côté backend => on garde tel quel)
    const matchesTab = activeTab === "actifs" ? true : false;

    return matchesSearch && matchesBien && matchesTab;
  });

  // ============================
  // Styling helpers
  // ============================
  const getEtatColor = (etat: string) => {
    switch (etat) {
      case "actif":
        return "bg-green-100 text-green-800";
      case "inactif":
        return "bg-slate-100 text-slate-800";
      case "suspendu":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getEtatLabel = (etat: string) => {
    switch (etat) {
      case "actif":
        return "Actif";
      case "inactif":
        return "Inactif";
      case "suspendu":
        return "Suspendu";
      default:
        return "Inconnu";
    }
  };

  const getSoldeColor = (solde: number) => {
    if (solde > 0) return "text-green-600 font-medium";
    if (solde < 0) return "text-red-600 font-medium";
    return "text-slate-600";
  };

  const biensUniques = Array.from(new Set(locataires.map((l) => l.bien)));

  // ============================
  // Actions
  // ============================
  const handleAddLocataire = () => navigate("/proprietaire/ajouter-locataire");

  const handleDeleteLocataire = (id: string) => {
    notify("Suppression à venir côté backend", "info");
  };

  const handleEditLocataire = (id: string) => {
    notify('Fonction "Éditer" en développement', "info");
  };

  const handleInviteZoneMembre = (email: string) => {
    notify(`Fonction invitation en dev pour ${email}`, "info");
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Locataires</h1>
          <p className="text-slate-500 mt-1">Gérez vos locataires et leurs accès</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleAddLocataire}>
          Nouveau locataire
        </Button>
      </div>

      {/* Premium notice */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">⭐</span>
          <div>
            <p className="font-semibold text-green-900">Besoin d&apos;un compte illimité ?</p>
            <p className="text-sm text-green-700">Passer en premium dès 4,90FCFA/mois</p>
          </div>
        </div>
        <Button variant="secondary" size="sm">
          ACHETER PREMIUM
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("actifs")}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === "actifs" ? "text-green-600 border-b-2 border-green-600" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ✓ Actifs ({filteredLocataires.length})
        </button>

        <button
          onClick={() => setActiveTab("archives")}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === "archives" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📋 Archives (0)
        </button>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Filtrer <span className="text-slate-400 font-normal">Utilisez les options ci-dessous</span>
        </h3>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-600 block mb-2">Bien</label>
            <select
              value={filterBien}
              onChange={(e) => setFilterBien(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-blue-500"
            >
              <option>Tous les biens</option>
              {biensUniques.map((bien) => (
                <option key={bien}>{bien}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-xs font-medium text-slate-600 block mb-2">Lignes par page</label>
            <select
              value={linesPerPage}
              onChange={(e) => setLinesPerPage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
            >
              <option value="50">50 lignes</option>
              <option value="100">100 lignes</option>
              <option value="250">250 lignes</option>
              <option value="500">500 lignes</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500"
          />
        </div>
        <Button variant="ghost" size="sm" icon={<Settings size={16} />}>
          Affichage
        </Button>
      </div>

      {/* TENANTS TABLE */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
        {/* Loading */}
        {loading && <div className="p-8 text-center text-slate-600">Chargement des locataires...</div>}

        {/* Error */}
        {!loading && error && <div className="p-6 text-center text-red-600 font-medium">{error}</div>}

        {/* Table */}
        {!loading && !error && filteredLocataires.length > 0 && (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Locataire</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Bien</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Solde</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">État</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Modèles</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredLocataires.map((locataire) => (
                <tr key={locataire.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{locataire.nom}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{locataire.type}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{locataire.bien}</span>
                  </td>

                  <td className="px-6 py-4">
                    <a href={`tel:${locataire.telephone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <Phone size={14} />
                      {locataire.telephone}
                    </a>
                  </td>

                  <td className="px-6 py-4">
                    <a href={`mailto:${locataire.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <Mail size={14} />
                      {locataire.email}
                    </a>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-sm ${getSoldeColor(locataire.solde)}`}>
                      {locataire.solde > 0 ? "+" : ""}
                      {locataire.solde} FCFA
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getEtatColor(locataire.etat)}`}>
                      {getEtatLabel(locataire.etat)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{locataire.modeles.length} modèles</span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleInviteZoneMembre(locataire.email)} className="p-1.5 hover:bg-blue-50 rounded-lg" type="button">
                        <Mail size={16} className="text-blue-600" />
                      </button>

                      <button onClick={() => handleEditLocataire(locataire.id)} className="p-1.5 hover:bg-slate-100 rounded-lg" type="button">
                        <MoreVertical size={16} className="text-slate-400" />
                      </button>

                      <button onClick={() => handleDeleteLocataire(locataire.id)} className="p-1.5 hover:bg-red-50 rounded-lg" type="button">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Empty State */}
        {!loading && !error && filteredLocataires.length === 0 && (
          <div className="p-16 text-center">
            <Users size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun locataire trouvé</h3>
            <p className="text-slate-600 mb-6">Vous pouvez inviter vos locataires pour leur donner accès à la zone membres.</p>
            <Button variant="primary" onClick={handleAddLocataire}>
              Créer un locataire
            </Button>
          </div>
        )}
      </div>

      {/* Zone membres */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-2">💡 Zone membres</h3>
        <p className="text-sm text-slate-600">
          Invitez vos locataires pour accéder à leur espace personnel : documents, paiements, messages…
        </p>
      </Card>
    </div>
  );
};
