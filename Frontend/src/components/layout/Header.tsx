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
    { label: "Fonctionnalités", href: "/#features" },
    { label: "Tarifs", href: "/pricing" },
    { label: "Aide", href: "/help" },
  ];

  return (
    <header
      className={`${isScrolled ? "fixed" : "sticky"} top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "left-1/2 right-auto w-[90%] max-w-[1000px] -translate-x-1/2 rounded-full bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 border border-gray-200/40 mx-auto my-3 shadow-lg"
          : "w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200/40 rounded-none shadow-md"
      }`}
    >
      <nav
        className={`max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "h-16" : "h-20"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src="/Ressource_gestiloc/gestiloc-removebg-preview 1.png"
            alt="GestiLoc"
            className={`w-auto transition-all ${!isScrolled ? "h-12" : "h-10"}`}
          />
        </Link>

        {/* Desktop Menu and Buttons */}
        <div className="hidden md:flex items-center gap-12">
          {/* Desktop Menu */}
          <div className="flex items-center space-x-12">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-gray-700 transition-colors ${!isScrolled ? "text-base" : "text-sm"}`}
                style={{ fontFamily: "Manrope, sans-serif" }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#83C757";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#374151";
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className={`transition-colors ${!isScrolled ? "text-base" : "text-sm"}`}
              style={{ fontFamily: "Manrope, sans-serif", color: "#83C757" }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.8";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
            >
              Connexion
            </button>
            <button
              onClick={() => navigate("/register")}
              className={`text-white px-6 py-2 rounded-lg transition-all ${!isScrolled ? "text-base" : "text-sm px-4 py-1.5"}`}
              style={{ fontFamily: "Manrope, sans-serif", backgroundColor: "#83C757" }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#75b045";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#83C757";
              }}
            >
              Inscription
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pb-4 space-y-3 border-t border-gray-200 pt-4 bg-white/95">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="block px-4 py-2 text-gray-700 rounded-lg transition-colors text-base"
              style={{ fontFamily: "Manrope, sans-serif" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#83C75715";
                e.currentTarget.style.color = "#83C757";
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
              className="w-full px-4 py-2 rounded-lg transition-colors text-base text-left"
              style={{ fontFamily: "Manrope, sans-serif", color: "#83C757" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#83C75715"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Connexion
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-white rounded-lg transition-colors text-base"
              style={{ fontFamily: "Manrope, sans-serif", backgroundColor: "#83C757" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#75b045"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#83C757"}
            >
              Inscription
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
