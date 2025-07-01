
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clientRequestService } from "@/services/clientRequestService";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, User, Phone, Wrench, MessageSquare } from "lucide-react";
import Footer from "@/components/Footer";

const SERVICES = [
  "Plomberie",
  "Électricité", 
  "Climatisation",
  "Peinture",
  "Menuiserie",
  "Mécanique",
  "Jardinage",
  "Nettoyage",
  "Autre"
];

const CITIES = [
  "Abidjan",
  "Bouaké", 
  "Daloa",
  "Yamoussoukro",
  "San-Pédro",
  "Korhogo",
  "Man",
  "Divo",
  "Gagnoa",
  "Abengourou"
];

const ClientRequest = () => {
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service_type: "",
    city: "",
    description: "",
    urgent: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Pré-remplir si un technicien préféré est passé
  const preferredTechnician = location.state?.preferredTechnician;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_phone || !formData.service_type || !formData.city) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const request = await clientRequestService.createRequest(formData);
      
      if (request) {
        toast({
          title: "Demande envoyée !",
          description: "Votre demande est prise en compte, merci de patienter, nous revenons vers vous sous peu.",
        });
        
        // Rediriger vers une page de confirmation
        navigate("/request-confirmation", { 
          state: { 
            requestId: request.id,
            clientName: formData.client_name
          }
        });
      } else {
        throw new Error("Erreur lors de la création de la demande");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Demander un service
            </h1>
            <p className="text-gray-600">
              Décrivez votre besoin et nous vous mettrons en relation avec un technicien qualifié
            </p>
            {preferredTechnician && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Service demandé pour: <span className="font-semibold">{preferredTechnician.name}</span> - {preferredTechnician.profession}
                </p>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Informations de la demande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    Vos informations
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nom complet *
                      </label>
                      <Input
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        placeholder="Votre nom et prénom"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Numéro de téléphone *
                      </label>
                      <Input
                        type="tel"
                        value={formData.client_phone}
                        onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                        placeholder="Ex: +225 XX XX XX XX XX"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Service demandé */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-gray-700">
                    <Wrench className="w-4 h-4 mr-2" />
                    Service demandé
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Type de service *
                      </label>
                      <Select 
                        value={formData.service_type} 
                        onValueChange={(value) => setFormData({...formData, service_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un service" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICES.map(service => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ville *
                      </label>
                      <Select 
                        value={formData.city} 
                        onValueChange={(value) => setFormData({...formData, city: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner votre ville" />
                        </SelectTrigger>
                        <SelectContent>
                          {CITIES.map(city => (
                            <SelectItem key={city} value={city}>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {city}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Description du problème
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Décrivez votre problème ou besoin en détail..."
                    rows={4}
                  />
                </div>

                {/* Urgence */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="urgent"
                    checked={formData.urgent}
                    onCheckedChange={(checked) => setFormData({...formData, urgent: !!checked})}
                  />
                  <label htmlFor="urgent" className="text-sm font-medium">
                    Demande urgente (intervention dans les plus brefs délais)
                  </label>
                </div>

                {/* Bouton de soumission */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Envoi en cours..." : "Envoyer ma demande"}
                  </Button>
                </div>

                {/* Informations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Vous envoyez votre demande</li>
                    <li>2. Notre équipe sélectionne le technicien le plus adapté</li>
                    <li>3. Nous vous recontactons rapidement avec les détails</li>
                    <li>4. Le technicien intervient chez vous</li>
                  </ol>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ClientRequest;
