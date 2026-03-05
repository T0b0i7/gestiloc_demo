import React from 'react';
import { motion } from 'framer-motion';
import { Check, Mail, Phone, Globe, Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';

const Features = () => {
  const features = [
    {
      id: 1,
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
      id: 2,
      title: "Dossier des locataires",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
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
      id: 3,
      title: "Baux et annexes",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
      title: "États des lieux",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
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
      id: 8,
      title: "Interventions et travaux",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
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
      id: 9,
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
      id: 10,
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

    </div>
  );
};

export default Features;
