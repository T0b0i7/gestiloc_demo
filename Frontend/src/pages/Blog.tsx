import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const blogPosts = [
  {
    slug: "optimiser-rentabilite-locative",
    title: "10 conseils pour optimiser la rentabilité de vos locations",
    excerpt: "Découvrez les meilleures pratiques pour maximiser vos revenus locatifs tout en maintenant des locataires satisfaits.",
    category: "Investissement",
    date: "15 Mars 2024",
    readTime: "5 min",
  },
  {
    slug: "revision-loyer-irl-2024",
    title: "Révision de loyer : tout savoir sur l'IRL 2024",
    excerpt: "Guide complet sur la révision annuelle des loyers avec l'indice de référence des loyers et ses évolutions.",
    category: "Législation",
    date: "10 Mars 2024",
    readTime: "7 min",
  },
  {
    slug: "etat-lieux-numerique",
    title: "L'état des lieux numérique : avantages et bonnes pratiques",
    excerpt: "Comment réaliser un état des lieux digital efficace et conforme à la réglementation.",
    category: "Gestion",
    date: "5 Mars 2024",
    readTime: "6 min",
  },
  {
    slug: "charges-locatives-regularisation",
    title: "Charges locatives : comprendre la régularisation annuelle",
    excerpt: "Tout ce qu'il faut savoir sur les charges récupérables et leur régularisation auprès des locataires.",
    category: "Comptabilité",
    date: "28 Février 2024",
    readTime: "8 min",
  },
  {
    slug: "loi-pinel-nouveautes-2024",
    title: "Loi Pinel : les nouveautés 2024 pour les investisseurs",
    excerpt: "Analyse des récentes modifications du dispositif Pinel et leurs impacts sur l'investissement locatif.",
    category: "Fiscalité",
    date: "20 Février 2024",
    readTime: "10 min",
  },
  {
    slug: "location-saisonniere-reglementation",
    title: "Location saisonnière : réglementation et déclarations obligatoires",
    excerpt: "Le cadre légal de la location de courte durée et les obligations des propriétaires.",
    category: "Législation",
    date: "12 Février 2024",
    readTime: "9 min",
  },
];

export default function Blog() {
  return (
    <div className="pb-16">
      <section className="bg-gradient-primary text-primary-foreground py-16 md:py-24">
        <div className="container text-center">
          <div className="page-subtitle text-primary-foreground/80">Blog</div>
          <h1 className="text-4xl font-bold mb-4 md:text-5xl">Blog</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Conseils, guides et actualités pour bien gérer vos biens locatifs
          </p>
        </div>
      </section>

      <div className="container py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
