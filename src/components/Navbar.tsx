
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    if (isOpen && isMobile) {
      setIsOpen(false);
    }
  };

  const navItems = [
    { label: "Accueil", href: "/" },
    { label: "Rechercher", href: "/search" },
    { label: "Inscription Technicien", href: "/register" },
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-bold text-xl text-technicien-600">
            FixHub
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeMenu}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                  location.pathname === item.href
                    ? "text-technicien-600"
                    : "text-gray-700"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Button asChild variant="outline" className="ml-2">
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Mon Profil
                </Link>
              </Button>
            ) : (
              <Button asChild variant="default" className="ml-2 bg-technicien-600 hover:bg-technicien-700">
                <Link to="/auth">
                  <User className="mr-2 h-4 w-4" />
                  Connexion
                </Link>
              </Button>
            )}
          </nav>

          {/* Menu button mobile */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={toggleMenu}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                    location.pathname === item.href
                      ? "text-technicien-600"
                      : "text-gray-700"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-technicien-600"
                >
                  <User className="inline-block mr-2 h-4 w-4" />
                  Mon Profil
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={closeMenu}
                  className="px-3 py-2 text-sm font-medium rounded-md bg-technicien-600 text-white"
                >
                  <User className="inline-block mr-2 h-4 w-4" />
                  Connexion
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
