import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

const benefits = [
  "Sans engagement",
  "Gratuit pour commencer",
  "Assistance incluse",
  "Aucune carte bancaire requise",
];

/* CSS pour l'animation de fumée */
const smokeStyles = `
  @keyframes smokeRise {
    0% {
      opacity: 0.7;
      transform: translateY(0) translateX(0) scale(1);
    }
    50% {
      opacity: 0.5;
      transform: translateY(-40px) translateX(8px) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: translateY(-80px) translateX(12px) scale(1.4);
    }
  }

  .smoke-particle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(60,60,60,0.8), rgba(30,30,30,0.4));
    pointer-events: none;
    filter: blur(2px);
  }

  .smoke-1 { animation: smokeRise 3s ease-out infinite; }
  .smoke-2 { animation: smokeRise 3.5s ease-out infinite 0.3s; }
  .smoke-3 { animation: smokeRise 3.2s ease-out infinite 0.6s; }
  .smoke-4 { animation: smokeRise 3.8s ease-out infinite 0.9s; }
`;

// Injecter les styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = smokeStyles;
  style.setAttribute("data-smoke-animation", "true");
  document.head.appendChild(style);
}

const footerNavigation = {
  product: [
    { name: "Fonctionnalités", href: "/tour" },
    { name: "Tarifs", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "À propos", href: "/about" },
  ],
  legal: [
    { name: "Conditions d'utilisation", href: "/legal/terms" },
    { name: "Confidentialité", href: "/legal/privacy" },
    { name: "Cookies", href: "/legal/cookies" },
  ],
  help: [
    { name: "Centre d'aide", href: "/help" },
    { name: "FAQ", href: "/help/faq" },
  ],
  social: [
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "Instagram", href: "#", icon: Instagram },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-white pt-32 md:pt-40 pb-12 overflow-hidden">
      {/* Fond bleu en forme de maison avec cheminée */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-12 md:top-16">
        {/* Toit de la maison */}
        <div
          className="absolute inset-x-0 top-0 w-full h-0"
          style={{
            zIndex: 0,
            borderLeft: "50vw solid transparent",
            borderRight: "50vw solid transparent",
            borderBottom: "200px solid #E0EBFF",
          }}
        />

        {/* Corps de la maison */}
        <div
          className="absolute inset-x-0 top-[180px] md:top-[200px] bottom-0 bg-[#E0EBFF]"
          style={{
            zIndex: 0,
            backgroundColor: "#E0EBFF"
          }}
        />


        {/* Cheminée */}
        <div
          className="absolute right-[15%] md:right-[20%] w-8 h-20 md:w-10 md:h-24 bg-[#E0EBFF]"
          style={{
            top: "80px",
            clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)",
            transform: "rotate(5deg)",
            zIndex: 1,
            boxShadow: "0 0 8px rgba(0,0,0,0.1)",
          }}
        />

        {/* Fumée sortant de la cheminée */}
        <div
          className="absolute right-[15%] md:right-[20%]"
          style={{
            top: "60px",
            width: "32px",
            height: "150px",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          {/* Particules de fumée noire bien visibles */}
          <div className="smoke-particle smoke-1" style={{ width: "20px", height: "20px", left: "6px", top: "0px" }} />
          <div className="smoke-particle smoke-2" style={{ width: "24px", height: "24px", left: "4px", top: "5px" }} />
          <div className="smoke-particle smoke-3" style={{ width: "18px", height: "18px", left: "8px", top: "10px" }} />
          <div className="smoke-particle smoke-4" style={{ width: "22px", height: "22px", left: "5px", top: "15px" }} />
        </div>
      </div>

      {/* Contenu par-dessus le fond bleu */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* CTA intégrée, sans cadre */}
       <section className="max-w-3xl mx-auto my-auto px-4 sm:px-6 text-center mt-20 sm:mt-28 md:mt-20">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight text-slate-900">
    Gérer vos biens en location n&apos;a jamais été aussi facile&nbsp;!
  </h2>

  <p className="text-base sm:text-lg text-slate-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
    Rejoignez des milliers de propriétaires qui simplifient leur
    gestion locative avec GestiLoc.
  </p>

  <div className="flex flex-row flex-nowrap justify-center gap-4 md:gap-8 mb-6 sm:mb-8 text-sm sm:text-base">
    {benefits.map((benefit, index) => (
      <div key={index} className="flex items-center justify-center gap-2 whitespace-nowrap">
        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#2563EB] shrink-0" />
        <span className="font-medium text-slate-800">
          {benefit}
        </span>
      </div>
    ))}
  </div>

  <div className="px-2">
    <Button
      asChild
      size="lg"
      className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 bg-[#2563EB] hover:bg-[#1D4ED8]"
    >
      <Link to="/register">Ouvrir un compte gratuit</Link>
    </Button>
  </div>

 
</section>

        {/* Contenu du footer */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-12 animate-float">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#111827] flex items-center justify-center">
                <span className="text-xl font-bold text-[#E0EBFF]">GL</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111827]">
                GestiLoc
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              La solution béninoise de gestion locative pour propriétaires
              et locataires. Gagnez du temps sur la gestion, concentrez-vous
              sur vos biens.
            </p>
            <div className="flex gap-3 pt-2">
              {footerNavigation.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="h-9 w-9 rounded-full bg-white/80 text-slate-600 flex items-center justify-center shadow-sm hover:bg-white hover:text-[#2563EB] transition-colors"
                    aria-label={item.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[#111827]">Produit</h3>
            <ul className="space-y-3">
              {footerNavigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-slate-700 hover:text-[#111827] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help + Legal Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[#111827]">
              Aide &amp; Support
            </h3>
            <ul className="space-y-3">
              {footerNavigation.help.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-slate-700 hover:text-[#111827] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-slate-700 hover:text-[#111827] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-[#111827]">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-[#2563EB] shrink-0" />
                <a
                  href="mailto:contact@gestiloc.bj"
                  className="hover:text-[#111827] transition-colors"
                >
                  contact@gestiloc.bj
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-[#2563EB] shrink-0" />
                <div className="space-y-1">
                  <a
                    href="tel:0756868570"
                    className="hover:text-[#111827] transition-colors block"
                  >
                    07 56 86 85 70
                  </a>
                  <span className="text-xs text-slate-500">
                    Disponible aussi sur WhatsApp pour vos questions
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-t border-[#BFCEF8] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-700 text-center md:text-left">
            © {new Date().getFullYear()} GestiLoc. Tous droits réservés.
            Développé par{" "}
            <Link
              to="/about"
              className="text-[#1D4ED8] hover:underline font-medium"
            >
              Innovtech
            </Link>
          </p>
        
        </div>
      </div>
    </footer>
  );
}
