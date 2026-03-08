import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  "Sans engagement",
  "Gratuit pour commencer",
  "Assistance incluse",
  "Aucune carte bancaire requise",
];

export function CTASection() {
  return (
    <motion.section
      className="container py-16 md:py-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="rounded-2xl border-2 border-primary/20 bg-gradient-subtle p-8 md:p-12 text-center"
        initial={{ scale: 0.97, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.h2
          className="text-3xl font-bold mb-4 md:text-4xl"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Gérer vos biens n’a jamais été aussi facile
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-8 text-base"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.3 },
            },
          }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <Check className="h-5 w-5 text-primary" />
              <span className="font-medium">{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild size="lg" className="text-base px-8 fluorescent-reflect">
            <Link to="/register">Ouvrir un compte gratuit</Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
