import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Hook pour détecter si on est sur mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

/* ------------------------------------------------------------
   Illustration SVG bleue - Formulaire "Nouveau bien"
------------------------------------------------------------ */
function HeroIllustrationBlue() {
  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full h-auto"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="ctaGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {/* Fond global */}
      <rect x="0" y="0" width="480" height="360" rx="32" fill="#f8fafc" />

      {/* Halo de fond derrière la carte */}
      <ellipse
        cx="290"
        cy="210"
        rx="170"
        ry="120"
        fill="#dbeafe"
        opacity="0.3"
      />

      {/* Maison / immeuble à gauche de la carte */}
      <g
        transform="translate(40, 130)"
        fill="none"
        stroke="#1e40af"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* sol */}
        <line x1="0" y1="90" x2="120" y2="90" />
        {/* corps maison */}
        <rect
          x="18"
          y="40"
          width="60"
          height="48"
          rx="6"
          fill="#e0edff"
          stroke="#1e40af"
        />
        {/* toit */}
        <path d="M14 42 L48 18 L82 42" fill="#dbeafe" />
        {/* porte */}
        <rect
          x="44"
          y="58"
          width="16"
          height="30"
          rx="4"
          fill="#f9fafb"
          stroke="#1e40af"
        />
        {/* poignée */}
        <circle cx="56" cy="73" r="1.5" fill="#1e40af" />
        {/* fenêtre gauche */}
        <rect
          x="24"
          y="52"
          width="12"
          height="10"
          rx="2"
          fill="#f9fafb"
          stroke="#1e40af"
        />
        {/* fenêtre droite */}
        <rect
          x="74"
          y="52"
          width="12"
          height="10"
          rx="2"
          fill="#f9fafb"
          stroke="#1e40af"
        />
        {/* petite plante */}
        <path
          d="M6 88 C6 80 4 72 0 66"
          fill="none"
          stroke="#1e40af"
        />
        <path
          d="M0 66 C6 64 10 60 12 54 C6 54 2 58 0 62"
          fill="#bfdbfe"
        />
      </g>

      {/* Carte formulaire "Nouveau bien" */}
      <g transform="translate(150, 50)">
        {/* ombre */}
        <rect
          x="16"
          y="20"
          width="280"
          height="220"
          rx="22"
          fill="#c7d2fe"
          opacity="0.35"
        />
        {/* carte */}
        <rect
          x="0"
          y="0"
          width="280"
          height="220"
          rx="22"
          fill="url(#cardGradient)"
          stroke="#cbd5f5"
          strokeWidth="2"
        />

        {/* barre titre */}
        <rect
          x="18"
          y="18"
          width="120"
          height="20"
          rx="10"
          fill="#1f2937"
          opacity="0.9"
        />
        {/* petit pictogramme maison dans le titre */}
        <path
          d="M26 28 L32 24 L38 28 V34 H30 V30"
          fill="none"
          stroke="#e5f0ff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* barre titre - texte simulé */}
        <rect
          x="42"
          y="24"
          width="80"
          height="6"
          rx="3"
          fill="#e5f0ff"
        />

        {/* onglets en haut à droite */}
        <rect x="160" y="18" width="32" height="18" rx="9" fill="url(#accentGradient)" />
        <rect x="198" y="18" width="24" height="18" rx="9" fill="#e5e7eb" />
        <rect x="228" y="18" width="24" height="18" rx="9" fill="#e5e7eb" opacity="0.8" />

        {/* section type de bien */}
        <rect x="18" y="56" width="80" height="8" rx="4" fill="#9ca3af" />
        {/* boutons radio "Appartement / Maison" */}
        <rect x="18" y="72" width="96" height="18" rx="9" fill="#f9fafb" />
        <rect x="120" y="72" width="96" height="18" rx="9" fill="#eef2ff" />
        <circle cx="30" cy="81" r="6" fill="none" stroke="#2563eb" strokeWidth="2" />
        <circle cx="30" cy="81" r="3" fill="#2563eb" />
        <circle cx="132" cy="81" r="6" fill="none" stroke="#9ca3af" strokeWidth="1.5" />

        {/* champs : Titre du bien / Référence */}
        <rect x="18" y="100" width="156" height="16" rx="8" fill="#ffffff" />
        <rect x="188" y="100" width="74" height="16" rx="8" fill="#ffffff" />

        {/* champ : Adresse */}
        <rect x="18" y="128" width="244" height="16" rx="8" fill="#ffffff" />

        {/* champs : Loyer / Charges */}
        <rect x="18" y="156" width="110" height="16" rx="8" fill="#ffffff" />
        <rect x="152" y="156" width="110" height="16" rx="8" fill="#ffffff" />

        {/* bas de carte : boutons */}
        <rect
          x="18"
          y="186"
          width="80"
          height="22"
          rx="11"
          fill="#e5e7eb"
        />
        <rect
          x="134"
          y="186"
          width="128"
          height="22"
          rx="11"
          fill="url(#ctaGradient)"
        />
        {/* texte simulé sur bouton principal */}
        <rect
          x="150"
          y="194"
          width="70"
          height="6"
          rx="3"
          fill="#f0fdf4"
          opacity="0.95"
        />
      </g>

      {/* Badge rond "proprio" en bas à droite de la carte */}
      <g transform="translate(380, 260)">
        <circle cx="0" cy="0" r="30" fill="#e0f2fe" />
        <circle
          cx="0"
          cy="0"
          r="28"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="2"
        />
        {/* visage simple */}
        <circle cx="0" cy="-7" r="8" fill="#ffffff" stroke="#1d4ed8" strokeWidth="2" />
        <path
          d="M -4 -9 q4 -4 8 0"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M -3 -5 q3 3 6 0"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* buste */}
        <path
          d="M -11 5 a11 9 0 0 1 22 0 v4 a4 4 0 0 1 -4 4 h-14 a4 4 0 0 1 -4 -4 z"
          fill="#bfdbfe"
          stroke="#1d4ed8"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

// Typing Text Component
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <span>
      {displayText}
      {!isComplete && <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-primary"
      >
        |
      </motion.span>}
    </span>
  );
}

/* ------------------------------------------------------------
                      COMPOSANT HERO
------------------------------------------------------------ */

export function Hero() {
  const isMobile = useIsMobile();

  return (
    <section className="relative py-4 sm:py-6 md:py-8 lg:py-10 overflow-hidden bg-gray-200">
      {/* Fond gris léger sur toute la largeur */}
      <div className="absolute inset-0 -z-10 bg-gray-200" />

      {/* Contenu centré dans la grille */}
      <div className="container relative">
        {/* Ligne d'avis tout en haut, centrée comme Rentila */}


        {/* Contenu principal : texte + illustration */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          {/* COLONNE GAUCHE */}
          <div className="space-y-8">
            {/* Tag compteur */}
            <motion.div
              className="inline-flex items-center gap-3 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-900"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div
                className="flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 1.0, type: "spring", stiffness: 200 }}
              >
                <ArrowUpRight className="h-3 w-3" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                >
                  1 250
                </motion.span>
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.4 }}
              >
                propriétaires béninois inscrits ce mois-ci !
              </motion.span>
            </motion.div>

            {/* Titre */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold max-w-xl leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              Gérez vos biens immobiliers avec le{" "}
              <span className="relative text-primary home-hero-underline-one">
                <TypingText text="meilleur logiciel gratuit" delay={2000} />
              </span>{" "}
              de gestion locative immobilière
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-base md:text-lg max-w-xl"
              style={{ color: '#000' }}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.5 }}
            >
              GestiLoc est le meilleur logiciel de gestion locative immobilière en
              ligne. Suivi des loyers et charges, comptabilité, aide à la
              déclaration des revenus fonciers… Toutes les étapes de la vie du
              contrat de location sont couvertes par notre plateforme.
            </motion.p>

            {/* CTA */}
            <motion.div
              className="flex flex-col items-start gap-3 pt-2"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    backgroundColor: "rgba(196, 255, 109, 1)",
                    color: "rgba(0, 0, 0, 1)",
                    borderRadius: "7px",
                    borderBottom: "3px solid rgba(20, 51, 0, 1)",
                    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                    width: "200px",
                    height: "60px",
                    fontFamily: "Montserrat",
                    fontWeight: "500",
                    fontStyle: "Medium",
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "-0.17px",
                    textAlign: "center",
                    verticalAlign: "middle"
                  }}
                >
                  Ouvrir un compte gratuit
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 3.0 }}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    color: "#31660e",
                    borderRadius: "7px",
                    border: "1px solid rgba(49, 102, 14, 1)",
                    width: "200px",
                    height: "60px",
                    fontFamily: "Montserrat",
                    fontWeight: "500",
                    fontSize: "14px",
                    lineHeight: "100%",
                    textAlign: "center",
                    verticalAlign: "middle"
                  }}
                >
                  Se connecter
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* COLONNE DROITE : ILLUSTRATION AGRANDIE */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {!isMobile && (
              <>
                <motion.div
                  className="absolute -top-10 -left-8 h-32 w-32 bg-primary/10 blur-3xl rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-16 -right-10 h-44 w-44 bg-blue-100/70 blur-3xl rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </>
            )}

            <motion.div
              className="relative w-full max-w-xl lg:max-w-2xl translate-y-2"
              animate={{
                y: [2, -5, 2],
                rotate: [0, 1, 0, -1, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <HeroIllustrationBlue />
            </motion.div>
          </motion.div>
        </div>

        {/* App Stores - Positionnement en bas à droite de la section */}
        <motion.div
          className="absolute bottom-0 right-4 md:right-8 flex flex-col items-end gap-2 md:gap-3 pb-4 md:pb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 3.4 }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 3.6 }}
            style={{
              fontFamily: "Lora",
              fontWeight: "700",
              fontStyle: "italic",
              fontSize: "14px",
              lineHeight: "100%",
              letterSpacing: "-0.17px",
              textAlign: "right",
              verticalAlign: "middle",
              color: "#000",
              whiteSpace: "nowrap"
            }}
          >
            Disponible sur
          </motion.span>

          <motion.div
            className="flex items-center gap-2 md:gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 3.8 }}
          >
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/Ressource_gestiloc/Apple Inc.png"
                alt="App Store"
                style={{
                  width: "auto",
                  height: "16px",
                  objectFit: "contain",
                  filter: "brightness(0)"
                }}
                className="md:h-[20px]"
              />
            </motion.a>

            <motion.div
              className="h-4 md:h-5 w-px bg-gray-400"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.3, delay: 4.0 }}
            />

            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/Ressource_gestiloc/Google Play.png"
                alt="Google Play"
                style={{
                  width: "auto",
                  height: "16px",
                  objectFit: "contain",
                  filter: "brightness(0)"
                }}
                className="md:h-[19px]"
              />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
