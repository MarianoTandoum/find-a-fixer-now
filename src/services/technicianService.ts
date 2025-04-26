
export interface Technician {
  id: string;
  name: string;
  profession: string;
  phone: string;
  location?: string;
  profilePicture?: string;
  isValidated?: boolean;
}

// Données initiales des techniciens fournies
const initialTechnicians: Technician[] = [
  { id: '1', name: 'Timothe', profession: 'Menuisier ébéniste', phone: '659276955' },
  { id: '2', name: 'Nelson', profession: 'Charpentier', phone: '672114806' },
  { id: '3', name: 'LCN - Construction', profession: 'Spécialiste en transformation du bois', phone: '670040553' },
  { id: '4', name: 'Samba', profession: 'Plombier', phone: '695635493' },
  { id: '5', name: 'Ervé', profession: 'Garagiste', phone: '674752634' },
  { id: '6', name: 'Jordan', profession: 'Électricien', phone: '658520763' },
  { id: '7', name: 'Flaubert', profession: 'Électricien', phone: '675513470' },
  { id: '8', name: 'Edwin', profession: 'Soudeur', phone: '673197129' },
  { id: '9', name: 'Dieudonne', profession: 'Mécanicien de vélos électriques', phone: '695957137' },
  { id: '10', name: 'Olivier', profession: 'Mécanicien', phone: '678717553' },
  { id: '11', name: 'Jean Pierre', profession: 'Charpentier', phone: '672728005' },
  { id: '12', name: 'Noël', profession: 'Plombier', phone: '698161500' },
  { id: '13', name: 'Léopard', profession: 'Chef de chantier', phone: '651876299' },
  { id: '14', name: 'Saneco', profession: 'Service sanitaire (vidange fosse septique)', phone: '695251888' },
  { id: '15', name: 'Sitafel Peinture', profession: 'Peintre', phone: '656713738' },
];

// Dans une vraie application, ces données seraient stockées dans une base de données
let technicians = [...initialTechnicians];

// Pour simuler la persistance locale, on utilise le localStorage
const loadTechnicians = (): Technician[] => {
  const storedTechnicians = localStorage.getItem('technicians');
  if (storedTechnicians) {
    return JSON.parse(storedTechnicians);
  }
  localStorage.setItem('technicians', JSON.stringify(technicians));
  return technicians;
};

const saveTechnicians = (techs: Technician[]) => {
  localStorage.setItem('technicians', JSON.stringify(techs));
  technicians = techs;
};

// Initialiser les techniciens au démarrage
const initializeTechnicians = () => {
  technicians = loadTechnicians();
};

// Récupérer tous les techniciens
const getAllTechnicians = (): Technician[] => {
  return technicians;
};

// Récupérer un technicien par ID
const getTechnicianById = (id: string): Technician | undefined => {
  return technicians.find(tech => tech.id === id);
};

// Rechercher des techniciens par nom ou profession
const searchTechnicians = (query: string): Technician[] => {
  const searchTerms = query.toLowerCase().trim();
  if (!searchTerms) return technicians;
  
  return technicians.filter(tech => 
    tech.name.toLowerCase().includes(searchTerms) || 
    tech.profession.toLowerCase().includes(searchTerms)
  );
};

// Ajouter un nouveau technicien
const addTechnician = (technician: Omit<Technician, 'id'>): Technician => {
  const newTechnician: Technician = {
    ...technician,
    id: Date.now().toString(),
    isValidated: false // Par défaut, les nouveaux techniciens ne sont pas validés
  };
  
  technicians = [...technicians, newTechnician];
  saveTechnicians(technicians);
  return newTechnician;
};

// Mettre à jour un technicien existant
const updateTechnician = (id: string, updates: Partial<Technician>): Technician | undefined => {
  const index = technicians.findIndex(tech => tech.id === id);
  if (index === -1) return undefined;
  
  const updatedTechnician = { ...technicians[index], ...updates };
  technicians[index] = updatedTechnician;
  saveTechnicians(technicians);
  return updatedTechnician;
};

// Supprimer un technicien
const deleteTechnician = (id: string): boolean => {
  const initialLength = technicians.length;
  technicians = technicians.filter(tech => tech.id !== id);
  
  if (technicians.length !== initialLength) {
    saveTechnicians(technicians);
    return true;
  }
  
  return false;
};

// Liste des professions disponibles (pour les filtres)
const getProfessions = (): string[] => {
  const professions = new Set(technicians.map(tech => tech.profession));
  return Array.from(professions).sort();
};

// Initialiser les données au chargement du service
initializeTechnicians();

export const technicianService = {
  getAllTechnicians,
  getTechnicianById,
  searchTechnicians,
  addTechnician,
  updateTechnician,
  deleteTechnician,
  getProfessions
};
