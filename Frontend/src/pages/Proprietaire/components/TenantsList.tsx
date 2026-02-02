import React, { useEffect, useState } from "react";
import { Plus, Search, Settings, Users, Trash2, MoreVertical, Mail, Phone, Clock, RefreshCw, Eye, Edit, UserCheck, UserX, Filter, ChevronDown, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { tenantService, TenantApi, TenantIndexResponse } from "@/services/api";

interface Locataire {
  id: string;
  nom: string;
  type: string;
  bien: string;
  telephone: string;
  email: string;
  solde: number;
  etat: "actif" | "inactif" | "suspendu" | "invited";
  modeles: string[];
  is_invited?: boolean;
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
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  // ============================
  // Mapper TenantApi vers Locataire UI
  // ============================
  const mapTenantApiToLocataire = (tenant: TenantApi): Locataire => {
    const nom = [tenant.first_name, tenant.last_name].filter(Boolean).join(" ") || tenant.email || "Locataire sans nom";

    const bien = tenant.property
      ? `${tenant.property.name ?? "Bien"} – ${tenant.property.address}${tenant.property.city ? ` (${tenant.property.city})` : ""}`
      : "Aucun bien assigné";

    let etat: Locataire["etat"] = "actif";
    if (tenant.status === "invited" || tenant.is_invited) {
      etat = "invited";
    } else if (tenant.status === "inactive") {
      etat = "inactif";
    } else if (tenant.status === "suspended") {
      etat = "suspendu";
    }

    return {
      id: String(tenant.id),
      nom,
      type: "Personne physique",
      bien,
      telephone: tenant.phone || "Non renseigné",
      email: tenant.email || "Email non fourni",
      solde: 0,
      etat,
      modeles: [],
      is_invited: tenant.is_invited,
    };
  };

  // ============================
  // FETCH tenants API
  // ============================
  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const res: TenantIndexResponse = await tenantService.listTenants();
      const mapped = (res.tenants || []).map(mapTenantApiToLocataire);
      setLocataires(mapped);
    } catch (err: any) {
      const message = err?.message || "Impossible de charger les locataires";
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // ============================
  // Filters
  // ============================
  const filteredLocataires = locataires.filter((locataire) => {
    const matchesSearch =
      locataire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locataire.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBien = filterBien === "Tous les biens" || locataire.bien.includes(filterBien);
    const matchesTab = activeTab === "actifs" ? true : false;

    return matchesSearch && matchesBien && matchesTab;
  });

  // ============================
  // Styling helpers
  // ============================
  const getEtatColor = (etat: string) => {
    switch (etat) {
      case "actif":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "invited":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "inactif":
        return "bg-slate-50 text-slate-600 border border-slate-100";
      case "suspendu":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  const getEtatIcon = (etat: string) => {
    switch (etat) {
      case "actif":
        return <UserCheck size={12} className="mr-1.5" />;
      case "invited":
        return <Clock size={12} className="mr-1.5" />;
      case "inactif":
        return <UserX size={12} className="mr-1.5" />;
      default:
        return null;
    }
  };

  const getSoldeColor = (solde: number) => {
    if (solde > 0) return "text-emerald-600 font-semibold";
    if (solde < 0) return "text-rose-600 font-semibold";
    return "text-slate-500";
  };

  const getSoldeBg = (solde: number) => {
    if (solde > 0) return "bg-emerald-50";
    if (solde < 0) return "bg-rose-50";
    return "bg-slate-50";
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

  const handleRefresh = () => {
    fetchTenants();
    notify("Liste actualisée", "success");
  };

  const handleViewDetails = (id: string) => {
    setSelectedTenant(selectedTenant === id ? null : id);
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <br />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Gestion des Locataires
          </h1>
          <p className="text-slate-500 text-sm md:text-base">Gérez vos locataires et leurs accès en toute simplicité</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            icon={<RefreshCw size={16} />}
            className="group hover:border-blue-500 transition-all duration-300"
          >
            <span className="group-hover:text-blue-600 transition-colors">Actualiser</span>
          </Button>
          <Button 
            variant="primary" 
            icon={<Plus size={16} />} 
            onClick={handleAddLocataire}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            Nouveau locataire
          </Button>
        </div>
      </div>

      {/* Premium notice */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="text-white font-bold">⭐</span>
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Passez à Premium</p>
            <p className="text-sm text-emerald-700">Compte illimité dès 4,90 FCFA/mois</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all"
        >
          Découvrir Premium
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("actifs")}
          className={`px-6 py-2.5 font-medium rounded-md transition-all duration-300 flex items-center gap-2 ${
            activeTab === "actifs" 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <UserCheck size={16} />
          <span>Actifs</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            activeTab === "actifs" ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"
          }`}>
            {filteredLocataires.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("archives")}
          className={`px-6 py-2.5 font-medium rounded-md transition-all duration-300 flex items-center gap-2 ${
            activeTab === "archives" 
              ? "bg-white text-slate-900 shadow-sm" 
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Archive size={16} />
          <span>Archives</span>
          <span className="px-2 py-0.5 text-xs bg-slate-200 text-slate-600 rounded-full">0</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-slate-200 hover:border-blue-300 transition-all duration-300 group hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 mb-1">Total locataires</div>
              <div className="text-2xl font-bold text-slate-900">{locataires.length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200 hover:border-emerald-300 transition-all duration-300 group hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 mb-1">Actifs</div>
              <div className="text-2xl font-bold text-emerald-600">{locataires.filter(l => l.etat === 'actif').length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <UserCheck className="text-emerald-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200 hover:border-amber-300 transition-all duration-300 group hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 mb-1">Invités</div>
              <div className="text-2xl font-bold text-amber-600">{locataires.filter(l => l.etat === 'invited').length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Clock className="text-amber-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border-slate-200 hover:border-slate-300 transition-all duration-300 group hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 mb-1">Inactifs</div>
              <div className="text-2xl font-bold text-slate-600">{locataires.filter(l => l.etat === 'inactif').length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
              <UserX className="text-slate-600" size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={filterBien}
                onChange={(e) => setFilterBien(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option>Tous les biens</option>
                {biensUniques.map((bien) => (
                  <option key={bien}>{bien}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              icon={<Settings size={16} />}
              className="px-4 py-3 border border-slate-300 hover:border-slate-400"
            >
              Affichage
            </Button>
          </div>
        </div>
      </Card>

      {/* TENANTS TABLE */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        {/* Loading */}
        {loading && (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <p className="text-slate-600 font-medium">Chargement des locataires...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-rose-500" size={24} />
            </div>
            <p className="text-slate-700 font-medium mb-2">Erreur de chargement</p>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchTenants}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredLocataires.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Locataire</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Bien</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Solde</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">État</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLocataires.map((locataire, index) => (
                  <tr 
                    key={locataire.id} 
                    className="hover:bg-slate-50 transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                          <span className="font-semibold text-blue-600">
                            {locataire.nom.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                            {locataire.nom}
                          </p>
                          {locataire.etat === 'invited' && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <Clock size={10} />
                              En attente d'acceptation
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{locataire.type}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <span className="text-sm text-slate-600 line-clamp-2">{locataire.bien}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <a 
                          href={`mailto:${locataire.email}`} 
                          className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 transition-colors group/link"
                        >
                          <Mail size={12} className="text-slate-400 group-hover/link:text-blue-500" />
                          <span className="truncate max-w-[150px]">{locataire.email}</span>
                        </a>
                        <a 
                          href={`tel:${locataire.telephone}`} 
                          className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 transition-colors group/link"
                        >
                          <Phone size={12} className="text-slate-400 group-hover/link:text-blue-500" />
                          {locataire.telephone}
                        </a>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${getSoldeBg(locataire.solde)}`}>
                        <span className={`text-sm font-medium ${getSoldeColor(locataire.solde)}`}>
                          {locataire.solde > 0 ? "+" : ""}
                          {locataire.solde.toLocaleString()} FCFA
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getEtatColor(locataire.etat)}`}>
                        {getEtatIcon(locataire.etat)}
                        {locataire.etat.charAt(0).toUpperCase() + locataire.etat.slice(1)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleViewDetails(locataire.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors group/btn"
                          title="Voir détails"
                        >
                          <Eye size={16} className="text-slate-500 group-hover/btn:text-blue-600" />
                        </button>
                        
                        <button 
                          onClick={() => handleEditLocataire(locataire.id)}
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors group/btn"
                          title="Modifier"
                        >
                          <Edit size={16} className="text-slate-500 group-hover/btn:text-blue-600" />
                        </button>
                        
                        {locataire.etat === 'invited' ? (
                          <button 
                            className="p-2 rounded-lg hover:bg-amber-50 transition-colors group/btn"
                            title="Relancer l'invitation"
                          >
                            <Mail size={16} className="text-amber-500 group-hover/btn:text-amber-600" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleInviteZoneMembre(locataire.email)}
                            className="p-2 rounded-lg hover:bg-emerald-50 transition-colors group/btn"
                            title="Inviter à la zone membres"
                          >
                            <Mail size={16} className="text-emerald-500 group-hover/btn:text-emerald-600" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleDeleteLocataire(locataire.id)}
                          className="p-2 rounded-lg hover:bg-rose-50 transition-colors group/btn"
                          title="Supprimer"
                        >
                          <Trash2 size={16} className="text-rose-500 group-hover/btn:text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredLocataires.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? "Aucun locataire trouvé" : "Commencez par inviter vos locataires"}
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? "Essayez de modifier vos critères de recherche ou vérifiez l'orthographe."
                : "Invitez vos locataires pour leur donner accès à leur espace personnel, documents, paiements et messages."
              }
            </p>
            <Button 
              variant="primary" 
              onClick={handleAddLocataire}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Plus size={16} className="mr-2" />
              Ajouter un locataire
            </Button>
          </div>
        )}
      </Card>

      {/* Zone membres */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Zone membres pour vos locataires</h3>
              <p className="text-sm text-slate-600">
                Invitez vos locataires pour accéder à leur espace personnel : documents, paiements, messages et plus.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
          >
            <ExternalLink size={16} className="mr-2" />
            Gérer la zone membres
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Composant Archive icon manquant
const Archive = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

// Composant AlertCircle icon manquant
const AlertCircle = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);