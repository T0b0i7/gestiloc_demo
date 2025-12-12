import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Terms() {
  return (
    <div className="pb-16">
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <div className="page-subtitle text-primary-foreground/80">Légal</div>
          <h1 className="text-4xl font-bold mb-4 md:text-5xl text-primary-foreground">
            Conditions Générales d'Utilisation
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
              <h2 className="text-2xl font-bold mb-4 text-primary">1. Objet</h2>
              <p className="text-foreground leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (CGU) définissent les conditions 
                d'accès et d'utilisation de la plateforme GestiLoc. En accédant et en utilisant 
                nos services, vous acceptez sans réserve les présentes CGU.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">2. Accès au service</h2>
              <p className="text-foreground leading-relaxed">
                GestiLoc est accessible 24h/24 et 7j/7, sauf interruption, programmée ou non, 
                pour les besoins de maintenance ou en cas de force majeure. L'accès à certaines 
                fonctionnalités peut nécessiter la création d'un compte utilisateur.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">3. Création de compte</h2>
              <p className="text-foreground leading-relaxed">
                Pour créer un compte, vous devez fournir des informations exactes et à jour. 
                Vous êtes responsable de la confidentialité de vos identifiants de connexion 
                et de toutes les activités effectuées sous votre compte.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">4. Utilisation du service</h2>
              <p className="text-foreground leading-relaxed">
                Vous vous engagez à utiliser GestiLoc conformément à sa destination et aux lois 
                en vigueur. Toute utilisation frauduleuse ou abusive entraînera la suspension 
                immédiate de votre compte.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">5. Propriété intellectuelle</h2>
              <p className="text-foreground leading-relaxed">
                L'ensemble du contenu présent sur GestiLoc (textes, images, logos, code) est 
                protégé par les droits de propriété intellectuelle. Toute reproduction non 
                autorisée est interdite.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">6. Responsabilité</h2>
              <p className="text-foreground leading-relaxed">
                GestiLoc met tout en œuvre pour fournir un service fiable et sécurisé. Toutefois, 
                nous ne pouvons garantir l'absence totale d'erreurs, d'interruptions ou de pertes 
                de données. L'utilisateur est seul responsable de ses décisions prises sur la base 
                des informations disponibles sur la plateforme.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">7. Disponibilité du service</h2>
              <p className="text-foreground leading-relaxed">
                Nous nous efforçons de maintenir la disponibilité du service mais ne garantissons 
                pas un accès ininterrompu. Des maintenances planifiées peuvent nécessiter une 
                interruption temporaire du service.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">8. Résiliation</h2>
              <p className="text-foreground leading-relaxed">
                Vous pouvez résilier votre compte à tout moment depuis vos paramètres. GestiLoc 
                se réserve le droit de suspendre ou résilier tout compte en cas de violation 
                des présentes CGU.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">9. Modifications des CGU</h2>
              <p className="text-foreground leading-relaxed">
                GestiLoc se réserve le droit de modifier les présentes CGU à tout moment. Les 
                utilisateurs seront informés de toute modification substantielle par email ou 
                notification dans l'application.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">10. Droit applicable</h2>
              <p className="text-foreground leading-relaxed">
                Les présentes CGU sont régies par le droit béninois. Tout litige sera soumis 
                aux tribunaux compétents de Cotonou, Bénin.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Contact</h2>
              <p className="text-foreground leading-relaxed">
                Pour toute question concernant ces CGU, vous pouvez nous contacter à l'adresse : 
                <a href="mailto:legal@gestiloc.bj" className="text-primary hover:underline ml-1">
                  legal@gestiloc.bj
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
