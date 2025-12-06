import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  FileText,
  CreditCard,
  FolderLock,
  Wrench,
  Calculator,
  Search,
} from "lucide-react";

const categories = [
  {
    icon: User,
    title: "Comptes & Profils",
    description: "Création de compte, paramètres, sécurité",
    articles: 5,
    slug: "comptes-profils",
  },
  {
    icon: Building2,
    title: "Gestion des biens",
    description: "Ajout, modification, suppression de biens",
    articles: 4,
    slug: "gestion-biens",
  },
  {
    icon: FileText,
    title: "Baux & Locataires",
    description: "Création de baux, gestion des locataires",
    articles: 5,
    slug: "baux-locataires",
  },
  {
    icon: CreditCard,
    title: "Paiements & Loyers",
    description: "Quittances, impayés, relances Mobile Money",
    articles: 5,
    slug: "paiements-loyers",
  },
  {
    icon: FolderLock,
    title: "Documents & Coffre-fort",
    description: "Upload, organisation, partage de documents",
    articles: 4,
    slug: "documents-coffre",
  },
  {
    icon: Wrench,
    title: "Interventions & Travaux",
    description: "Demandes d'intervention, suivi des travaux",
    articles: 4,
    slug: "interventions-travaux",
  },
  {
    icon: Calculator,
    title: "Comptabilité & Fiscalité",
    description: "Déclarations, exports comptables, charges",
    articles: 5,
    slug: "comptabilite-fiscalite",
  },
];

export default function Help() {
  return (
    <div className="pb-16">
      <section className="bg-background py-12 sm:py-16 md:py-24">
        <div className="container text-center">
          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-4 md:text-5xl text-primary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Centre d'aide
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg max-w-2xl mx-auto mb-8 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Trouvez rapidement des réponses à vos questions
          </motion.p>
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </motion.div>
              <Input
                type="search"
                placeholder="Rechercher dans l'aide..."
                className="pl-10 bg-background border-input"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="container py-16">
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Link to={`/help/${category.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <motion.div
                        className="flex items-center gap-4 mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <motion.div
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="h-5 w-5 text-primary" />
                        </motion.div>
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <CardDescription>{category.description}</CardDescription>
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <motion.p
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        {category.articles} articles
                      </motion.p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <motion.section
        className="container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-muted/50 text-center p-8 md:p-12">
          <motion.h2
            className="text-2xl font-bold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Vous ne trouvez pas ce que vous cherchez ?
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Notre équipe support est là pour vous aider
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild variant="outline">
                <Link to="/help/faq">Voir la FAQ</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      </motion.section>
    </div>
  );
}
