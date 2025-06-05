
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Technician } from "@/services/technicianService";
import TechnicianBadge from "./TechnicianBadge";

interface TechnicianCardProps {
  technician: Technician;
  showDetails?: boolean;
}

const TechnicianCard = ({ technician, showDetails = false }: TechnicianCardProps) => {
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
          {technician.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{technician.location}</span>
            </div>
          )}
          
          {technician.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {technician.bio}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/technician/${technician.id}`}>
            <User className="mr-2 h-4 w-4" />
            Voir le profil
          </Link>
        </Button>
        
        {!showDetails && (
          <Button asChild className="flex-1 bg-technicien-600 hover:bg-technicien-700">
            <Link to={`/contact/${technician.id}`}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contacter
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TechnicianCard;
