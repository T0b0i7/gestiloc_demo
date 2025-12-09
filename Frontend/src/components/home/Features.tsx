import {
  Shield,
  FileText,
  Receipt,
  TrendingUp,
  Calculator,
  Landmark,
  BarChart3,
  ClipboardCheck,
  Wrench,
  MessageSquare,
  FolderLock,
  Calendar,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useRef, useState } from "react";

/* -------------------------------------------
   Hook + wrapper d'animation scroll (bottom → top)
------------------------------------------- */

interface AnimatedItemProps {
  children: React.ReactNode;
  delay?: number; // en secondes
}

function AnimatedItem({ children, delay = 0 }: AnimatedItemProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------
   Données des features
------------------------------------------- */

const features = [
  {
    icon: Shield,
    title: "Compte sécurisé 24/7",
    description:
      "Accédez à vos données en toute sécurité, à tout moment, depuis n'importe quel appareil.",
  },
  {
    icon: FileText,
    title: "Modèles de baux pré-remplis",
    description:
      "Baux nus, meublés, commerciaux... Générez des contrats conformes à la législation béninoise.",
  },
  {
    icon: Receipt,
    title: "Quittances automatiques",
    description:
      "Générez et envoyez vos quittances sans effort, chaque mois, avec avis d'échéance.",
  },
  {
    icon: TrendingUp,
    title: "Révision de loyer",
    description:
      "Gérez les révisions annuelles de loyer avec rappels automatiques et historique complet.",
  },
  {
    icon: Calculator,
    title: "Régularisation des charges",
    description:
      "Répartissez et régularisez les charges entre locataires en toute transparence.",
  },
  {
    icon: Landmark,
    title: "Synchronisation bancaire",
    description:
      "Récupérez vos transactions et pointez vos loyers en quelques clics.",
  },
  {
    icon: BarChart3,
    title: "Comptabilité & exports",
    description:
      "Tableaux de bord, rapports détaillés et exports comptables (CSV, Excel, PDF).",
  },
  {
    icon: ClipboardCheck,
    title: "États des lieux & inventaires",
    description:
      "Créez des états des lieux détaillés avec photos, compteurs et signatures électroniques.",
  },
  {
    icon: Wrench,
    title: "Travaux & interventions",
    description:
      "Gérez les demandes d'interventions, suivez les travaux et communiquez avec les artisans.",
  },
  {
    icon: MessageSquare,
    title: "Messagerie & notifications",
    description:
      "Échangez avec vos locataires et recevez des notifications pour ne rien oublier.",
  },
  {
    icon: FolderLock,
    title: "Coffre-fort documents",
    description:
      "Stockez tous vos documents importants dans un espace sécurisé et accessible.",
  },
  {
    icon: Calendar,
    title: "Saisonnier & réservations",
    description:
      "Calendrier iCal, gestion des réservations et synchronisation multi-plateformes.",
  },
];

/* -------------------------------------------
   SVG principal "workflow" à droite du texte
------------------------------------------- */

function AssistIllustrationBlue() {
  return (
    <svg
      viewBox="0 0 480 260"
      className="w-full h-auto"
      role="img"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="480" height="260" rx="32" fill="#f7f8fa" />

      {/* écran */}
      <g
        transform="translate(180, 90)"
        fill="none"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="0" y="0" width="150" height="100" rx="10" fill="#ffffff" />
        <rect
          x="10"
          y="10"
          width="40"
          height="6"
          rx="3"
          fill="#e5e7eb"
          stroke="none"
        />
        <path d="M70 30 L84 58 L77 54 L73 66" />
        <path d="M105 72 L118 86 L112 86 L112 94" stroke="#1e40af" />
      </g>

      {/* flux */}
      <g
        fill="none"
        stroke="#020617"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M90 140 C130 140 150 140 180 130" />
        <path d="M178 130 L172 126 M178 130 L172 134" />
        <path d="M255 90 C280 60 310 50 340 60" />
        <path d="M338 60 L332 56 M338 60 L332 64" />
        <path d="M370 80 C400 105 410 125 410 145" />
        <path d="M410 145 L406 139 M410 145 L404 143" />
        <path d="M395 180 C370 210 330 215 290 210" />
        <path d="M290 210 L296 206 M290 210 L296 214" />
        <path d="M200 210 C180 205 160 195 155 180" />
        <path d="M155 180 L161 183 M155 180 L160 187" />
      </g>

      {/* avatar locataire gauche */}
      <g transform="translate(70, 120)">
        <circle cx="0" cy="0" r="32" fill="#dbeafe" />
        <circle
          cx="0"
          cy="0"
          r="30"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.4"
        />
        <circle cx="0" cy="-4" r="10" fill="#ffffff" stroke="#0f172a" />
        <path d="M-5 -6 q5 -6 10 0" fill="none" stroke="#0f172a" />
        <path d="M-4 -2 q4 4 8 0" fill="none" stroke="#0f172a" />
        <path
          d="M-10 10 a12 9 0 0 1 20 0 v4 a4 4 0 0 1 -4 4 h-12 a4 4 0 0 1 -4 -4 z"
          fill="#93c5fd"
          stroke="#0f172a"
        />
      </g>

      {/* avatar haut */}
      <g transform="translate(340, 60)">
        <circle cx="0" cy="0" r="26" fill="#dbeafe" />
        <circle
          cx="0"
          cy="0"
          r="24"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.2"
        />
        <circle cx="0" cy="-4" r="8" fill="#ffffff" stroke="#0f172a" />
        <path d="M-4 -6 q4 -5 8 0" fill="none" stroke="#0f172a" />
        <path d="M-3 -2 q3 3 6 0" fill="none" stroke="#0f172a" />
        <path
          d="M-8 8 a10 8 0 0 1 16 0 v3 a3.5 3.5 0 0 1 -3.5 3.5 h-9 a3.5 3.5 0 0 1 -3.5 -3.5 z"
          fill="#93c5fd"
          stroke="#0f172a"
        />
      </g>

      {/* avatar droite */}
      <g transform="translate(410, 150)">
        <circle cx="0" cy="0" r="26" fill="#dbeafe" />
        <circle
          cx="0"
          cy="0"
          r="24"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.2"
        />
        <circle cx="0" cy="-4" r="8" fill="#ffffff" stroke="#0f172a" />
        <path d="M-4 -6 q4 -5 8 0" fill="none" stroke="#0f172a" />
        <path d="M-3 -2 q3 3 6 0" fill="none" stroke="#0f172a" />
        <path
          d="M-8 8 a10 8 0 0 1 16 0 v3 a3.5 3.5 0 0 1 -3.5 3.5 h-9 a3.5 3.5 0 0 1 -3.5 -3.5 z"
          fill="#93c5fd"
          stroke="#0f172a"
        />
      </g>

      {/* maison en haut */}
      <g
        transform="translate(360, 20)"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="0" cy="0" r="16" fill="#dbeafe" />
        <path d="M-6 4 h12 v-8 l-6 -4 -6 4 z" />
        <path d="M-2 4 v-4" />
        <path d="M2 4 v-4" />
      </g>

      {/* maison en bas */}
      <g
        transform="translate(340, 210)"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="0" cy="0" r="18" fill="#dbeafe" />
        <path d="M-7 5 h14 v-8 l-7 -5 -7 5 z" />
        <path d="M-2 5 v-4" />
        <path d="M2 5 v-4" />
      </g>
    </svg>
  );
}

/* -------------------------------------------
   Deux cartes SVG à insérer dans la grille
------------------------------------------- */

function FeatureSvgCard1() {
  return (
    <Card className="border-dashed border-primary/40 bg-primary/5 h-full">
      <CardContent className="p-5 h-full flex flex-col">
        <div className="mb-3 text-sm font-semibold text-primary uppercase tracking-wide">
          Vue d&apos;ensemble GestiLoc
        </div>
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-sm mt-auto">
          {/* mini chart / dashboard illustration */}
          <svg viewBox="0 0 320 240" className="w-full h-full">
            <rect x="0" y="0" width="320" height="240" fill="#f7f8fa" />
            <rect
              x="24"
              y="26"
              width="272"
              height="188"
              rx="18"
              fill="#ffffff"
              stroke="#e5e7eb"
            />
            <rect x="40" y="46" width="80" height="8" rx="4" fill="#e5e7eb" />
            <rect x="40" y="62" width="60" height="6" rx="3" fill="#e5e7eb" />
            {/* barres */}
            <rect x="60" y="150" width="24" height="40" rx="6" fill="#93c5fd" />
            <rect x="110" y="130" width="24" height="60" rx="6" fill="#3b82f6" />
            <rect x="160" y="110" width="24" height="80" rx="6" fill="#1e40af" />
            <rect x="210" y="140" width="24" height="50" rx="6" fill="#dbeafe" />
            {/* courbe */}
            <path
              d="M60 110 C90 80 130 90 160 70 C190 50 220 70 250 60"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureSvgCard2() {
  return (
    <Card className="border-dashed border-primary/40 bg-blue-50/60 h-full">
      <CardContent className="p-5 flex flex-col gap-3 h-full">
        <div className="text-sm font-semibold text-primary uppercase tracking-wide">
          Multi-canal & Mobile Money
        </div>
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-sm mt-auto">
          {/* illustration mobile / paiement */}
          <svg viewBox="0 0 320 240" className="w-full h-full">
            <rect x="0" y="0" width="320" height="240" fill="#dbeafe" />
            {/* téléphone */}
            <rect
              x="96"
              y="30"
              width="128"
              height="190"
              rx="22"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="3"
            />
            <rect x="120" y="52" width="80" height="10" rx="5" fill="#e5e7eb" />
            <rect x="114" y="80" width="92" height="20" rx="10" fill="#dbeafe" />
            <rect x="114" y="112" width="92" height="20" rx="10" fill="#dbeafe" />
            <rect x="114" y="144" width="92" height="20" rx="10" fill="#dbeafe" />
            {/* bouton payer */}
            <rect
              x="114"
              y="178"
              width="92"
              height="28"
              rx="14"
              fill="#1e40af"
            />
            <circle cx="160" cy="208" r="4" fill="#0f172a" />
            {/* cercles moyens de paiement */}
            <circle cx="60" cy="90" r="18" fill="#dbeafe" />
            <circle cx="260" cy="70" r="18" fill="#dbeafe" />
            <circle cx="260" cy="160" r="18" fill="#dbeafe" />
            <path
              d="M52 90 h16"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M252 70 h16"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M252 160 h16"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------
                Composant principal
------------------------------------------- */

export function Features() {
  return (
    <section className="container py-16 md:py-24">
      {/* Bloc texte + illustration, animé du bas vers le haut */}
      <AnimatedItem delay={0.05}>
        <div className="grid gap-10 md:gap-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center mb-16">
          {/* Texte à gauche */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold md:text-4xl leading-tight">
              GestiLoc vous assiste avec votre gestion locative au Bénin
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
              Le site <strong>automatise la création de vos quittances</strong>{" "}
              et vos <strong>contrats de location</strong> conformes à la
              législation béninoise. Pour chaque contrat de location, les loyers
              et les quittances électroniques sont générés automatiquement
              chaque mois.{" "}
              <strong>Paiement Mobile Money accepté</strong> (MTN, Moov,
              Celtiis, Wave).
            </p>
            <div className="space-y-1 pt-2">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium text-foreground">
                  Tellement utile et pratique&nbsp;!
                </span>
                <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1">
                  <span className="text-xs font-semibold text-primary">4.8</span>
                  <span className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                de 5 d&apos;après plus de 1000 utilisateurs béninois.
              </p>
            </div>
          </div>

          {/* Illustration à droite */}
          <div className="relative flex justify-center md:justify-end">
            <div className="absolute -top-10 -left-6 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-blue-100/70 blur-3xl" />
            <div className="relative w-full max-w-md">
              <AssistIllustrationBlue />
            </div>
          </div>
        </div>
      </AnimatedItem>

      {/* Grille des fonctionnalités + 2 cartes SVG, toutes animées */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const delayBase = 0.05 * (index + 1);

          return (
            <React.Fragment key={feature.title}>
              {/* SVG en 4ᵉ position */}
              {index === 3 && (
                <AnimatedItem delay={delayBase}>
                  <FeatureSvgCard1 />
                </AnimatedItem>
              )}

              <AnimatedItem delay={delayBase + 0.02}>
                <Card className="rounded-3xl bg-muted/60 h-full hover:shadow-lg transition-shadow">
                  <CardContent className="h-full flex flex-col items-center justify-center px-8 py-10 text-center">
                    <div className="mb-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedItem>

              {/* SVG à la toute fin */}
              {index === features.length - 1 && (
                <AnimatedItem delay={delayBase + 0.04}>
                  <FeatureSvgCard2 />
                </AnimatedItem>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
