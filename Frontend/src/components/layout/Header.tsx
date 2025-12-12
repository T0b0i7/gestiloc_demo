import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, User, Home } from "lucide-react";
import { authService } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "Fonctionnalités", href: "/tour" },
  { name: "Tarifs", href: "/pricing" },
  { name: "Aide", href: "/help" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string; roles?: string[] } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger les informations de l'utilisateur depuis le localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Détecteur de scroll pour l'effet morphing
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthenticated = !!user?.id;

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <header 
      className={`${isScrolled ? 'fixed' : 'sticky'} top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'left-1/2 right-auto w-[90%] max-w-[1000px] -translate-x-1/2 rounded-full bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border border-border/40 mx-auto my-3 shadow-lg' 
          : 'w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40 rounded-none'
      }`}
    >
      <nav 
        className={`flex h-16 items-center justify-between transition-all duration-300 ${
          isScrolled 
            ? 'px-6' 
            : 'container'
        }`}
        aria-label="Navigation principale"
      >
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-lg font-bold text-primary-foreground">GL</span>
            </div>
          </div>
          <span className="text-xl font-bold text-foreground leading-none">
            GestiLoc
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="px-4 py-2 text-base font-semibold text-black hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="w-full cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  Connexion
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">
                  Inscription
                </Link>
              </Button>
            </div>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu de navigation"
                className="min-h-[44px] min-w-[44px] touch-manipulation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu principal</SheetTitle>
                <SheetDescription>
                  Navigation vers les pages Accueil, Fonctionnalités, Tarifs et Aide.
                </SheetDescription>
              </SheetHeader>
              <div className="flex items-center gap-2 mb-8">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">GL</span>
                </div>
                <span className="text-lg font-bold leading-none">GestiLoc</span>
              </div>
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-3 text-base font-medium hover:bg-accent rounded-lg transition-colors touch-manipulation min-h-[44px] flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full justify-start gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="default"
                        className="w-full justify-start gap-2"
                      >
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                          Connexion
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="default"
                        className="w-full gap-2"
                      >
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                          Inscription
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
