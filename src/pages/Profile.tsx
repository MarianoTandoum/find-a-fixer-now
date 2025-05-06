
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser, getUserProfile, updateUserProfile, UserProfile } from "@/services/userProfileService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Home, MapPin, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Charger le profil de l'utilisateur
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      const user = await getCurrentUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
      } else {
        setError("Impossible de charger votre profil. Veuillez réessayer plus tard.");
      }
      setLoading(false);
    };

    loadUserProfile();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setSaving(true);
    setError(null);

    try {
      const updatedProfile = await updateUserProfile(userProfile.id, userProfile);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été enregistrées avec succès.",
        });
      } else {
        throw new Error("Erreur lors de la mise à jour du profil");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la mise à jour de votre profil. Veuillez réessayer.");
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion. Veuillez réessayer.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {userProfile && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-technicien-600" />
                        Prénom
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={userProfile.first_name || ""}
                        onChange={handleInputChange}
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-technicien-600" />
                        Nom
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={userProfile.last_name || ""}
                        onChange={handleInputChange}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-technicien-600" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={userProfile.phone || ""}
                      onChange={handleInputChange}
                      placeholder="Votre numéro de téléphone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-technicien-600" />
                      Adresse
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={userProfile.address || ""}
                      onChange={handleInputChange}
                      placeholder="Votre adresse complète"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-technicien-600" />
                      Ville
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={userProfile.city || ""}
                      onChange={handleInputChange}
                      placeholder="Votre ville"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-technicien-600 hover:bg-technicien-700"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLogout}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      Se déconnecter
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
