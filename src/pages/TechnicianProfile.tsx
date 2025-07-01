
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { newTechnicianService, NewTechnician } from "@/services/newTechnicianService";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star, MapPin, Phone, Briefcase, Award } from "lucide-react";
import Footer from "@/components/Footer";

const TechnicianProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [technician, setTechnician] = useState<NewTechnician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTechnician = async () => {
      const technicianData = await newTechnicianService.getTechnicianById(id);
      setTechnician(technicianData);
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

  if (!technician) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Technicien non trouvé</h1>
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la recherche
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête du profil */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={technician.profile_picture} alt={technician.name} />
                    <AvatarFallback className="text-2xl">
                      {technician.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{technician.name}</h1>
                      {technician.is_validated && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Award className="w-3 h-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span className="font-medium">{technician.profession}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{technician.city}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{technician.rating.toFixed(1)}</span>
                        <span className="ml-1 text-gray-500">({technician.total_missions} missions)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {technician.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{technician.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  <span>{technician.phone}</span>
                </div>
                
                <Button className="w-full" asChild>
                  <Link to="/client-request" state={{ preferredTechnician: technician }}>
                    Demander un service
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Missions réalisées</span>
                  <span className="font-semibold">{technician.total_missions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Note moyenne</span>
                  <span className="font-semibold">{technician.rating.toFixed(1)}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut</span>
                  <Badge variant={technician.status === 'validated' ? 'default' : 'secondary'}>
                    {technician.status === 'validated' ? 'Actif' : 'En attente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TechnicianProfile;
