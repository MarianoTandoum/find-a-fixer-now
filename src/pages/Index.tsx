
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Shield, MessageCircle, Phone, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section */}
      <div className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Trouvez le <span className="text-blue-600">technicien</span> parfait
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              FixHub vous met en relation avec des techniciens qualifiés de votre région. 
              Communication sécurisée, appels intégrés, zéro donnée personnelle partagée.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/search">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Chercher un technicien
                </Button>
              </Link>
              
              {user ? (
                <Link to="/conversations">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-blue-600 text-blue-600 hover:bg-blue-50">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Mes conversations
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-blue-600 text-blue-600 hover:bg-blue-50">
                    Inscription gratuite
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir FixHub ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une plateforme conçue pour protéger votre vie privée tout en facilitant vos échanges avec les professionnels.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow border-none bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">100% Confidentiel</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Vos données personnelles ne sont jamais partagées. Communication anonyme et sécurisée.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-none bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Messagerie Intégrée</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interface comme Messenger : messages en temps réel, statut en ligne, notifications par email.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-none bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Appels Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Appels directs dans le navigateur sans révéler votre numéro. WebRTC sécurisé.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-none bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Disponible 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Contactez vos techniciens à tout moment. Système de notifications pour ne rien manquer.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Rejoignez dès maintenant la plateforme qui révolutionne la mise en relation avec les techniciens.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user && (
                <Link to="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                    Créer un compte gratuit
                  </Button>
                </Link>
              )}
              <Link to="/search">
                <Button variant="outline" size="lg" className="px-8 py-3 border-blue-600 text-blue-600 hover:bg-blue-50">
                  Explorer les techniciens
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
