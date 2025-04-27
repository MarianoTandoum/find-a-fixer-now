
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TechnicianCard from "@/components/TechnicianCard";
import { technicianService, Technician } from "@/services/technicianService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Footer from "@/components/Footer";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const allTechnicians = await technicianService.getAllTechnicians();
      const availableProfessions = await technicianService.getProfessions();
      
      setTechnicians(allTechnicians);
      setFilteredTechnicians(allTechnicians);
      setProfessions(availableProfessions);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const filterTechnicians = async () => {
      let results = technicians;
      
      if (searchTerm.trim()) {
        results = await technicianService.searchTechnicians(searchTerm);
      }
      
      if (professionFilter && professionFilter !== "all") {
        results = results.filter(tech => 
          tech.profession.toLowerCase() === professionFilter.toLowerCase()
        );
      }
      
      setFilteredTechnicians(results);
    };

    filterTechnicians();
  }, [searchTerm, professionFilter, technicians]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleReset = () => {
    setSearchTerm("");
    setProfessionFilter("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">Rechercher un technicien</h1>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium mb-2">
                  Recherche par nom ou métier
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Ex: Plombier, Électricien..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="profession" className="block text-sm font-medium mb-2">
                  Filtrer par profession
                </label>
                <Select value={professionFilter} onValueChange={setProfessionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les professions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les professions</SelectItem>
                    {professions.map(profession => (
                      <SelectItem key={profession} value={profession}>
                        {profession}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={handleReset}>
                Réinitialiser
              </Button>
              <Button type="submit">
                <SearchIcon className="mr-2 h-4 w-4" /> Rechercher
              </Button>
            </div>
          </div>
        </form>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {filteredTechnicians.length} technicien(s) trouvé(s)
          </h2>
          
          {filteredTechnicians.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechnicians.map(technician => (
                <TechnicianCard key={technician.id} technician={technician} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">
                Aucun technicien ne correspond à votre recherche.
              </p>
              <Button 
                variant="link" 
                onClick={handleReset} 
                className="mt-2 text-technicien-600"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;
