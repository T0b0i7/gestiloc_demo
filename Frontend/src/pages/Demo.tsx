import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const kpis = [
  {
    title: "Loyers du mois",
    value: "12 450 FCFA",
    change: "+5.2%",
    trend: "up",
  },
  {
    title: "Impayés",
    value: "850 FCFA",
    change: "-12%",
    trend: "down",
  },
  {
    title: "Dépenses",
    value: "3 200 FCFA",
    change: "+8%",
    trend: "up",
  },
  {
    title: "Taux d'occupation",
    value: "96%",
    change: "+2%",
    trend: "up",
  },
];

const rents = [
  {
    tenant: "Marie Dubois",
    property: "45 Rue de la Paix, Paris",
    dueDate: "05/04/2024",
    amount: "1 250 FCFA",
    status: "paid",
  },
  {
    tenant: "Pierre Martin",
    property: "12 Avenue Victor Hugo, Lyon",
    dueDate: "01/04/2024",
    amount: "850 FCFA",
    status: "paid",
  },
  {
    tenant: "Sophie Laurent",
    property: "78 Boulevard Haussmann, Paris",
    dueDate: "10/04/2024",
    amount: "1 500 FCFA",
    status: "pending",
  },
  {
    tenant: "Jean Dupont",
    property: "5 Rue du Commerce, Marseille",
    dueDate: "28/03/2024",
    amount: "720 FCFA",
    status: "late",
  },
];

const tasks = [
  {
    title: "Révision de loyer - Appartement Lyon",
    date: "Dans 5 jours",
    priority: "high",
  },
  {
    title: "Régularisation charges - 45 Rue de la Paix",
    date: "Dans 12 jours",
    priority: "medium",
  },
  {
    title: "Renouvellement bail - Sophie Laurent",
    date: "Dans 30 jours",
    priority: "medium",
  },
];

export default function Demo() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GestiLoc
            </span>
            <Badge variant="secondary">Mode démo</Badge>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au site
            </Link>
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre portefeuille locatif
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription>{kpi.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-1 text-sm mt-1">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {kpi.change}
                  </span>
                  <span className="text-muted-foreground">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Loyers du mois</CardTitle>
              <CardDescription>Suivi des paiements en cours</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Locataire</TableHead>
                    <TableHead>Bien</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rents.map((rent, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rent.tenant}</TableCell>
                      <TableCell>{rent.property}</TableCell>
                      <TableCell>{rent.dueDate}</TableCell>
                      <TableCell>{rent.amount}</TableCell>
                      <TableCell>
                        {rent.status === "paid" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Payé
                          </Badge>
                        )}
                        {rent.status === "pending" && (
                          <Badge variant="secondary">En attente</Badge>
                        )}
                        {rent.status === "late" && (
                          <Badge variant="destructive">En retard</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tâches & rappels</CardTitle>
              <CardDescription>À faire prochainement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertCircle
                      className={`h-5 w-5 mt-0.5 shrink-0 ${
                        task.priority === "high"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground">{task.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">
                  Cette démo présente les fonctionnalités principales de GestiLoc
                </h3>
                <p className="text-sm text-muted-foreground">
                  Créez un compte gratuit pour accéder à toutes les fonctionnalités
                </p>
              </div>
              <Button asChild>
                <Link to="/register">Créer mon compte</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
