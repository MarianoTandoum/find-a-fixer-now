
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { technicianService } from "@/services/technicianService";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, Briefcase } from "lucide-react";
import Footer from "@/components/Footer";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schéma de validation
const registerSchema = z.object({
  name: z.string().min(2, "Veuillez saisir un nom valide"),
  profession: z.string().min(2, "Veuillez saisir une profession valide"),
  phone: z.string()
    .min(9, "Le numéro doit contenir au moins 9 chiffres")
    .max(13, "Le numéro ne doit pas dépasser 13 caractères")
    .regex(/^(?:\+?237|237)?[6-9][0-9]{8}$/, "Format invalide. Exemple: 6XXXXXXXX ou +2376XXXXXXXX"),
  location: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      profession: "",
      phone: "",
      location: "",
    },
  });

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentification requise",
          description: "Veuillez vous connecter pour vous inscrire comme technicien.",
          variant: "destructive"
        });
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);
  
  const formatPhoneNumber = (phone: string): string => {
    // Supprimer tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');
    
    // Si le numéro ne commence pas par 237, l'ajouter
    if (cleaned.length === 9 && !cleaned.startsWith('237')) {
      cleaned = '237' + cleaned;
    } else if (cleaned.length > 9 && cleaned.length < 12) {
      // Si le numéro a plus de 9 chiffres mais moins de 12, normaliser à 12
      cleaned = '237' + cleaned.slice(-9);
    }
    
    return cleaned;
  };
  
  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentification requise",
          description: "Veuillez vous connecter pour vous inscrire comme technicien.",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }
      
      // Formater le numéro de téléphone
      const formattedPhone = formatPhoneNumber(values.phone);
      
      // Enregistrer le nouveau technicien avec l'ID de l'utilisateur
      const newTechnician = await technicianService.addTechnician({
        name: values.name,
        profession: values.profession,
        phone: formattedPhone,
        location: values.location || "",
        user_id: session.user.id
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
      console.error("Error adding technician:", error);
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-technicien-600" />
                        Nom complet ou nom de l'entreprise *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Jean Dupont"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-technicien-600" />
                        Profession / Spécialité *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Plombier, Électricien..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-technicien-600" />
                        Numéro de téléphone *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 695123456"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Format: 6XXXXXXXX ou +2376XXXXXXXX
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-technicien-600" />
                        Localisation (Ville, Quartier)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Douala, Bonamoussadi"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
            </Form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
