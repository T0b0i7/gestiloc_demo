// 📁 DocumentsManager.tsx - VERSION MOCK (Prête pour intégration API)
import { useState } from "react";
import monIcone from "@/assets/downloadIcon.svg";
import pencil from "@/assets/pencilIcon.svg";
import moreVertical from "@/assets/more-vertical.svg";
import setting from "@/assets/Settings.png";
import sucette from "@/assets/SuccetteIcon.svg";
import sablier from "@/assets/sablier.png";
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  FileText,
  Loader2,
  Settings,
  MoreVertical,
  Pencil,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// ────────────────────────────────────────────────
// 🎭 TYPES - À CONSERVER POUR L'INTÉGRATION API
// ────────────────────────────────────────────────
type DocumentContrat = {
  id: string;
  titre: string;
  locataire: string;
  bien: string;
  loyer: number;
  depot: number | null;
  debut: string;
  fin: string | null;
  statut: "active" | "terminated" | "pending";
  creeLe: string;
  uuid?: string; // ✅ Pour le téléchargement (plus tard)
  type?: string; // ✅ Type de bail
};

// ────────────────────────────────────────────────
// 📦 DONNÉES MOCK - À REMPLACER PAR API PLUS TARD
// ────────────────────────────────────────────────
const MOCK_DOCUMENTS: DocumentContrat[] = [
  {
    id: "lease-1",
    titre: "Contrat - Mons Athys",
    locataire: "Mons Athys",
    bien: "Appartement 02 - Aglaia",
    loyer: 60000,
    depot: 120000,
    debut: "2026-01-01",
    fin: "2026-12-31",
    statut: "active",
    creeLe: "Créé le 28/12/2025",
    uuid: "550e8400-e29b-41d4-a716-446655440000",
    type: "Bail d'habitation nu",
  },
  {
    id: "lease-2",
    titre: "Contrat - Sophie Bernard",
    locataire: "Sophie Bernard",
    bien: "Villa moderne - Fidjrossè",
    loyer: 150000,
    depot: 300000,
    debut: "2026-01-15",
    fin: "2027-02-14",
    statut: "active",
    creeLe: "Créé le 10/02/2026",
    uuid: "660e8400-e29b-41d4-a716-446655440001",
    type: "Bail meublé",
  },
  {
    id: "lease-3",
    titre: "Contrat - Jean-Pierre Kouassi",
    locataire: "Jean-Pierre Kouassi",
    bien: "Appartement 8 - Akpakpa",
    loyer: 50000,
    depot: 100000,
    debut: "2026-01-01",
    fin: "2027-02-28",
    statut: "pending",
    creeLe: "Créé le 04/02/2026",
    uuid: "770e8400-e29b-41d4-a716-446655440002",
    type: "Bail d'habitation nu",
  },
];

// ────────────────────────────────────────────────
// 🎯 COMPOSANT PRINCIPAL - 100% MOCK
// ────────────────────────────────────────────────
interface DocumentsManagerProps {
  notify?: (msg: string, type: "success" | "info" | "error") => void;
}

export const DocumentsManager = ({
  notify = console.log,
}: DocumentsManagerProps) => {
  //ÉTATS LOCAUX
  const [documents] = useState<DocumentContrat[]>(MOCK_DOCUMENTS); // ✅ Mock statique
  const [search, setSearch] = useState("");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [loading, setLoading] = useState(false); // ✅ Pas de chargement (mock)
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>(
    {},
  );

  // FILTRES (Fonctionnels immédiatement)
  const filteredDocuments = documents.filter((doc) => {
    // Filtre recherche textuelle
    const matchesSearch =
      !search ||
      doc.titre.toLowerCase().includes(search.toLowerCase()) ||
      doc.locataire.toLowerCase().includes(search.toLowerCase()) ||
      doc.bien.toLowerCase().includes(search.toLowerCase());

    // Filtre par bien (simplifié pour le mock)
    const matchesBien =
      filterBien === "Tous les biens" || doc.bien.includes(filterBien);

    return matchesSearch && matchesBien;
  });

  // LISTE UNIQUE DES BIENS POUR LE FILTRE

  const biensList = [
    "Tous les biens",
    ...new Set(documents.map((d) => d.bien)),
  ];

  //  SIMULATION TÉLÉCHARGEMENT
  const handleDownload = async (doc: DocumentContrat) => {
    // ⚠️ SIMULATION - À REMPLACER PAR VRAI APPEL API
    setDownloadingIds((prev) => ({ ...prev, [doc.id]: true }));

    // Simule un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 1500));

    notify(`📥 Téléchargement simulé : ${doc.titre}`, "success");
    console.log("🔵 SIMULATION - Téléchargement du contrat:", {
      id: doc.id,
      uuid: doc.uuid,
      nom: doc.titre,
    });

    setDownloadingIds((prev) => ({ ...prev, [doc.id]: false }));
  };

  //  SIMULATION RAFRAÎCHISSEMENT

  const handleRefresh = () => {
    setLoading(true);
    notify("🔄 Actualisation simulée...", "info");

    setTimeout(() => {
      setLoading(false);
      notify("✅ Données actualisées (mock)", "success");
    }, 1000);
  };

  //  FORMATAGE DATE
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // TRADUCTION STATUT

  const getStatusLabel = (statut: DocumentContrat["statut"]) => {
    switch (statut) {
      case "active":
        return "✓ Actif";
      case "terminated":
        return "✗ Terminé";
      case "pending":
        return "⏳ En attente de signature";
      default:
        return statut;
    }
  };

  const getStatusClass = (statut: DocumentContrat["statut"]) => {
    switch (statut) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "terminated":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // RENDU PRINCIPAL
  return (
    <div className="space-y-6 p-2 md:p-3 lg:p-4 w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrats de bail</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Générez automatiquement vos contrats de bail personnalisés en
            quelques clics.
            <br />
            Documents conformes et prêts à signer.
          </p>
        </div>

        {/* BOUTON CRÉATION - UI uniquement */}
        <Button className="bg-primary-light hover:bg-primary-deep">
          <Plus className="h-4 w-4 text-purple-700" />
          Contrat de bail
        </Button>
      </div>

      {/*  FILTRES ET RECHERCHE */}
      <div className=" bg-transparent rounded-xl shadow-lg p-4 md:p-6 border border-gray-400 mt-4">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl font-medium uppercase tracking-tight leading-relaxed">
            Filtrer par bien{" "}
          </h4>
          <Select value={filterBien} onValueChange={setFilterBien}>
            <SelectTrigger className="w-full text-center border-primary-light focus:ring-primary-light bg-white">
              <SelectValue
                className="text-gray-500"
                placeholder="Tous les biens"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous les biens">Tous les biens</SelectItem>
              {/* À remplacer par vraie liste */}
              <SelectItem value="Résidence du Parc">
                Résidence du Parc
              </SelectItem>
              <SelectItem value="Villa bleue">Villa bleue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center gap-2 ">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />
            <Input
              placeholder="Rechercher locataire, bien, mois..."
              className="pl-9  border-primary-light focus:ring-primary-light bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button className="bg-slate-100 text-black font-normal shrink-0 border-2 border-primary-light">
            <img src={setting} alt="Settings" className="h-6 w-6 mr-2" />
            Affichage
          </Button>
        </div>
      </div>

      {/*  COMPTEUR RÉSULTATS */}
      <div className="text-sm text-gray-500">
        {filteredDocuments.length} contrat
        {filteredDocuments.length > 1 ? "s" : ""} trouvé
        {filteredDocuments.length > 1 ? "s" : ""}
      </div>

      {/*  ÉTAT DE CHARGEMENT SIMULÉ */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Actualisation...</span>
        </div>
      ) : (
        <>
          {/*  ÉTAT VIDE */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Aucun contrat trouvé
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Aucun contrat ne correspond à votre recherche. Essayez de
                modifier vos filtres ou créez un nouveau contrat.
              </p>
              <Button className="mt-6 bg-green-600 hover:bg-green-700 gap-2">
                <Plus className="h-4 w-4" />
                Nouveau contrat
              </Button>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 border border-gray-50 rounded-sm bg-gray-50 ">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="overflow-hidden bg-[#f8fafc] border border-[#e2e8f0] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-200"
              >
                {/* En-tête */}
                <div className="bg-[#F0FDF4] px-5 py-4 w-full">
                  <div className="space-y-1.5">
                    <p className="text-xs font-extrabold uppercase text-gray-500">
                      {doc.type}
                    </p>
                    <h3 className="text-base font-bold">{doc.titre}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                      <span className="text-emerald-600 text-lg leading-none">
                        <img src={sucette} alt="Succette" className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{doc.bien}</span>
                    </p>
                  </div>
                </div>
                <CardContent className="space-y-4 p-5 bg-white">
                  {/* Loyer + Dépôt */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <div className="text-xs uppercase font-medium tracking-wide text-gray-500 mb-0.5">
                        Loyer mensuel
                      </div>
                      <div className="font-semibold text-gray-900">
                        {doc.loyer.toLocaleString("fr-FR")} FCFA
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-medium tracking-wide text-gray-500 mb-0.5">
                        Dépôt de garantie
                      </div>
                      <div className="font-semibold text-gray-900">
                        {doc.depot?.toLocaleString("fr-FR") || "—"} FCFA
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <div className="text-xs uppercase font-medium tracking-wide text-gray-500 mb-0.5">
                        Date de début
                      </div>
                      <div className="font-medium text-gray-800">
                        {formatDate(doc.debut)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-medium tracking-wide text-gray-500 mb-0.5">
                        Date de fin
                      </div>
                      <div className="font-medium text-gray-800">
                        {formatDate(doc.fin)}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      doc.statut === "active"
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 px-3 py-1 text-sm font-medium"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100 px-3 py-1 text-sm font-medium flex items-center gap-1.5"
                    }
                  >
                    {doc.statut === "active" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Actif
                      </>
                    ) : (
                      <>
                        <img
                          src={sablier}
                          alt="Sablier"
                          className="h-4 w-4 mt-2"
                        />
                        En attente de signature
                      </>
                    )}
                  </Badge>
                </CardContent>
                <CardFooter className="h-auto px-5 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  {/* Statut + actions + créé le */}
                  <p className="text-xs font-bold text-gray-400">
                    {doc.creeLe}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingIds[doc.id]}
                    >
                      {downloadingIds[doc.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <img
                          src={monIcone}
                          alt="Télécharger"
                          className="h-5 w-5"
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                    >
                      <img src={pencil} alt="Modifier" className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <img
                        src={moreVertical}
                        alt="Plus d'options"
                        className="h-5 w-5"
                      />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
