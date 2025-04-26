
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Technician } from "@/services/technicianService";

interface TechnicianCardProps {
  technician: Technician;
  showDetails?: boolean;
}

const TechnicianCard = ({ technician, showDetails = false }: TechnicianCardProps) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{technician.name}</CardTitle>
          <Badge variant="outline" className="bg-technicien-100 text-technicien-800 border-technicien-300">
            {technician.profession}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{technician.phone}</span>
        </div>
        
        {technician.location && (
          <p className="text-sm text-muted-foreground mt-2">
            {technician.location}
          </p>
        )}
      </CardContent>
      <CardFooter>
        {!showDetails && (
          <Button asChild variant="outline" className="w-full border-technicien-500 text-technicien-700 hover:bg-technicien-50">
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
