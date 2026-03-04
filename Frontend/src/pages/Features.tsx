import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Mail, Phone, Globe, Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';

const Features = () => {
  const features = [
    {
      id: 1,
      title: "Gestion des biens",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f10.jpg",
      description: "Centralisez tous vos biens immobiliers avec une interface claire et organisée.",
      benefits: [
        "Filtres biens (par type, statut)",
        "Historique des loyers et charges",
        "Documents associés (diagnostics, assurances)",
        "Suivi des règlements et maintenance"
      ]
    },
    {
      id: 2,
      title: "Dossier des locataires",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f7.jpg",
      description: "Gérez vos locataires et leurs dossiers en toute conformité avec la réglementation.",
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
      image: "/Ressource_gestiloc/f6.jpg",
      description: "Créez et suivez facilement vos baux et documents contractuels.",
      benefits: [
        "Modèles pour résidence principale, meublé, parking, commercial",
        "Génération automatique depuis les données",
        "Envoi des baux par email intégré",
        "Signature électronique disponible"
      ]
    },
    {
      id: 4,
      title: "Loyers et quittances",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f5.jpg",
      description: "Automatisez l'émission et le suivi des quittances de loyer.",
      benefits: [
        "Génération automatique mensuelle",
        "Envoi par email au locataire",
        "Suivi des paiements et impayés",
        "Relances automatiques"
      ]
    },
    {
      id: 5,
      title: "Révision de loyers",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f8.jpg",
      description: "Automatisez la révision annuelle de vos loyers.",
      benefits: [
        "Calcul automatique selon l'indice",
        "Rappels avant la date de révision",
        "Historique des révisions",
        "Génération des courriers de notification"
      ]
    },
    {
      id: 6,
      title: "Comptabilité et fiscalité",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f4.png",
      description: "Suivez vos revenus et charges avec une comptabilité simplifiée.",
      benefits: [
        "Tableau de bord avec KPIs",
        "Rapports personnalisables",
        "Exportation compatible (CSV, Excel, PDF)",
        "Préparation déclaration fiscale"
      ]
    },
    {
      id: 7,
      title: "États des lieux",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f3.jpg",
      description: "Réalisez des états des lieux directement depuis votre smartphone.",
      benefits: [
        "Modèles structurés par pièce",
        "Photos et vidéos illimitées",
        "Signature électronique",
        "Comparaison entrée/sortie facile"
      ]
    },
    {
      id: 8,
      title: "Interventions et travaux",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f2.png",
      description: "Gérez vos demandes d'intervention et suivez les travaux.",
      benefits: [
        "Tickets d'intervention locataire",
        "Attribution aux prestataires",
        "Suivi en temps réel",
        "Historique et coûts"
      ]
    },
    {
      id: 9,
      title: "Messagerie intégrée",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f9.jpg",
      description: "Communiquez facilement avec vos locataires et prestataires.",
      benefits: [
        "Conversations par bien ou locataire",
        "Notifications par email ou push",
        "Pièces jointes",
        "Historique complet"
      ]
    },
    {
      id: 10,
      title: "Locations saisonnières",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f1.jpg",
      description: "Module dédié pour gérer vos emplacements de courte durée.",
      benefits: [
        "Calendrier de disponibilité",
        "Synchronisation (Airbnb, Booking...)",
        "Tarifs variables selon la saison",
        "Gestion des réservations"
      ]
    },
  ];

  return (
    <div className="font-sans text-[#1a1a1a]">
      {/* Container Background */}
      <div className="bg-[#E9F5E1] min-h-screen pb-20">

        {/* Header Content */}
        <div className="max-w-4xl mx-auto pt-16 px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1F3A19] mb-8">
            Toutes les fonctionnalités réunies!
          </h1>

          <div className="bg-[#D8ECC8] rounded-2xl p-6 md:p-8 mb-16 shadow-sm border border-[#C5E0AF]">
            <p className="text-[#2D4A22] text-lg md:text-xl leading-relaxed">
              La plateforme de GestiLoc s'occupe de vos besoins de gestion locative. Explorez les fonctionnalités détaillées de notre logiciel afin de gérer vos biens et vos locataires en toute sérénité. Elle a été pensée pour faciliter le quotidien de tout le monde.
            </p>
          </div>
        </div>

        {/* Features Cards Grid */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-[32px] border-[1px] ${feature.color} p-8 relative flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              {/* Image Circle */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-dashed border-gray-200 p-2 bg-white -mt-16 sm:-mt-20 mb-6 shadow-md overflow-hidden flex items-center justify-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${feature.textColor}`}>
                {feature.title}
              </h2>

              <p className="text-gray-600 mb-8 max-w-sm text-lg italic">
                {feature.description}
              </p>

              <div className="w-full space-y-4">
                {feature.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#87C44E] flex-shrink-0" />
                    <span className="text-gray-700 text-left text-base md:text-lg font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
