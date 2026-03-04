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

          {/* Payment Section - Directement sur le gradient */}
          <motion.h3 
            className="text-center mb-8 pt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "Merriweather, serif",
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: "32px",
              letterSpacing: "-0.17px",
              lineHeight: "100%",
              verticalAlign: "middle"
            }}
          >
            <span className="text-gray-800">Paiement sécurisé </span>
            <span style={{ color: "#9B7FE8" }}>Mobile Money & Carte Bancaire</span>
          </motion.h3>

          <motion.div 
            className="flex flex-wrap justify-center items-center gap-20 md:gap-32 lg:gap-40 pb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {/* MTN */}
            <motion.div 
              className="flex items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            >
              <img 
                src="/Ressource_gestiloc/MTN 1.png" 
                alt="MTN" 
                style={{
                  width: "100px",
                  height: "63px",
                  borderRadius: "10px"
                }}
              />
            </motion.div>

            {/* Moov */}
            <motion.div 
              className="flex items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            >
              <img 
                src="/Ressource_gestiloc/Moov 1.png" 
                alt="Moov" 
                style={{
                  width: "100px",
                  height: "63px",
                  borderRadius: "10px"
                }}
              />
            </motion.div>

            {/* Celtis */}
            <motion.div 
              className="flex items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            >
              <img 
                src="/Ressource_gestiloc/celtis.png" 
                alt="Celtis" 
                style={{
                  width: "100px",
                  height: "63px",
                  borderRadius: "10px"
                }}
              />
            </motion.div>

            {/* Wave */}
            <motion.div 
              className="flex items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            >
              <img 
                src="/Ressource_gestiloc/wave 1.png" 
                alt="Wave" 
                style={{
                  width: "100px",
                  height: "63px",
                  borderRadius: "10px"
                }}
              />
            </motion.div>

            {/* Master Card */}
            <motion.div 
              className="flex items-center hover:scale-110 transition-transform duration-300"
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            >
              <img 
                src="/Ressource_gestiloc/master_card.png" 
                alt="Master Card" 
                style={{
                  width: "100px",
                  height: "63px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0, 0, 0, 1)"
                }}
              />
            </motion.div>
          </motion.div>

          {/* Rating Section - 4.8 Stars */}
          <motion.div 
            className="flex flex-col items-center justify-center py-20 md:py-28"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6"
              style={{ color: '#9B7FE8' }}
            >
              4.8
            </h2>
            <div className="flex gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
                  style={{ color: '#FCD34D' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-medium">1000+ utilisateurs</p>
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

            {/* Features Grid - Mobile carousel, Desktop 3x4 layout */}
            <div className="relative overflow-hidden">
              {/* Mobile Carousel */}
              <div className="md:hidden">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" ref={carouselRef} style={{ scrollSnapType: 'x mandatory' }}>
                  {/* Card 1 - Compte sécurisé */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center p-6 transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)",
                        whiteSpace: "nowrap"
                      }}>Compte sécurisé 24h/24 et 7j/7</h4>
                      <img 
                        src="/Ressource_gestiloc/sécurié.jpg" 
                        alt="Compte sécurisé" 
                        className="object-contain"
                        style={{
                          width: "280px",
                          height: "180px",
                          borderRadius: "15px"
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Card 2 - Baux pré-remplis */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center p-6 transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <img 
                        src="/Ressource_gestiloc/baux_pré_remplie.png" 
                        alt="Baux pré-remplis" 
                        className="mb-4 object-contain"
                        style={{
                          width: "82px",
                          height: "82px"
                        }}
                      />
                      <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)"
                      }}>Modèles de baux pré-remplis</h4>
                      <p className="text-center"><span style={{
                        fontFamily: "Manrope",
                        fontWeight: "500",
                        fontStyle: "Medium",
                        fontSize: "16px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(82, 157, 33, 1)",
                        padding: "1px 4px",
                        borderRadius: "4px"
                      }}>Baux nus, meublés, commerciaux...</span><br/><span style={{
                        fontFamily: "Manrope",
                        fontWeight: "500",
                        fontStyle: "Medium",
                        fontSize: "16px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(82, 157, 33, 1)",
                        padding: "1px 4px",
                        borderRadius: "4px"
                      }}>Générez des contrats conformes à la législation béninoise.</span></p>
                    </motion.div>
                  </div>

                  {/* Card 3 - Quittances */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col justify-start overflow-hidden relative transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "15px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundImage: 'url(/Ressource_gestiloc/Quittance_automautomatisée.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-black/40 rounded-lg" />
                      <div className="relative z-10 text-center p-4 pt-6">
                        <h4 className="font-bold text-white text-lg mb-1" style={{
                          fontFamily: "Manrope",
                          fontWeight: "600",
                          fontStyle: "SemiBold",
                          fontSize: "20px",
                          lineHeight: "100%",
                          letterSpacing: "-0.17px",
                          verticalAlign: "middle"
                        }}>Quittances automatiques</h4>
                      </div>
                    </motion.div>
                  </div>

                  {/* Card 4 - Régularisation */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center p-6 transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <img 
                        src="/Ressource_gestiloc/regularisation.png" 
                        alt="Régularisation" 
                        className="mb-4 object-contain"
                        style={{
                          width: "280px",
                          height: "180px"
                        }}
                      />
                      <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)"
                      }}>Régularisation des charges</h4>
                    </motion.div>
                  </div>

                  {/* Card 5 - Statistiques */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center p-6 transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)"
                      }}>Statistiques & indicateurs</h4>
                      <img 
                        src="/Ressource_gestiloc/statistiques.png" 
                        alt="Statistiques" 
                        className="h-32 object-contain"
                      />
                    </motion.div>
                  </div>

                  {/* Card 6 - Révision */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center p-6 transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <img 
                        src="/Ressource_gestiloc/Revision loyer.png" 
                        alt="Révision de loyers" 
                        className="mb-4 object-contain"
                        style={{
                          width: "53px",
                          height: "45px"
                        }}
                      />
                      <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)"
                      }}>Révision de loyers</h4>
                      <p className="text-center" style={{
                        fontFamily: "Manrope",
                        fontWeight: "500",
                        fontStyle: "Medium",
                        fontSize: "16px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        padding: "21px 4px"
                      }}>Gérez les révisions annuelles de loyer<br/><span style={{
                        color: "rgba(82, 157, 33, 1)"
                      }}>avec rappels automatiques.</span></p>
                    </motion.div>
                  </div>

                  {/* Card 7 - Travaux */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        overflow: "hidden"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        background: "rgba(0, 0, 0, 1)",
                        color: "rgba(0, 0, 0, 1)",
                        padding: "8px 16px",
                        width: "252px",
                        height: "169px",
                        top: "817px",
                        left: "90px",
                        borderRadius: "17px",
                        opacity: "1"
                      }}>Travaux et interventions</h4>
                      <img 
                        src="/Ressource_gestiloc/travaux.png" 
                        alt="Travaux" 
                        className="object-contain"
                        style={{
                          width: "252px",
                          height: "169px",
                          top: "817px",
                          left: "90px",
                          borderRadius: "17px",
                          opacity: "1"
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Card 8 - Comptabilité */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-row items-center justify-between p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <div className="flex flex-col justify-start flex-1 pr-2">
                        <h4 className="font-semibold text-left" style={{
                          fontFamily: "Manrope",
                          fontWeight: "600",
                          fontStyle: "SemiBold",
                          fontSize: "17px",
                          lineHeight: "120%",
                          letterSpacing: "-0.17px",
                          verticalAlign: "middle",
                          color: "rgba(151, 71, 255, 1)"
                        }}>Comptabilité et exportations(CSV, PDF, Excel)</h4>
                      </div>
                      <img 
                        src="/Ressource_gestiloc/comptabilitées.png" 
                        alt="Comptabilité" 
                        className="object-contain flex-shrink-0"
                        style={{
                          width: "110px",
                          height: "110px",
                          borderRadius: "8px"
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Card 9 - État des lieux */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center justify-between p-6 transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <div className="flex justify-center gap-2 w-full mb-0">
                        <img 
                          src="/Ressource_gestiloc/etat_lieux_1.png" 
                          alt="État des lieux" 
                          className="object-contain"
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "12px"
                          }}
                        />
                        <img 
                          src="/Ressource_gestiloc/etat_lieux_2.png" 
                          alt="État des lieux 2" 
                          className="object-contain"
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "12px"
                          }}
                        />
                      </div>
                      <div className="text-center flex-1 flex flex-col justify-end">
                        <h4 className="font-semibold text-gray-900 text-center mb-1" style={{
                          fontFamily: "Manrope",
                          fontWeight: "600",
                          fontStyle: "SemiBold",
                          fontSize: "20px",
                          lineHeight: "100%",
                          letterSpacing: "-0.17px",
                          verticalAlign: "middle"
                        }}>États des lieux & inventaires</h4>
                        <p className="text-gray-600 text-center" style={{
                          fontFamily: "Manrope",
                          fontWeight: "500",
                          fontStyle: "Medium",
                          fontSize: "16px",
                          lineHeight: "100%",
                          letterSpacing: "-0.17px",
                          verticalAlign: "middle"
                        }}>Gérez les révisions annuelles de loyer<br/>avec rappels automatiques.</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Card 10 - Messagerie */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center justify-center p-6 transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        background: "linear-gradient(180deg, #FFFFFF 0%, rgba(151, 71, 255, 0.69) 100%)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <img 
                        src="/Ressource_gestiloc/Circled Envelope.png" 
                        alt="Messagerie" 
                        className="w-16 h-16 mb-4 object-contain"
                      />
                      <h4 className="text-center mb-2" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "#1F2937"
                      }}>Messagerie et notifications</h4>
                      <p className="text-center" style={{
                        fontFamily: "Manrope",
                        fontWeight: "500",
                        fontStyle: "Medium",
                        fontSize: "16px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "#374151"
                      }}>Échangez avec vos locataires et recevez des notifications pour ne rien oublier.</p>
                    </motion.div>
                  </div>

                  {/* Card 11 - Coffre-fort */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-row items-center justify-between p-6 transition-all duration-300"
                      style={{
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundColor: "#FFFFFF"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                    >
                      <div className="flex flex-col justify-center pr-4">
                        <h4 className="font-semibold text-gray-900 mb-2" style={{
                          fontFamily: "Manrope",
                          fontWeight: "600",
                          fontSize: "20px",
                          lineHeight: "100%",
                          letterSpacing: "-0.17px"
                        }}>Coffre-fort documents</h4>
                        <p className="text-sm text-gray-700" style={{
                          fontFamily: "Manrope",
                          fontWeight: "500",
                          fontSize: "14px",
                          lineHeight: "140%",
                          letterSpacing: "-0.14px"
                        }}>Stockez tous vos documents importants dans un espace <span style={{ color: "#529D21" }}>sécurisés et accessible.</span></p>
                      </div>
                      <img 
                        src="/Ressource_gestiloc/secure-folder.png" 
                        alt="Coffre-fort" 
                        className="h-24 w-24 object-contain flex-shrink-0"
                      />
                    </motion.div>
                  </div>

                  {/* Card 12 - Locations saisonnières */}
                  <div className="flex-shrink-0 w-[85vw] max-w-[320px] px-2 snap-center">
                    <motion.div 
                      className="flex flex-col items-center justify-end overflow-hidden relative"
                      style={{ 
                        width: "344px",
                        height: "295px",
                        borderRadius: "25px",
                        border: "1px solid rgba(82, 157, 33, 1)",
                        backgroundImage: 'url(/Ressource_gestiloc/location_saisonnièere.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-[25px]" />
                      <div className="relative z-10 w-full flex justify-center gap-8 pb-6 px-4">
                        <div className="text-center">
                          <p className="text-white font-bold" style={{
                            fontFamily: "Manrope",
                            fontWeight: "700",
                            fontSize: "20px",
                            lineHeight: "100%",
                            letterSpacing: "-0.17px"
                          }}>Locations</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold" style={{
                            fontFamily: "Manrope",
                            fontWeight: "700",
                            fontSize: "20px",
                            lineHeight: "100%",
                            letterSpacing: "-0.17px"
                          }}>Saisonnières</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center mt-4 gap-2">
                  {Array.from({ length: totalCards }).map((_, index) => (
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
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentIndex === index 
                          ? 'bg-[#529D21] w-6' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Grid */}
              <motion.div 
                className="hidden md:grid grid-cols-3 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 }
                  }
                }}
              >
              {/* Card 1 - Compte sécurisé */}
              <motion.div 
                className="flex flex-col items-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)",
                        whiteSpace: "nowrap"
                      }}>Compte sécurisé 24h/24 et 7j/7</h4>
                <img 
                  src="/Ressource_gestiloc/sécurié.jpg" 
                  alt="Compte sécurisé" 
                  className="object-contain"
                  style={{
                    width: "314px",
                    height: "209px",
                    borderRadius: "15px"
                  }}
                />
              </motion.div>

              {/* Card 2 - Baux pré-remplis */}
              <motion.div 
                className="flex flex-col items-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/baux_pré_remplie.png" 
                  alt="Baux pré-remplis" 
                  className="mb-4 object-contain"
                  style={{
                    width: "82px",
                    height: "82px"
                  }}
                />
                <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)"
                      }}>Modèles de baux pré-remplis</h4>
                <p className="text-center"><span style={{
                  fontFamily: "Manrope",
                  fontWeight: "500",
                  fontStyle: "Medium",
                  fontSize: "16px",
                  lineHeight: "100%",
                  letterSpacing: "-0.17px",
                  verticalAlign: "middle",
                  color: "rgba(82, 157, 33, 1)",
                  padding: "1px 4px",
                  borderRadius: "4px"
                }}>Baux nus, meublés, commerciaux...</span><br/><span style={{
                  fontFamily: "Manrope",
                  fontWeight: "500",
                  fontStyle: "Medium",
                  fontSize: "16px",
                  lineHeight: "100%",
                  letterSpacing: "-0.17px",
                  verticalAlign: "middle",
                  color: "rgba(82, 157, 33, 1)",
                  padding: "1px 4px",
                  borderRadius: "4px"
                }}>Générez des contrats conformes à la législation béninoise.</span></p>
              </motion.div>

              {/* Card 3 - Quittances automatisées */}
              <motion.div 
                className="flex flex-col justify-start overflow-hidden relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "15px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundImage: 'url(/Ressource_gestiloc/Quittance_automautomatisée.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="absolute inset-0 bg-black/40 rounded-lg" />
                <div className="relative z-10 text-center p-4 pt-6">
                  <h4 className="font-bold text-white text-lg mb-1" style={{
                    fontFamily: "Manrope",
                    fontWeight: "600",
                    fontStyle: "SemiBold",
                    fontSize: "20px",
                    lineHeight: "100%",
                    letterSpacing: "-0.17px",
                    verticalAlign: "middle"
                  }}>Quittances automatiques</h4>
                </div>
              </motion.div>

              {/* Card 4 - Régularisation des charges */}
              <motion.div 
                className="flex flex-col items-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/regularisation.png" 
                  alt="Régularisation" 
                  className="mb-4 object-contain"
                  style={{
                    width: "280px",
                    height: "180px"
                  }}
                />
                <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)"
                      }}>Régularisation des charges</h4>
              </motion.div>

              {/* Card 5 - Statistiques */}
              <motion.div 
                className="flex flex-col items-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <h4 className="font-semibold text-center mb-4" style={{
                  fontFamily: "Manrope",
                  fontWeight: "600",
                  fontStyle: "SemiBold",
                  fontSize: "20px",
                  lineHeight: "100%",
                  letterSpacing: "-0.17px",
                  verticalAlign: "middle",
                  color: "rgba(0, 0, 0, 1)"
                }}>Statistiques & indicateurs</h4>
                <img 
                  src="/Ressource_gestiloc/statistiques.png" 
                  alt="Statistiques" 
                  className="h-32 object-contain"
                />
              </motion.div>

              {/* Card 6 - Révision de loyers */}
              <motion.div 
                className="flex flex-col items-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/Revision loyer.png" 
                  alt="Révision de loyers" 
                  className="mb-4 object-contain"
                  style={{
                    width: "53px",
                    height: "45px"
                  }}
                />
                <h4 className="font-semibold text-center mb-4" style={{
                        fontFamily: "Manrope",
                        fontWeight: "600",
                        fontStyle: "SemiBold",
                        fontSize: "20px",
                        lineHeight: "100%",
                        letterSpacing: "-0.17px",
                        verticalAlign: "middle",
                        color: "rgba(0, 0, 0, 1)"
                      }}>Révision de loyers</h4>
                <p className="text-center" style={{
                  fontFamily: "Manrope",
                  fontWeight: "500",
                  fontStyle: "Medium",
                  fontSize: "16px",
                  lineHeight: "100%",
                  letterSpacing: "-0.17px",
                  verticalAlign: "middle",
                  padding: "21px 4px"
                }}>Gérez les révisions annuelles de loyer<br/><span style={{
                  color: "rgba(82, 157, 33, 1)"
                }}>avec rappels automatiques.</span></p>
              </motion.div>

              {/* Card 7 - Travaux et interventions */}
              <motion.div 
                className="flex flex-col items-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <h4 className="font-semibold text-center mb-4" style={{
                  fontFamily: "Manrope",
                  fontWeight: "600",
                  fontStyle: "SemiBold",
                  fontSize: "20px",
                  lineHeight: "100%",
                  letterSpacing: "-0.17px",
                  verticalAlign: "middle",
                  color: "rgba(0, 0, 0, 1)"
                }}>Travaux et interventions</h4>
                <img 
                  src="/Ressource_gestiloc/Taux_Interventions.png" 
                  alt="Taux interventions" 
                  className="pt-4"
                  style={{
                    width: "240px",
                    height: "160px",
                    borderRadius: "25px",
                    opacity: "1",
                    objectFit: "contain"
                  }}
                />
               
              </motion.div>

              {/* Card 8 - Comptabilité */}
              <motion.div 
                className="flex flex-row items-center justify-between p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex flex-col justify-start flex-1 pr-2">
                  <h4 className="font-semibold text-left" style={{
                    fontFamily: "Manrope",
                    fontWeight: "600",
                    fontStyle: "SemiBold",
                    fontSize: "17px",
                    lineHeight: "120%",
                    letterSpacing: "-0.17px",
                    verticalAlign: "middle",
                    color: "rgba(151, 71, 255, 1)"
                  }}>Comptabilité et exportations(CSV, PDF, Excel)</h4>
                </div>
                <img 
                  src="/Ressource_gestiloc/comptabilitées.png" 
                  alt="Comptabilité" 
                  className="object-contain flex-shrink-0"
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "8px"
                  }}
                />
              </motion.div>

              {/* Card 9 - État des lieux */}
              <motion.div 
                className="flex flex-col items-center justify-between p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex justify-center gap-2 w-full mb-0">
                  <img 
                    src="/Ressource_gestiloc/etat_lieux_1.png" 
                    alt="État des lieux" 
                    className="object-contain"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px"
                    }}
                  />
                  <img 
                    src="/Ressource_gestiloc/etat_lieux_2.png" 
                    alt="État des lieux 2" 
                    className="object-contain"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px"
                    }}
                  />
                </div>
                <div className="text-center flex-1 flex flex-col justify-end">
                  <h4 className="font-semibold text-gray-900 text-center mb-1" style={{
                    fontFamily: "Manrope",
                    fontWeight: "600",
                    fontStyle: "SemiBold",
                    fontSize: "20px",
                    lineHeight: "100%",
                    letterSpacing: "-0.17px",
                    verticalAlign: "middle"
                  }}>États des lieux & inventaires</h4>
                  <p className="text-gray-600 text-center" style={{
                    fontFamily: "Manrope",
                    fontWeight: "500",
                    fontStyle: "Medium",
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "-0.17px",
                    verticalAlign: "middle"
                  }}>Gérez les révisions annuelles de loyer<br/>avec rappels automatiques.</p>
                </div>
              </motion.div>

              {/* Card 10 - Messagerie */}
              <motion.div 
                className="flex flex-col items-center justify-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  background: "linear-gradient(180deg, #FFFFFF 0%, rgba(151, 71, 255, 0.69) 100%)"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/Circled Envelope.png" 
                  alt="Messagerie" 
                  className="w-16 h-16 mb-4 object-contain"
                />
                <h4 className="font-semibold text-center mb-4" style={{
                  fontFamily: "Manrope",
                  fontWeight: "600",
                  fontStyle: "SemiBold",
                  fontSize: "20px",
                  lineHeight: "100%",
                  letterSpacing: "-0.17px",
                  verticalAlign: "middle",
                  color: "rgba(0, 0, 0, 1)"
                }}>Messagerie et notifications</h4>
                <p className="text-center" style={{
                  fontFamily: "Manrope",
                  fontWeight: "500",
                  fontStyle: "Medium",
                  fontSize: "16px",
                  lineHeight: "100%",
                  letterSpacing: "-0.17px",
                  verticalAlign: "middle",
                  color: "#374151"
                }}>Échangez avec vos locataires et recevez des notifications pour ne rien oublier.</p>
              </motion.div>

              {/* Card 11 - Coffre-fort documents */}
              <motion.div 
                className="flex flex-row items-center justify-between p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundColor: "#FFFFFF"
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex flex-col justify-center pr-4">
                  <h4 className="font-semibold text-gray-900 mb-2" style={{
                    fontFamily: "Manrope",
                    fontWeight: "600",
                    fontSize: "20px",
                    lineHeight: "100%",
                    letterSpacing: "-0.17px"
                  }}>Coffre-fort documents</h4>
                  <p className="text-sm text-gray-700" style={{
                    fontFamily: "Manrope",
                    fontWeight: "500",
                    fontSize: "14px",
                    lineHeight: "140%",
                    letterSpacing: "-0.14px"
                  }}>Stockez tous vos documents importants dans un espace <span style={{ color: "#529D21" }}>sécurisés et accessible.</span></p>
                </div>
                <img 
                  src="/Ressource_gestiloc/secure-folder.png" 
                  alt="Dossiers sécurisés" 
                  className="h-24 w-24 object-contain flex-shrink-0"
                />
              </motion.div>

              {/* Card 12 - Locations & Saisonnières */}
              <motion.div 
                className="flex flex-col items-center justify-end overflow-hidden relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  width: "344px",
                  height: "295px",
                  borderRadius: "25px",
                  border: "1px solid rgba(82, 157, 33, 1)",
                  backgroundImage: 'url(/Ressource_gestiloc/location_saisonnièere.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-[25px]" />
                <div className="relative z-10 w-full flex justify-center gap-8 pb-6 px-4">
                  <div className="text-center">
                    <p className="text-white font-bold" style={{
                      fontFamily: "Manrope",
                      fontWeight: "700",
                      fontSize: "20px",
                      lineHeight: "100%",
                      letterSpacing: "-0.17px"
                    }}>Locations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold" style={{
                      fontFamily: "Manrope",
                      fontWeight: "700",
                      fontSize: "20px",
                      lineHeight: "100%",
                      letterSpacing: "-0.17px"
                    }}>Saisonnières</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
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

          {/* Testimonials Grid */}
          <div className="relative mx-auto w-full max-w-7xl" style={{ width: "1200px", height: "900px" }}>
            {/* GAUCHE */}
            <motion.div 
              className="absolute bg-white border border-gray-300 rounded-xl p-8 flex flex-col justify-between"
              style={{ 
                top: "0px", 
                left: "0px", 
                width: "320px", 
                height: "200px",
                borderWidth: "1.5px",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#555",
                zIndex: 1
              }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: 0.05 }}
            >
              <div className="flex-1" style={{ fontSize: "16px", lineHeight: "1.6", color: "#555" }}>
                "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
              </div>
              <div style={{ fontSize: "16px", fontWeight: "500", color: "#333", marginTop: "12px" }}>
                – Pierre, Cotonou, Bénin
              </div>
            </motion.div>

            <motion.div 
              className="absolute text-white flex flex-col justify-center"
              style={{ 
                top: "183.74px", 
                left: "190px", 
                width: "297px", 
                height: "192px",
                borderRadius: "7px",
                background: "rgba(82, 157, 33, 1)",
                border: "1px solid rgba(82, 157, 33, 1)",
                transform: "rotate(0.5deg)",
                opacity: 1,
                zIndex: 2,
                padding: "30px 30px 25px"
              }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: 0.26 }}
            >
              <div style={{ fontSize: "60px", fontWeight: "800", lineHeight: "1", marginBottom: "10px", letterSpacing: "-1px" }}>
                67%
              </div>
              <div style={{ fontSize: "16px", fontWeight: "400", lineHeight: "1.45" }}>
                de nos clients recommandent GestiLoc à leur entourage.
              </div>
            </motion.div>

            {/* DROITE */}
            <motion.div 
              className="absolute bg-white border border-gray-300 rounded-xl p-8 flex flex-col justify-between"
              style={{ 
                top: "0px", 
                right: "50px", 
                width: "320px", 
                height: "200px",
                borderWidth: "1.5px",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#555",
                zIndex: 1
              }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: 0.12 }}
            >
              <div className="flex-1" style={{ fontSize: "16px", lineHeight: "1.6", color: "#555" }}>
                "Je tiens à vous dire un grand merci pour votre site. J'y ai énormément appris de choses. Bravo !"
              </div>
              <div style={{ fontSize: "16px", fontWeight: "500", color: "#333", marginTop: "12px" }}>
                – Francine, Porto-Novo, Bénin
              </div>
            </motion.div>

            <motion.div 
              className="absolute flex flex-col justify-center"
              style={{ 
                top: "183.74px", 
                left: "1000px",
                width: "297px", 
                height: "192px",
                borderRadius: "7px",
                background: "rgba(131, 199, 87, 1)",
                border: "1px solid rgba(131, 199, 87, 1)",
                transform: "rotate(0.5deg)",
                opacity: 1,
                zIndex: 2,
                padding: "30px 30px 25px"
              }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: 0.34 }}
            >
              <div style={{ fontSize: "60px", fontWeight: "800", lineHeight: "1", marginBottom: "10px", letterSpacing: "-1px", color: "white" }}>
                97%
              </div>
              <div style={{ 
                fontFamily: "Manrope",
                fontWeight: "500",
                fontStyle: "Medium",
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "-0.17px",
                verticalAlign: "middle",
                color: "black"
              }}>
                de nos clients affirment gagner en efficacité et en productivité.
              </div>
            </motion.div>

            {/* CENTRE BAS */}
            <motion.div 
              className="absolute bg-white border border-gray-300 rounded-xl p-8 flex flex-col justify-between"
              style={{ 
                top: "480px", 
                left: "420px", 
                width: "320px", 
                height: "200px",
                borderWidth: "1.5px",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#555",
                zIndex: 1
              }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: 0.48 }}
            >
              <div className="flex-1" style={{ fontSize: "16px", lineHeight: "1.6", color: "#555" }}>
                "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
              </div>
              <div style={{ fontSize: "16px", fontWeight: "500", color: "#333", marginTop: "12px" }}>
                – Pierre, Cotonou, Bénin
              </div>
            </motion.div>

            <motion.div 
              className="absolute bg-purple-500 text-white rounded-xl flex flex-col justify-center"
              style={{ 
                top: "680px", 
                left: "520px", 
                width: "300px", 
                height: "180px",
                padding: "30px 30px 25px",
                zIndex: 2
              }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: 0.60 }}
            >
              <div style={{ fontSize: "60px", fontWeight: "800", lineHeight: "1", marginBottom: "10px", letterSpacing: "-1px" }}>
                83%
              </div>
              <div style={{ fontSize: "16px", fontWeight: "400", lineHeight: "1.45" }}>
                déclarent que le logiciel les aide à mieux suivre les loyers, charges et quittances.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
}