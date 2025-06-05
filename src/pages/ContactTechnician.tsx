
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { technicianService, Technician } from "@/services/technicianService";
import { conversationService } from "@/services/conversationService";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import Footer from "@/components/Footer";

const ContactTechnician = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour contacter un technicien.",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const fetchTechnician = async () => {
      const technicianData = await technicianService.getTechnicianById(id);
      setTechnician(technicianData);
      setLoading(false);
    };

    fetchTechnician();
  }, [id, isAuthenticated]);

  const handleSendMessage = async () => {
    if (!technician || !message.trim()) return;

    setSending(true);
    try {
      // Créer ou obtenir la conversation
      const conversation = await conversationService.getOrCreateConversation(technician.id);
      
      if (!conversation) {
        throw new Error("Impossible de créer la conversation");
      }

      // Envoyer le message
      await conversationService.sendMessage(conversation.id, message);

      toast({
        title: "Message envoyé !",
        description: "Votre message a été envoyé au technicien. Il pourra vous répondre via la messagerie.",
      });

      // Rediriger vers la page des conversations
      navigate("/conversations");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

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
              <a href="/search">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la recherche
              </a>
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
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Contacter {technician.name}</CardTitle>
              <p className="text-muted-foreground">
                Envoyez un message sécurisé à ce technicien spécialisé en {technician.profession.toLowerCase()}.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Message sécurisé</h4>
                <p className="text-sm text-blue-800">
                  Votre message sera envoyé via notre système de messagerie sécurisée. 
                  Le technicien pourra vous répondre et vous pourrez échanger en toute confidentialité.
                </p>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Votre message
                </label>
                <Textarea
                  id="message"
                  placeholder="Décrivez votre besoin, le problème à résoudre, ou toute question que vous avez..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full"
                />
              </div>

              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="w-full bg-technicien-600 hover:bg-technicien-700"
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Envoi en cours..." : "Envoyer le message"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Après l'envoi, vous pourrez suivre la conversation dans votre espace personnel.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactTechnician;
