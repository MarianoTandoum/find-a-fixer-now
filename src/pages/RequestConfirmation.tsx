
import { useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Phone, Home } from "lucide-react";
import Footer from "@/components/Footer";

const RequestConfirmation = () => {
  const location = useLocation();
  const { requestId, clientName } = location.state || {};

  if (!requestId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Informations de demande non trouvées.</p>
          <Button asChild className="mt-4">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Demande envoyée avec succès !
            </h1>
            <p className="text-xl text-gray-600">
              Merci {clientName}, votre demande est prise en compte.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Votre demande #{requestId.slice(-8)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-left">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Prochaines étapes :</h3>
                  <ol className="text-sm text-green-800 space-y-2">
                    <li className="flex items-start">
                      <span className="bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center mr-2 mt-0.5">1</span>
                      Notre équipe examine votre demande
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center mr-2 mt-0.5">2</span>
                      Nous sélectionnons le technicien le plus adapté
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center mr-2 mt-0.5">3</span>
                      Nous vous recontactons sous peu avec les détails
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Besoin urgent ?
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Si votre situation est urgente, vous pouvez nous appeler directement :
                  </p>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler l'agence : +225 XX XX XX XX
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-x-4">
            <Button asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/client-request">
                Nouvelle demande
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RequestConfirmation;
