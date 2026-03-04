import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
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
    icon: UserCircle2,
    title: "Compte & profils",
    slug: "comptes-profils",
    description: "Gérez vos informations personnelles et vos accès"
  },
  {
    icon: Building2,
    title: "Gestion des biens",
    slug: "gestion-biens",
    description: "Ajoutez, modifiez et organisez vos biens immobiliers"
  },
  {
    icon: FileText,
    title: "Baux & locataires",
    slug: "baux-locataires",
    description: "Tout sur la création des baux et le suivi des locataires"
  },
  {
    icon: CreditCard,
    title: "Paiements et loyers",
    slug: "paiements-loyers",
    description: "Suivez les encaissements et gérez les quittances"
  },
  {
    icon: FolderLock,
    title: "Documents et coffre fort",
    slug: "documents-coffre",
    description: "Stockez et partagez vos documents en toute sécurité"
  },
  {
    icon: Wrench,
    title: "Interventions et travaux",
    slug: "interventions-travaux",
    description: "Gérez les pannes, les travaux et vos prestataires"
  },
  {
    icon: Calculator,
    title: "Comptabilité et fiscalité",
    slug: "comptabilite-fiscalite",
    description: "Suivez vos revenus, charges et rentabilité nette"
  },
];

export default function Help() {
  return (
    <div className="min-h-screen pb-16" style={{ background: "rgba(255, 255, 255, 1)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,700&family=Manrope:wght@400;500;600;700&display=swap');
        
        .help-title {
          font-family: 'Lora', serif;
          font-weight: 700;
          font-style: italic;
          font-size: 20px;
          line-height: 100%;
          letter-spacing: -0.17px;
          text-align: center;
          display: inline-block;
          vertical-align: middle;
          margin-bottom: 24px;
          color: #1a1a1a;
        }

        .category-pill {
          background: white;
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          border-color: #A5F364;
        }

        .search-container focus-within {
           outline: 2px solid #A5F364;
        }
      `}</style>

      {/* Search Header */}
      <div className="text-center mb-10 mt-6 px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="help-title">Centre d'aide</h1>
        </motion.div>

        <motion.p
          className="text-gray-600 text-[16px] mb-10 max-w-xs mx-auto font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Trouvez rapidement des réponses à vos questions
        </motion.p>

        <motion.div
          className="max-w-xl mx-auto relative mb-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative group search-container">
            <Input
              type="text"
              placeholder="Rechercher une aide"
              className="w-full h-14 pl-6 pr-12 rounded-2xl border border-gray-100 shadow-sm text-lg placeholder:text-gray-400 bg-white transition-all group-hover:shadow-md"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-transparent">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto mb-20 px-4 sm:px-6 lg:px-8">

        {/* MOBILE VIEW (Stacked Pills with Staggered Entrance) */}
        <div className="flex flex-col space-y-4 lg:hidden max-w-sm mx-auto">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx, type: "spring", stiffness: 100 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/help/${cat.slug}`} className="block">
                  <div className="category-pill rounded-full p-4 flex items-center">
                    <div className="mr-5 text-gray-700 ml-2">
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-[17px] font-semibold text-gray-800">{cat.title}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* DESKTOP VIEW (Refined Grid with Staggered Fade-in) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * idx, duration: 0.6 }}
              >
                <Link to={`/help/${cat.slug}`} className="group block h-full">
                  <div className="bg-white rounded-[32px] p-8 flex flex-col items-center text-center shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 h-full group-hover:border-[#A5F364]/50 group-hover:-translate-y-2">
                    <motion.div
                      className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-gray-800 mb-6 group-hover:bg-[#A5F364]/20 group-hover:text-[#529D21] transition-colors"
                      whileHover={{ rotate: 10 }}
                    >
                      <Icon size={32} strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{cat.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{cat.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Support Section */}
      <motion.div
        className="text-center mb-24 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-[22px] font-bold mb-5 italic" style={{ fontFamily: "'Lora', serif" }}>
          Vous ne trouvez pas ce que vous cherchez ?
        </h2>
        <p className="text-gray-500 mb-10 max-w-xs mx-auto font-medium">
          Notre équipe support est là pour vous aider.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xs sm:max-w-md mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              className="rounded-full h-12 px-10 bg-[#A5F364] hover:bg-[#92E252] text-gray-900 font-bold border-none shadow-md"
            >
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-12 px-10 border-gray-200 text-gray-800 font-bold bg-white shadow-sm hover:border-[#A5F364]"
            >
              <Link to="/help/faq">Voir la FAQ</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
