
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { technicianService, Technician } from "@/services/technicianService";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Check, X, Loader2 } from "lucide-react";

const Admin = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('administrators')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        navigate('/');
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administrateur.",
          variant: "destructive"
        });
      }
    };

    checkAdmin();
    loadTechnicians();
  }, [navigate]);

  const loadTechnicians = async () => {
    setLoading(true);
    const technicians = await technicianService.getAllTechnicians();
    setTechnicians(technicians);
    setLoading(false);
  };

  const handleValidate = async (id: string) => {
    setProcessingId(id);
    const success = await technicianService.validateTechnician(id);
    
    if (success) {
      toast({
        title: "Succès",
        description: "Le technicien a été validé.",
      });
      await loadTechnicians();
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation.",
        variant: "destructive"
      });
    }
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce technicien ?")) {
      return;
    }

    setProcessingId(id);
    const success = await technicianService.deleteTechnician(id);
    
    if (success) {
      toast({
        title: "Succès",
        description: "Le technicien a été supprimé.",
      });
      await loadTechnicians();
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive"
      });
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Administration des techniciens</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Profession</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell>{tech.name}</TableCell>
                  <TableCell>{tech.profession}</TableCell>
                  <TableCell>{tech.phone}</TableCell>
                  <TableCell>
                    {tech.is_validated ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Validé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!tech.is_validated && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleValidate(tech.id)}
                        disabled={processingId === tech.id}
                      >
                        {processingId === tech.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(tech.id)}
                      disabled={processingId === tech.id}
                    >
                      {processingId === tech.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
