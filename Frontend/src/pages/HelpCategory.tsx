import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const categoryArticles: Record<string, { title: string; description: string; articles: Array<{ title: string; slug: string; content: string }> }> = {
  "comptes-profils": {
    title: "Comptes & Profils",
    description: "Gérez votre compte et vos paramètres",
    articles: [
      {
        title: "Comment créer un compte propriétaire",
        slug: "creer-compte-proprietaire",
        content: "Pour créer un compte propriétaire sur GestiLoc, cliquez sur 'Inscription' en haut à droite. Remplissez le formulaire avec vos informations personnelles : nom, prénom, email et mot de passe sécurisé. Validez votre email via le lien de confirmation reçu par mail."
      },
      {
        title: "Réinitialiser mon mot de passe",
        slug: "reinitialiser-mot-de-passe",
        content: "Si vous avez oublié votre mot de passe, cliquez sur 'Mot de passe oublié' sur la page de connexion. Saisissez votre adresse email et vous recevrez un lien de réinitialisation. Cliquez sur ce lien et définissez un nouveau mot de passe sécurisé."
      },
      {
        title: "Modifier mes informations personnelles",
        slug: "modifier-informations",
        content: "Pour modifier vos informations personnelles, connectez-vous et accédez à 'Mon profil' dans le menu. Vous pouvez y modifier votre nom, prénom, numéro de téléphone et adresse. N'oubliez pas de sauvegarder vos modifications."
      },
      {
        title: "Gérer mes préférences de notifications",
        slug: "preferences-notifications",
        content: "Dans les paramètres de votre compte, section 'Notifications', vous pouvez activer ou désactiver les notifications par email et SMS pour les loyers, les interventions et les messages des locataires."
      },
      {
        title: "Supprimer mon compte",
        slug: "supprimer-compte",
        content: "Pour supprimer votre compte, rendez-vous dans Paramètres > Compte > Supprimer mon compte. Attention : cette action est irréversible et supprimera toutes vos données."
      },
    ]
  },
  "gestion-biens": {
    title: "Gestion des biens",
    description: "Ajoutez et gérez vos propriétés",
    articles: [
      {
        title: "Ajouter un bien immobilier",
        slug: "ajouter-bien",
        content: "Pour ajouter un bien, accédez à 'Mes biens' puis cliquez sur 'Ajouter un bien'. Renseignez l'adresse complète, le type de bien (appartement, maison, studio), la surface, le nombre de pièces et ajoutez des photos. Vous pouvez aussi indiquer les équipements disponibles."
      },
      {
        title: "Modifier les informations d'un bien",
        slug: "modifier-bien",
        content: "Dans la liste de vos biens, cliquez sur le bien à modifier puis sur 'Modifier'. Vous pouvez changer toutes les informations : adresse, surface, loyer, description, photos et équipements."
      },
      {
        title: "Archiver ou supprimer un bien",
        slug: "archiver-bien",
        content: "Pour archiver un bien que vous ne louez plus, cliquez sur 'Archiver' dans les options du bien. Le bien restera dans votre historique. Pour supprimer définitivement un bien sans locataire ni historique, utilisez l'option 'Supprimer'."
      },
      {
        title: "Gérer les photos de mon bien",
        slug: "photos-bien",
        content: "Dans la fiche du bien, section 'Photos', vous pouvez ajouter jusqu'à 10 photos. Glissez-déposez vos images ou cliquez pour les sélectionner. Vous pouvez réorganiser l'ordre des photos et définir une photo principale."
      },
    ]
  },
  "baux-locataires": {
    title: "Baux et Locataires",
    description: "Gérez vos contrats et locataires",
    articles: [
      {
        title: "Créer un nouveau bail",
        slug: "creer-bail",
        content: "Pour créer un bail, sélectionnez le bien concerné puis cliquez sur 'Nouveau bail'. Renseignez les dates de début et fin, le montant du loyer, la caution, et les informations du locataire. Le système génère automatiquement un contrat de bail conforme."
      },
      {
        title: "Ajouter un locataire",
        slug: "ajouter-locataire",
        content: "Lors de la création d'un bail, ajoutez les informations du locataire : nom, prénom, email, téléphone, numéro Mobile Money. Le locataire recevra une invitation à créer son compte pour accéder à son espace locataire."
      },
      {
        title: "Renouveler un bail",
        slug: "renouveler-bail",
        content: "À l'approche de l'échéance du bail, vous recevrez une notification. Cliquez sur 'Renouveler le bail' pour créer un nouveau contrat avec les mêmes informations ou modifier le loyer et les conditions."
      },
      {
        title: "Résilier un bail",
        slug: "resilier-bail",
        content: "Pour résilier un bail, accédez à la fiche du locataire puis cliquez sur 'Résilier le bail'. Indiquez la date de fin effective et le motif. Le système calculera automatiquement les derniers paiements dus."
      },
      {
        title: "Gérer plusieurs locataires pour un même bien",
        slug: "colocataires",
        content: "Pour un bien en colocation, vous pouvez ajouter plusieurs locataires au même bail. Définissez la répartition des charges et du loyer entre les colocataires."
      },
    ]
  },
  "paiements-loyers": {
    title: "Paiements et Loyers",
    description: "Suivez les paiements et gérez les quittances",
    articles: [
      {
        title: "Enregistrer un paiement Mobile Money",
        slug: "enregistrer-paiement",
        content: "Lorsqu'un locataire effectue un paiement Mobile Money, enregistrez-le dans 'Paiements' en indiquant le montant, la date et le numéro de transaction Mobile Money. Le système met à jour automatiquement le solde du locataire."
      },
      {
        title: "Générer une quittance de loyer",
        slug: "generer-quittance",
        content: "Après avoir enregistré un paiement, cliquez sur 'Générer quittance' pour créer un reçu officiel. La quittance est automatiquement envoyée par email au locataire et stockée dans votre coffre-fort numérique."
      },
      {
        title: "Gérer les impayés",
        slug: "gerer-impayes",
        content: "Le tableau de bord affiche les loyers impayés en rouge. Vous pouvez envoyer des relances automatiques par SMS et email au locataire. Le système calcule les pénalités de retard selon les conditions du bail."
      },
      {
        title: "Configurer les paiements récurrents",
        slug: "paiements-recurrents",
        content: "Pour faciliter le suivi, configurez les échéances de loyer mensuelles. Le système créera automatiquement les lignes de paiement attendues et vous alertera en cas de retard."
      },
      {
        title: "Envoyer une relance de paiement",
        slug: "relance-paiement",
        content: "Dans la section Paiements, sélectionnez le loyer impayé et cliquez sur 'Envoyer une relance'. Vous pouvez personnaliser le message qui sera envoyé par SMS et email au locataire."
      },
    ]
  },
  "documents-coffre": {
    title: "Documents et coffre-fort",
    description: "Tout sur le stockage et partage",
    articles: [
      {
        title: "Télécharger un document dans le coffre-fort",
        slug: "telecharger-document",
        content: "Accédez au coffre-fort numérique et cliquez sur 'Ajouter un document'. Glissez-déposez vos fichiers (PDF, images, Word) ou sélectionnez-les. Organisez-les par catégories : baux, quittances, états des lieux, factures, etc."
      },
      {
        title: "Partager un document avec un locataire",
        slug: "partager-document",
        content: "Dans la fiche d'un document, cliquez sur 'Partager'. Sélectionnez le ou les locataires destinataires. Ils recevront une notification et pourront consulter le document depuis leur espace locataire."
      },
      {
        title: "Organiser mes documents par dossier",
        slug: "organiser-documents",
        content: "Créez des dossiers personnalisés pour organiser vos documents par bien, par locataire ou par type. Vous pouvez déplacer les documents entre dossiers et ajouter des tags pour faciliter la recherche."
      },
      {
        title: "Rechercher un document",
        slug: "rechercher-document",
        content: "Utilisez la barre de recherche en haut du coffre-fort pour retrouver rapidement un document par nom, date ou tag. Vous pouvez aussi filtrer par type de document ou par bien immobilier."
      },
    ]
  },
  "interventions-travaux": {
    title: "Interventions et Travaux",
    description: "Gérer les pannes et travaux",
    articles: [
      {
        title: "Créer une demande d'intervention",
        slug: "creer-intervention",
        content: "Accédez à 'Interventions' et cliquez sur 'Nouvelle intervention'. Sélectionnez le bien concerné, décrivez le problème, ajoutez des photos et définissez le niveau d'urgence. Vous pouvez assigner l'intervention à un prestataire."
      },
      {
        title: "Suivre l'état d'une intervention",
        slug: "suivre-intervention",
        content: "Toutes vos interventions sont listées avec leur statut : en attente, en cours, terminée. Cliquez sur une intervention pour voir les détails, les échanges avec le prestataire et les photos avant/après."
      },
      {
        title: "Ajouter un prestataire",
        slug: "ajouter-prestataire",
        content: "Dans 'Prestataires', cliquez sur 'Ajouter un prestataire'. Renseignez son nom, spécialité (plombier, électricien, etc.), téléphone et email. Vous pourrez ensuite lui assigner des interventions."
      },
      {
        title: "Planifier des travaux",
        slug: "planifier-travaux",
        content: "Pour des travaux d'envergure, créez un projet dans 'Travaux'. Définissez les tâches, leur ordre, les prestataires et le budget. Le système vous aide à suivre l'avancement et les dépenses."
      },
    ]
  },
  "comptabilite-fiscalite": {
    title: "Comptabilité et Fiscalité",
    description: "Revenus, charges et rentabilité",
    articles: [
      {
        title: "Exporter mes données comptables",
        slug: "export-comptable",
        content: "Dans 'Comptabilité', cliquez sur 'Exporter' et sélectionnez la période. Vous pouvez exporter vos données au format Excel ou PDF pour les transmettre à votre comptable ou pour vos déclarations fiscales."
      },
      {
        title: "Suivre mes revenus locatifs",
        slug: "revenus-locatifs",
        content: "Le tableau de bord comptable affiche vos revenus locatifs mois par mois. Vous pouvez filtrer par bien, voir les tendances annuelles et comparer les performances de vos différents biens."
      },
      {
        title: "Gérer mes charges et dépenses",
        slug: "charges-depenses",
        content: "Enregistrez toutes vos dépenses dans 'Charges' : travaux, entretien, taxe foncière, assurance, etc. Joignez les factures et catégorisez les dépenses pour faciliter votre suivi et vos déclarations."
      },
      {
        title: "Calculer ma rentabilité",
        slug: "calculer-rentabilite",
        content: "L'outil de calcul de rentabilité vous permet de voir le rendement de chaque bien. Il prend en compte les loyers perçus, les charges, les impayés et les dépenses pour calculer votre rentabilité nette."
      },
      {
        title: "Préparer ma déclaration fiscale",
        slug: "declaration-fiscale",
        content: "GestiLoc génère un récapitulatif annuel de vos revenus fonciers avec toutes les informations nécessaires pour votre déclaration d'impôts. Consultez 'Fiscalité' puis 'Récapitulatif annuel'."
      },
    ]
  },
};

export default function HelpCategory() {
  const { category } = useParams();
  const categoryData = category ? categoryArticles[category] : null;

  if (!categoryData) {
    return (
      <div className="flex flex-col items-center justify-center p-4 py-20 bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Catégorie non trouvée</h1>
        <Button asChild>
          <Link to="/help">Retour à l'aide</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "rgba(255, 255, 255, 1)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,900;1,900&family=Manrope:wght@400;500;600;700&display=swap');
        
        .article-title {
          color: #529D21;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 26px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .article-card:hover .article-title {
           transform: translateX(10px);
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 pt-16 pb-24">

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/help" className="inline-flex items-center text-gray-400 hover:text-[#529D21] transition-colors mb-12 group">
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold uppercase tracking-wider text-xs">Centre d'aide</span>
          </Link>
        </motion.div>

        {/* Header - Merriweather like in images */}
        <div className="text-center mb-24">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-7xl font-black mb-6"
            style={{ fontFamily: "'Merriweather', serif", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.04em" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {categoryData.title}
          </motion.h1>
          <motion.div
            className="w-24 h-1.5 bg-[#A5F364] mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
        </div>

        {/* Articles List */}
        <div className="space-y-32">
          {categoryData.articles.map((article, idx) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="article-card"
            >
              <h2 className="article-title">{article.title}</h2>
              <motion.div
                className="text-[17px] md:text-[19px] text-gray-700 leading-relaxed max-w-3xl font-normal"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {article.content}
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
