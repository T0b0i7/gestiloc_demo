import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Produit",
      links: [
        { label: "Fonctionnalités", href: "/#features" },
        { label: "Tarifs", href: "/pricing" },
        { label: "Téléchargements", href: "/#download" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Centre d'aide", href: "/help" },
        { label: "FAQ", href: "/faq" },
        { label: "Contact", href: "/contact" },
        { label: "Documentation", href: "#" },
      ],
    },
    {
      title: "Légal",
      links: [
        { label: "Politique de confidentialité", href: "/legal/privacy" },
        { label: "Conditions d'utilisation", href: "/legal/terms" },
        { label: "Mentions légales", href: "#" },
        { label: "Politique de cookies", href: "/cookies" },
        { label: "À propos", href: "/about" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
          {/* Brand Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl md:text-4xl font-bold text-green-400 mb-3 md:mb-4">Imona</h3>
            <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6">
              La plateforme de gestion immobilière #1 en Afrique de l'Ouest
            </p>
            <div className="space-y-2 md:space-y-3 text-sm md:text-base">
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 md:h-5 w-4 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
                <a href="mailto:support@imona.bj" className="hover:text-green-400 transition-colors">
                  support@imona.bj
                </a>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 md:h-5 w-4 md:w-5 mr-2 md:mr-3 flex-shrink-0" />
                <a href="tel:+229XXXXXXXX" className="hover:text-green-400 transition-colors">
                  +229 XX XX XX XX
                </a>
              </div>
              <div className="flex items-start text-gray-400">
                <MapPin className="h-4 md:h-5 w-4 md:w-5 mr-2 md:mr-3 mt-0.5 md:mt-1 flex-shrink-0" />
                <span>Cotonou, Bénin</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="col-span-1">
              <h4 className="font-bold text-white mb-3 md:mb-4 text-sm md:text-base">{section.title}</h4>
              <ul className="space-y-2 md:space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-green-400 transition-colors text-sm md:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 md:pt-8">
          {/* Social Links */}
          <div className="flex justify-center space-x-4 md:space-x-6 mb-6 md:mb-8">
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
              <svg className="h-5 md:h-6 w-5 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
              <svg className="h-5 md:h-6 w-5 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
              <svg className="h-5 md:h-6 w-5 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
            <p className="text-gray-400 text-xs md:text-sm">
              © {currentYear} Imona. Tous les droits réservés. 
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Plateforme de gestion immobilière créée avec ❤️ pour l'Afrique de l'Ouest
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
