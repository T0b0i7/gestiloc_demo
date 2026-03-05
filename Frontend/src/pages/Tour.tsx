import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureMockup } from "@/components/tour/FeatureMockup";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  FileText,
  Calculator,
  TrendingUp,
  Landmark,
  BarChart3,
  ClipboardCheck,
  Wrench,
  MessageSquare,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Gestion des biens",
    description: "Centralisez tous vos biens immobiliers avec leurs caractéristiques détaillées : adresse, type, surface, équipements, charges...",
    benefits: [
      "Fiches biens complètes avec photos",
      "Historique des locations et travaux",
      "Documents associés (diagnostics, assurances)",
      "Suivi des équipements et maintenances",
    ],
    mockupType: 'properties' as const,
  },
  {
    icon: Users,
    title: "Dossiers locataires",
    description: "Gérez vos locataires et leurs dossiers en toute conformité avec la réglementation.",
    benefits: [
      "Coordonnées et pièces d'identité",
      "Informations sur les garants",
      "Historique de paiements",
      "Documents et attestations",
    ],
    mockupType: 'tenants' as const,
  },
  {
    icon: FileText,
    title: "Baux & annexes",
    description: "Créez des baux conformes à la loi avec tous les modèles nécessaires pré-remplis.",
    benefits: [
      "Modèles pour nu, meublé, parking, commercial",
      "Génération automatique depuis vos données",
      "État des lieux et inventaires intégrés",
      "Signature électronique disponible",
    ],
    mockupType: 'lease' as const,
  },
  {
    icon: Calculator,
    title: "Loyers & quittances",
    description: "Automatisez l'émission et le suivi de vos quittances de loyer.",
    benefits: [
      "Génération automatique mensuelle",
      "Envoi par email ou courrier",
      "Suivi des paiements et impayés",
      "Relances automatiques",
    ],
    mockupType: 'rent' as const,
  },
  {
    icon: TrendingUp,
    title: "Révision de loyer",
    description: "Calculez automatiquement les révisions annuelles avec les indices IRL ou ILC.",
    benefits: [
      "Calcul automatique selon l'indice",
      "Rappels avant la date de révision",
      "Historique des révisions",
      "Génération des courriers de notification",
    ],
    mockupType: 'revision' as const,
  },
  {
    icon: Landmark,
    title: "Synchronisation bancaire",
    description: "Connectez vos comptes bancaires et automatisez le rapprochement des loyers.",
    benefits: [
      "Récupération automatique des transactions",
      "Rapprochement intelligent des paiements",
      "Vision consolidée de votre trésorerie",
      "Alertes sur les écarts",
    ],
    mockupType: 'bank' as const,
  },
  {
    icon: BarChart3,
    title: "Comptabilité & fiscalité",
    description: "Suivez vos revenus et charges avec une comptabilité simplifiée.",
    benefits: [
      "Tableau de bord avec KPIs",
      "Rapports personnalisables",
      "Exports comptables (CSV, Excel, PDF)",
      "Préparation déclaration fiscale",
    ],
    mockupType: 'accounting' as const,
  },
  {
    icon: ClipboardCheck,
    title: "États des lieux",
    description: "Réalisez des états des lieux détaillés directement depuis votre smartphone.",
    benefits: [
      "Modèles structurés par pièce",
      "Photos et vidéos illimitées",
      "Relevés de compteurs",
      "Signature électronique",
    ],
    mockupType: 'inspection' as const,
  },
  {
    icon: Wrench,
    title: "Interventions & travaux",
    description: "Gérez les demandes d'intervention et suivez les travaux de A à Z.",
    benefits: [
      "Ticket d'intervention du locataire",
      "Attribution aux prestataires",
      "Suivi en temps réel",
      "Historique et coûts",
    ],
    mockupType: 'maintenance' as const,
  },
  {
    icon: MessageSquare,
    title: "Messagerie intégrée",
    description: "Communiquez facilement avec vos locataires et prestataires.",
    benefits: [
      "Conversations par bien ou locataire",
      "Notifications email et push",
      "Pièces jointes",
      "Historique conservé",
    ],
    mockupType: 'messaging' as const,
  },
  {
    icon: Calendar,
    title: "Location saisonnière",
    description: "Module dédié pour gérer vos locations de courte durée.",
    benefits: [
      "Calendrier de disponibilités",
      "Synchronisation iCal (Airbnb, Booking...)",
      "Tarifs variables selon saison",
      "Gestion des réservations",
    ],
    mockupType: 'seasonal' as const,
  },
];

export default function Tour() {
  return (
    <div className="pb-16">
      <section className="bg-background py-12 sm:py-16 md:py-24">
        <div className="container text-center">
          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-4 md:text-5xl text-primary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Toutes les fonctionnalités en détail
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg max-w-2xl mx-auto text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Découvrez comment GestiLoc simplifie chaque aspect de votre gestion locative
          </motion.p>
        </div>
      </section>

      <div className="container py-16">
        <div className="space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                className={`grid gap-12 lg:grid-cols-2 lg:gap-16 items-center ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  className={`space-y-6 ${isEven ? "" : "lg:order-2"}`}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h2 className="text-3xl font-bold">{feature.title}</h2>
                  </motion.div>
                  <motion.p
                    className="text-lg text-muted-foreground"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    {feature.description}
                  </motion.p>
                  <motion.ul
                    className="space-y-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.5 + index * 0.1,
                        },
                      },
                    }}
                  >
                    {feature.benefits.map((benefit, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-3"
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <motion.div
                          className="mt-1 h-5 w-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center"
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </motion.div>
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
                <motion.div
                  className={isEven ? "" : "lg:order-1"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <motion.div
                    className="aspect-video rounded-2xl overflow-hidden shadow-xl"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FeatureMockup type={feature.mockupType} />
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.section
        className="sticky bottom-0 border-t bg-background/95 backdrop-blur py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="container flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg">
              <Link to="/register">Essayer gratuitement</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
