
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Find-A-Fixer</h3>
            <p className="text-gray-300 text-sm">
              La plateforme qui connecte les clients avec des techniciens qualifiés près de chez eux.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/search" className="hover:text-white transition-colors">Rechercher un technicien</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Devenir technicien</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">À propos</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>Email: contact@find-a-fixer.com</li>
              <li>Téléphone: +237 6XX XXX XXX</li>
              <li>Yaoundé, Cameroun</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Find-A-Fixer. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
