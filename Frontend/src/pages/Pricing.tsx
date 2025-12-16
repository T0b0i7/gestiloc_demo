import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Injecter les styles d'animation pricing
if (typeof document !== "undefined") {
  const pricingStyles = document.createElement("style");
  pricingStyles.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    @keyframes glowPulse {
      0%, 100% {
        box-shadow: 0 0 20px rgba(30, 64, 175, 0.3), inset 0 0 20px rgba(30, 64, 175, 0.1);
      }
      50% {
        box-shadow: 0 0 40px rgba(30, 64, 175, 0.6), inset 0 0 30px rgba(30, 64, 175, 0.2);
      }
    }

    @keyframes popIn {
      0% {
        transform: scale(0.8) rotateZ(-8deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.05) rotateZ(2deg);
      }
      100% {
        transform: scale(1) rotateZ(0deg);
        opacity: 1;
      }
    }

    @keyframes borderFlow {
      0% {
        border-image-source: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%);
        border-image-slice: 1;
      }
      50% {
        border-image-source: linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%);
        border-image-slice: 1;
      }
      100% {
        border-image-source: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%);
        border-image-slice: 1;
      }
    }

    @keyframes floatUp {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-8px);
      }
    }

    @keyframes magneticHover {
      0% {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      }
      50% {
        background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      }
      100% {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      }
    }

    @keyframes checkBounce {
      0% {
        transform: scale(0) rotateZ(-180deg);
      }
      50% {
        transform: scale(1.2) rotateZ(10deg);
      }
      100% {
        transform: scale(1) rotateZ(0deg);
      }
    }

    @keyframes shineEffect {
      0% {
        text-shadow: 0 0 0 rgba(60, 180, 255, 0);
      }
      50% {
        text-shadow: 0 0 20px rgba(60, 180, 255, 0.8);
      }
      100% {
        text-shadow: 0 0 0 rgba(60, 180, 255, 0);
      }
    }

    .pricing-card-popular {
      animation: glowPulse 3s ease-in-out infinite;
      background: linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
    }

    .pricing-badge {
      animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    }

    .pricing-price {
      animation: shineEffect 2s ease-in-out infinite;
    }

    .pricing-feature-check {
      animation: checkBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .pricing-button {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      background-size: 200% 200%;
      animation: magneticHover 3s ease-in-out infinite;
      transition: all 0.3s ease;
    }

    .pricing-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(30, 64, 175, 0.4);
    }

    .pricing-button:active {
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(pricingStyles);
}

const plans = [
  {
    name: "Starter",
    price: "0 FCFA",
    period: "/mois",
    description: "Parfait pour débuter",
    features: [
      "Jusqu'à 3 biens",
      "Gestion des baux et locataires",
      "Quittances automatiques",
      "États des lieux numériques",
      "Support par email",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: "15 000 FCFA",
    period: "/mois",
    description: "Pour les bailleurs actifs",
    features: [
      "Biens illimités",
      "Toutes les fonctionnalités Starter",
      "Synchronisation bancaire",
      "Révision de loyer automatique",
      "Régularisation des charges",
      "Comptabilité complète",
      "Support prioritaire",
    ],
    cta: "Essayer 30 jours gratuits",
    popular: true,
  },
  {
    name: "Business",
    price: "50 000 FCFA",
    period: "/mois",
    description: "Pour les professionnels",
    features: [
      "Tout du plan Pro",
      "Multi-utilisateurs (jusqu'à 10)",
      "API & intégrations avancées",
      "Rapports personnalisés",
      "Formation dédiée",
      "Account manager dédié",
    ],
    cta: "Contacter l'équipe",
    popular: false,
  },
];

const faqs = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prennent effet immédiatement.",
  },
  {
    question: "Y a-t-il un engagement de durée ?",
    answer: "Non, tous nos plans sont sans engagement. Vous pouvez annuler votre abonnement à tout moment.",
  },
  {
    question: "Proposez-vous une période d'essai ?",
    answer: "Oui, le plan Starter est gratuit sans limite de durée. Les plans Pro et Business bénéficient d'un essai gratuit de 30 jours.",
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons le Mobile Money (MTN, Moov, Celtiis, Wave) ainsi que les cartes bancaires Visa et Mastercard.",
  },
  {
    question: "Comment fonctionne le paiement par Mobile Money ?",
    answer: "Sélectionnez votre opérateur (MTN, Moov, Celtiis ou Wave), composez le code sur votre téléphone, validez avec votre PIN et recevez une confirmation par SMS. C'est simple et 100% sécurisé.",
  },
];

export default function Pricing() {
  return (
    <div className="pb-16">
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <div className="page-subtitle text-primary-foreground/80">Tarification</div>
          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-4 md:text-5xl text-primary-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Tarifs simples et transparents
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Choisissez le plan qui correspond à vos besoins. Sans engagement, changez quand vous voulez.
          </motion.p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container py-12 sm:py-16 md:py-24 text-center">
          <motion.div
            className="grid gap-8 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.4,
                },
              },
            }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: plan.popular ? -8 : -5 }}
              >
                <Card
                  className={`relative overflow-visible transition-all duration-500 ${
                    plan.popular 
                      ? "border-2 border-primary shadow-2xl pricing-card-popular" 
                      : "border border-border hover:border-primary/50 hover:shadow-lg"
                  }`}
                >
                {/* Effet de brillance en arrière-plan pour la carte populaire */}
                {plan.popular && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    style={{ pointerEvents: "none" }}
                  />
                )}

                {plan.popular && (
                  <motion.div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 z-50"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.2, type: "spring" }}
                  >
                    <div className="pricing-badge rounded-full px-4 py-1.5 text-sm font-bold text-white flex items-center gap-2 shadow-lg whitespace-nowrap">
                      <Sparkles className="h-4 w-4" />
                      Le plus populaire
                    </div>
                  </motion.div>
                )}

                <CardHeader className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      {plan.popular && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="h-6 w-6 text-primary fill-primary" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                  <motion.div
                    className="pt-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                  >
                    <span className="pricing-price text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </motion.div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <motion.ul
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 1 + index * 0.2,
                        },
                      },
                    }}
                  >
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-3"
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        <motion.div
                          className="pricing-feature-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 1.2 + index * 0.2 + i * 0.1 }}
                        >
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                            plan.popular 
                              ? "bg-primary/20" 
                              : "bg-primary/10"
                          }`}>
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>
                        </motion.div>
                        <span className="text-sm leading-relaxed pt-0.5">{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </CardContent>

                <CardFooter className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full"
                  >
                    <Button
                      asChild
                      className={`w-full pricing-button font-semibold py-6 text-base ${
                        plan.popular 
                          ? "bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg hover:shadow-xl border-0" 
                          : "border border-primary/30"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      <Link to="/register" className="flex items-center justify-center gap-2">
                        {plan.cta}
                        {plan.popular && <Zap className="h-4 w-4" />}
                      </Link>
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
            </motion.div>
          </div>
      </section>

      {/* Section CTA animée attrayante */}
      <motion.section
        className="container py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          {/* Fond avec gradient animé */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-blue-200/20 to-primary/20 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-6 inline-block"
            >
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-primary animate-spin" />
                <span className="text-sm font-semibold text-primary">Offre limitée</span>
              </div>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Commencez maintenant, gratuitement
            </motion.h2>

            <motion.p
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Pas de carte bancaire requise. Accès complet au plan Starter pendant 30 jours. Annulez à tout moment.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="pricing-button font-bold py-6 px-8 text-base bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg hover:shadow-2xl border-0"
                >
                  <Link to="/register" className="flex items-center gap-2">
                    <Zap className="h-5 w-5 fill-current" />
                    Créer un compte gratuit
                  </Link>
                </Button>
              </motion.div>

              <motion.p
                className="text-sm text-muted-foreground"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✓ Inscription en moins de 2 minutes
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section FAQ */}
      <motion.section
        className="container py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                Paiement Mobile Money au Bénin
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Payez facilement et en toute sécurité avec votre téléphone mobile
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  },
                },
              }}
            >
              {[
                { name: "MTN", desc: "MTN Mobile Money" },
                { name: "Moov", desc: "Moov Money" },
                { name: "Celtiis", desc: "Celtiis Cash" },
                { name: "Wave", desc: "Wave Mobile" },
              ].map((operator, index) => (
                <motion.div
                  key={index}
                  className="bg-background p-6 rounded-xl border text-center hover:shadow-md transition-shadow"
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl font-bold text-primary mb-2">{operator.name}</div>
                  <p className="text-xs text-muted-foreground">{operator.desc}</p>
                </motion.div>
                ))}
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background p-6 rounded-xl border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Comment payer ?
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    <span>Choisissez votre forfait (Pro ou Business)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    <span>Sélectionnez votre opérateur Mobile Money</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    <span>Composez le code USSD sur votre téléphone</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">4.</span>
                    <span>Validez avec votre code PIN</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">5.</span>
                    <span>Recevez la confirmation par SMS</span>
                  </li>
                </ol>
              </div>

              <div className="bg-background p-6 rounded-xl border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  100% Sécurisé
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Transactions cryptées et sécurisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Aucune donnée bancaire stockée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Confirmation instantanée par SMS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Support client disponible 7j/7</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        className="container py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-3xl">
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Questions fréquentes
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
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
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <AccordionItem value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-subtle text-center p-8 md:p-12">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Besoin d'une offre sur-mesure ?
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-6 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Pour les agences immobilières et grands portefeuilles, nous proposons des solutions personnalisées.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg">
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      </motion.section>
    </div>
  );
}
