import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, Users, Target, Award, Mail } from "lucide-react";

export default function About() {
  return (
    <div className="pb-16">
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <div className="page-subtitle text-primary-foreground/80">À propos</div>
          <h1 className="text-4xl font-bold mb-4 md:text-5xl text-primary-foreground">
            À propos de GestiLoc
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-primary-foreground/90">
            Une solution innovante développée par Innovtech
          </p>
        </div>
      </section>

      <div className="container py-12 md:py-16 max-w-4xl">
        <Card>
          <CardContent className="p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Notre histoire</h2>
              <p className="text-foreground leading-relaxed mb-4">
                GestiLoc est une plateforme de gestion locative développée par <strong>Innovtech</strong>, 
                une entreprise technologique béninoise spécialisée dans la création de solutions digitales 
                innovantes pour l'Afrique de l'Ouest.
              </p>
              <p className="text-foreground leading-relaxed">
                Née de la volonté de simplifier la gestion immobilière au Bénin, GestiLoc répond aux 
                besoins spécifiques des propriétaires et locataires béninois en proposant une solution 
                moderne, accessible et adaptée au contexte local.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Innovtech, notre créateur</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Entreprise technologique béninoise</h3>
                    <p className="text-foreground leading-relaxed">
                      Innovtech est une entreprise innovante basée à Cotonou, spécialisée dans le 
                      développement de solutions numériques sur-mesure pour les entreprises et 
                      particuliers en Afrique de l'Ouest.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Mission</h3>
                    <p className="text-foreground leading-relaxed">
                      Notre mission est de démocratiser l'accès aux technologies modernes en Afrique, 
                      en créant des outils performants, intuitifs et adaptés aux réalités locales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Expertise</h3>
                    <p className="text-foreground leading-relaxed">
                      Avec une équipe d'experts en développement web, mobile et gestion de projets, 
                      Innovtech combine innovation technologique et compréhension approfondie du 
                      marché africain.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Notre vision pour GestiLoc</h2>
              <p className="text-foreground leading-relaxed mb-4">
                Chez Innovtech, nous avons imaginé GestiLoc comme bien plus qu'un simple logiciel de 
                gestion. C'est une plateforme complète qui :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Simplifie la gestion quotidienne des biens immobiliers</li>
                <li>Facilite la communication entre propriétaires et locataires</li>
                <li>Intègre les méthodes de paiement locales (Mobile Money)</li>
                <li>S'adapte aux réglementations béninoises</li>
                <li>Offre une expérience utilisateur moderne et intuitive</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Nos valeurs</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous repoussons constamment les limites de la technologie pour créer des 
                    solutions avant-gardistes.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Accessibilité</h3>
                  <p className="text-sm text-muted-foreground">
                    Nos produits sont conçus pour être utilisables par tous, quel que soit le 
                    niveau technique.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Fiabilité</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous garantissons des solutions robustes, sécurisées et disponibles 24/7.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Engagement local</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous sommes profondément ancrés dans notre communauté et travaillons pour 
                    son développement.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Contactez Innovtech</h2>
              <p className="text-foreground leading-relaxed mb-4">
                Vous souhaitez en savoir plus sur Innovtech ou discuter d'un projet ? 
                Notre équipe est à votre écoute.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href="mailto:info@innovtech.bj" className="text-primary hover:underline">
                    info@innovtech.bj
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-foreground">
                    Une équipe passionnée au service de l'innovation africaine
                  </span>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
