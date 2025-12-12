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

/* CSS pour l'animation flip card */
const flipCardStyles = `
  @keyframes flipIn {
    0% {
      opacity: 0;
      transform: translateY(20px) rotateX(-90deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  }

  @keyframes cardFlip {
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }

  /* Animation pour les barres du graphique */
  @keyframes barRise {
    0% {
      height: 0;
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  /* Animation pour la courbe */
  @keyframes curveDraw {
    0% {
      stroke-dashoffset: 200;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  /* Animation pour les éléments mobiles */
  @keyframes phoneSlide {
    0% {
      transform: translateX(-20px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Animation pour les cercles de paiement */
  @keyframes paymentPulse {
    0%, 100% {
      r: 18;
      opacity: 0.8;
    }
    50% {
      r: 22;
      opacity: 1;
    }
  }

  /* Animation pour le texte de la courbe */
  @keyframes curveFloat {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  .svg-bar-chart rect {
    animation: barRise 0.8s ease-out backwards;
  }

  .svg-bar-chart rect:nth-child(5) {
    animation-delay: 0.1s;
  }

  .svg-bar-chart rect:nth-child(6) {
    animation-delay: 0.2s;
  }

  .svg-bar-chart rect:nth-child(7) {
    animation-delay: 0.3s;
  }

  .svg-bar-chart rect:nth-child(8) {
    animation-delay: 0.4s;
  }

  .svg-curve-line {
    stroke-dasharray: 200;
    animation: curveDraw 1.2s ease-out forwards;
  }

  .svg-phone {
    animation: phoneSlide 0.6s ease-out;
  }

  .svg-payment-circle {
    animation: paymentPulse 2s ease-in-out infinite;
  }

  .svg-phone-content rect {
    animation: curveFloat 2s ease-in-out infinite;
  }

  .feature-card {
    perspective: 1000px;
    animation: flipIn 0.7s ease-out backwards;
  }

  .feature-card:hover {
    animation: cardFlip 0.6s ease-in-out;
  }

  .feature-card-inner {
    transition: transform 0.3s ease;
    transform-style: preserve-3d;
  }
`;

// Injecter les styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = flipCardStyles;
  document.head.appendChild(style);
}

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
      style={{ "--transition-delay": `${delay}s` } as React.CSSProperties}
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

const benefits = [
 "Sans engagement",
 "Gratuit pour commencer",
 "Assistance incluse",
 "Aucune carte bancaire requise",
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
    <Card className="border-dashed border-primary/40 bg-gradient-to-br from-primary/8 via-transparent to-blue-50/40 h-full overflow-hidden hover:shadow-lg transition-shadow duration-500">
      <CardContent className="p-5 h-full flex flex-col">
        <div className="mb-3 text-sm font-semibold text-primary uppercase tracking-wide">
          Vue d&apos;ensemble GestiLoc
        </div>
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50/80 shadow-sm mt-auto border border-slate-200/60">
          {/* mini chart / dashboard illustration */}
          <svg viewBox="0 0 320 240" className="w-full h-full svg-bar-chart" role="img" aria-hidden="true">
            {/* Arrière-plan avec dégradé */}
            <defs>
              <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f7f8fa" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <linearGradient id="barGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="barGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
            </defs>
            
            <rect x="0" y="0" width="320" height="240" fill="url(#bgGrad1)" />
            
            {/* Cadre du dashboard */}
            <rect
              x="24"
              y="26"
              width="272"
              height="188"
              rx="18"
              fill="#ffffff"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            
            {/* En-tête du tableau */}
            <rect x="40" y="46" width="80" height="8" rx="4" fill="#e5e7eb" />
            <rect x="40" y="62" width="60" height="6" rx="3" fill="#d1d5db" />
            
            {/* Ligne de grille subtile */}
            <line x1="40" y1="90" x2="280" y2="90" stroke="#f3f4f6" strokeWidth="1" />
            
            {/* Barres animées avec dégradés */}
            <rect x="60" y="150" width="24" height="40" rx="6" fill="url(#barGrad1)" />
            <rect x="110" y="130" width="24" height="60" rx="6" fill="url(#barGrad2)" />
            <rect x="160" y="110" width="24" height="80" rx="6" fill="#1e40af" />
            <rect x="210" y="140" width="24" height="50" rx="6" fill="url(#barGrad1)" />
            
            {/* Valeurs au-dessus des barres */}
            <text x="72" y="148" fontSize="10" fontWeight="bold" fill="#1e40af" textAnchor="middle">
              45K
            </text>
            <text x="122" y="128" fontSize="10" fontWeight="bold" fill="#1e40af" textAnchor="middle">
              62K
            </text>
            <text x="172" y="108" fontSize="10" fontWeight="bold" fill="#1e40af" textAnchor="middle">
              78K
            </text>
            <text x="222" y="138" fontSize="10" fontWeight="bold" fill="#1e40af" textAnchor="middle">
              55K
            </text>
            
            {/* Courbe animée (trend line) */}
            <path
              className="svg-curve-line"
              d="M55 115 C85 95 125 100 155 75 C185 50 215 70 245 60"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Points sur la courbe */}
            <circle cx="55" cy="115" r="3" fill="#22c55e" />
            <circle cx="155" cy="75" r="3" fill="#22c55e" />
            <circle cx="245" cy="60" r="3" fill="#22c55e" />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureSvgCard2() {
  return (
    <Card className="border-dashed border-primary/40 bg-gradient-to-br from-blue-50/80 via-transparent to-cyan-50/40 h-full overflow-hidden hover:shadow-lg transition-shadow duration-500">
      <CardContent className="p-5 flex flex-col gap-3 h-full">
        <div className="text-sm font-semibold text-primary uppercase tracking-wide">
          Multi-canal & Mobile Money
        </div>
        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-blue-50/90 to-white shadow-sm mt-auto border border-blue-200/60">
          {/* illustration mobile / paiement */}
          <svg viewBox="0 0 320 240" className="w-full h-full" role="img" aria-hidden="true">
            <defs>
              <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <linearGradient id="screenGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#dbeafe" />
              </linearGradient>
              <linearGradient id="buttonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
            </defs>
            
            {/* Arrière-plan */}
            <rect x="0" y="0" width="320" height="240" fill="#f0f9ff" />
            
            {/* Cercles de paiement à gauche - animés */}
            <circle className="svg-payment-circle" cx="50" cy="80" r="18" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="2" style={{animationDelay: '0s'}} />
            <circle className="svg-payment-circle" cx="50" cy="160" r="18" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="2" style={{animationDelay: '0.4s'}} />
            
            {/* Cercles de paiement à droite - animés */}
            <circle className="svg-payment-circle" cx="270" cy="70" r="18" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="2" style={{animationDelay: '0.2s'}} />
            <circle className="svg-payment-circle" cx="270" cy="150" r="18" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="2" style={{animationDelay: '0.6s'}} />
            
            {/* Symboles à l'intérieur des cercles */}
            <text x="50" y="85" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">
              M
            </text>
            <text x="50" y="165" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">
              W
            </text>
            <text x="270" y="75" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">
              ◆
            </text>
            <text x="270" y="155" fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">
              ✓
            </text>
            
            {/* Téléphone avec meilleur style */}
            <rect
              className="svg-phone"
              x="96"
              y="30"
              width="128"
              height="190"
              rx="22"
              fill="url(#phoneGrad)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            
            {/* Encoches du téléphone */}
            <rect x="140" y="32" width="40" height="12" rx="6" fill="#0f172a" />
            
            {/* Barre d'état */}
            <rect x="110" y="50" width="100" height="4" rx="2" fill="#e5e7eb" />
            
            {/* Contenu de l'écran avec animation */}
            <g className="svg-phone-content">
              <rect x="114" y="68" width="92" height="20" rx="10" fill="url(#screenGrad)" />
              <text x="160" y="79" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                MTN Mobile Money
              </text>
            </g>
            
            <g className="svg-phone-content" style={{animationDelay: '0.4s'}}>
              <rect x="114" y="100" width="92" height="20" rx="10" fill="url(#screenGrad)" />
              <text x="160" y="111" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                Moov Money
              </text>
            </g>
            
            <g className="svg-phone-content" style={{animationDelay: '0.8s'}}>
              <rect x="114" y="132" width="92" height="20" rx="10" fill="url(#screenGrad)" />
              <text x="160" y="143" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                Wave/Celtiis
              </text>
            </g>
            
            {/* Bouton de paiement en évidence */}
            <rect
              x="114"
              y="166"
              width="92"
              height="28"
              rx="14"
              fill="url(#buttonGrad)"
            />
            <text x="160" y="181" fontSize="11" fontWeight="bold" fill="#ffffff" textAnchor="middle">
              Payer
            </text>
            
            {/* Bouton home */}
            <circle cx="160" cy="208" r="5" fill="#0f172a" />
            
            {/* Lignes de connexion */}
            <path
              d="M68 80 L96 60"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5,5"
            />
            <path
              d="M68 160 L96 170"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5,5"
            />
            <path
              d="M252 70 L224 55"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5,5"
            />
            <path
              d="M252 150 L224 175"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5,5"
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
                <div 
                  className="feature-card rounded-3xl h-full"
                  style={{
                    animationDelay: `${delayBase + 0.02}s`
                  }}
                >
                  <Card className="rounded-3xl bg-gradient-to-br from-primary/10 via-muted/60 to-muted/40 h-full hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <CardContent className="h-full flex flex-col items-center justify-center px-8 py-10 text-center">
                      <div className="mb-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors duration-300">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold mb-3 text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
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

      {/* Benefits - 4 points sur la même ligne */}
      <AnimatedItem delay={0.3}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-16 border-t border-border/50">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center justify-center py-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="text-sm md:text-base font-medium text-foreground">
                  {benefit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedItem>
    </section>
  );
}
