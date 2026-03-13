// src/pages/Proprietaire/components/QuittancesLoyers.tsx
import { useState, useEffect } from "react";
import { Plus, Check, Search, FileText, TrendingUp, Clock, Wallet } from "lucide-react";
import setting from "@/assets/Settings.png";
import monIcone from "@/assets/downloadIcon.svg";
import sucette from "@/assets/SuccetteIcon.svg";
import sablier from "@/assets/sablier.png";
import Eye from "@/assets/oeil.png";
import Mail from "@/assets/e-mail.png";
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
import { invoiceService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

export default function QuittancesLoyers() {
  const [quittances, setQuittances] = useState<any[]>([]);
  const [stats, setStats] = useState({
    envoyees: 0,
    ceMois: 0,
    enAttente: 0,
    totalEncaisse: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterBien, setFilterBien] = useState("Tous les biens");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.listInvoices();
      const paidInvoices = (data || []).filter(
        (inv: any) => inv.type === "rent" && inv.status === "paid"
      );

      let total = 0;
      const mapped = paidInvoices.map((inv: any) => {
        const amount = parseFloat(inv.amount_total || 0);
        total += amount;
        return {
          id: inv.id,
          mois: inv.period_start
            ? new Date(inv.period_start).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })
            : "—",
          locataire: inv.lease?.tenant
            ? `${inv.lease.tenant.first_name || ""} ${inv.lease.tenant.last_name || ""}`.trim()
            : "Inconnu",
          ville: inv.lease?.property?.city || "-",
          loyer: parseFloat(inv.amount_rent || 0),
          charges: parseFloat(inv.amount_charges || 0),
          total: amount,
          statut: "envoyé",
          date_envoi: new Date(inv.created_at).toLocaleDateString("fr-FR"),
          bien:
            inv.lease?.property?.name ||
            inv.lease?.property?.address ||
            "Bien inconnu",
          date_paiement: inv.paid_at
            ? new Date(inv.paid_at).toLocaleDateString("fr-FR")
            : "Non renseigné",
        };
      });

      setQuittances(mapped);
      setStats({
        envoyees: mapped.length,
        ceMois: mapped.filter((q: any) => {
          const d = new Date();
          return q.mois
            .toLowerCase()
            .includes(
              d.toLocaleDateString("fr-FR", { month: "long" }).toLowerCase()
            );
        }).length,
        enAttente: 0,
        totalEncaisse: total,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les quittances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cardAnimationStyle = (index: number) => ({
    animation: loading
      ? "none"
      : `slideInUp 0.6s ease-out ${index * 0.1}s both`,
  });

  const filtered = quittances.filter((q) => {
    const matchStatut =
      filterStatut === "Tous" || q.statut === filterStatut;
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
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <div className="space-y-6 p-4 md:p-6">

        {/* ── Header ── */}
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${loading ? "opacity-50" : "opacity-100"
            } transition-opacity duration-500`}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Quittances de loyers
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Gérez et générez vos quittances de loyer après réception des paiements.
            </p>
          </div>

          <Button className="bg-primary-light hover:bg-primary-deep" size="default">
            <Plus className="h-4 w-4 mr-2 text-purple-600" />
            Créer une quittance de loyer
          </Button>
        </div>

        {/* ── Stats cards ── */}
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${loading ? "opacity-50" : "opacity-100"} transition-opacity duration-500`}>
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4 h-24 animate-pulse"></div>
            ))
          ) : (
            <>
              <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0">
                    <FileText size={19} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-semibold">Quittances émises</p>
                    <p className="text-lg font-bold text-gray-900">{stats.envoyees}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <TrendingUp size={19} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold">Ce mois-ci</p>
                    <p className="text-lg font-bold text-gray-900">{stats.ceMois}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                    <Clock size={19} />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-semibold">En attente d'envoi</p>
                    <p className="text-lg font-bold text-gray-900">{stats.enAttente}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shrink-0">
                    <Wallet size={19} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-semibold">Total encaissé</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalEncaisse)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Filtres ── */}
        <div className={loading ? "opacity-50 pointer-events-none" : "opacity-100"}>
          <div className="flex flex-wrap gap-2">
            {["Tous", "À envoyer", "En attente", "Par an"].map((s) => (
              <Button
                key={s}
                variant={filterStatut === s ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatut(s)}
                className={filterStatut === s ? "bg-primary-light hover:bg-primary-deep" : ""}
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="bg-transparent rounded-xl shadow-lg p-6 border border-gray-400 mt-4">
            <div className="w-full">
              <h4 className="text-xl md:text-2xl font-medium uppercase tracking-tight leading-relaxed">
                Filtrer par bien
              </h4>
              <Select value={filterBien} onValueChange={setFilterBien}>
                <SelectTrigger className="w-full text-center border-primary-light focus:ring-primary-light bg-white">
                  <SelectValue className="text-gray-500" placeholder="Tous les biens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous les biens">Tous les biens</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher locataire, bien, mois..."
                  className="pl-9 border-primary-light focus:ring-primary-light bg-white"
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

        {/* ── Liste / Grille ── */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden shadow-sm animate-pulse-gentle">
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
            : filtered.length === 0
              ? (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <p className="text-lg font-semibold">Aucune quittance trouvée</p>
                  <p className="text-sm mt-1">Modifiez vos filtres ou ajoutez des paiements reçus.</p>
                </div>
              )
              : filtered.map((q, index) => {
                const isEnvoye = q.statut === "envoyé";
                const bgColor = isEnvoye ? "bg-green-100" : "bg-orange-100";
                const borderColor = isEnvoye ? "border-green-100" : "border-orange-100";
                const iconColor = isEnvoye ? "text-green-600" : "text-orange-600";
                const variantBadge = isEnvoye ? "success" : "warning";
                const statusText = isEnvoye
                  ? `ENVOYÉE LE ${q.date_envoi?.toUpperCase() || ""}`
                  : "EN ATTENTE D'ENVOI";

                return (
                  <Card
                    key={q.id}
                    className="overflow-hidden shadow-sm"
                    style={cardAnimationStyle(index)}
                  >
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className={`flex items-center font-bold border ${borderColor} ${bgColor} rounded-sm w-fit`}>
                        {isEnvoye ? (
                          <Check className={`h-4 w-4 ${iconColor}`} />
                        ) : (
                          <img src={sablier} alt="Sablier" className="h-4 w-4" />
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
                          <img src={sucette} alt="Succette" className="h-4 w-4" />
                          {q.locataire} - {q.ville}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 text-xs gap-x-4 gap-y-1">
                        <div className="text-xs uppercase font-bold text-gray-500">Période</div>
                        <div className="text-xs uppercase font-bold text-gray-500">Paiement reçu</div>
                        <div className="font-bold">{q.mois}</div>
                        <div className="font-bold">{q.date_paiement}</div>
                      </div>

                      <div className="grid grid-cols-2 text-xs gap-x-4 gap-y-1">
                        <div className="text-xs uppercase font-bold text-gray-500">Loyer</div>
                        <div className="text-xs uppercase font-bold text-gray-500">Charges</div>
                        <div className="font-bold">{formatCurrency(q.loyer)}</div>
                        <div className="font-bold">{formatCurrency(q.charges)}</div>
                      </div>

                      <div>
                        <div className="text-xs uppercase text-gray-500 font-bold">Total payé</div>
                        <div className="text-base font-bold text-green-600">
                          {formatCurrency(q.total)}
                        </div>
                      </div>

                      <hr className="my-3 border-gray-200" />

                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-gray-500">
                          Créé le {q.date_envoi}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            <img src={Eye} alt="Voir" className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            <img src={monIcone} alt="Télécharger" className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            <img src={Mail} alt="Envoyer par mail" className="h-5 w-5" />
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
