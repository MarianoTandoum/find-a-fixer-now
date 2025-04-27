
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TechnicianBadgeProps {
  isValidated?: boolean;
  className?: string;
}

const TechnicianBadge = ({ isValidated, className }: TechnicianBadgeProps) => {
  if (isValidated === undefined) return null;
  
  return (
    <Badge 
      variant={isValidated ? "default" : "secondary"}
      className={cn(
        isValidated ? "bg-green-500" : "bg-yellow-500",
        "text-white",
        className
      )}
    >
      {isValidated ? "Vérifié" : "En attente"}
    </Badge>
  );
};

export default TechnicianBadge;
