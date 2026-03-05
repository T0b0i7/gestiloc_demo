// Features images are now used instead of icon components
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const totalCards = 12;

  // Autoplay carousel - continuous scroll left to right then right to left
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        let nextIndex = currentIndex + direction;

        // Change direction at ends
        if (nextIndex >= totalCards - 1) {
          nextIndex = totalCards - 1;
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
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, direction]);

  return (
    <section id="features" className="bg-white">
      {/* Section Header and Steps */}
      <div className="py-8 md:py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Animation améliorée */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              GestiLoc vous assiste avec votre gestion locative au Bénin
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              Le site automatise la création de vos quittances et contrats de location confirmés à la législation béninoise. Pour chaque contrat de location, les loyers et les quittances électroniques sont générés automatiquement chaque mois.
            </p>
          </motion.div>

          {/* Comment ça marche ? Section */}
          <div className="mb-12 md:mb-20">
            <motion.h3
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12 italic"
              initial={{ opacity: 0, y: 30, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Comment ça marche ?
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {/* Step 1 - Animation améliorée */}
              <motion.div
                className="border-2 border-green-100 rounded-lg p-6 md:p-8 bg-green-50 text-center relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, x: -60, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="absolute top-3 md:top-4 left-3 md:left-4 flex items-center justify-center w-10 md:w-12 h-10 md:h-12 rounded-full bg-green-400 text-white font-bold text-lg">1</span>
                <img
                  src="/Ressource_gestiloc/creer_un_bien.png"
                  alt="Créer un bien"
                  className="h-28 md:h-32 mx-auto mb-3 md:mb-4 object-contain"
                />
                <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Créer un bien</h4>
                <p className="text-xs md:text-sm text-gray-700">Ajoutez vos propriétés immobilières en quelques clics</p>
              </motion.div>

              {/* Step 2 - Animation améliorée */}
              <motion.div
                className="border-2 border-orange-100 rounded-lg p-6 md:p-8 bg-orange-50 text-center relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="absolute top-3 md:top-4 left-3 md:left-4 flex items-center justify-center w-10 md:w-12 h-10 md:h-12 rounded-full bg-orange-400 text-white font-bold text-lg">2</span>
                <img
                  src="/Ressource_gestiloc/creer_une_location.png"
                  alt="Créer une location"
                  className="h-28 md:h-32 mx-auto mb-3 md:mb-4 object-contain"
                />
                <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Créer un locataire</h4>
                <p className="text-xs md:text-sm text-gray-700">Enregistrez les informations de vos locataires</p>
              </motion.div>

              {/* Step 3 - Animation améliorée */}
              <motion.div
                className="border-2 border-purple-100 rounded-lg p-6 md:p-8 bg-purple-50 text-center relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, x: 60, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="absolute top-3 md:top-4 left-3 md:left-4 flex items-center justify-center w-10 md:w-12 h-10 md:h-12 rounded-full bg-purple-400 text-white font-bold text-lg">3</span>
                <img
                  src="/Ressource_gestiloc/creer_un_locataire.png"
                  alt="Créer une location"
                  className="h-28 md:h-32 mx-auto mb-3 md:mb-4 object-contain"
                />
                <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Ouvrir une location</h4>
                <p className="text-xs md:text-sm text-gray-700">Créez les contrats et lancez la gestion</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion locative automatisée et Paiement Section - Full Width Background */}
      <div
        className="w-full py-8 md:py-10 lg:py-14 text-center"
        style={{
          background: "linear-gradient(179.27deg, rgba(255, 255, 255, 0.74) 0.63%, rgba(232, 255, 186, 0.71) 58.55%, rgba(255, 255, 255, 0.87) 99.37%)"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h3
            className="mb-3"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              fontFamily: "Lora, serif",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "16px",
              letterSpacing: "-0.17px",
              lineHeight: "100%"
            }}
          >
            <span className="text-2xl font-bold text-gray-900">Gestion locative </span>
            <span className="text-2xl font-bold" style={{ color: "#529D21" }}>automatisée</span>
          </motion.h3>
          <p className="text-gray-600 mb-12">Conforme à la législation béninoise</p>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 lg:gap-16 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.1 }
              }
            }}
          >
            {/* Quittances - Animation améliorée */}
            <motion.div
              className="flex flex-col items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, y: 30, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/Ressource_gestiloc/quittances.png"
                alt="Quittances"
                className="mb-3 object-contain"
                style={{
                  width: "86px",
                  height: "85px",
                  borderRadius: "11px"
                }}
              />
              <p className="font-semibold text-gray-800">Quittances</p>
            </motion.div>

            {/* Contrats - Animation améliorée */}
            <motion.div
              className="flex flex-col items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, y: 30, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/Ressource_gestiloc/contrats.png"
                alt="Contrats"
                className="mb-3 object-contain"
                style={{
                  width: "86px",
                  height: "85px",
                  borderRadius: "11px"
                }}
              />
              <p className="font-semibold text-gray-800">Contrats</p>
            </motion.div>

            {/* Loyers - Animation améliorée */}
            <motion.div
              className="flex flex-col items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, y: 30, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/Ressource_gestiloc/creer_un_locataire.png"
                alt="Loyers"
                className="mb-3 object-contain"
                style={{
                  width: "86px",
                  height: "85px",
                  borderRadius: "11px"
                }}
              />
              <p className="font-semibold text-gray-800">Loyers</p>
            </motion.div>

            {/* Rappels - Animation améliorée */}
            <motion.div
              className="flex flex-col items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, y: 30, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/Ressource_gestiloc/rappels.png"
                alt="Rappels"
                className="mb-3 object-contain"
                style={{
                  width: "86px",
                  height: "85px",
                  borderRadius: "11px"
                }}
              />
              <p className="font-semibold text-gray-800">Rappels</p>
            </motion.div>
          </motion.div>



        </div>
      </div>

      {/* Rest of Content - Back to max-w-7xl */}
      <div className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Pourquoi choisir GestiLoc Section */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Pourquoi choisir GestiLoc ?
              </h3>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Nous sommes accessibles, modernes et pensées pour les propriétaires béninois.
              </p>
            </motion.div>

            {/* Features Data */}
            {(() => {
              const features = [
                {
                  title: "Compte sécurisé 24h/24 et 7j/7",
                  image: "/Ressource_gestiloc/sécurié.jpg",
                  description: "Votre plateforme bénéficie d'une protection totale pour une gestion sereine de vos biens.",
                },
                {
                  title: "Baux pré-remplis",
                  image: "/Ressource_gestiloc/baux_pré_remplie.png",
                  description: "Modèles de baux (nus, meublés, commerciaux) conformes à la législation béninoise.",
                },
                {
                  title: "Quittances automatiques",
                  image: "/Ressource_gestiloc/Quittance_automautomatisée.png",
                  description: "Génération et envoi automatique de vos quittances chaque mois sans effort.",
                },
                {
                  title: "Régularisation des charges",
                  image: "/Ressource_gestiloc/regularisation.png",
                  description: "Calculez et régularisez les charges locatives de manière simple et précise.",
                },
                {
                  title: "Statistiques & indicateurs",
                  image: "/Ressource_gestiloc/statistiques.png",
                  description: "Visualisez la performance de vos investissements grâce à des indicateurs clés.",
                },
                {
                  title: "Révision de loyers",
                  image: "/Ressource_gestiloc/Revision loyer.png",
                  description: "Gérez les révisions annuelles de loyer avec des rappels automatiques programmés.",
                },
                {
                  title: "Travaux et interventions",
                  image: "/Ressource_gestiloc/Taux_Interventions.png",
                  description: "Suivez les interventions techniques et gérez les travaux dans tous vos logements.",
                },
                {
                  title: "Comptabilité & Exportations",
                  image: "/Ressource_gestiloc/comptabilitées.png",
                  description: "Exportez vos données (CSV, PDF, Excel) pour simplifier votre comptabilité foncière.",
                },
                {
                  title: "États des lieux & inventaires",
                  image: "/Ressource_gestiloc/etat_lieux_1.png",
                  description: "Réalisez vos états des lieux et inventaires de manière professionnelle et structurée.",
                },
                {
                  title: "Messagerie et notifications",
                  image: "/Ressource_gestiloc/Circled Envelope.png",
                  description: "Échangez avec vos locataires et recevez des alertes pour ne rien oublier.",
                },
                {
                  title: "Coffre-fort documents",
                  image: "/Ressource_gestiloc/secure-folder.png",
                  description: "Stockez vos documents importants dans un espace hautement sécurisé et accessible.",
                },
                {
                  title: "Locations Saisonnières",
                  image: "/Ressource_gestiloc/location_saisonnièere.png",
                  description: "Suivez vos locations de courte durée avec la même efficacité que vos baux longue durée.",
                }
              ];

              return (
                <div className="relative overflow-hidden">
                  {/* Mobile Carousel */}
                  <div className="md:hidden">
                    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3" ref={carouselRef} style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                      {features.map((feature, index) => (
                        <div key={index} className="flex-shrink-0 w-[75vw] max-w-[280px] px-2 snap-center">
                          <motion.div
                            className="flex flex-col items-center p-4 h-[320px] bg-white border border-[#529D21] rounded-[20px] transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                          >
                            <h4 className="font-bold text-center mb-4 text-black" style={{ fontFamily: "Merriweather, serif", fontSize: "16px" }}>
                              {feature.title}
                            </h4>
                            <div className="flex-1 flex items-center justify-center mb-4 w-full overflow-hidden">
                              <img src={feature.image} alt={feature.title} className={`${feature.title.includes("Messagerie") ? "max-h-[180px] scale-125" : "max-h-[140px]"} w-auto object-contain rounded-lg`} />
                            </div>
                            <p className="text-center text-xs text-black" style={{ fontFamily: "Manrope, sans-serif", lineHeight: "1.4" }}>
                              {feature.description}
                            </p>
                          </motion.div>
                        </div>
                      ))}
                    </div>

                    {/* Carousel Indicators */}
                    <div className="flex justify-center mt-3 mb-1 gap-2">
                      {features.map((_, index) => (
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
                          className={`rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-[#529D21] w-6 h-2' : 'bg-gray-300 w-2 h-2'}`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Desktop Grid */}
                  <div className="hidden md:grid grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center p-8 bg-white border border-[#529D21] rounded-[25px] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 w-full"
                        style={{ minHeight: "380px" }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <h4 className="font-bold text-center mb-6 text-black" style={{ fontFamily: "Merriweather, serif", fontSize: "24px", lineHeight: "1.2" }}>
                          {feature.title}
                        </h4>
                        <div className="flex-1 flex items-center justify-center mb-6 w-full overflow-hidden">
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className={`${feature.title.includes("Messagerie") ? "max-h-[220px] scale-125" : "max-h-[180px]"} w-auto object-contain rounded-xl shadow-sm hover:scale-105 transition-transform duration-300`}
                          />
                        </div>
                        <p className="text-center text-gray-800" style={{ fontFamily: "Manrope, sans-serif", fontSize: "16px", lineHeight: "1.6" }}>
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>

        {/* Testimonials Section - Floating & Animated Cards Layout */}
        <div className="w-full py-20 md:py-32 bg-[#E5E5E5]/40 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{
                fontFamily: "Manrope",
                fontWeight: "700",
                lineHeight: "110%",
                letterSpacing: "-0.02em"
              }}>
                Nous aidons les bailleurs à gérer sereinement leurs emplacements
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{
                fontFamily: "Manrope",
                fontWeight: "400",
                lineHeight: "150%"
              }}>
                Nous sommes accessibles, modernes et pensées pour les propriétaires béninois.
              </p>
            </motion.div>

            <div className="relative min-h-[850px] md:min-h-[950px] lg:min-h-[1000px]">

              {/* Card 1: 97% (Lime Green) - Tilted Right */}
              <motion.div
                className="md:absolute top-[5%] left-[2%] bg-[#D7F28B] p-10 rounded-[35px] shadow-lg w-full md:w-[420px] mb-8 md:mb-0"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [6, 4, 6]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <h4 className="text-6xl font-black text-gray-900 mb-4" style={{ fontFamily: "Manrope" }}>97%</h4>
                <p className="text-xl font-semibold text-gray-800 leading-tight">
                  de nos clients affirment gagner en efficacité et en productivité.
                </p>
              </motion.div>

              {/* Card 2: Pierre Quote (Mint White) - Tilted Left */}
              <motion.div
                className="md:absolute top-[8%] right-[2%] bg-[#F0FDF9] p-10 rounded-[40px] shadow-md border border-gray-100 w-full md:w-[480px] mb-8 md:mb-0"
                initial={{ opacity: 0, x: 50, rotate: 0 }}
                whileInView={{ opacity: 1, x: 0, rotate: -2 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, 20, 0],
                  rotate: [-2, -4, -2]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <p className="text-gray-800 text-xl mb-8 leading-relaxed font-medium">
                  "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
                </p>
                <div className="text-gray-600 font-black text-lg">
                  – Pierre, <span className="font-semibold text-gray-500 text-base">Cotonou, Bénin</span>
                </div>
              </motion.div>

              {/* Card 3: Francine Quote (Mint White) - Very Tilted Left */}
              <motion.div
                className="md:absolute top-[38%] left-[5%] bg-[#F0FDF9] p-10 rounded-[40px] shadow-md border border-gray-100 w-full md:w-[480px] mb-8 md:mb-0"
                initial={{ opacity: 0, x: -50, rotate: 0 }}
                whileInView={{ opacity: 1, x: 0, rotate: -3 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, -25, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <p className="text-gray-800 text-xl mb-8 leading-relaxed font-medium">
                  "Je tiens à vous dire un grand merci pour votre site. J'y ai énormément appris de choses. Bravo !"
                </p>
                <div className="text-gray-600 font-black text-lg">
                  – Francine, <span className="font-semibold text-gray-500 text-base">Porto-Novo, Bénin</span>
                </div>
              </motion.div>

              {/* Card 4: 83% (Purple) - Straight Floating */}
              <motion.div
                className="md:absolute top-[45%] right-[8%] bg-[#A855F7] p-10 rounded-[35px] shadow-2xl w-full md:w-[420px] text-white overflow-hidden mb-8 md:mb-0"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{
                  y: [-10, 15, -10],
                  rotate: [0, 2, 0]
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 1.5
                }}
              >
                <h4 className="text-6xl font-black mb-4" style={{ fontFamily: "Manrope" }}>83%</h4>
                <p className="text-xl font-bold leading-tight">
                  de nos clients affirment que GestiLoc les aide à mieux suivre loyers, charges et quittances.
                </p>
              </motion.div>

              {/* Card 5: 67% (Dark Forest Green) - Large Bottom Center */}
              <motion.div
                className="md:absolute bottom-[5%] left-[50%] md:translate-x-[-50%] bg-[#065F46] p-10 rounded-[40px] shadow-2xl w-full md:w-[460px] text-white mb-8 md:mb-0"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 0.98, 1]
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                <h4 className="text-6xl font-black mb-4" style={{ fontFamily: "Manrope" }}>67%</h4>
                <p className="text-xl font-bold leading-tight text-white/95">
                  de nos clients recommandent GestiLoc à leur entourage.
                </p>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}