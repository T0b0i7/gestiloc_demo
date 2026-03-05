import { motion } from "framer-motion";

export function PressLogos() {
  return (
    <motion.section
      className="container py-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.p
          className="text-sm text-muted-foreground mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Partenaires de confiance
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.2 },
            },
          }}
        >
          {[
            "La Nation",
            "Bénin Web TV",
            "Ehuzu",
            "Bénin Intelligent",
          ].map((name) => (
            <motion.div
              key={name}
              className="text-2xl font-bold text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              {name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
