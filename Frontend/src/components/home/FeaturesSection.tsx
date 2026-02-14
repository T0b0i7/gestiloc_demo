// Features images are now used instead of icon components
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white">
      {/* Section Header and Steps */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Animation améliorée */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              GestiLoc vous assiste avec votre gestion locative au Bénin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Le site automatise la création de vos quittances et contrats de location confirmés à la législation béninoise. Pour chaque contrat de location, les loyers et les quittances électroniques sont générés automatiquement chaque mois.
            </p>
          </motion.div>

          {/* Comment ça marche ? Section */}
          <div className="mb-20">
            <motion.h3 
              className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12 italic"
              initial={{ opacity: 0, y: 30, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Comment ça marche ?
            </motion.h3>
          
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 - Animation améliorée */}
              <motion.div 
                className="border-2 border-green-100 rounded-lg p-8 bg-green-50 text-center relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, x: -60, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 rounded-full bg-green-400 text-white font-bold text-lg">1</span>
                <img 
                  src="/Ressource_gestiloc/creer_un_bien.png" 
                  alt="Créer un bien" 
                  className="h-32 mx-auto mb-4 object-contain"
                />
                <h4 className="font-semibold text-gray-800 mb-2">Créer un bien</h4>
                <p className="text-sm text-gray-700">Ajoutez vos propriétés immobilières en quelques clics</p>
              </motion.div>

              {/* Step 2 - Animation améliorée */}
              <motion.div 
                className="border-2 border-orange-100 rounded-lg p-8 bg-orange-50 text-center relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 rounded-full bg-orange-400 text-white font-bold text-lg">2</span>
                <img 
                  src="/Ressource_gestiloc/creer_une_location.png" 
                  alt="Créer une location" 
                  className="h-32 mx-auto mb-4 object-contain"
                />
                <h4 className="font-semibold text-gray-800 mb-2">Créer un locataire</h4>
                <p className="text-sm text-gray-700">Enregistrez les informations de vos locataires</p>
              </motion.div>

              {/* Step 3 - Animation améliorée */}
              <motion.div 
                className="border-2 border-purple-100 rounded-lg p-8 bg-purple-50 text-center relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, x: 60, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 rounded-full bg-purple-400 text-white font-bold text-lg">3</span>
                <img 
                  src="/Ressource_gestiloc/creer_un_locataire.png" 
                  alt="Créer une location" 
                  className="h-32 mx-auto mb-4 object-contain"
                />
                <h4 className="font-semibold text-gray-800 mb-2">Ouvrir une location</h4>
                <p className="text-sm text-gray-700">Créez les contrats et lancez la gestion</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion locative automatisée et Paiement Section - Full Width Background */}
      <div 
        className="w-full py-16 md:py-24 text-center"
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
            <span className="text-2xl font-bold" style={{ color: "#83C757" }}>automatisée</span>
          </motion.h3>
          <p className="text-gray-600 mb-12">Conforme à la législation béninoise</p>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
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
                className="h-20 mb-3 object-contain"
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
                className="h-20 mb-3 object-contain"
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
                className="h-20 mb-3 object-contain"
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
                className="h-20 mb-3 object-contain"
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
            className="flex flex-wrap justify-center items-center gap-16 md:gap-24 pb-16"
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
                className="h-12 object-contain"
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
                className="h-12 object-contain"
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
                className="h-12 object-contain"
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
                className="h-12 object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Rating Section - 4.8 Stars */}
          <motion.div 
            className="flex flex-col items-center justify-center py-16 md:py-20"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-6xl md:text-7xl font-bold mb-4"
              style={{ color: '#9B7FE8' }}
            >
              4.8
            </h2>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  className="w-6 h-6 md:w-8 md:h-8"
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
            <p className="text-sm md:text-base text-gray-700 font-medium">1000+ utilisateurs</p>
          </motion.div>
        </div>
      </div>

      {/* Rest of Content - Back to max-w-7xl */}
      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Pourquoi choisir GestiLoc Section */}
          <motion.div 
            className="mt-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Pourquoi choisir GestiLoc ?
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nous sommes accessibles, modernes et pensées pour les propriétaires béninois.
            </p>
            </motion.div>

            {/* Features Grid - 3x4 layout (3 colonnes, 4 lignes) */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
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
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/secure-folder.png" 
                  alt="Compte sécurisé" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Compte sécurisé 24h/24 et 7j/7</h4>
                <p className="text-xs text-gray-600 text-center">Sécurité maximale pour vos données</p>
              </motion.div>

              {/* Card 2 - Baux pré-remplis */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/baux_pré_remplie.png" 
                  alt="Baux pré-remplis" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Modèles de baux pré-remplis</h4>
                <p className="text-xs text-gray-600 text-center">Baux, quittances, remplissage légal</p>
              </motion.div>

              {/* Card 3 - Quittances automatisées */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/Quittance_automautomatisée.png" 
                  alt="Quittances automatisées" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Quittances automatisées</h4>
                <p className="text-xs text-gray-600 text-center">Génération automatique chaque mois</p>
              </motion.div>

              {/* Card 4 - Régularisation des charges */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/regularisation.png" 
                  alt="Régularisation" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Régularisation des charges</h4>
                <p className="text-xs text-gray-600 text-center">Gestion automatique des charges</p>
              </motion.div>

              {/* Card 5 - Statistiques */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/statistiques.png" 
                  alt="Statistiques" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Statistiques & indicateurs</h4>
                <p className="text-xs text-gray-600 text-center">Suivi en temps réel de vos biens</p>
              </motion.div>

              {/* Card 6 - Révision de loyers */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/Revision loyer.png" 
                  alt="Révision de loyers" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Révision de loyers</h4>
                <p className="text-xs text-gray-600 text-center">Gestion automatique des révisions</p>
              </motion.div>

              {/* Card 7 - Travaux et interventions */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/Taux_Interventions.png" 
                  alt="Taux interventions" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Travaux et interventions</h4>
                <p className="text-xs text-gray-600 text-center">Gestion complète des interventions</p>
              </motion.div>

              {/* Card 8 - Comptabilité */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/comptabilitées.png" 
                  alt="Comptabilité" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Comptabilité et exportations</h4>
                <p className="text-xs text-gray-600 text-center">Export CSV, PDF, Excel</p>
              </motion.div>

              {/* Card 9 - État des lieux */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/etat_lieux_1.png" 
                  alt="État des lieux entrée" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">État des lieux & inventaires</h4>
                <p className="text-xs text-gray-600 text-center">Rapports automatiques</p>
              </motion.div>

              {/* Card 10 - Messagerie */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/Circled Envelope.png" 
                  alt="Messagerie" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">Messagerie et notifications</h4>
                <p className="text-xs text-gray-600 text-center">Échanges sécurisés</p>
              </motion.div>

              {/* Card 11 - Coffre-fort documents */}
              <motion.div 
                className="flex flex-col items-center rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: '#A855F7', border: '1px solid #529D21' }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <img 
                  src="/Ressource_gestiloc/secure-folder.png" 
                  alt="Dossiers sécurisés" 
                  className="h-20 mb-3 object-contain"
                />
                <h4 className="font-semibold text-white text-center text-sm mb-1">Coffre-fort documents</h4>
                <p className="text-xs text-white/80 text-center">Stockage sécurisé</p>
              </motion.div>

              {/* Card 12 - Locations & Saisonnières */}
              <motion.div 
                className="rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 relative group flex flex-col items-center justify-center min-h-[180px]"
                style={{ 
                  border: '1px solid #529D21',
                  backgroundImage: 'url(/Ressource_gestiloc/location_saisonnièere.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors rounded-lg" />
                <div className="relative z-10 text-center p-4">
                  <h4 className="font-bold text-white text-lg mb-1">Locations & Saisonnières</h4>
                  <p className="text-white/90 text-xs">Gestion des locations courtes durées</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
