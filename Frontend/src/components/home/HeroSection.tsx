import { useNavigate } from "react-router-dom";
import { Users, Apple, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/Ressource_gestiloc/bg.png')`,
        }}
      />

      {/* Blur and Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-8 py-20">
        <div className="space-y-8 text-center">
          {/* Stats Counter */}
          <motion.div 
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-md w-fit mx-auto" 
            style={{ backgroundColor: "#83C75730", color: "#83C757" }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Users size={20} />
            <p className="font-medium text-base" style={{ fontFamily: "Manrope, sans-serif" }}>
              1 250 propriétaires béninois inscrits ce mois-ci !
            </p>
          </motion.div>

          {/* Main Title - Taille augmentée */}
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl text-white leading-tight"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            style={{ 
              fontFamily: "Merriweather, serif",
              fontWeight: 700,
              fontStyle: "italic",
              letterSpacing: "-0.17px",
              lineHeight: "110%",
              textShadow: "0 4px 30px rgba(0,0,0,0.3)"
            }}
          >
            Gérez vos biens immobiliers
          </motion.h1>

          {/* Subtitle - Amélioré */}
          <motion.p 
            className="text-lg md:text-xl text-white/95 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            style={{ 
              fontFamily: "Manrope, sans-serif",
              textShadow: "0 2px 10px rgba(0,0,0,0.2)"
            }}
          >
            GestiLoc est le meilleur logiciel de gestion locative immobilière en ligne. Suivi des loyers et charges, comptabilité, aide à la déclaration des revenus fonciers… Toutes les étapes de la vie du contrat de location sont couvertes par notre plateforme.
          </motion.p>

          {/* CTA Buttons - Améliorés */}
          <motion.div 
            className="flex flex-col gap-4 pt-6 w-fit mx-auto items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            <motion.button
              onClick={() => navigate("/register")}
              className="text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ 
                backgroundColor: "#D4FF8C",
                color: "#143300",
                fontFamily: "Manrope, sans-serif",
                fontSize: "20px"
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c5ef7d";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D4FF8C";
              }}
            >
              Ouvrir un compte gratuit
            </motion.button>
            <motion.button
              onClick={() => navigate("/login")}
              className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg border border-gray-300 transition-all"
              style={{ fontFamily: "Manrope, sans-serif" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Se connecter
            </motion.button>
          </motion.div>

          {/* Disponible sur Badge */}
          <motion.div 
            className="flex items-center justify-center gap-4 pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <p 
              className="text-white"
              style={{
                fontFamily: "Lora, serif",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: "16px",
                letterSpacing: "-0.17px",
                lineHeight: "100%"
              }}
            >
              Disponible sur
            </p>
            
            <div className="flex gap-3 items-center">
              <motion.a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors text-sm font-medium"
                style={{ fontFamily: "Lora, serif", color: "white" }}
                whileHover={{ scale: 1.1 }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#83C757"}
                onMouseLeave={(e) => e.currentTarget.style.color = "white"}
              >
                <Apple size={18} />
                <span>AppStore</span>
              </motion.a>
              <span className="text-white/50">|</span>
              <motion.a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors text-sm font-medium"
                style={{ fontFamily: "Lora, serif", color: "white" }}
                whileHover={{ scale: 1.1 }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#83C757"}
                onMouseLeave={(e) => e.currentTarget.style.color = "white"}
              >
                <Play size={18} />
                <span>Google Play</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
