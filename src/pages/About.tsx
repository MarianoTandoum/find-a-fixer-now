
import { Navbar } from "@/components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
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
            <h2 className="text-2xl font-semibold mb-4">Sécurité et Confidentialité</h2>
            <p className="text-muted-foreground">
              Vos données personnelles sont importantes pour nous. Nous nous engageons à les protéger 
              et à ne les utiliser que dans le cadre de la mise en relation entre techniciens et clients. 
              Aucune information ne sera partagée avec des tiers sans votre consentement.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
