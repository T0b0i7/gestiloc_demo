import React, { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";

type WhyCard = {
  id: string;
  kind: "stat" | "quote";
  percent?: string;
  bigText: string;
  author?: string;
  location?: string;
  bgColor: string;        // couleur de fond en hex
  textColor?: string;     // couleur de texte optionnelle
  rotationClass: string;  // ex: "-rotate-6"
  side: "left" | "right"; // pour l'animation
  top: string;            // position verticale (ex "55%")
  left?: string;          // soit left
  right?: string;         // soit right
  delay: string;          // delay d'animation
};

const cards: WhyCard[] = [
  {
    id: "c1",
    kind: "stat",
    percent: "97%",
    bigText:
      "de nos clients affirment gagner en efficacité et en productivité.",
    bgColor: "#D9F99D",      // lime-200
    textColor: "#052e16",    // texte vert foncé par ex.
    rotationClass: "-rotate-6",
    side: "left",
    top: "5%",
    left: "0%",
    delay: "0s",
  },
  {
    id: "c2",
    kind: "quote",
    bigText:
      '"Ce site est un vrai bonheur pour les particuliers bailleurs et m\'aide énormément ! À recommander !!"',
    author: "Pierre",
    location: "Cotonou, Bénin",
    bgColor: "#ECFDF5",      // emerald-50
    textColor: "#022c22",
    rotationClass: "rotate-4",
    side: "right",
    top: "8%",
    right: "0%",
    delay: "0.15s",
  },
  {
    id: "c3",
    kind: "quote",
    bigText:
      '"Je tiens à vous dire un grand merci pour votre site. J\'y ai appris énormément de choses. Bravo !"',
    author: "Francine",
    location: "Porto-Novo, Bénin",
    bgColor: "#ECFDF5",      // emerald-50
    textColor: "#022c22",
    rotationClass: "-rotate-2",
    side: "left",
    top: "45%",
    left: "5%",
    delay: "0.3s",
  },
  {
    id: "c4",
    kind: "stat",
    percent: "83%",
    bigText:
      "de nos clients affirment que GestiLoc les aide à mieux suivre loyers, charges et quittances.",
    bgColor: "#A855F7",      // purple-400
    textColor: "#FFFFFF",    // texte blanc
    rotationClass: "rotate-5",
    side: "right",
    top: "50%",
    right: "5%",
    delay: "0.45s",
  },
  {
    id: "c5",
    kind: "stat",
    percent: "67%",
    bigText: "de nos clients recommandent GestiLoc à leur entourage.",
    bgColor: "#047857",      // emerald-700
    textColor: "#ECFDF5",    // texte clair
    rotationClass: "-rotate-4",
    side: "left",
    top: "85%",
    left: "35%",
    delay: "0.6s",
  },
];

/* CSS pour animations avancées */
const animationStyles = `
  @keyframes bounceInCard {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    60% {
      opacity: 1;
      transform: translateY(-8px);
    }
    80% {
      transform: translateY(2px);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes floatParallax {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  .card-animated {
    animation: bounceInCard 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .card-floating {
    animation: floatParallax 3s ease-in-out infinite;
  }

  .card-hover:hover {
    transform: translateY(-12px) !important;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15) !important;
  }

  .card-hover {
    transition: all 0.3s ease;
  }
`;

// Injecter les styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

/* -----------------------------
   Wrapper d'animation pour carte
   (entre depuis gauche/droite)
------------------------------ */

interface FloatingCardProps {
  children: React.ReactNode;
  side: "left" | "right";
  delay: string;
  style: React.CSSProperties;
}

function FloatingCard({ children, side, delay, style }: FloatingCardProps) {
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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ ...style, transitionDelay: delay }}
      className={[
        "absolute max-w-md px-0 py-0",
        "transition-all duration-700 ease-out",
        visible ? "card-animated" : "",
        visible ? "card-floating" : "",
        visible
          ? "opacity-100 translate-x-0"
          : side === "left"
          ? "opacity-0 -translate-x-8"
          : "opacity-0 translate-x-8",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function Stats() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container">
        {/* Titre + sous-titre */}
        <div className="max-w-3xl mx-auto text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            <MessageCircle className="h-4 w-4" />
            <span>Pourquoi choisir GestiLoc ?</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold">
            Nous aidons les bailleurs à gérer sereinement leurs locations
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Nous sommes accessibles, modernes et pensés pour les propriétaires
            béninois.
          </p>
        </div>

        {/* VERSION DESKTOP : cartes flottantes inclinées */}
        <div className="relative hidden md:block h-[520px] lg:h-[560px]">
          {cards.map((card) => {
            const pos: React.CSSProperties = {
              top: card.top,
            };
            if (card.left !== undefined) pos.left = card.left;
            if (card.right !== undefined) pos.right = card.right;

            return (
              <FloatingCard
                key={card.id}
                side={card.side}
                delay={card.delay}
                style={pos}
              >
                {/* carte réelle, avec rotation */}
                <div
                  className={[
                    "rounded-3xl shadow-xl px-8 py-6",
                    "card-hover",
                    card.rotationClass,
                  ].join(" ")}
                  style={{
                    backgroundColor: card.bgColor,
                    color: card.textColor,
                  }}
                >
                  {card.kind === "stat" && (
                    <>
                      <div className="text-4xl lg:text-5xl font-bold mb-3">
                        {card.percent}
                      </div>
                      <p className="text-base lg:text-lg leading-relaxed">
                        {card.bigText}
                      </p>
                    </>
                  )}

                  {card.kind === "quote" && (
                    <>
                      <p className="text-lg lg:text-xl leading-relaxed mb-4">
                        {card.bigText}
                      </p>
                      {card.author && (
                        <p className="text-sm font-semibold">
                          – {card.author}
                          {card.location && (
                            <span className="font-normal text-muted-foreground">
                              , {card.location}
                            </span>
                          )}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </FloatingCard>
            );
          })}
        </div>

        {/* VERSION MOBILE : cartes empilées */}
        <div className="grid gap-6 md:hidden">
          {cards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl px-6 py-5 shadow-sm"
              style={{
                backgroundColor: card.bgColor,
                color: card.textColor,
              }}
            >
              {card.kind === "stat" && (
                <>
                  <div className="text-3xl font-bold mb-2">
                    {card.percent}
                  </div>
                  <p className="text-base leading-relaxed">
                    {card.bigText}
                  </p>
                </>
              )}
              {card.kind === "quote" && (
                <>
                  <p className="text-base leading-relaxed mb-3">
                    {card.bigText}
                  </p>
                  {card.author && (
                    <p className="text-xs font-semibold">
                      – {card.author}
                      {card.location && (
                        <span className="font-normal text-muted-foreground">
                          , {card.location}
                        </span>
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
