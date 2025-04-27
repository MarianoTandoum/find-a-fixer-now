
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { technicianService, Technician } from "@/services/technicianService";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, MapPin, ArrowLeft } from "lucide-react";

const TechnicianProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) {
      setError("Identifiant du technicien manquant");
      setLoading(false);
      return;
    }
    
    // Récupérer les informations du technicien
    const fetchTechnician = async () => {
      const technicianData = await technicianService.getTechnicianById(id);
      
      if (technicianData) {
        setTechnician(technicianData);
      } else {
        setError("Technicien non trouvé");
      }
      
      setLoading(false);
    };
    
    fetchTechnician();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (error || !technician) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Technicien non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              {error || "Ce technicien n'existe pas ou a été supprimé."}
            </p>
            <Button asChild>
              <Link to="/search">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la recherche
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la recherche
            </Link>
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold">{technician.name}</CardTitle>
                  <CardDescription className="text-lg mt-1">
                    <Badge className="bg-technicien-100 text-technicien-800 border-technicien-300 text-base py-1">
                      {technician.profession}
                    </Badge>
                  </CardDescription>
                </div>
                
                <Button className="bg-green-600 hover:bg-green-700" size="lg" asChild>
                  <a href={`tel:${technician.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Appeler maintenant
                  </a>
                </Button>
              </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Coordonnées</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-technicien-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-lg">{technician.phone}</p>
                      </div>
                    </div>
                    
                    {technician.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-technicien-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Localisation</p>
                          <p className="text-lg">{technician.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">À propos</h3>
                  <p className="text-muted-foreground">
                    {technician.name} est un professionnel spécialisé en {technician.profession.toLowerCase()}.
                    Contactez-le directement par téléphone pour discuter de vos besoins spécifiques
                    et obtenir un devis personnalisé.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Ce profil a été publié sur Find-A-Fixer, le réseau des professionnels de confiance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Find-A-Fixer. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TechnicianProfile;
