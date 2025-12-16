import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "GestiLoc est-il adapté aux particuliers et aux professionnels ?",
    answer: "Oui, GestiLoc s'adresse aussi bien aux particuliers possédant un ou plusieurs biens qu'aux professionnels de l'immobilier (agences, administrateurs de biens, investisseurs). Nos plans tarifaires s'adaptent à vos besoins.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "La sécurité de vos données est notre priorité. Nous utilisons un chiffrement de niveau bancaire (SSL/TLS), des serveurs hébergés en France et des sauvegardes quotidiennes automatiques. Vos données ne sont jamais partagées avec des tiers.",
  },
  {
    question: "Puis-je importer mes données existantes ?",
    answer: "Oui, nous proposons des outils d'import pour vos biens, locataires et historique de paiements. Les formats Excel et CSV sont supportés. Notre équipe peut vous accompagner dans la migration de vos données.",
  },
  {
    question: "Comment fonctionne la synchronisation bancaire ?",
    answer: "La synchronisation bancaire utilise une connexion sécurisée avec votre banque (via notre partenaire agréé DSP2). Vos identifiants ne sont jamais stockés. Les transactions sont récupérées automatiquement et vous pouvez les rapprocher de vos loyers en quelques clics.",
  },
  {
    question: "Puis-je générer des quittances personnalisées ?",
    answer: "Oui, vous pouvez personnaliser vos quittances avec votre logo, vos coordonnées et choisir parmi plusieurs modèles. Les quittances sont générées automatiquement chaque mois et peuvent être envoyées par email ou téléchargées en PDF.",
  },
  {
    question: "Comment sont calculées les révisions de loyer ?",
    answer: "Les révisions sont calculées automatiquement selon l'indice de référence (IRL pour les locations nues, ILC pour les commerciales). Vous recevez des rappels avant chaque échéance de révision et les courriers de notification sont générés automatiquement.",
  },
  {
    question: "Puis-je gérer des locations saisonnières ?",
    answer: "Oui, GestiLoc intègre un module dédié aux locations saisonnières avec calendrier, synchronisation iCal (Airbnb, Booking.com...), gestion des réservations et tarifs variables selon les périodes.",
  },
  {
    question: "Y a-t-il une application mobile ?",
    answer: "Oui, nos applications iOS et Android vous permettent de gérer vos biens en mobilité : consulter les paiements, créer des états des lieux, communiquer avec les locataires et recevoir des notifications en temps réel.",
  },
  {
    question: "Comment fonctionne le support client ?",
    answer: "Nous proposons un support par email pour tous les plans, avec un temps de réponse sous 24h. Les plans Pro et Business bénéficient d'un support prioritaire. Une base de connaissances complète et des tutoriels vidéo sont également disponibles.",
  },
  {
    question: "Puis-je obtenir une formation à l'utilisation ?",
    answer: "Oui, nous proposons des webinaires gratuits de prise en main pour tous les utilisateurs. Les clients Business bénéficient de formations personnalisées. Des tutoriels vidéo sont également disponibles dans le centre d'aide.",
  },
  {
    question: "Comment résilier mon abonnement ?",
    answer: "Vous pouvez résilier votre abonnement à tout moment depuis votre espace compte, en quelques clics. Il n'y a aucun frais de résiliation et vous gardez l'accès jusqu'à la fin de votre période payée. Vous pouvez exporter toutes vos données avant de partir.",
  },
  {
    question: "Proposez-vous des remises pour les grands portefeuilles ?",
    answer: "Oui, nous proposons des tarifs dégressifs pour les portefeuilles de plus de 50 biens. Contactez notre équipe commerciale pour obtenir un devis personnalisé.",
  },
];

export default function FAQ() {
  return (
    <div className="pb-16">
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <div className="page-subtitle text-primary-foreground/80">Aide</div>
          <h1 className="text-4xl font-bold mb-4 md:text-5xl text-primary-foreground">
            Questions fréquentes
          </h1>
          <p className="text-lg text-primary-foreground/90">
            Trouvez rapidement des réponses aux questions les plus courantes
          </p>
        </div>
      </section>

      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
