import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, Plus, Minus, Home, Mail, Phone, MapPin, Globe, Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const monthlyPrices = [
        {
            id: 1,
            name: "Gratuit",
            price: "0",
            subtitle: "Parfait pour vos débuts",
            features: [
                "Jusqu'à 10 baux",
                "Gestion des baux et locataires",
                "Quittances automatisées",
                "Etas des lieux numériques",
                "Support par email"
            ],
            color: "border-[#87C44E]",
            bg: "bg-white",
            btnText: "Commencer gratuitement",
            btnColor: "bg-[#BAFF4D]",
            hoverColor: "hover:bg-[#a6e644]",
            popular: false
        },
        {
            id: 2,
            name: "Pro",
            price: "9.900",
            subtitle: "Pour vos tailles réels",
            features: [
                "Illimité baux",
                "Toutes les fonctionnalités de Basique",
                "Révision de loyer automatique",
                "Régularisation des charges",
                "Comptabilité complète",
                "Soutien prioritaire"
            ],
            color: "border-[#9B59B6]",
            bg: "bg-white",
            btnText: "Essayez 30 jours gratuit",
            btnColor: "bg-[#D1ABFF]",
            hoverColor: "hover:bg-[#bc90f2]",
            popular: true
        },
        {
            id: 3,
            name: "Entreprise",
            price: "50.000",
            subtitle: "Pour les professionnels",
            features: [
                "Pack de plus de 100",
                "Multi-utilisateurs (jusqu'à 10)",
                "API et intégrations sur mesure",
                "Support personnalisé 24/7",
                "Formation dédiée",
                "Gestionnaire de compte dédié"
            ],
            color: "border-[#87C44E]",
            bg: "bg-white",
            btnText: "Contactez l'équipe",
            btnColor: "bg-[#BAFF4D]",
            hoverColor: "hover:bg-[#a6e644]",
            popular: false
        }
    ];

    const annualPrices = [
        {
            id: 1,
            name: "Basique",
            price: "60.000",
            subtitle: "Parfait pour vos débuts",
            features: [
                "Jusqu'à 10 baux",
                "Gestion des baux et locataires",
                "Quittances automatisées",
                "Etas des lieux numériques",
                "Support par email"
            ],
            color: "border-[#87C44E]",
            bg: "bg-white",
            btnText: "Commencer gratuitement",
            btnColor: "bg-[#BAFF4D]",
            hoverColor: "hover:bg-[#a6e644]",
            popular: false
        },
        {
            id: 2,
            name: "Pro",
            price: "144.000",
            subtitle: "Pour vos tailles réels",
            features: [
                "Illimité baux",
                "Toutes les fonctionnalités de Basique",
                "Révision de loyer automatique",
                "Régularisation des charges",
                "Comptabilité complète",
                "Soutien prioritaire"
            ],
            color: "border-[#9B59B6]",
            bg: "bg-white",
            btnText: "Essayez 30 jours gratuit",
            btnColor: "bg-[#D1ABFF]",
            hoverColor: "hover:bg-[#bc90f2]",
            popular: true
        },
        {
            id: 3,
            name: "Entreprise",
            price: "500.000",
            subtitle: "Pour les professionnels",
            features: [
                "Pack de plus de 100",
                "Multi-utilisateurs (jusqu'à 10)",
                "API et intégrations sur mesure",
                "Support personnalisé 24/7",
                "Formation dédiée",
                "Gestionnaire de compte dédié"
            ],
            color: "border-[#87C44E]",
            bg: "bg-white",
            btnText: "Contactez l'équipe",
            btnColor: "bg-[#BAFF4D]",
            hoverColor: "hover:bg-[#a6e644]",
            popular: false
        }
    ];

    const faqs = [
        {
            question: "Puis-je changer de plan à tout moment ?",
            answer: "Oui, vous pouvez passer à un forfait supérieur ou inférieur à tout moment depuis vos paramètres. Le calcul au pro-rata sera automatiquement appliqué."
        },
        {
            question: "Y a-t-il un engagement de durée ?",
            answer: "Non, nos forfaits mensuels sont sans engagement. Vous pouvez résilier à tout moment. Les forfaits annuels vous engagent sur 12 mois avec une réduction."
        },
        {
            question: "Proposez-vous une période d'essai ?",
            answer: "Oui, nous offrons 30 jours d'essai gratuit sur le forfait Pro afin que vous puissiez tester toutes les fonctionnalités sans risque."
        },
        {
            question: "Quels moyens de paiement sont acceptés ?",
            answer: "Nous acceptons les paiements via Mobile Money (MTN, Moov, Celtis, Wave) ainsi que toutes les cartes bancaires internationales (Visa, Mastercard)."
        },
        {
            question: "Est-ce que mon compte est vraiment sécurisé ?",
            answer: "Absolument. GestiLoc utilise un chiffrement de niveau bancaire et des protocoles de sécurité avancés pour protéger vos données et celles de vos locataires."
        }
    ];

    const currentPrices = isAnnual ? annualPrices : monthlyPrices;

    return (
        <div className="font-sans text-[#1a1a1a]">
            {/* Container Background */}
            <div className="bg-[#E9F5E1] min-h-screen pb-20">

                {/* Header Content */}
                <div className="max-w-4xl mx-auto pt-16 px-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#1F3A19] mb-4">
                        Tarifs simples et transparents
                    </h1>
                    <p className="text-[#2D4A22] text-lg font-medium max-w-2xl mx-auto mb-10">
                        Choisissez le plan qui vous correspond le mieux. Sans engagement, changez quand vous voulez !
                    </p>

                    {/* Toggle Button */}
                    <div className="flex items-center justify-center mb-16">
                        <div className="bg-white p-1 rounded-full shadow-md flex items-center">
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`py-3 px-8 rounded-full font-bold transition-all duration-300 ${!isAnnual ? 'bg-[#FFEB3B] text-[#1F3A19]' : 'text-gray-500'}`}
                            >
                                Mensuel
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`py-3 px-8 rounded-full font-bold transition-all duration-300 ${isAnnual ? 'bg-[#FFEB3B] text-[#1F3A19]' : 'text-gray-500'}`}
                            >
                                Annuel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                    {currentPrices.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-white rounded-[32px] border-[1px] ${tier.color} p-8 relative flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full`}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#9747FF] text-white py-1 px-4 rounded-full text-sm font-bold shadow-md whitespace-nowrap">
                                    L'offre la plus prisée
                                </div>
                            )}

                            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${tier.color.replace('border-', 'text-')}`}>
                                {tier.name}
                            </h2>

                            <p className="text-gray-600 mb-6 text-sm">{tier.subtitle}</p>

                            <div className="mb-8 items-baseline flex gap-1">
                                <span className="text-4xl md:text-5xl font-black text-[#1F3A19]">{tier.price} FCFA</span>
                                <span className="text-gray-500 font-bold">/{isAnnual ? 'an' : 'mois'}</span>
                            </div>

                            <div className="w-full space-y-4 mb-10 flex-grow text-left">
                                {tier.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${tier.color.replace('border-', 'text-')}`} />
                                        <span className="text-gray-700 text-sm md:text-base font-medium">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-full py-4 px-6 rounded-2xl ${tier.btnColor} ${tier.hoverColor} text-[#1F3A19] font-black text-lg shadow-lg transition-all duration-300`}
                            >
                                {tier.btnText}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Mini CTA */}
                <div className="max-w-4xl mx-auto mt-20 text-center px-6">
                    <h3 className="text-2xl font-black text-[#1F3A19] mb-4">Commencez maintenant, gratuitement !</h3>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Pas de carte bancaire requise. Votre compte est prêt à être paramétré en moins de 5 minutes.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#D1ABFF] hover:bg-[#bc90f2] text-[#1F3A19] font-black py-4 px-10 rounded-2xl shadow-lg transition-all"
                    >
                        Ouvrez un compte gratuit
                    </motion.button>
                </div>

                {/* Payment Methods */}
                <div className="max-w-4xl mx-auto mt-20 text-center px-6">
                    <h4 className="text-[#529D21] font-bold text-lg mb-8 uppercase tracking-widest">
                        Paiement Mobile Money & Carte bancaire (100% sécurisé)
                    </h4>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        <img src="/Ressource_gestiloc/MTN 1.png" alt="MTN" className="h-12 object-contain" />
                        <img src="/Ressource_gestiloc/Moov 1.png" alt="Moov Africa" className="h-12 object-contain" />
                        <img src="/Ressource_gestiloc/celtis.png" alt="celtiis" className="h-12 object-contain" />
                        <img src="/Ressource_gestiloc/wave 1.png" alt="Wave" className="h-12 object-contain" />
                        <img src="/Ressource_gestiloc/master_card.png" alt="mastercard" className="h-12 object-contain" />
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mt-32 px-6">
                    <h2 className="text-3xl md:text-5xl font-black text-[#1F3A19] text-center mb-16">Questions Fréquentes ?</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>

                {/* Offre sur mesure */}
                <div className="max-w-4xl mx-auto mt-32 bg-[#D1FF96] rounded-[40px] p-12 text-center shadow-xl border-4 border-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-[#1F3A19] mb-4">Besoin d'une offre sur mesure ?</h2>
                        <p className="text-[#2D4A22] text-xl font-semibold mb-10 max-w-2xl mx-auto">
                            Pour les agences immobilières et grands portefeuilles, nous proposons des solutions personnalisées.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white hover:bg-gray-50 text-[#1F3A19] font-black py-4 px-10 rounded-full shadow-lg transition-all"
                        >
                            Nous contacter
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-[#2D4A22]/20 py-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left group"
            >
                <span className="text-xl font-bold text-[#1F3A19] group-hover:text-[#529D21] transition-colors">
                    {question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="text-[#1F3A19]"
                >
                    <ChevronDown size={28} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-8 text-gray-700 leading-relaxed text-lg">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pricing;
