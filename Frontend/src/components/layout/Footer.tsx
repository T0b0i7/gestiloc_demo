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
    <footer className="relative bg-white pt-40 md:pt-48 pb-12 overflow-hidden">
      {/* Fond vert en forme de maison */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-12 md:top-16">
        {/* Toit de la maison */}
        <div
          className="absolute inset-x-0 top-0 w-full h-0"
          style={{
            zIndex: 0,
            borderLeft: "50vw solid transparent",
            borderRight: "50vw solid transparent",
            borderBottom: "200px solid #D4E4CC",
          }}
        />

        {/* Corps de la maison */}
        <div
          className="absolute inset-x-0 top-[180px] md:top-[200px] bottom-0 bg-[#D4E4CC]"
          style={{
            zIndex: 0,
            backgroundColor: "#D4E4CC"
          }}
        />

        {/* Cheminée */}
        <div
          className="absolute right-[15%] md:right-[20%] w-8 h-20 md:w-10 md:h-24 bg-[#D4E4CC]"
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
          {/* Particules de fumée */}
          <div className="smoke-particle smoke-1" style={{ width: "20px", height: "20px", left: "6px", top: "0px" }} />
          <div className="smoke-particle smoke-2" style={{ width: "24px", height: "24px", left: "4px", top: "5px" }} />
          <div className="smoke-particle smoke-3" style={{ width: "18px", height: "18px", left: "8px", top: "10px" }} />
          <div className="smoke-particle smoke-4" style={{ width: "22px", height: "22px", left: "5px", top: "15px" }} />
        </div>
      </div>

      {/* Contenu par-dessus le fond vert */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Image Footer */}
        <div className="flex justify-center mb-8 -mt-8">
          <img
            src="/Ressource_gestiloc/footer.png"
            alt="Footer illustration"
            className="h-40 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* CTA intégrée avec illustration */}
        <section className="max-w-3xl mx-auto my-auto px-4 sm:px-6 text-center mt-20 sm:mt-28 md:mt-20">
  {/* Illustration des bâtiments */}
  <div className="mb-8">
    <img
      src="/Ressource_gestiloc/footer_buildings.png"
      alt="Bâtiments et maisons"
      className="mx-auto h-32 w-auto object-contain"
      onError={(e) => {
        // Fallback si l'image n'existe pas
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>

  <h2 
    className="text-2xl sm:text-3xl md:text-4xl mb-4 tracking-tight text-slate-900"
    style={{
      fontFamily: 'Merriweather',
      fontWeight: 700,
      fontStyle: 'italic',
      fontSize: '24px',
      lineHeight: '100%',
      letterSpacing: '-0.17px',
      verticalAlign: 'middle'
    }}
  >
    Gérer vos biens en location n&apos;a jamais été aussi facile&nbsp;!
  </h2>

  <p 
    className="text-base sm:text-lg text-slate-700 mb-6 sm:mb-8 max-w-2xl mx-auto"
    style={{
      fontFamily: 'Manrope',
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '14px',
      lineHeight: '100%',
      letterSpacing: '-0.17px',
      textAlign: 'center',
      verticalAlign: 'middle'
    }}
  >
    Rejoignez des milliers de propriétaires et agences qui simplifient leur
    gestion locative avec GestiLoc.
  </p>

  <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 mb-6 sm:mb-8 text-sm sm:text-base">
    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 shrink-0" />
      <span className="font-medium text-slate-800">
        Sans engagement
      </span>
    </div>
    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 shrink-0" />
      <span className="font-medium text-slate-800">
        Gratuit pour commencer
      </span>
    </div>
  </div>

  <div className="px-2">
    <Button
      asChild
      size="lg"
      className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 bg-[#A8E063] hover:bg-[#92C753] text-gray-900 font-bold"
    >
      <Link to="/register">Ouvrir un compte gratuit</Link>
    </Button>
  </div>

</section>

        {/* Contenu du footer */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {/* Section Gestiloc */}
          <div>
            <h3 
            className="font-bold text-lg mb-4 text-green-700"
            style={{
              fontFamily: 'Merriweather',
              fontWeight: 700,
              fontStyle: 'italic',
              fontSize: '16px',
              lineHeight: '30px',
              letterSpacing: '-0.17px',
              verticalAlign: 'middle'
            }}
          >
            Gestiloc
          </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Qui sommes nous ?
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Confidentialités et cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Aide & support */}
          <div>
            <h3 
            className="font-bold text-lg mb-4 text-green-700"
            style={{
              fontFamily: 'Merriweather',
              fontWeight: 700,
              fontStyle: 'italic',
              fontSize: '16px',
              lineHeight: '30px',
              letterSpacing: '-0.17px',
              verticalAlign: 'middle'
            }}
          >
            Aide & support
          </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Contacts */}
          <div>
            <h3 
            className="font-bold text-lg mb-4 text-green-700"
            style={{
              fontFamily: 'Merriweather',
              fontWeight: 700,
              fontStyle: 'italic',
              fontSize: '16px',
              lineHeight: '30px',
              letterSpacing: '-0.17px',
              verticalAlign: 'middle'
            }}
          >
            Contacts
          </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-700 shrink-0" />
                <a
                  href="mailto:contact@gestiloc.bj"
                  className="hover:text-gray-900 transition-colors"
                >
                  contact@gestiloc.bj
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-700 shrink-0" />
                <a
                  href="tel:+2290156868570"
                  className="hover:text-gray-900 transition-colors"
                >
                  +229 01 56 86 85 70
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                <span>
                  Disponible aussi sur WhatsApp pour vos questions
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-t border-gray-300 pt-8 flex flex-col items-center gap-6">
          {/* Réseaux sociaux - centrés */}
          <div className="flex gap-4">
            <a
              href="#"
              className="h-10 w-10 rounded-full border-2 border-gray-400 bg-white text-green-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="h-10 w-10 rounded-full border-2 border-gray-400 bg-white text-green-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="h-10 w-10 rounded-full border-2 border-gray-400 bg-white text-green-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="h-10 w-10 rounded-full border-2 border-gray-400 bg-white text-green-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright - centré */}
          <p className="text-sm text-gray-600 text-center">
            ©2026 GestiLoc. Tous droits réservés. Designé et Développé par{" "}
            <span className="text-green-700 font-medium">Innovtech</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
