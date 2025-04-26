
import { Link } from 'react-router-dom';
import { Search, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const isMobile = useIsMobile();

  return (
    <nav className="bg-primary text-primary-foreground py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-white">Find-A-Fixer</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild size={isMobile ? "icon" : "default"} className="text-white hover:bg-primary-foreground/10">
            <Link to="/">
              <Home className={isMobile ? "h-5 w-5" : "h-4 w-4 mr-2"} />
              {!isMobile && "Accueil"}
            </Link>
          </Button>
          
          <Button variant="ghost" asChild size={isMobile ? "icon" : "default"} className="text-white hover:bg-primary-foreground/10">
            <Link to="/search">
              <Search className={isMobile ? "h-5 w-5" : "h-4 w-4 mr-2"} />
              {!isMobile && "Rechercher"}
            </Link>
          </Button>
          
          <Button variant="secondary" asChild size={isMobile ? "icon" : "default"} className="bg-white text-primary hover:bg-primary-foreground">
            <Link to="/register">
              <User className={isMobile ? "h-5 w-5" : "h-4 w-4 mr-2"} />
              {!isMobile && "S'inscrire"}
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
