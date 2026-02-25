// src/pages/Locataire/Quittances.tsx    ← ou où tu veux la placer
import { useState, useEffect } from "react";
import {
  Plus,
  Download,
  FileText,
  Check,
  Search,
  Settings,
  ThumbsUp,
  Camera,
  MapPin,
  DownloadIcon,
  AlertCircle,
} from "lucide-react";
import setting from "@/assets/Settings.png";
import monIcone from "@/assets/downloadIcon.svg";
import sucette from "@/assets/SuccetteIcon.svg";
import sablier from "@/assets/sablier.png";
import Eye from "@/assets/oeil.png";
import Mail from "@/assets/e-mail.png"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/pages/Proprietaire/components/ui/Badge.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ────────────────────────────────────────────────
//  Types mock (à remplacer par tes vrais types plus tard)
// ────────────────────────────────────────────────
type Quittance = {
  id: number;
  mois: string; // "Février 2025"
  locataire: string;
  ville: string;
  bien: string;
  loyer: number;
  charges: number;
  total: number;
  statut: "envoyé" | "en attente d'envoi";
  date_envoi?: string;
  date_paiement?: string;
};

// ────────────────────────────────────────────────
//  Données mock – à remplacer par appel API
// ────────────────────────────────────────────────
const mockStats = {
  envoyees: 142,
  ceMois: 18,
  enAttente: 5,
  totalEncaisse: 45780,
};

const mockQuittances: Quittance[] = [
  {
    id: 1,
    mois: "Février 2025",
    locataire: "Jean-Pierre Nouailhat",
    ville: "La Rochelle",
    loyer: 950,
    charges: 110,
    total: 1060,
    statut: "envoyé",
    date_envoi: "31 janv. 2025",
    bien: "Résidence du Parc",
    date_paiement: "29 Janv 2025",
  },
  {
    id: 2,
    mois: "Février 2025",
    locataire: "Marie-Claire Dubois",
    ville: "Bordeaux",
    loyer: 1200,
    charges: 150,
    total: 1350,
    statut: "en attente d'envoi",
    date_envoi: "30 janv. 2025",
    bien: "Villa bleue",
    date_paiement: "28 Janv 2025",
  },
  {
    id: 3,
    mois: "Février 2025",
    locataire: "Philippe Martin",
    ville: "Paris",
    loyer: 1500,
    charges: 200,
    total: 1700,
    statut: "envoyé",
    date_envoi: "05 févr. 2025",
    bien: "Appartement Marais",
    date_paiement: "02 Févr 2025",
  },
  {
    id: 4,
    mois: "Février 2025",
    locataire: "Sophie Laurent",
    ville: "Lyon",
    loyer: 875,
    charges: 95,
    total: 970,
    statut: "en attente d'envoi",
    date_envoi: "02 févr. 2025",
    bien: "Studio Centre-ville",
    date_paiement: "01 Févr 2025",
  },
  {
    id: 5,
    mois: "Février 2025",
    locataire: "Luc Petit",
    ville: "Toulouse",
    loyer: 1100,
    charges: 130,
    total: 1230,
    statut: "envoyé",
    date_envoi: "29 janv. 2025",
    bien: "Maison Montagne",
    date_paiement: "26 Janv 2025",
  },
  {
    id: 6,
    mois: "Février 2025",
    locataire: "Isabelle Moreau",
    ville: "Marseille",
    loyer: 950,
    charges: 120,
    total: 1070,
    statut: "envoyé",
    date_envoi: "30 janv. 2025",
    bien: "Appartement Vieux-Port",
    date_paiement: "27 Janv 2025",
  },
];

// ────────────────────────────────────────────────
export default function QuittancesLoyers() {
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const error = null;

  // Simuler le chargement avec animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Style pour l'animation des cartes
  const cardAnimationStyle = (index: number) => ({
    animation: loading
      ? "none"
      : `slideInUp 0.6s ease-out ${index * 0.1}s both`,
  });

  const filtered = mockQuittances.filter((q) => {
    const matchStatut = filterStatut === "Tous" || q.statut === filterStatut;
    const matchBien =
      filterBien === "Tous les biens" || q.bien.includes(filterBien);
    const matchSearch =
      !search ||
      q.locataire.toLowerCase().includes(search.toLowerCase()) ||
      q.bien.toLowerCase().includes(search.toLowerCase()) ||
      q.mois.toLowerCase().includes(search.toLowerCase());
    return matchStatut && matchBien && matchSearch;
  });

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-gentle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${loading ? "opacity-50" : "opacity-100"
            } transition-opacity duration-500`}
        >
          <div>
            <h1 className="font-merriweather text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight md:leading-tight">
              Quittances de loyers
            </h1>
            <p className="p-leading pt-5">
              Gérez et générez vos quittances de loyer après réception des
              paiements. <br />
              Envoyez automatiquement les quittances à vos locataires.
            </p>
          </div>

          <Button className="bg-primary-light hover:bg-primary-deep" size="default">
            <Plus className="h-9 w-9 text-purple-600" />
            Créer une quittance de loyer
          </Button>
        </div>

        {/* Stats cards */}
        <div
          className={`grid gap-2 sm:grid-cols-2 lg:grid-cols-4 bg-secondary rounded-lg ${loading ? "opacity-50" : "opacity-100"
            } transition-opacity duration-500`}
        >
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <Card key={i} className="py-2">
                <CardHeader className="py-0">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="py-0">
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="py-2">
                <CardHeader className="py-0">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Quittances émises
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold">{mockStats.envoyees}</div>
                </CardContent>
              </Card>

              <Card className="py-2">
                <CardHeader className="py-0">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Ce mois-ci
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold text-primary">
                    {mockStats.ceMois}
                  </div>
                </CardContent>
              </Card>

              <Card className="py-2">
                <CardHeader className="py-0">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    En attente d'envoi
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl text-orange-500 font-bold">
                    {mockStats.enAttente}
                  </div>
                </CardContent>
              </Card>

              <Card className="py-2">
                <CardHeader className="py-0">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total encaissé
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold text-primary">
                    {mockStats.totalEncaisse.toLocaleString("fr-FR")} €
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filtres */}
        <div
          className={loading ? "opacity-50 pointer-events-none" : "opacity-100"}
        >
          <div className="flex flex-wrap gap-2">
            {["Tous", "À envoyer", "En attente", "Par an"].map((s) => (
              <Button
                key={s}
                variant={filterStatut === s ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatut(s)}
                className={
                  filterStatut === s ? "bg-primary-light hover:bg-primary-deep" : ""
                }
              >
                {s}
              </Button>
            ))}
          </div>

          <div className=" bg-transparent rounded-xl shadow-lg p-6 border border-gray-400 mt-4">
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

            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />
                <Input
                  placeholder="Rechercher locataire, bien, mois..."
                  className="pl-9  border-primary-light focus:ring-primary-light bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button className="bg-slate-100 text-black font-normal shrink-0 border-2 border-primary-light w-full sm:w-auto">
                <img src={setting} alt="Settings" className="h-6 w-6 mr-2" />
                Affichage
              </Button>
            </div>
          </div>
        </div>

        {/* Liste / Grille */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-gray-100">
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="overflow-hidden shadow-sm animate-pulse-gentle"
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))
            : filtered.map((q, index) => {
              const isEnvoye = q.statut === "envoyé";
              const bgColor = isEnvoye ? "bg-green-100" : "bg-orange-100";
              const borderColor = isEnvoye
                ? "border-green-100"
                : "border-orange-100";
              const iconColor = isEnvoye
                ? "text-green-600"
                : "text-orange-600";
              const variantBadge = isEnvoye ? "success" : "warning";
              const statusText = isEnvoye
                ? `ENVOYÉE LE ${q.date_envoi?.toUpperCase() || ""}`
                : "EN ATTENTE D'ENVOI";

              return (
                <Card
                  key={q.id}
                  className="overflow-hidden shadow-sm "
                  style={cardAnimationStyle(index)}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div
                      className={`flex items-center font-bold border ${borderColor} ${bgColor} rounded-sm w-fit`}
                    >
                      {isEnvoye ? (
                        <Check className={`h-4 w-4 ${iconColor}`} />
                      ) : (
                        <img
                          src={sablier}
                          alt="Sablier"
                          className="h-4 w-4 text-orange-500"
                        />
                      )}
                      <Badge variant={variantBadge}>{statusText}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 pb-4 pt-0 space-y-3">
                    <div>
                      <h3 className="text-base font-semibold">
                        Quittance {q.mois}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <img
                          src={sucette}
                          alt="Succette"
                          className="h-4 w-4"
                        />
                        {q.locataire} - {q.ville}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 text-xs gap-x-4 gap-y-1">
                      <div className="text-xs uppercase font-bold text-gray-500 ">
                        Période
                      </div>
                      <div className="text-xs uppercase font-bold text-gray-500 ">
                        Paiement reçu
                      </div>
                      <div className="font-bold">
                        {q.mois.split(" ")[0]} {q.mois.split(" ")[1]}
                      </div>
                      <div className="font-bold">{q.date_paiement}</div>
                    </div>

                    <div className="grid grid-cols-2 text-xs gap-x-4 gap-y-1">
                      <div className="text-xs uppercase font-bold text-gray-500 ">
                        Loyer
                      </div>
                      <div className="text-xs uppercase font-bold text-gray-500 ">
                        Charges
                      </div>
                      <div className="font-bold">
                        {q.loyer.toLocaleString("fr-FR")} €
                      </div>
                      <div className="font-bold">
                        {q.charges.toLocaleString("fr-FR")} €
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase text-gray-500 font-bold ">
                        Total payé
                      </div>
                      <div className="text-base font-bold text-green-600">
                        {q.total.toLocaleString("fr-FR")} €
                      </div>
                    </div>
                    <hr className="my-3 border-gray-200" />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <p className="pt-4 text-xs font-bold text-gray-500">
                        Créé le {q.date_envoi}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 "
                        >
                          <img src={Eye} alt="Voir" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 "
                        >
                          <img
                            src={monIcone}
                            alt="Télécharger"
                            className="h-4 w-4 text-emerald-500"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 "
                        >
                          <img
                            src={Mail}
                            alt="Envoyer par mail"
                            className="h-4 w-4 text-emerald-500"
                          />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </>
  );
}
