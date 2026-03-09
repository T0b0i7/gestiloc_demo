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
            Nous aidons les bailleurs à gérer sereinement leurs biens
          </h2>
          
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

        {/* VERSION MOBILE : Carousel professionnel avec autoplay */}
        <MobileStatsCarousel cards={cards} />
      </div>
    </section>
  );
}

// Composant carousel mobile séparé - Binômes
function MobileStatsCarousel({ cards }: { cards: WhyCard[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Regrouper les cartes en binômes (2 par slide)
  const binomes: WhyCard[][] = [];
  for (let i = 0; i < cards.length; i += 2) {
    binomes.push(cards.slice(i, i + 2));
  }
  const totalSlides = binomes.length;

  // Autoplay - défilement continu gauche-droite
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        let nextIndex = currentIndex + direction;

        // Changement de direction aux extrémités
        if (nextIndex >= totalSlides - 1) {
          nextIndex = totalSlides - 1;
          setDirection(-1);
        } else if (nextIndex <= 0) {
          nextIndex = 0;
          setDirection(1);
        }

        const scrollAmount = carouselRef.current.offsetWidth;
        carouselRef.current.scrollTo({
          left: nextIndex * scrollAmount,
          behavior: 'smooth'
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000); // 4 secondes par binôme

    return () => clearInterval(interval);
  }, [currentIndex, direction, totalSlides]);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const slideWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / slideWidth);
      setCurrentIndex(newIndex);
    }
  };

  const renderCard = (card: WhyCard, index: number) => (
    <div
      key={card.id}
      className="rounded-2xl px-5 py-5 shadow-lg flex-1 flex flex-col justify-center"
      style={{
        backgroundColor: card.bgColor,
        color: card.textColor,
        minHeight: '200px',
        transform: `rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
      }}
    >
      {card.kind === "stat" && (
        <>
          <div className="text-3xl font-bold mb-2">
            {card.percent}
          </div>
          <p className="text-sm leading-relaxed">
            {card.bigText}
          </p>
        </>
      )}
      {card.kind === "quote" && (
        <>
          <div className="text-xl mb-1 opacity-50">"</div>
          <p className="text-sm leading-relaxed mb-3 italic">
            {card.bigText.replace(/"/g, '')}
          </p>
          {card.author && (
            <div className="flex items-center gap-2 mt-auto">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: card.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  color: card.textColor
                }}
              >
                {card.author.charAt(0)}
              </div>
              <p className="text-xs">
                <span className="font-semibold">{card.author}</span>
                {card.location && (
                  <span className="opacity-70">, {card.location}</span>
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="md:hidden">
      {/* Carousel container avec binômes */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 gap-4 px-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {binomes.map((binome, slideIndex) => (
          <div
            key={slideIndex}
            className="flex-shrink-0 w-[90vw] max-w-[380px] snap-center flex gap-3"
          >
            {binome.map((card, cardIndex) => renderCard(card, slideIndex * 2 + cardIndex))}
          </div>
        ))}
      </div>

      {/* Indicateurs de progression (un par binôme) */}
      <div className="flex justify-center mt-4 gap-2">
        {binomes.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (carouselRef.current) {
                carouselRef.current.scrollTo({
                  left: index * carouselRef.current.offsetWidth,
                  behavior: 'smooth'
                });
                setCurrentIndex(index);
              }
            }}
            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index
              ? 'bg-violet-500 w-8'
              : 'bg-gray-300 w-2'
              }`}
            aria-label={`Voir binôme ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
