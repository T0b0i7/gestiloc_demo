import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogIn, UserPlus, LogOut, User, Home } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "Fonctionnalités", href: "/tour" },
  { name: "Tarifs", href: "/pricing" },
  { name: "Aide", href: "/help" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string; roles?: string[] } | null>(null);
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

  const isAuthenticated = !!user?.id;

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40">
      <nav className="container flex h-16 items-center justify-between" aria-label="Navigation principale">
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
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Créer un compte
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
                          <LogIn className="h-4 w-4" />
                          Connexion
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="default"
                        className="w-full gap-2"
                      >
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                          <UserPlus className="h-4 w-4" />
                          Créer un compte
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
