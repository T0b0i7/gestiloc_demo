import React from 'react';
import { motion } from 'framer-motion';
import { Check, Mail, Phone, Globe, Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';

const Features = () => {
  const features = [
    {
      id: 1,
      title: "Compte sécurisé",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/sécurié.jpg",
      description: "Accédez à votre espace de gestion 24h/24 et 7j/7 en toute sécurité.",
      benefits: [
        "Chiffrement des données",
        "Authentification double facteur",
        "Sauvegardes automatiques",
        "Accès multi-appareils"
      ]
    },
    {
      id: 2,
      title: "Gestion des biens",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f1.jpg",
      description: "Centralisez tous vos biens immobiliers avec une interface claire et organisée.",
      benefits: [
        "Filtres biens (par type, statut)",
        "Historique des loyers et charges",
        "Documents associés (diagnostics)",
        "Suivi des règlements"
      ]
    },
    {
      id: 3,
      title: "Dossier des locataires",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f2.png",
      description: "Gérez vos locataires et leurs dossiers en conformité avec la réglementation.",
      benefits: [
        "Coordonnées et pièces d'identité",
        "Informations sur les garants",
        "Historique des paiements",
        "Documents et attestations"
      ]
    },
    {
      id: 4,
      title: "Baux et annexes",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f3.jpg",
      description: "Créez et suivez facilement vos baux et documents contractuels.",
      benefits: [
        "Modèles multilingues",
        "Génération automatique",
        "Envoi par email intégré",
        "Signature électronique"
      ]
    },
    {
      id: 5,
      title: "Loyers et quittances",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f4.png",
      description: "Automatisez l'émission et le suivi des quittances de loyer.",
      benefits: [
        "Génération mensuelle",
        "Envoi automatique",
        "Suivi des impayés",
        "Relances automatiques"
      ]
    },
    {
      id: 6,
      title: "Révision de loyers",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f5.jpg",
      description: "Automatisez la révision annuelle de vos loyers sans effort.",
      benefits: [
        "Calcul selon les indices réels",
        "Rappels automatiques",
        "Historique des révisions",
        "Courriers de notification"
      ]
    },
    {
      id: 7,
      title: "Comptabilité et fiscalité",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f6.jpg",
      description: "Suivez vos revenus et charges avec une comptabilité simplifiée.",
      benefits: [
        "Tableau de bord dynamique",
        "Rapports personnalisables",
        "Export CSV, Excel, PDF",
        "Aide à la déclaration fiscale"
      ]
    },
    {
      id: 8,
      title: "États des lieux",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f7.jpg",
      description: "Réalisez des états des lieux directement depuis votre smartphone.",
      benefits: [
        "Modèles structurés",
        "Photos illimitées",
        "Signature sur tablette",
        "Comparaison entrée/sortie"
      ]
    },
    {
      id: 9,
      title: "Interventions et travaux",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f8.jpg",
      description: "Gérez vos demandes d'intervention et suivez les chantiers.",
      benefits: [
        "Tickets locataires",
        "Gestion des prestataires",
        "Suivi budgétaire",
        "Historique complet"
      ]
    },
    {
      id: 10,
      title: "Messagerie intégrée",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f9.png",
      description: "Communiquez facilement avec vos locataires et prestataires par messagerie.",
      benefits: [
        "Conversations centralisées",
        "Notifications temps réel",
        "Partage de fichiers",
        "Archivage sécurisé"
      ]
    },
    {
      id: 11,
      title: "Locations saisonnières",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f10.jpg",
      description: "Module dédié pour gérer vos locations de courte durée avec efficacité.",
      benefits: [
        "Calendrier partagé",
        "Sync (Airbnb, Booking)",
        "Tarification flexible",
        "Automatisation des séjours"
      ]
    },
  ];

  return (
    <div
      className="min-h-screen pt-20 pb-0 overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(225, 255, 206, 0.89) 0%, #FFFFFF 20.19%)' }}
    >

      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-6 pt-10 text-center">
        <motion.h1
          className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 font-merriweather"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Tout ce que vous pouvez faire avec GestiLoc
        </motion.h1>

        <motion.div
          className="bg-[#D9EDC9] rounded-[24px] p-6 md:p-10 mb-16 shadow-sm border border-[#C5DDB5] max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-[#2D4A22] text-base md:text-lg leading-relaxed font-manrope font-medium">
            La plateforme de GestiLoc s'occupe de vos besoins de gestion locative. Explorez les fonctionnalités détaillées de notre logiciel afin de gérer vos biens et vos locataires en toute sérénité. Elle a été pensée pour faciliter le quotidien de tout le monde.
          </p>
        </motion.div>
      </div>

      {/* 4 Lines x 3 Columns Grid - Optimized for Desktop */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 pb-20 mt-10">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
            className={`bg-white rounded-[32px] border-[2px] ${feature.color} p-6 md:p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all duration-300 group`}
          >
            {/* Image Container */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-[#F1F9EB] bg-[#F1F9EB] mb-6 p-1 overflow-hidden transition-transform duration-300 group-hover:scale-110">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <h2 className={`text-xl md:text-2xl font-bold mb-4 ${feature.textColor} font-merriweather`}>
              {feature.title}
            </h2>

            <p className="text-gray-900 text-sm md:text-base mb-8 max-w-sm font-manrope font-semibold leading-relaxed">
              {feature.description}
            </p>

            <div className="w-full space-y-4 px-2">
              {feature.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  {/* Solid Green Pastille with Checkmark */}
                  <div className={`w-6 h-6 rounded-full ${feature.textColor.replace('text-', 'bg-')} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
                    <Check className="w-4 h-4 text-white font-bold" />
                  </div>
                  <span className="text-gray-700 text-left text-sm md:text-[15px] font-manrope font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section - House Shape at Bottom */}
      <div className="relative mt-20 pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-end">
          <svg
            viewBox="0 0 1440 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto mb-[-2px]"
            preserveAspectRatio="none"
          >
            <path d="M0 200L720 0L1440 200V800H0V200Z" fill="#D9EDC9" />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pb-20 pt-32 md:pt-48">
          <div className="mb-10 flex justify-center">
            <img
              src="/Ressource_gestiloc/logo_imobi.png"
              alt="Logo GestiLoc"
              className="w-56 md:w-72 h-auto object-contain"
            />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 font-merriweather leading-tight max-w-3xl mx-auto">
            Libérez-vous des soucis de gestion de loyer dès aujourd'hui !
          </h2>

          <p className="text-gray-700 text-base md:text-xl mb-12 max-w-3xl mx-auto font-manrope font-medium leading-relaxed">
            GestiLoc est l'outil indispensable pour les propriétaires indépendants désireux de professionnaliser et simplifier leur gestion locative.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#529D21] flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="font-manrope font-bold text-gray-800">Solution clef en main</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#529D21] flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="font-manrope font-bold text-gray-800">Évolutif selon vos besoins</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#A3E635] text-gray-900 px-12 py-4 rounded-full font-bold text-xl shadow-xl hover:bg-[#91ce2f] transition-colors"
          >
            En savoir plus
          </motion.button>
        </div>

        {/* Footer Links Section */}
        <div className="relative z-10 bg-[#D9EDC9] border-t border-black/5 pt-16 pb-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Contact</h4>
              <ul className="space-y-4 text-[15px] text-gray-700 font-manrope">
                <li className="flex items-center justify-center md:justify-start gap-3"><Mail size={18} className="text-[#529D21]" /> Support client</li>
                <li className="flex items-center justify-center md:justify-start gap-3"><Phone size={18} className="text-[#529D21]" /> +229 XX XX XX XX</li>
                <li className="flex items-center justify-center md:justify-start gap-3"><Globe size={18} className="text-[#529D21]" /> Cotonou, Bénin</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">L'entreprise</h4>
              <ul className="space-y-4 text-[15px] text-gray-700 font-manrope">
                <li className="hover:text-[#529D21] cursor-pointer transition-colors">À propos</li>
                <li className="hover:text-[#529D21] cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-[#529D21] cursor-pointer transition-colors">Mentions légales</li>
                <li className="hover:text-[#529D21] cursor-pointer transition-colors">Conditions générales</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest text-center">Réseaux sociaux</h4>
              <div className="flex justify-center gap-6">
                <Facebook size={24} className="text-gray-700 hover:text-[#529D21] cursor-pointer transition-all hover:scale-110" />
                <Twitter size={24} className="text-gray-700 hover:text-[#529D21] cursor-pointer transition-all hover:scale-110" />
                <Linkedin size={24} className="text-gray-700 hover:text-[#529D21] cursor-pointer transition-all hover:scale-110" />
                <Instagram size={24} className="text-gray-700 hover:text-[#529D21] cursor-pointer transition-all hover:scale-110" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Plateforme</h4>
              <ul className="space-y-4 font-bold">
                <li className="flex items-center justify-center md:justify-start gap-3 text-[#529D21] cursor-pointer hover:underline underline-offset-4">
                  <span className="w-2 h-2 rounded-full bg-[#529D21]"></span> Inscription
                </li>
                <li className="flex items-center justify-center md:justify-start gap-3 text-gray-800 cursor-pointer hover:underline underline-offset-4">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span> Connexion
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-20 pt-8 border-t border-black/10 text-xs text-gray-600 font-manrope">
            © 2024 GestiLoc. All rights reserved. Made with ❤️ in Bénin.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
