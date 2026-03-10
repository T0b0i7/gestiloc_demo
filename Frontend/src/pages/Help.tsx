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
    <div
      className="min-h-screen pb-16"
      style={{ background: 'linear-gradient(180deg, rgba(225, 255, 206, 0.89) 0%, #FFFFFF 20.19%)' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700&display=swap');

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

      {/* Header Section - same design as Features page */}
      <div className="max-w-6xl mx-auto px-6 pt-28 text-center">
        <motion.h1
          className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 font-merriweather"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Centre d'aide
        </motion.h1>

        <motion.div
          className="mb-10 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-black text-base md:text-lg leading-relaxed font-manrope font-medium text-center">
            Trouvez rapidement des réponses à vos questions
          </p>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto relative mb-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative group search-container">
            <Input
              type="text"
              placeholder="Rechercher une aide"
              className="w-full h-16 pl-8 pr-14 rounded-2xl border border-gray-100 shadow-sm text-lg placeholder:text-gray-400 bg-white transition-all group-hover:shadow-md"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-transparent">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto mb-20 px-4 sm:px-6 lg:px-8">

        {/* MOBILE VIEW (Stacked Pills with Staggered Entrance) */}
        <div className="flex flex-col space-y-4 lg:hidden max-w-sm mx-auto">
          {categories.map((cat, idx) => {
            const imageUrl = `/Ressource_gestiloc/A${idx + 1}.png`;
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
                    <div className="mr-5 text-gray-700 ml-2 w-8 h-8 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={cat.title}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const Icon = cat.icon;
                          target.style.display = 'none';
                          const iconContainer = target.parentElement;
                          if (iconContainer) {
                            iconContainer.innerHTML = '';
                            const iconElement = document.createElement('div');
                            iconContainer.appendChild(iconElement);
                            // Fallback to icon if image fails
                          }
                        }}
                      />
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
            const imageUrl = `/Ressource_gestiloc/A${idx + 1}.png`;
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
                      <img
                        src={imageUrl}
                        alt={cat.title}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const Icon = cat.icon;
                          target.style.display = 'none';
                          const iconContainer = target.parentElement;
                          if (iconContainer) {
                            iconContainer.innerHTML = '';
                            const iconElement = document.createElement('div');
                            iconContainer.appendChild(iconElement);
                            // Fallback to icon if image fails
                          }
                        }}
                      />
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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2
          className="text-[36px] font-bold mb-5 italic"
          style={{ fontFamily: "'Lora', serif" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Vous ne trouvez pas ce que vous cherchez ?
        </motion.h2>
        <motion.p
          className="text-gray-500 mb-10 max-w-xs mx-auto font-medium text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Notre équipe support est là pour vous aider.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 max-w-xs sm:max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              className="rounded-full h-16 px-14 bg-[#A5F364] hover:bg-[#92E252] text-gray-900 font-bold border-none shadow-md text-lg"
            >
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-16 px-14 border-gray-200 text-gray-800 font-bold bg-white shadow-sm hover:border-[#A5F364] text-lg"
            >
              <Link to="/help/faq">Voir la FAQ</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
