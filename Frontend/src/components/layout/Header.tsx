import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Accueil", href: "/" },
    { label: "Fonctionnalités", href: "/features" },
    { label: "Tarifs", href: "/pricing" },
    { label: "Aide", href: "/help" },
  ];

  return (
    <header
      className={`${isScrolled ? "fixed" : "sticky"} top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "left-1/2 -translate-x-1/2 w-[95%] max-w-[1132px] rounded-md bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-gray-100 mx-auto my-4"
          : "w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200/40 rounded-none shadow-md"
      }`}
    >
      <nav
        className={`mx-auto flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "h-16 px-8" : "h-20 max-w-7xl px-6 lg:px-8"
        }`}
      >
        {/* Logo - Left */}
        <Link to="/" className="flex-shrink-0 transition-all md:absolute md:left-5 lg:md:left-8">
          <img
            src="/Ressource_gestiloc/gestiloc-removebg-preview 1.png"
            alt="GestiLoc"
            className={`w-auto transition-all ${!isScrolled ? "h-12" : "h-10"}`}
          />
        </Link>

        {/* Desktop Navigation - Center */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center space-x-12">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-gray-700 transition-colors hover:text-[#529D21] ${!isScrolled ? "text-base" : "text-sm"}`}
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Auth Buttons - Right - Texte uniquement vert */}
        <div className={`hidden md:flex items-center space-x-8 ${isScrolled ? "absolute right-8" : "absolute right-20"}`}>
          <button
            onClick={() => navigate("/login")}
            className={`transition-all hover:opacity-70 font-semibold ${!isScrolled ? "text-base" : "text-sm"}`}
            style={{ fontFamily: "Manrope, sans-serif", color: "rgba(131, 199, 87, 1)", background: "none", border: "none" }}
          >
            Connexion
          </button>
          <button
            onClick={() => navigate("/register")}
            className={`transition-all hover:opacity-70 font-semibold ${!isScrolled ? "text-base" : "text-sm"}`}
            style={{ fontFamily: "Manrope, sans-serif", color: "rgba(131, 199, 87, 1)", background: "none", border: "none" }}
          >
            Inscription
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 ml-auto hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} color="#529D21" /> : <Menu size={24} color="#529D21" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pb-4 space-y-3 border-t border-gray-200 pt-4 bg-white/95 backdrop-blur-sm fixed top-16 lg:top-20 left-0 right-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block px-4 py-3 text-gray-700 rounded-lg transition-colors text-base"
                style={{ fontFamily: "Manrope, sans-serif" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#529D2115";
                  e.currentTarget.style.color = "#529D21";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#374151";
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-lg transition-colors text-base text-left"
                style={{ fontFamily: "Manrope, sans-serif", color: "#529D21" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#529D2115"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  navigate("/register");
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-white rounded-lg transition-colors text-base"
                style={{ fontFamily: "Manrope, sans-serif", backgroundColor: "#529D21" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4A8C1A"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#529D21"}
              >
                Inscription
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
