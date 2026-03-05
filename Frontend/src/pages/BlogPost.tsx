import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();

  return (
    <div className="pb-16">
      <div className="container py-8">
        <Button asChild variant="ghost" size="sm">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au blog
          </Link>
        </Button>
      </div>

      <article className="container max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge>Investissement</Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>15 Mars 2024</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>5 min de lecture</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 md:text-5xl">
            10 conseils pour optimiser la rentabilité de vos locations
          </h1>
          <p className="text-xl text-muted-foreground">
            Découvrez les meilleures pratiques pour maximiser vos revenus locatifs tout en maintenant des locataires satisfaits.
          </p>
        </header>

        <div className="aspect-video bg-muted rounded-2xl mb-12"></div>

        <div className="prose prose-lg max-w-none">
          <h2>Introduction</h2>
          <p>
            La gestion locative est un art qui nécessite de trouver le bon équilibre entre 
            rentabilité et satisfaction des locataires. Dans cet article, nous allons explorer 
            les stratégies éprouvées pour optimiser vos revenus locatifs.
          </p>

          <h2>1. Fixez le bon prix de location</h2>
          <p>
            Le prix de votre location est crucial. Trop élevé, vous risquez la vacance locative. 
            Trop bas, vous perdez des revenus. Analysez le marché local, comparez avec des biens 
            similaires et ajustez en fonction des équipements proposés.
          </p>

          <h2>2. Entretenez régulièrement votre bien</h2>
          <p>
            Un bien bien entretenu attire des locataires de qualité et justifie un loyer plus élevé. 
            Planifiez des inspections régulières et anticipez les réparations avant qu'elles ne 
            deviennent coûteuses.
          </p>

          <h2>3. Optimisez les charges</h2>
          <p>
            Maîtrisez vos charges en négociant avec vos fournisseurs, en améliorant l'isolation 
            thermique et en installant des équipements économes en énergie. Ces investissements 
            se répercuteront positivement sur votre rentabilité.
          </p>

          <h2>Conclusion</h2>
          <p>
            La rentabilité locative s'améliore avec une gestion proactive et réfléchie. En 
            appliquant ces conseils, vous pourrez augmenter vos revenus tout en fidélisant vos 
            locataires.
          </p>
        </div>
      </article>
    </div>
  );
}
