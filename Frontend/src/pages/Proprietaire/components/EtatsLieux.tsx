// src/pages/Proprietaire/EtatsDesLieux.tsx
import { useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  Pencil,
  MoreVertical,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  Loader2,
  Check,
} from "lucide-react";
import sablier from "@/assets/sablier.png";
import monIcone from "@/assets/downloadIcon.svg";
import pencil from "@/assets/pencilIcon.svg";
import moreVertical from "@/assets/more-vertical.svg";
import Entry from "@/assets/EntryIcon.svg";
import Exit from "@/assets/ExitIcon.svg";
import setting from "@/assets/Settings.png";
import sucette from "@/assets/SuccetteIcon.svg";
import camera from "@/assets/camera.svg";
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
// Types mock (à adapter avec le backend réel)
type EtatLieu = {
  id: number;
  titre: string; // ex: "EDL - Sophie Bernard"
  type: "entrée" | "sortie";
  locataire: string;
  bien: string;
  date: string; // "15 Fév 2026"
  etatGeneral: "Très bon" | "Excellent" | "Bon" | "Correct";
  signe: boolean;
  photosCount: number;
  statut: "signé" | "en attente";
  creeLe: string; // "Créé le 14 Fév 2026"
};

// Données mock – à remplacer par appel API
const mockEtats: EtatLieu[] = [
  {
    id: 1,
    titre: "EDL - Mons Athys",
    type: "entrée",
    locataire: "Mons Athys",
    bien: "Appartement 12 - Agla",
    date: "28 Déc 2025",
    etatGeneral: "Très bon",
    signe: true,
    photosCount: 12,
    statut: "signé",
    creeLe: "Créé le 28 Déc 2025",
  },
  {
    id: 2,
    titre: "EDL - Sophie Bernard",
    type: "entrée",
    locataire: "Sophie Bernard",
    bien: "Villa moderne - Fidjrossè",
    date: "15 Fév 2026",
    etatGeneral: "Excellent",
    signe: true,
    photosCount: 18,
    statut: "signé",
    creeLe: "Créé le 14 Fév 2026",
  },
  {
    id: 3,
    titre: "EDL - Martin Dupont",
    type: "sortie",
    locataire: "Martin Dupont",
    bien: "Studio cosy - Centre-ville",
    date: "30 Jan 2026",
    etatGeneral: "Bon",
    signe: true,
    photosCount: 15,
    statut: "signé",
    creeLe: "Créé le 30 Jan 2026",
  },
  {
    id: 4,
    titre: "EDL - Jean-Pierre Kouassi",
    type: "entrée",
    locataire: "J-P Kouassi",
    bien: "Appartement 8 - Akpakpa",
    date: "01 Mar 2026",
    etatGeneral: "Très bon",
    signe: false,
    photosCount: 10,
    statut: "en attente",
    creeLe: "Créé le 28 Fév 2026",
  },
];

// ────────────────────────────────────────────────
export default function EtatsDesLieux() {
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Tous");

  const filtered = mockEtats.filter((e) => {
    const matchSearch =
      !search ||
      e.titre.toLowerCase().includes(search.toLowerCase()) ||
      e.locataire.toLowerCase().includes(search.toLowerCase()) ||
      e.bien.toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === "Tous" || e.type === filterType.toLowerCase();
    return matchSearch && matchType;
  });

  const filters = [
    { label: "Tous", icon: null },
    { label: "Entrée", icon: Entry },
    { label: "Sortie", icon: Exit },
  ];

  const [downloadingIds, setDownloadingIds] = useState<Record<number, boolean>>(
    {},
  );

  function handleDownload(e: EtatLieu): void {
    // Set loading state
    setDownloadingIds((prev) => ({ ...prev, [e.id]: true }));

    // Simulate PDF generation/download
    setTimeout(() => {
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        `data:text/plain;charset=utf-8,${encodeURIComponent(
          `État des lieux: ${e.titre}\nBien: ${e.bien}\nLocataire: ${e.locataire}\nDate: ${e.date}\nÉtat général: ${e.etatGeneral}\nPhotos: ${e.photosCount}`,
        )}`,
      );
      element.setAttribute(
        "download",
        `EDL_${e.titre.replace(/\s+/g, "_")}.txt`,
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      // Clear loading state
      setDownloadingIds((prev) => ({ ...prev, [e.id]: false }));
    }, 1000);
  }
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Etats des lieux</h1>
          <p className="text-muted-foreground font-sans mt-1 font-light">
            Documentez l’état de vos biens avec photos et descriptions
            détaillées.
            <br />
            Générez des PDF professionnels en quelques clics.
          </p>
        </div>

        <Button className="bg-primary-light hover:bg-primary-deep gap-2">
          <Plus className="h-3 w-3 text-purple-600" />
          Créer un nouvel état de lieu
        </Button>
      </div>

      {/* Filtres type */}
      <div className="flex flex-wrap gap-2 bg-slate-200 text-blue-500 w-fit p-2">
        {filters.map((filter) => (
          <Button
            key={`${filter.label}-${filter.icon}`}
            variant={filterType === filter.label ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(filter.label)}
            className={
              filterType === filter.label
                ? " bg-primary-light hover:bg-primary-deep"
                : ""
            }
          >
            <span className="flex items-center gap-2">
              {filter.icon && (
                <img src={filter.icon} alt={filter.label} className="h-4 w-4" />
              )}
              {filter.label}
            </span>
          </Button>
        ))}
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

      {/* Grille */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 bg-gray-50">
        {filtered.map((e) => (
          <Card
            key={`${e.id}-${e.type}`}
            className={`overflow-hidden bg-[#f8fafc] rounded-xl hover:shadow-md transition-shadow shadow-lg border-l-4 ${
              e.type === "entrée" ? "border-l-green-500" : "border-l-rose-700"
            }`}
          >
            <CardContent className="p-5 space-y-4">
              {/* En-tête */}
              <div className="space-y-1">
                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-0.5 ${
                    e.type === "entrée"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                      : "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                  }`}
                >
                  <img
                    src={monIcone}
                    alt="Télécharger"
                    className="h-4 w-4 inline mr-2"
                  />
                  {e.type === "entrée"
                    ? "ÉTAT DES LIEUX D’ENTRÉE"
                    : "ÉTAT DES LIEUX DE SORTIE"}
                </Badge>

                <h3 className="font-bold text-base mt-3">{e.titre}</h3>

                <p className="text-sm text-gray-500 flex items-center gap-1.5 font-light">
                  <span className="text-lg leading-none">
                    <img src={sucette} alt="Succette" className="h-4 w-4" />
                  </span>
                  {e.bien}
                </p>
              </div>
              <div className="mx-0 border-t-2 border-gray-300" />
              {/* Infos principales */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs uppercase font-semibold text-gray-500">
                    Locataire
                  </div>
                  <div className="font-medium">{e.locataire}</div>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-gray-500">
                    Date
                  </div>
                  <div className="font-medium">{e.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs uppercase font-semibold text-gray-500">
                    État général
                  </div>
                  <div className="font-medium">{e.etatGeneral}</div>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-gray-500">
                    Signé
                  </div>
                  <div className="flex items-center gap-1.5">
                    {e.signe ? (
                      <Check className="h-4 w-4 mt-2" />
                    ) : (
                      <img
                        src={sablier}
                        alt="Sablier"
                        className="h-4 w-4 mt-2"
                      />
                    )}
                    <span
                      className={
                        e.signe ? "mt-2 font-medium" : "font-medium mt-2"
                      }
                    >
                      {e.signe ? "Oui" : e.statut}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photos count */}
              <div className="flex items-center gap-2 text-sm bg-gray-100 px-1 py-2 text-gray-600">
                <img src={camera} alt="Camera" className="h-4 w-4" />
                <span className="text-black">{e.photosCount} photos</span>
              </div>
            </CardContent>
            {/* Footer */}
            <CardFooter className="bg-gray-50 flex items-center justify-between gap-2 flex-nowrap">
              {/* Statut + actions + créé le */}
              <p className="text-xs font-semibold text-gray-400">{e.creeLe}</p>
              <div className="flex shrink-0 w-fit">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => handleDownload(e)}
                  disabled={downloadingIds[e.id]}
                >
                  {downloadingIds[e.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <img src={monIcone} alt="Télécharger" className="h-5 w-5" />
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
    </div>
  );
}
