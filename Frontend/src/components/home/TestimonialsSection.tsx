import { motion } from 'framer-motion';

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nous aidons les bailleurs à gérer sereinement leurs emplacements
          </h2>
          <p className="text-gray-600 text-lg">
            Nous sommes accessibles, modernes et pensées pour les propriétaires béninois.
          </p>
        </motion.div>

        {/* Testimonials Grid - Forme de V */}
        <div className="relative h-[800px] md:h-[700px]">
          
          {/* Top Left - Pierre testimonial + 67% stat */}
          <motion.div 
            className="absolute top-0 left-0 md:left-8 z-10"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Testimonial box */}
            <div className="bg-white border border-green-400 rounded-lg p-5 w-64 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
              </p>
              <p className="text-gray-500 text-xs">
                Pierre , Cotonou, Bénin
              </p>
            </div>
            
            {/* Stat box 67% - décalé à droite pour former le V */}
            <div 
              className="text-white rounded-lg p-5 w-64 shadow-md mt-2 ml-16 hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: '#529D21', border: '1px solid #529D21' }}
            >
              <div className="text-4xl font-bold mb-2">67%</div>
              <p className="text-sm leading-relaxed">
                de nos clients recommandent GestiLoc à leur entourage.
              </p>
            </div>
          </motion.div>

          {/* Top Right - Francine testimonial + 97% stat */}
          <motion.div 
            className="absolute top-0 right-0 md:right-8 z-10"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Testimonial box */}
            <div className="bg-white border border-green-400 rounded-lg p-5 w-64 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "Je tiens à vous dire un grand merci pour votre site. J'y ai énormément appris de choses. Bravo !"
              </p>
              <p className="text-gray-500 text-xs">
                Francine , Porto-Novo, Bénin
              </p>
            </div>
            
            {/* Stat box 97% - décalé à gauche pour former le V */}
            <div 
              className="text-white rounded-lg p-5 w-64 shadow-md mt-2 -ml-8 hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: '#83C757', border: '1px solid #83C757' }}
            >
              <div className="text-4xl font-bold mb-2">97%</div>
              <p className="text-sm leading-relaxed">
                de nos clients affirment gagner en efficacité et en productivité.
              </p>
            </div>
          </motion.div>

          {/* Bottom Center - Pierre testimonial + 83% stat (point du V) */}
          <motion.div 
            className="absolute top-80 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Testimonial box */}
            <div className="bg-white border border-green-400 rounded-lg p-5 w-64 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                "Ce site est un vrai bonheur pour les particuliers bailleurs et m'aide énormément ! À recommander !!"
              </p>
              <p className="text-gray-500 text-xs">
                Pierre , Cotonou, Bénin
              </p>
            </div>
            
            {/* Stat box 83% - décalé à droite */}
            <div 
              className="text-white rounded-lg p-5 w-64 shadow-md mt-2 ml-16 hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: '#9747FF', border: '1px solid #529D21' }}
            >
              <div className="text-4xl font-bold mb-2">83%</div>
              <p className="text-sm leading-relaxed">
                de nos clients affirment que GestiLoc les aide à mieux suivre les loyers, charges et quittances.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
