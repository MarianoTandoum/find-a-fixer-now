
import { useState, useEffect } from "react";
import { newTechnicianService, NewTechnician } from "@/services/newTechnicianService";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, MapPin, Star, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Search = () => {
  const [technicians, setTechnicians] = useState<NewTechnician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<NewTechnician[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [professions, setProfessions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [technicianData, professionData] = await Promise.all([
        newTechnicianService.getAllTechnicians(),
        newTechnicianService.getProfessions()
      ]);
      
      // Filtrer seulement les techniciens validés
      const validatedTechnicians = technicianData.filter(t => t.is_validated);
      setTechnicians(validatedTechnicians);
      setFilteredTechnicians(validatedTechnicians);
      setProfessions(professionData);
      
      // Extraire les villes uniques
      const uniqueCities = [...new Set(validatedTechnicians.map(t => t.city))].sort();
      setCities(uniqueCities);
      
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = technicians;

    if (searchQuery) {
      filtered = filtered.filter(tech =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedProfession) {
      filtered = filtered.filter(tech => tech.profession === selectedProfession);
    }

    if (selectedCity) {
      filtered = filtered.filter(tech => tech.city === selectedCity);
    }

    // Trier par note décroissante
    filtered.sort((a, b) => b.rating - a.rating);

    setFilteredTechnicians(filtered);
  }, [searchQuery, selectedProfession, selectedCity, technicians]);

  const TechnicianCard = ({ technician }: { technician: NewTechnician }) => (
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
        
        <div className="flex space-x-2">
          <Link to={`/technician/${technician.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Voir le profil
            </Button>
          </Link>
          
          <Link to={`/contact/${technician.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Phone className="w-4 h-4 mr-1" />
              Contacter
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trouvez le technicien qu'il vous faut
          </h1>
          <p className="text-xl text-gray-600">
            Des professionnels qualifiés et vérifiés près de chez vous
          </p>
        </div>

        {/* Filtres de recherche */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un technicien ou service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedProfession} onValueChange={setSelectedProfession}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un métier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les métiers</SelectItem>
                {professions.map(profession => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les villes</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {city}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedProfession("");
                setSelectedCity("");
              }}
              variant="outline"
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des techniciens...</p>
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Aucun technicien trouvé pour votre recherche.
            </p>
            <p className="text-gray-500 mt-2">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {filteredTechnicians.length} technicien{filteredTechnicians.length > 1 ? 's' : ''} trouvé{filteredTechnicians.length > 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechnicians.map((technician) => (
                <TechnicianCard key={technician.id} technician={technician} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;
