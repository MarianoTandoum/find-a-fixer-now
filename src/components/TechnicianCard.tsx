
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Technician } from "@/services/technicianService";
import TechnicianBadge from "./TechnicianBadge";
import { supabase } from "@/integrations/supabase/client";

interface TechnicianCardProps {
  technician: Technician;
  showDetails?: boolean;
}

const TechnicianCard = ({ technician, showDetails = false }: TechnicianCardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getPhoneDisplay = () => {
    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{technician.phone}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <Link to="/auth" className="text-technicien-600 hover:underline">
            Connectez-vous pour voir le numéro
          </Link>
        </div>
      );
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {technician.name}
              <TechnicianBadge isValidated={technician.is_validated} />
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4">
        <div className="text-sm font-medium text-technicien-600 bg-technicien-50 inline-block px-2 py-1 rounded">
          {technician.profession}
        </div>
        
        <div className="space-y-2">
          {getPhoneDisplay()}
          
          {technician.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{technician.location}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {!showDetails && (
          <Button asChild variant="outline" className="w-full">
            <Link to={`/technician/${technician.id}`}>
              <User className="mr-2 h-4 w-4" />
              Voir le profil
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TechnicianCard;
