
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { technicianService } from "@/services/technicianService";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, Briefcase } from "lucide-react";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    phone: "",
    location: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.name || !formData.profession || !formData.phone) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Enregistrer le nouveau technicien
      const newTechnician = await technicianService.addTechnician({
        name: formData.name,
        profession: formData.profession,
        phone: formData.phone,
        location: formData.location,
      });
      
      toast({
        title: "Inscription réussie !",
        description: "Votre profil a été créé avec succès.",
      });
      
      // Rediriger vers la page du profil du technicien
      if (newTechnician) {
        navigate(`/technician/${newTechnician.id}`);
      } else {
        throw new Error("Erreur lors de la création du technicien");
      }
      
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast({
        title: "Erreur lors de l'inscription",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Inscription comme technicien</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Rejoignez notre réseau de professionnels et développez votre clientèle.
          </p>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-technicien-600" />
                  Nom complet ou nom de l'entreprise *
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Jean Dupont"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profession" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-technicien-600" />
                  Profession / Spécialité *
                </Label>
                <Input
                  id="profession"
                  name="profession"
                  placeholder="Ex: Plombier, Électricien..."
                  value={formData.profession}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-technicien-600" />
                  Numéro de téléphone *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Ex: 695123456"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-technicien-600" />
                  Localisation (Ville, Quartier)
                </Label>
                <Textarea
                  id="location"
                  name="location"
                  placeholder="Ex: Douala, Bonamoussadi"
                  value={formData.location}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-technicien-600 hover:bg-technicien-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Inscription en cours..." : "S'inscrire maintenant"}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                En vous inscrivant, vous acceptez que vos coordonnées soient visibles par les visiteurs du site.
              </p>
            </form>
          </div>
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

export default Register;
