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
              Le site automatise la création de vos quittances et contrats de rotation confirmés à la législation béninoise.
            </p>
          </motion.div>

          {/* Comment ça marche ? Section */}
          <div className="mb-12 md:mb-20">
            <motion.h3
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12 italic"
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

      {/* Gestion locative automatisée */}
      <div className="w-full py-12 md:py-20 bg-gradient-to-b from-white to-green-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h3 className="mb-4 text-3xl font-bold text-gray-900">
            Gestion locative <span style={{ color: "#529D21" }}>automatisée</span>
          </motion.h3>
          <p className="text-gray-600 mb-12">Conforme à la législation béninoise</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Quittances', 'Contrats', 'Loyers', 'Rappels'].map((item, i) => (
              <motion.div key={i} className="flex flex-col items-center hover:scale-110 transition-transform" whileHover={{ y: -5 }}>
                <img src={`/Ressource_gestiloc/${item.toLowerCase()}.png`} alt={item} className="w-20 h-20 mb-3 rounded-xl object-contain shadow-sm" />
                <p className="font-semibold text-gray-800">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pourquoi choisir GestiLoc Section - Image 2 Style */}
      <div className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: "Manrope" }}>Pourquoi choisir GestiLoc ?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Nous sommes accessibles, modernes et pensées pour les propriétaires béninois.</p>
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
                            className="max-h-[140px] w-auto object-contain"
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
                    <motion.div key={i} className="flex flex-col items-center p-10 bg-white border-2 border-[#529D21] rounded-[50px] shadow-sm hover:shadow-2xl transition-all duration-500 w-[380px] h-[380px] group" whileHover={{ y: -15, scale: 1.02 }}>
                      <h4 className="font-black text-center mb-6 group-hover:text-[#529D21] transition-colors" style={{ fontFamily: "Merriweather", fontSize: "22px" }}>{f.title}</h4>
                      <div className="flex-1 flex items-center justify-center mb-6">
                        <motion.img src={f.image} alt={f.title} className="max-h-[140px] object-contain" whileHover={{ scale: 1.15 }} />
                      </div>
                      <p className="text-center text-gray-600 leading-relaxed" style={{ fontFamily: "Manrope", fontSize: "15px" }}>{f.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Testimonials Section - Precise Image 1 Recreation */}
      <div className="w-full py-24 md:py-32 bg-[#F3F4F6] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-24" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-8" style={{ fontFamily: "Manrope", lineHeight: "1.1" }}>
              Nous aidons les bailleurs à gérer sereinement leurs locations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "Manrope" }}>
              Nous sommes accessibles, modernes et pensées pour les propriétaires béninois.
            </p>
          </motion.div>

          <div className="relative min-h-[1000px] md:min-h-[900px]">
            {/* Card 1: 97% */}
            <motion.div className="md:absolute top-[5%] left-[0%] bg-[#D7F28B] p-12 rounded-[40px] shadow-lg w-full md:w-[450px]" whileHover={{ scale: 1.05, rotate: 1, zIndex: 10 }} animate={{ y: [0, -20, 0], rotate: [-1, 1, -1] }} transition={{ duration: 5, repeat: Infinity }}>
              <div className="text-7xl font-black text-gray-900 mb-4" style={{ fontFamily: "Manrope" }}>97%</div>
              <p className="text-xl font-bold text-gray-800">de nos clients affirment gagner en efficacité et en productivité.</p>
            </motion.div>

            {/* Card 2: Pierre */}
            <motion.div className="md:absolute top-[10%] right-[0%] bg-[#F0FDF9] p-12 rounded-[50px] shadow-md border border-white/50 w-full md:w-[550px]" whileHover={{ scale: 1.05, rotate: -1, zIndex: 10 }} animate={{ y: [0, 25, 0], rotate: [1, -1, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}>
              <p className="text-gray-800 text-xl mb-10 leading-relaxed italic">"Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"</p>
              <div className="text-gray-900 font-black text-lg">— Pierre, <span className="font-normal text-gray-500">Cotonou, Bénin</span></div>
            </motion.div>

            {/* Card 3: Francine */}
            <motion.div className="md:absolute top-[40%] left-[3%] bg-[#F0FDF9] p-12 rounded-[50px] shadow-md border border-white/50 w-full md:w-[550px]" whileHover={{ scale: 1.05, rotate: 1, zIndex: 10 }} animate={{ y: [0, -30, 0], rotate: [-1, 1, -1] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }}>
              <p className="text-gray-800 text-xl mb-10 leading-relaxed italic">"Je tiens à vous dire un grand merci pour votre site. J'y ai appris énormément de choses. Bravo !"</p>
              <div className="text-gray-900 font-black text-lg">— Francine, <span className="font-normal text-gray-500">Porto-Novo, Bénin</span></div>
            </motion.div>

            {/* Card 4: 83% */}
            <motion.div className="md:absolute top-[50%] right-[3%] bg-[#A855F7] p-12 rounded-[40px] shadow-2xl w-full md:w-[450px] text-white" whileHover={{ scale: 1.05, rotate: -2, zIndex: 10 }} animate={{ y: [0, 20, 0], scale: [1, 1.02, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}>
              <div className="text-7xl font-black mb-4" style={{ fontFamily: "Manrope" }}>83%</div>
              <p className="text-xl font-bold leading-tight">de nos clients affirment que GestiLoc les aide à mieux suivre loyers, charges et quittances.</p>
            </motion.div>

            {/* Card 5: 67% */}
            <motion.div className="md:absolute bottom-[5%] left-[50%] md:translate-x-[-50%] bg-[#065F46] p-14 rounded-[55px] shadow-2xl w-full md:w-[550px] text-white" whileHover={{ scale: 1.05, y: -15, zIndex: 10 }} animate={{ y: [0, -10, 0] }} transition={{ duration: 5.5, repeat: Infinity, delay: 2 }}>
              <div className="text-7xl font-black mb-6" style={{ fontFamily: "Manrope" }}>67%</div>
              <p className="text-xl font-bold leading-tight text-white/95">de nos clients recommandent GestiLoc à leur entourage.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}