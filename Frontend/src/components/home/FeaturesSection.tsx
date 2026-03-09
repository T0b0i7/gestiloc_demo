// Features images are now used instead of icon components
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalCards = 12;

  // Autoplay carousel for "Pourquoi choisir GestiLoc?"
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalCards);
    }, 3000);
    return () => clearInterval(interval);
  }, [totalCards]);

  return (
    <section id="features" className="bg-white">
      {/* Section Header and Steps */}
      <div className="pt-48 pb-24 md:pt-64 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Animation améliorée */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-[1.1]" style={{ fontFamily: "Merriweather" }}>
              GestiLoc vous assiste avec votre gestion locative au Bénin
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              Le site automatise la création de vos quittances et contrats de rotation confirmés à la législation béninoise.
            </p>
          </motion.div>

          {/* Comment ça marche ? Section */}
          <div className="mb-12 md:mb-20">
            <motion.h3
              className="text-3xl md:text-4xl font-black text-gray-900 text-center mb-12 italic"
              style={{ fontFamily: "Merriweather" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Comment ça marche ?
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {/* Step 1 */}
              <motion.div
                className="border-2 border-green-100 rounded-lg p-6 md:p-8 bg-green-50 text-center relative hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <span className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full bg-green-400 text-white font-bold">1</span>
                <img src="/Ressource_gestiloc/creer_un_bien.png" alt="Créer un bien" className="h-28 mx-auto mb-4 object-contain" />
                <h4 className="font-semibold text-gray-800 mb-2">Créer un bien</h4>
                <p className="text-sm text-gray-600">Ajoutez vos propriétés immobilières en quelques clics</p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="border-2 border-orange-100 rounded-lg p-6 md:p-8 bg-orange-50 text-center relative hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <span className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full bg-orange-400 text-white font-bold">2</span>
                <img src="/Ressource_gestiloc/creer_une_location.png" alt="Créer une location" className="h-28 mx-auto mb-4 object-contain" />
                <h4 className="font-semibold text-gray-800 mb-2">Créer un locataire</h4>
                <p className="text-sm text-gray-600">Enregistrez les informations de vos locataires</p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="border-2 border-purple-100 rounded-lg p-6 md:p-8 bg-purple-50 text-center relative hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <span className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full bg-purple-400 text-white font-bold">3</span>
                <img src="/Ressource_gestiloc/creer_un_locataire.png" alt="Créer un locataire" className="h-28 mx-auto mb-4 object-contain" />
                <h4 className="font-semibold text-gray-800 mb-2">Ouvrir une location</h4>
                <p className="text-sm text-gray-600">Créez les contrats et lancez la gestion</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Pourquoi choisir GestiLoc Section - Image 2 Style */}
      <div className="py-24 md:py-32 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6" style={{ fontFamily: "Merriweather", lineHeight: "1.1" }}>Pourquoi choisir GestiLoc ?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Nous sommes innovants, modernes et adaptés aux réalités africaines</p>
          </div>

          {(() => {
            const features = [
              { title: "Compte sécurisé 24h/24 et 7j/7", image: "/Ressource_gestiloc/sécurié.jpg", description: "Votre plateforme bénéficie d'une protection totale pour une gestion sereine de vos biens." },
              { title: "Modèles de baux pré-remplis", image: "/Ressource_gestiloc/baux_pré_remplie.png", description: "Baux (nus, meublés, commerciaux) conformes à la législation béninoise." },
              { title: "Quittances automatiques", image: "/Ressource_gestiloc/Quittance_automautomatisée.png", description: "Génération et envoi automatique de vos quittances chaque mois sans effort." },
              { title: "Régularisation des charges", image: "/Ressource_gestiloc/regularisation.png", description: "Calculez et régularisez les charges locatives de manière simple et précise." },
              { title: "Statistiques & indicateurs", image: "/Ressource_gestiloc/statistiques.png", description: "Visualisez la performance de vos investissements grâce à des indicateurs clés." },
              { title: "Révision de loyers", image: "/Ressource_gestiloc/Revision loyer.png", description: "Gérez les révisions annuelles de loyer avec des rappels automatiques programmés." },
              { title: "Travaux et interventions", image: "/Ressource_gestiloc/Taux_Interventions.png", description: "Suivez les interventions techniques et gérez les travaux dans tous vos logements." },
              { title: "Comptabilité & Exportations", image: "/Ressource_gestiloc/comptabilitées.png", description: "Exportez vos données (CSV, PDF, Excel) pour simplifier votre comptabilité." },
              { title: "États des lieux & inventaires", image: "/Ressource_gestiloc/etat_lieux_1.png", description: "Réalisez vos états des lieux et inventaires de manière professionnelle." },
              { title: "Messagerie et notifications", image: "/Ressource_gestiloc/Circled Envelope.png", description: "Échangez avec vos locataires et recevez des alertes pour ne rien oublier." },
              { title: "Coffre-fort documents", image: "/Ressource_gestiloc/secure-folder.png", description: "Stockez vos documents importants dans un espace hautement sécurisé." },
              { title: "Locations Saisonnières", image: "/Ressource_gestiloc/location_saisonnièere.png", description: "Suivez vos locations saisonnières avec la même efficacité que vos baux longue durée." }
            ];

            return (
              <div className="relative">
                {/* Mobile Auto-Scroll with Zoom - Optimized for content fit */}
                <div className="md:hidden overflow-hidden rounded-[30px] border-2 border-[#529D21] bg-white shadow-xl mx-2">
                  <motion.div
                    className="flex"
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    {features.map((f, i) => (
                      <div key={i} className="w-full flex-shrink-0 flex flex-col items-center justify-center p-6 sm:p-8 min-h-[400px]">
                        <h4 className="font-black text-center mb-4 text-lg sm:text-xl leading-snug px-2" style={{ fontFamily: "Merriweather" }}>
                          {f.title}
                        </h4>
                        <div className="flex-1 flex items-center justify-center mb-6 w-full max-w-[200px]">
                          <motion.img
                            src={f.image}
                            alt={f.title}
                            className="max-h-[120px] w-auto object-contain"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>
                        <p className="text-center text-sm text-gray-700 leading-relaxed px-2" style={{ fontFamily: "Manrope" }}>
                          {f.description}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Desktop Grid - 380x380 Professional Layout */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 place-items-center">
                  {features.map((f, i) => (
                    <motion.div key={i} className="flex flex-col items-center p-8 bg-white border-2 border-[#529D21] rounded-[50px] shadow-sm hover:shadow-2xl transition-all duration-500 w-[380px] h-[380px] group overflow-hidden" whileHover={{ y: -15, scale: 1.02 }}>
                      <h4 className="font-black text-center mb-4 group-hover:text-[#529D21] transition-colors" style={{ fontFamily: "Merriweather", fontSize: "22px", lineHeight: "1.2" }}>{f.title}</h4>
                      <div className="flex-1 flex items-center justify-center mb-4 w-full px-4">
                        <motion.img src={f.image} alt={f.title} className="max-h-[110px] w-auto object-contain" whileHover={{ scale: 1.1 }} />
                      </div>
                      <p className="text-center text-gray-600 leading-relaxed px-2" style={{ fontFamily: "Manrope", fontSize: "14px", height: "auto" }}>{f.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Testimonials Section - Responsive & Animated Version */}
      <div className="w-full py-24 md:py-32 bg-white border-t border-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 md:mb-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8" style={{ fontFamily: "Merriweather", lineHeight: "1.1" }}>
              Nous aidons les bailleurs à gérer sereinement leurs biens
            </h2>
            
          </motion.div>

          {(() => {
            const CARDS = [
              {
                type: "stat",
                num: "97%",
                descText: "de nos clients affirment gagner en efficacité et en productivité.",
                descBold: "gagner en efficacité et en productivité",
                bg: "#c8e6a0", color: "#2d6a0a",
                width: 520, top: 100, left: -80, rotate: 8,
                fromX: -100, fromY: -50, delay: 0,
              },
              {
                type: "stat",
                num: "83%",
                descText: "de nos clients affirment que GestiLoc les aide à apprendre et à mieux gérer.",
                descBold: "aide à apprendre et à mieux gérer",
                bg: "#c9a8e8", color: "#4a1a7a",
                width: 520, top: 340, left: 740, rotate: 4,
                fromX: 100, fromY: 50, delay: 450,
              },
              {
                type: "stat",
                num: "67%",
                descText: "de nos clients recommandent GestiLoc à leur entourage !",
                descBold: "recommandent GestiLoc à leur entourage",
                bg: "#4a7a3a", color: "#d4f0b8",
                width: 520, top: 740, left: 340, rotate: 3,
                fromX: 70, fromY: 70, delay: 750,
              },
              {
                type: "quote",
                quote: '"Je tiens a vous dire un grand merci pour votre site et félicitations car j\'y ai appris énormément de choses. Bravo!"',
                authorName: "Francine", authorPlace: "Paris, France",
                bg: "#eef5eb", border: "1px solid #b0d9a0",
                width: 520, top: 280, left: -60, rotate: -2,
                fromX: -100, fromY: 50, delay: 300,
              },
              {
                type: "quote",
                quote: '"Ce site est un vrai bonheur pour les particuliers bailleurs et m\'aide énormément ! A recommander!!"',
                authorName: "Pierre", authorPlace: "Nîmes, France",
                bg: "#eef5eb", border: "1px solid #b0d9a0",
                width: 520, top: 80, left: 780, rotate: -10,
                fromX: 100, fromY: -50, delay: 150,
              },
              {
                type: "quote",
                quote: '"GestiLoc c\'est génial je fais de la pub à tout mon entourage. Merci à toute votre équipe !"',
                authorName: "Luc", authorPlace: "Abomey-Calavi, Bénin",
                bg: "#eef5eb", border: "1px solid #b0d9a0",
                width: 520, top: 540, left: 380, rotate: -7,
                fromX: -70, fromY: 70, delay: 600,
              },
            ];

            const MOBILE_ROTATES = [4, -5, -2, 3, -4, 2];

            const [show, setShow] = useState(false);
            const [isMobile, setIsMobile] = useState(false);
            const wrapRef = useRef<HTMLDivElement>(null);

            useEffect(() => {
              const check = () => setIsMobile(window.innerWidth < 768);
              check();
              window.addEventListener("resize", check);
              return () => window.removeEventListener("resize", check);
            }, []);

            useEffect(() => {
              const observer = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) { setShow(true); observer.disconnect(); } },
                { threshold: 0.05 }
              );
              if (wrapRef.current) observer.observe(wrapRef.current);
              return () => observer.disconnect();
            }, []);

            function boldify(text: string, bold?: string) {
              if (!bold) return text;
              const parts = text.split(bold);
              if (parts.length < 2) return text;
              return <>{parts[0]}<span className="font-bold">{bold}</span>{parts[1]}</>;
            }

            return (
              <div style={{ background: "#fff", padding: isMobile ? "1rem 0.25rem" : "1rem", width: "100%", fontFamily: "Merriweather, serif" }}>
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Manrope:wght@400;600;700&display=swap');

                  .wr-wrap-desktop {
                    position: relative;
                    width: 100%;
                    max-width: 1240px;
                    height: 1020px;
                    margin: 0 auto;
                  }

                  .wr-wrap-mobile {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.2rem;
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto;
                  }

                  .wr-card-mobile {
                    width: 100% !important;
                    border-radius: 14px;
                    padding: 1.2rem;
                    box-shadow: 0 4px 18px rgba(0,0,0,0.07);
                  }
                `}</style>

                {!isMobile ? (
                  <div className="wr-wrap-desktop" ref={wrapRef}>
                    {CARDS.map((card, i) => {
                      const rot = `rotate(${card.rotate}deg)`;
                      const style = {
                        position: "absolute" as const,
                        borderRadius: 14,
                        padding: "1.6rem 2rem",
                        width: card.width,
                        top: card.top,
                        left: card.left,
                        background: card.bg,
                        border: card.border || "none",
                        opacity: show ? 1 : 0,
                        transform: show
                          ? rot
                          : `rotate(${card.rotate}deg) translate(${card.fromX}px, ${card.fromY}px)`,
                        transition: show
                          ? `transform 0.8s cubic-bezier(0.22,1,0.36,1) ${card.delay}ms, opacity 0.65s ease ${card.delay}ms`
                          : "none",
                        boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
                      };

                      if (card.type === "stat") return (
                        <div key={i} style={{ ...style, display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                          <div style={{ fontSize: "4.5rem", fontWeight: 900, lineHeight: 1.1, flexShrink: 0, color: card.color }}>{card.num}</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.5, fontStyle: "italic", paddingTop: "0.8rem", color: card.color }}>
                            {boldify(card.descText || "", card.descBold)}
                          </div>
                        </div>
                      );

                      return (
                        <div key={i} style={style}>
                          <p style={{ fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.6, color: "#1c1c1c", margin: "0 0 1.2rem" }}>{card.quote}</p>
                          <p style={{ fontSize: "0.9rem", color: "#444" }}>- <span className="font-bold">{card.authorName}</span>, {card.authorPlace}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="wr-wrap-mobile" ref={wrapRef}>
                    {CARDS.map((card, i) => {
                      const rot = MOBILE_ROTATES[i];
                      const mobileStyle = {
                        background: card.bg,
                        border: card.border || "none",
                        transform: show ? `rotate(${rot}deg)` : `rotate(${rot}deg) translateY(40px)`,
                        opacity: show ? 1 : 0,
                        transition: show
                          ? `transform 0.75s cubic-bezier(0.22,1,0.36,1) ${card.delay}ms, opacity 0.6s ease ${card.delay}ms`
                          : "none",
                      };

                      if (card.type === "stat") return (
                        <div key={i} className="wr-card-mobile" style={{ ...mobileStyle, display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                          <div style={{ fontSize: "3rem", fontWeight: 900, lineHeight: 1, flexShrink: 0, color: card.color }}>{card.num}</div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.45, fontStyle: "italic", paddingTop: "0.4rem", color: card.color }}>
                            {boldify(card.descText || "", card.descBold)}
                          </div>
                        </div>
                      );

                      return (
                        <div key={i} className="wr-card-mobile" style={mobileStyle}>
                          <p style={{ fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.55, color: "#1c1c1c", margin: "0 0 0.9rem" }}>{card.quote}</p>
                          <p style={{ fontSize: "0.82rem", color: "#444" }}>- <span className="font-bold">{card.authorName}</span>, {card.authorPlace}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}