import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Cookies() {
  return (
    <div className="pb-16">
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <div className="page-subtitle text-primary-foreground/80">Légal</div>
          <h1 className="text-4xl font-bold mb-4 md:text-5xl text-primary-foreground">
            Politique de Cookies
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
              <h2 className="text-2xl font-bold mb-4 text-primary">1. Qu'est-ce qu'un cookie ?</h2>
              <p className="text-foreground leading-relaxed">
                Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous 
                visitez un site web. Les cookies permettent au site de mémoriser vos actions 
                et préférences sur une période donnée.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">2. Types de cookies utilisés</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">Cookies strictement nécessaires</h3>
              <p className="text-foreground leading-relaxed">
                Ces cookies sont indispensables au fonctionnement du site. Ils vous permettent 
                de naviguer et d'utiliser les fonctionnalités essentielles comme l'accès aux 
                zones sécurisées.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mt-3">
                <li>Cookie de session (identifiant de connexion)</li>
                <li>Cookie de sécurité (protection CSRF)</li>
                <li>Cookie de préférence de langue</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">Cookies de performance</h3>
              <p className="text-foreground leading-relaxed">
                Ces cookies collectent des informations sur la façon dont vous utilisez notre 
                site, comme les pages les plus visitées et les messages d'erreur.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mt-3">
                <li>Analyse d'audience</li>
                <li>Cookies de mesure de performance</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">Cookies fonctionnels</h3>
              <p className="text-foreground leading-relaxed">
                Ces cookies permettent au site de mémoriser vos choix et de personnaliser votre 
                expérience.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mt-3">
                <li>Préférences d'affichage</li>
                <li>Mémorisation des formulaires</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">3. Finalités des cookies</h2>
              <p className="text-foreground leading-relaxed mb-4">
                Nous utilisons les cookies pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Assurer le bon fonctionnement du site</li>
                <li>Mémoriser vos préférences et paramètres</li>
                <li>Analyser l'utilisation du site et améliorer ses performances</li>
                <li>Personnaliser votre expérience</li>
                <li>Sécuriser votre connexion</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">4. Durée de conservation</h2>
              <p className="text-foreground leading-relaxed">
                La durée de conservation varie selon le type de cookie :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mt-3">
                <li><strong>Cookies de session</strong> : supprimés à la fermeture du navigateur</li>
                <li><strong>Cookies persistants</strong> : conservés entre 1 mois et 13 mois maximum</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">5. Gestion des cookies</h2>
              <p className="text-foreground leading-relaxed mb-4">
                Vous pouvez gérer vos préférences de cookies :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li><strong>Via notre bandeau de consentement</strong> : lors de votre première visite</li>
                <li><strong>Via vos paramètres de compte</strong> : accessible à tout moment</li>
                <li><strong>Via votre navigateur</strong> : consultez l'aide de votre navigateur</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-4">
                <strong>Note :</strong> La désactivation de certains cookies peut affecter le 
                fonctionnement du site.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">6. Cookies tiers</h2>
              <p className="text-foreground leading-relaxed">
                Certains cookies sont déposés par des services tiers pour analyser l'audience. 
                Ces cookies sont soumis aux politiques de confidentialité de ces tiers.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">7. Modifications</h2>
              <p className="text-foreground leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de cookies. Toute 
                modification vous sera notifiée via notre bandeau de cookies.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">8. Contact</h2>
              <p className="text-foreground leading-relaxed">
                Pour toute question sur l'utilisation des cookies : 
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
