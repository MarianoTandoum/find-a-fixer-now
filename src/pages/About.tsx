
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">À propos</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
            <p className="text-muted-foreground">
              Notre plateforme a pour objectif de simplifier la mise en relation entre les clients 
              et les techniciens qualifiés. Nous croyons qu'il devrait être simple et rapide de 
              trouver un professionnel de confiance près de chez soi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Comment ça marche</h2>
            <p className="text-muted-foreground">
              Notre plateforme permet aux techniciens de créer gratuitement leur profil 
              et aux clients de les trouver facilement. Nous vérifions chaque profil pour 
              assurer la qualité de notre service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Sécurité et Confidentialité</h2>
            <p className="text-muted-foreground">
              Vos données personnelles sont importantes pour nous. Nous nous engageons à les protéger 
              et à ne les utiliser que dans le cadre de la mise en relation entre techniciens et clients. 
              Aucune information ne sera partagée avec des tiers sans votre consentement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Notre Engagement</h2>
            <p className="text-muted-foreground">
              Nous nous efforçons de maintenir un niveau de qualité élevé en vérifiant 
              régulièrement les profils des techniciens et en prenant en compte les retours 
              de nos utilisateurs. Notre objectif est de créer une communauté de confiance.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
