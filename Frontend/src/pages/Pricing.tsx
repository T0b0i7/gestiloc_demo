import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown } from 'lucide-react';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const monthlyPrices = [
        {
            id: 1,
            name: "Gratuit",
            price: "0",
            subtitle: "Parfait pour vos début",
            features: [
                "Jusqu'à 10 baux",
                "Gestion des baux et locataires",
                "Quittances automatisées",
                "État des lieux numériques",
                "Support par email"
            ],
            color: "border-[#529D21]",
            bg: "bg-white",
            btnText: "Commencer gratuitement",
            btnColor: "",
            hoverColor: "",
            popular: false,
            nameStyle: { fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, fontSize: '28px', lineHeight: '100%', letterSpacing: '-0.17px', textAlign: 'left' as const, color: '#529D21' },
            checkColor: "text-[#529D21]",
            cardBg: "rgba(82, 157, 33, 1)"
        },
        {
            id: 2,
            name: "Pro",
            price: "9.900",
            subtitle: "Pour vos tailles réelles",
            features: [
                "Illimité baux",
                "Toutes les fonctionnalités de Gratuit",
                "Loyer et quittances automatique",
                "Régularisation des charges",
                "Comptabilité complète",
                "Soutien prioritaire"
            ],
            color: "border-[#9747FF]",
            bg: "bg-white",
            btnText: "Essayez 30 jours gratuit",
            btnColor: "",
            hoverColor: "",
            popular: true,
            nameStyle: { fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, fontSize: '28px', lineHeight: '100%', letterSpacing: '-0.17px', textAlign: 'left' as const, color: '#9747FF' },
            checkColor: "text-[#9747FF]",
            cardBg: "rgba(151, 71, 255, 0.69)"
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
            color: "border-[#529D21]",
            bg: "bg-white",
            btnText: "Contactez l'équipe",
            btnColor: "",
            hoverColor: "",
            popular: false,
            nameStyle: { fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, fontSize: '28px', lineHeight: '100%', letterSpacing: '-0.17px', textAlign: 'left' as const, color: '#529D21' },
            checkColor: "text-[#529D21]",
            cardBg: "rgba(82, 157, 33, 1)"
        }
    ];

    const annualPrices = [
        {
            id: 1,
            name: "Gratuit",
            price: "60.000",
            subtitle: "Parfait pour vos début",
            features: [
                "Jusqu'à 10 baux",
                "Gestion des baux et locataires",
                "Quittances automatisées",
                "État des lieux numériques",
                "Support par email"
            ],
            color: "border-[#529D21]",
            bg: "bg-white",
            btnText: "Commencer gratuitement",
            btnColor: "",
            hoverColor: "",
            popular: false,
            nameStyle: { fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, fontSize: '28px', lineHeight: '100%', letterSpacing: '-0.17px', textAlign: 'left' as const, color: '#529D21' },
            checkColor: "text-[#529D21]",
            cardBg: "rgba(82, 157, 33, 1)"
        },
        {
            id: 2,
            name: "Pro",
            price: "144.000",
            subtitle: "Pour vos tailles réelles",
            features: [
                "Illimité baux",
                "Toutes les fonctionnalités de Gratuit",
                "Loyer et quittances automatique",
                "Régularisation des charges",
                "Comptabilité complète",
                "Soutien prioritaire"
            ],
            color: "border-[#9747FF]",
            bg: "bg-white",
            btnText: "Essayez 30 jours gratuit",
            btnColor: "",
            hoverColor: "",
            popular: true,
            nameStyle: { fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, fontSize: '28px', lineHeight: '100%', letterSpacing: '-0.17px', textAlign: 'left' as const, color: '#9747FF' },
            checkColor: "text-[#9747FF]",
            cardBg: "rgba(151, 71, 255, 0.69)"
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
            color: "border-[#529D21]",
            bg: "bg-white",
            btnText: "Contactez l'équipe",
            btnColor: "",
            hoverColor: "",
            popular: false,
            nameStyle: { fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, fontSize: '28px', lineHeight: '100%', letterSpacing: '-0.17px', textAlign: 'left' as const, color: '#529D21' },
            checkColor: "text-[#529D21]",
            cardBg: "rgba(82, 157, 33, 1)"
        }
    ];

    const faqs = [
        {
            question: "Puis-je changer de plan à tout moment ?",
            answer: "Oui, vous pouvez passer à un forfait supérieur ou inférieur à tout moment depuis vos paramètres de compte. Le calcul au pro-rata sera automatiquement appliqué : vous ne payez que la différence pour la période restante. Si vous passez à un forfait inférieur, le montant restant sera crédité sur votre compte pour les prochains mois."
        },
        {
            question: "Y a-t-il un engagement de durée ?",
            answer: "Aucun engagement ! Nos forfaits mensuels sont entièrement flexibles : vous pouvez résilier à tout moment sans frais supplémentaires. Les forfaits annuels vous permettent de bénéficier d'une réduction significative (jusqu'à 20%) mais vous engagent sur 12 mois. Cependant, même en forfait annuel, vous pouvez résilier prématurément et obtenir un remboursement proportionnel."
        },
        {
            question: "Proposez-vous une période d'essai ?",
            answer: "Absolument ! Nous offrons 30 jours d'essai gratuit sur le forfait Pro afin que vous puissiez tester toutes les fonctionnalités avancées sans aucun risque. Pas de carte bancaire requise pour commencer. Vous avez accès complet à : la gestion illimitée des baux, les quittances automatisées, la comptabilité et le soutien prioritaire. Vous pouvez annuler à tout moment pendant cette période."
        },
        {
            question: "Quels moyens de paiement sont acceptés ?",
            answer: "Nous avons choisi des moyens de paiement adaptés à tous en Afrique : Mobile Money (MTN Mobile Money, Moov Africa, Celtiis, Wave) pour des paiements rapides depuis votre téléphone, et toutes les cartes bancaires internationales (Visa, Mastercard, American Express). Tous les paiements sont sécurisés par encryption SSL 256-bit et traités via des passerelles certifiées PCI-DSS."
        },
        {
            question: "Est-ce que mon compte est vraiment sécurisé ?",
            answer: "La sécurité de vos données est notre priorité absolue. GestiLoc utilise : un chiffrement de niveau bancaire (SSL/TLS 256-bit) pour toutes les données, une authentification forte avec vérification en deux étapes, des sauvegardes automatiques quotidiennes, une infrastructure hébergée dans des centres de données sécurisés avec certifications ISO 27001. Vos données et celles de vos locataires sont protégées conformément au RGPD."
        }
    ];

    const currentPrices = isAnnual ? annualPrices : monthlyPrices;

    return (
        <div className="font-sans text-[#1a1a1a]">
            {/* Container Background with gradient */}
            <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(180deg, #83C757 3.37%, #83C757 26.92%, #C1E9A2 49.04%, #E4FFBD 69.23%, #FFFFFF 93.27%)' }}>

                {/* Header Content */}
                <div className="max-w-4xl mx-auto pt-16 px-6 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl font-extrabold text-white mb-4"
                        style={{ fontFamily: 'Lora', fontWeight: 700, fontStyle: 'italic' as const, fontSize: '48px', lineHeight: '100%', letterSpacing: '-0.17px', textAlign: 'center', verticalAlign: 'middle' }}
                    >
                        Tarifs simples et transparents
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-white text-lg font-medium max-w-2xl mx-auto mb-20"
                        style={{ fontFamily: 'Manrope', fontWeight: 500, fontSize: '16px', lineHeight: '100%', letterSpacing: '-0.17px' }}
                    >
                        Choisissez le plan qui vous correspond le mieux. Sans engagement, changez quand vous voulez !
                    </motion.p>

                    {/* Toggle Button */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center justify-center mb-16"
                    >
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-white p-1 rounded-full shadow-md flex items-center"
                        >
                            <motion.button
                                onClick={() => setIsAnnual(false)}
                                whileTap={{ scale: 0.95 }}
                                className={`py-3 px-8 rounded-full font-bold transition-all duration-300 ${!isAnnual ? 'bg-[#FFEB3B] text-[#1F3A19]' : 'text-gray-500'}`}
                            >
                                Mensuel
                            </motion.button>
                            <motion.button
                                onClick={() => setIsAnnual(true)}
                                whileTap={{ scale: 0.95 }}
                                className={`py-3 px-8 rounded-full font-bold transition-all duration-300 ${isAnnual ? 'bg-[#FFEB3B] text-[#1F3A19]' : 'text-gray-500'}`}
                            >
                                Annuel
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                    {currentPrices.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.5, type: "spring", stiffness: 100 }}
                            whileHover={{ 
                                scale: 1.05, 
                                boxShadow: "0 25px 50px -12px rgba(151, 71, 255, 0.35)",
                            }}
                            className={`bg-white rounded-[32px] border-[1px] ${tier.color} p-8 relative flex flex-col items-start text-left shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full ${tier.popular ? 'ring-4 ring-[#9747FF]/20' : ''}`}
                        >
                            {tier.popular && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="absolute -top-4 right-4 bg-white border-[1px] border-[rgba(151,71,255,1)] py-2 px-4 rounded-full text-sm font-bold shadow-md whitespace-nowrap flex items-center gap-2"
                                >
                                    <img src="/Ressource_gestiloc/starpng.png" alt="star" className="w-5 h-5 animate-spin-slow" />
                                    <span style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '14px', letterSpacing: '-0.17px' }}>
                                        Le plus populaire
                                    </span>
                                </motion.div>
                            )}

                            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-left" style={tier.nameStyle as React.CSSProperties}>
                                {tier.name}
                            </h2>

                            <p className="text-gray-600 mb-6 text-sm text-left">{tier.subtitle}</p>

                            <div className="mb-8 items-baseline flex gap-1 justify-center">
                                <span className="text-5xl md:text-6xl font-black text-[#1F3A19]">{tier.price} FCFA</span>
                                <span className="text-gray-500 font-bold text-lg md:text-xl">/{isAnnual ? 'an' : 'mois'}</span>
                            </div>

                            <div className="w-full space-y-4 mb-10 flex-grow text-left">
                                {tier.features.map((feature, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <CheckCircle2 className={`w-6 h-6 flex-shrink-0`} style={{ color: tier.cardBg }} />
                                        <span className="text-gray-700 text-sm md:text-base font-medium">
                                            {feature}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-full py-4 px-6 rounded-2xl text-[#1F3A19] font-black text-lg shadow-lg transition-all duration-300`}
                                style={{
                                    background: tier.id === 1 || tier.id === 3 ? 'rgba(196, 255, 109, 1)' : 'rgba(187, 139, 249, 0.69)',
                                    borderBottom: tier.id === 1 || tier.id === 3 ? '2px solid rgba(82, 157, 33, 1)' : '2px solid rgba(151, 71, 255, 0.69)'
                                }}
                            >
                                {tier.btnText}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Mini CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto mt-20 text-center px-6"
                >
                    <h3 className="text-3xl md:text-5xl font-black text-[#1F3A19] mb-4" style={{ fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, lineHeight: '100%', letterSpacing: '-0.17px' }}>Commencez maintenant, gratuitement !</h3>
                    <p className="text-black mb-8 max-w-xl mx-auto text-center" style={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '18px', lineHeight: '150%' }}>
                        Pas de carte bancaire requis.<br />
                        Accès complet au plan Starter pendant 30 jours.<br />
                        Annulez à tout moment.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-black font-black py-4 px-10 rounded-2xl shadow-lg transition-all"
                        style={{ background: 'rgba(179, 120, 255, 0.69)', borderBottom: '2px solid rgba(151, 71, 255, 1)' }}
                        onClick={() => window.location.href = '/register'}
                    >
                        Ouvrez un compte gratuit
                    </motion.button>
                </motion.div>

                {/* Payment Methods */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto mt-20 text-center px-6"
                >
                    <h4 className="text-[#529D21] font-bold text-lg md:text-xl mb-8 uppercase tracking-widest" style={{ fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, lineHeight: '100%', letterSpacing: '-0.17px' }}>
                        Paiement Mobile Money & Carte bancaire <span style={{ fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, fontSize: '12px', lineHeight: '100%', letterSpacing: '-0.17px', verticalAlign: 'middle', color: '#9747FF' }}>(100% sécurisé)</span>
                    </h4>
                    <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
                        <img src="/Ressource_gestiloc/MTN%201.png" alt="MTN Mobile Money" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <img src="/Ressource_gestiloc/Moov%201.png" alt="Moov Africa" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <img src="/Ressource_gestiloc/celtis.png" alt="Celtiis" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <img src="/Ressource_gestiloc/wave%201.png" alt="Wave" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <img src="/Ressource_gestiloc/master_card.png" alt="Mastercard" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto mt-32 px-6"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-black text-center mb-16" style={{ fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const, lineHeight: '100%', letterSpacing: '-0.17px' }}>Questions Fréquentes ?</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </motion.div>

                {/* Offre sur mesure */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto mt-32 relative"
                >
                    <div className="text-center">
                        <h2 className="font-[Lora] font-bold italic text-4xl lg:text-5xl text-center mb-8" style={{ fontFamily: 'Lora', fontWeight: 700, fontStyle: 'italic', lineHeight: '120%', letterSpacing: '-0.17px' }}>
                            Besoin d'une offre sur mesure ?
                        </h2>
                        <p className="text-black text-xl font-semibold mb-4 max-w-2xl mx-auto" style={{ fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const }}>
                            Pour les agences immobilières et grands portefeuilles, nous proposons des solutions personnalisées.
                        </p>
                        <p className="text-gray-700 text-lg font-medium mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Lora', fontWeight: 600, fontStyle: 'italic' as const }}>
                            Profitez d'un accompagnement dédié, d'API sur mesure et d'une gestion optimisée pour votre parc.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[#1F3A19] font-bold py-6 px-16 rounded-2xl shadow-xl transition-all whitespace-nowrap text-lg"
                            style={{ background: 'rgba(185, 255, 140, 1)', borderBottom: '2px solid rgba(82, 157, 33, 0.67)' }}
                        >
                            Nous contacter
                        </motion.button>
                    </div>
                </motion.div>
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
                <span className="text-xl font-bold text-black group-hover:text-[#529D21] transition-colors" style={{ fontFamily: 'Montserrat', fontWeight: 600, fontStyle: 'normal' as const, lineHeight: '100%', letterSpacing: '-0.17px' }}>
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