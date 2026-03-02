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
      description: "Centralisez tous vos biens immobiliers avec leurs caractéristiques détaillées : adresse, type, surface, équipements, charges...",
      benefits: [
        "Fiches biens complètes avec photos",
        "Historique des lieux et travaux",
        "Documents associés (diagnostics, assurances)",
        "Suivi des équipements et maintenances"
      ]
    },
    {
      id: 3,
      title: "Révision de loyer",
      color: "border-[#529D21]",
      textColor: "text-[#529D21]",
      image: "/Ressource_gestiloc/f8.jpg",
      description: "Des outils de révision automatisés pour que vos loyers soient toujours à jour sans effort.",
      benefits: [
        "Calcul automatique selon les indices",
        "Suivi des dates anniversaires",
        "Génération des courriers de révision",
        "Historique des indexations"
      ]
    },
    {
      id: 4,
      title: "Dossier locataire",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f7.jpg",
      description: "Accédez à toutes les informations et pièces justificatives de vos locataires en un clic.",
      benefits: [
        "Base de données sécurisée",
        "Suivi des pièces justificatives",
        "Historique complet du locataire",
        "Gestion simplifiée des garants"
      ]
    },
    {
      id: 5,
      title: "Baux et annexes",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f6.jpg",
      description: "Générez des contrats de location et leurs annexes conformes à la législation locale.",
      benefits: [
        "Modèles de baux pré-remplis",
        "Génération automatique d'annexes",
        "Signature électronique intégrée",
        "Conformité juridique garantie"
      ]
    },
    {
      id: 6,
      title: "Loyer et quittances",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f5.jpg",
      description: "Gérez vos encaissements et générez des quittances automatiques pour vos locataires.",
      benefits: [
        "Génération automatique des quittances",
        "Suivi des paiements en temps réel",
        "Relances automatiques pour impayés",
        "Envoi électronique sécurisé"
      ]
    },
    {
      id: 7,
      title: "Comptabilité et fiscalité",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f4.png",
      description: "Simplifiez vos déclarations et suivez la rentabilité de vos investissements.",
      benefits: [
        "Calcul automatique de l'IBLD",
        "Rapports de revenus et dépenses",
        "Préparation aux déclarations fiscales",
        "Export comptable facile"
      ]
    },
    {
      id: 8,
      title: "Etats des lieux",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f3.jpg",
      description: "Réalisez vos états des lieux digitaux avec photos pour éviter tout litige.",
      benefits: [
        "Modèles d'états des lieux complets",
        "Prise de photos intégrée",
        "Comparaison entrée/sortie facile",
        "Signature sur tablette ou mobile"
      ]
    },
    {
      id: 9,
      title: "Intervention et travaux",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f2.png",
      description: "Planifiez et suivez les interventions de maintenance pour maintenir vos biens en état.",
      benefits: [
        "Suivi des demandes d'intervention",
        "Gestion des devis et factures",
        "Historique des travaux par bien",
        "Carnet d'entretien numérique"
      ]
    },
    {
      id: 10,
      title: "Location saisonnière",
      color: "border-[#9747FF]",
      textColor: "text-[#9747FF]",
      image: "/Ressource_gestiloc/f1.jpg",
      description: "Gérez vos locations courte durée avec la même simplicité qu'une location classique.",
      benefits: [
        "Calendrier de réservations",
        "Suivi des check-in / check-out",
        "Gestion des services de ménage",
        "Statistiques de taux d'occupation"
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
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
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
