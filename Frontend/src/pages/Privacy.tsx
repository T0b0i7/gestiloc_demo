import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Privacy() {
  return (
    <div className="pb-16">
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <div className="page-subtitle text-primary-foreground/80">Légal</div>
          <h1 className="text-4xl font-bold mb-4 md:text-5xl text-primary-foreground">
            Politique de Confidentialité
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-primary-foreground/90">
            Dernière mise à jour : 11 novembre 2025
          </p>
        </div>
      </section>

      <div className="container py-12 md:py-16 max-w-4xl">
        <Card>
          <CardContent className="p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">1. Introduction</h2>
              <p className="text-foreground leading-relaxed">
                GestiLoc accorde une grande importance à la protection de vos données personnelles. 
                Cette politique de confidentialité explique quelles données nous collectons, comment 
                nous les utilisons et quels sont vos droits.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">2. Données collectées</h2>
              <p className="text-foreground leading-relaxed mb-4">
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li><strong>Données d'identification</strong> : nom, prénom, adresse email, téléphone</li>
                <li><strong>Données de compte</strong> : identifiants de connexion, préférences</li>
                <li><strong>Données de gestion</strong> : informations sur vos biens, locataires, transactions</li>
                <li><strong>Données techniques</strong> : adresse IP, cookies, logs de connexion</li>
                <li><strong>Données de paiement</strong> : informations Mobile Money (stockées de manière sécurisée)</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">3. Finalités du traitement</h2>
              <p className="text-foreground leading-relaxed mb-4">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Fournir et améliorer nos services</li>
                <li>Gérer votre compte et vos abonnements</li>
                <li>Traiter vos paiements via Mobile Money</li>
                <li>Vous envoyer des communications importantes</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">4. Base légale</h2>
              <p className="text-foreground leading-relaxed">
                Le traitement de vos données repose sur : l'exécution du contrat vous liant à 
                GestiLoc, votre consentement explicite, nos obligations légales et nos intérêts 
                légitimes à améliorer nos services.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">5. Durée de conservation</h2>
              <p className="text-foreground leading-relaxed">
                Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services 
                et respecter nos obligations légales. Les données comptables sont conservées 10 ans 
                conformément à la réglementation béninoise.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">6. Destinataires des données</h2>
              <p className="text-foreground leading-relaxed">
                Vos données peuvent être transmises à nos sous-traitants (hébergement, paiement Mobile Money, 
                support client) qui sont contractuellement tenus de garantir leur sécurité et 
                confidentialité.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">7. Vos droits</h2>
              <p className="text-foreground leading-relaxed mb-4">
                Conformément à la réglementation sur la protection des données, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement</strong> : supprimer vos données</li>
                <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données</li>
                <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à : 
                <a href="mailto:privacy@gestiloc.bj" className="text-primary hover:underline ml-1">
                  privacy@gestiloc.bj
                </a>
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">8. Sécurité des données</h2>
              <p className="text-foreground leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
                pour protéger vos données : chiffrement SSL/TLS, hébergement sécurisé, 
                sauvegardes quotidiennes, contrôle d'accès strict.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">9. Cookies</h2>
              <p className="text-foreground leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience. Consultez notre 
                politique de cookies pour plus d'informations sur leur utilisation et votre 
                possibilité de les refuser.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">10. Modifications</h2>
              <p className="text-foreground leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité. 
                Toute modification substantielle vous sera notifiée par email.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">11. Contact</h2>
              <p className="text-foreground leading-relaxed">
                Pour toute question : 
                <a href="mailto:privacy@gestiloc.bj" className="text-primary hover:underline ml-1">
                  privacy@gestiloc.bj
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
