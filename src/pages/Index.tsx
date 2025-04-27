import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TechnicianCard from "@/components/TechnicianCard";
import { technicianService } from "@/services/technicianService";
import { useState, useEffect } from "react";
import { Technician } from "@/services/technicianService";
import Footer from "@/components/Footer";

const Index = () => {
  const [featuredTechnicians, setFeaturedTechnicians] = useState<Technician[]>([]);

  useEffect(() => {
    // Récupérer quelques techniciens à mettre en avant sur la page d'accueil
    const allTechnicians = technicianService.getAllTechnicians();
    // Prendre un échantillon aléatoire de 3 techniciens
    const randomTechnicians = [...allTechnicians]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    setFeaturedTechnicians(randomTechnicians);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-technicien-700 to-technicien-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Trouvez le technicien qu'il vous faut</h1>
            <p className="text-xl mb-8">
              Un réseau de professionnels qualifiés pour tous vos besoins techniques et travaux.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-technicien-700 hover:bg-gray-100">
                <Link to="/search">Trouver un technicien</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                <Link to="/register">S'inscrire comme technicien</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos techniciens à votre service</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTechnicians.map(technician => (
              <TechnicianCard key={technician.id} technician={technician} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-technicien-600 hover:bg-technicien-700">
              <Link to="/search">Voir tous les techniciens</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-technicien-100 text-technicien-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Recherchez</h3>
              <p className="text-muted-foreground">Trouvez le type de technicien dont vous avez besoin en utilisant notre moteur de recherche.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-technicien-100 text-technicien-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Contactez</h3>
              <p className="text-muted-foreground">Contactez directement le technicien par téléphone pour discuter de vos besoins.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-technicien-100 text-technicien-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Profitez</h3>
              <p className="text-muted-foreground">Bénéficiez des services d'un professionnel qualifié pour résoudre votre problème.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-technicien-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Vous êtes un technicien ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez notre réseau de professionnels et développez votre clientèle dès aujourd'hui.
          </p>
          <Button asChild size="lg" className="bg-white text-technicien-700 hover:bg-gray-100">
            <Link to="/register">S'inscrire maintenant</Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
