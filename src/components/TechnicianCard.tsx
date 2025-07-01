
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { Technician } from "@/services/technicianService";

interface TechnicianCardProps {
  technician: Technician;
}

const TechnicianCard = ({ technician }: TechnicianCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold">
              {technician.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900">
              {technician.name}
            </CardTitle>
            
            <Badge variant="secondary" className="mt-1">
              {technician.profession}
            </Badge>
            
            <div className="flex items-center mt-2 text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{technician.city}</span>
            </div>
            
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{technician.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 ml-1">
                ({technician.total_missions} missions)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {technician.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {technician.bio}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicianCard;
