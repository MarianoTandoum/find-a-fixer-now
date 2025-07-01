
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, updateUserProfile, UserProfile } from "@/services/userProfileService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, MapPin, Mail } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setCurrentUser(session.user);
      const userProfile = await getUserProfile(session.user.id);
      
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          first_name: userProfile.first_name || "",
          last_name: userProfile.last_name || "",
          phone: userProfile.phone || "",
        });
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!currentUser || !profile) return;

    setUpdating(true);
    try {
      const updatedProfile = await updateUserProfile(currentUser.id, formData);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été sauvegardées avec succès.",
        });
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations de base */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      placeholder="Votre prénom"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Votre numéro de téléphone"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={currentUser?.email || ""}
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleSave}
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updating ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Photo de profil */}
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {profile?.first_name?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-500 mb-4">
                  Photo de profil non disponible pour le moment
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
