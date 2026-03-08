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
} from "lucide-react";

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
  const existingStyle = document.querySelector('[data-smoke-animation="true"]');
  if (!existingStyle) {
    const style = document.createElement("style");
    style.textContent = smokeStyles;
    style.setAttribute("data-smoke-animation", "true");
    document.head.appendChild(style);
  }
}

export function Footer() {
  return (
    <footer className="relative bg-white pt-24 md:pt-32 pb-12 overflow-hidden">
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

        {/* Corps de la maison - FIX Zoom : chevauchement de 4px pour éviter le trait blanc */}
        <div
          className="absolute inset-x-0 bottom-0 bg-[#D4E4CC]"
          style={{
            zIndex: 0,
            backgroundColor: "#D4E4CC",
            top: "196px",
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

        {/* Fumées */}
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
          <div className="smoke-particle smoke-1" style={{ width: "20px", height: "20px", left: "6px", top: "0px" }} />
          <div className="smoke-particle smoke-2" style={{ width: "24px", height: "24px", left: "4px", top: "5px" }} />
          <div className="smoke-particle smoke-3" style={{ width: "18px", height: "18px", left: "8px", top: "10px" }} />
          <div className="smoke-particle smoke-4" style={{ width: "22px", height: "22px", left: "5px", top: "15px" }} />
        </div>
      </div>

      {/* Contenu par-dessus le fond vert */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Image Footer illustration */}
        <div className="flex justify-center mb-8 -mt-8">
          <img
            src="/Ressource_gestiloc/footer.png"
            alt="Footer illustration"
            className="h-40 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* CTA Section */}
        <section className="max-w-3xl mx-auto px-4 text-center mt-20 md:mt-20">
          <div className="mb-8">
            <img
              src="/Ressource_gestiloc/footer_buildings.png"
              alt="Bâtiments"
              className="mx-auto h-32 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <h2
            className="text-2xl sm:text-3xl md:text-4xl mb-4"
            style={{ fontFamily: 'Merriweather', fontWeight: 700, fontSize: '24px' }}
          >
            Gérer vos biens en location n'a jamais été aussi facile !
          </h2>




          <div className="px-2">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-[#A8E063] hover:bg-[#92C753] text-gray-900 font-bold"
            >
              <Link to="/register">Ouvrir un compte gratuit</Link>
            </Button>
          </div>
        </section>

        {/* Section Paiement Sécurisé */}
        <div className="mb-12 mt-16">
          <div className="text-center mb-6">
            <h3 className="font-bold text-[#529D21] text-lg mb-2" style={{ fontFamily: 'Merriweather' }}>Paiement sécurisé</h3>
            <p className="text-sm text-gray-600">Mobile Money & Carte Bancaire</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {/* Mobile Money */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-500 font-medium">Mobile Money</p>
              <div className="flex gap-3 items-center">
                <img src="/Ressource_gestiloc/MTN 1.png" alt="MTN" className="h-8 w-auto object-contain" />
                <img src="/Ressource_gestiloc/Moov 1.png" alt="Moov" className="h-8 w-auto object-contain" />
                <img src="/Ressource_gestiloc/celtis.png" alt="Celtis" className="h-8 w-auto object-contain" />
                <img src="/Ressource_gestiloc/wave 1.png" alt="Wave" className="h-8 w-auto object-contain" />
              </div>
            </div>

            {/* Carte Bancaire */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-500 font-medium">Carte Bancaire</p>
              <div className="flex gap-3 items-center">
                <img src="/Ressource_gestiloc/master_card.png" alt="MasterCard" className="h-10 w-auto object-contain" />
                {/* Vous pouvez ajouter Visa ici si vous avez l'image */}
              </div>
            </div>
          </div>
        </div>

        {/* Liens Footer */}
        <div className="grid gap-8 md:grid-cols-3 mb-12 mt-20">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-[#529D21] mb-4 italic" style={{ fontFamily: 'Merriweather' }}>Gestiloc</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><Link to="/about" className="hover:text-gray-900">Qui sommes nous ?</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900">Nous contacter</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-900">Confidentialités et cookies</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-bold text-[#529D21] mb-4 italic" style={{ fontFamily: 'Merriweather' }}>Aide & support</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><Link to="/help" className="hover:text-gray-900">Centre d'aide</Link></li>
              <li><Link to="/faq" className="hover:text-gray-900">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-gray-900">Conditions d'utilisation</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-bold text-[#529D21] mb-4 italic" style={{ fontFamily: 'Merriweather' }}>Contacts</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="h-4 w-4 text-green-700" />
                <a href="mailto:contact@gestiloc.bj">contact@gestiloc.bj</a>
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="h-4 w-4 text-green-700" />
                <a href="tel:+2290156868570">+229 01 56 86 85 70</a>
              </li>
              <li className="text-xs">Disponible aussi sur WhatsApp </li>
            </ul>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-t border-gray-300 pt-8 flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <a href="#" className="h-10 w-10 rounded-full border-2 border-gray-400 flex items-center justify-center text-green-700 hover:bg-gray-50"><Facebook size={20} /></a>
            <a href="#" className="h-10 w-10 rounded-full border-2 border-gray-400 flex items-center justify-center text-green-700 hover:bg-gray-50"><Twitter size={20} /></a>
            <a href="#" className="h-10 w-10 rounded-full border-2 border-gray-400 flex items-center justify-center text-green-700 hover:bg-gray-50"><Linkedin size={20} /></a>
            <a href="#" className="h-10 w-10 rounded-full border-2 border-gray-400 flex items-center justify-center text-green-700 hover:bg-gray-50"><Instagram size={20} /></a>
          </div>
          <p className="text-xs text-gray-600 text-center">
            ©2026 GestiLoc. Tous droits réservés. Designé et Développé par <span className="text-green-700 font-medium">Innovtech</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
