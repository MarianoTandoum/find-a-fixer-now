
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { newTechnicianService, NewTechnician } from "@/services/newTechnicianService";
import { clientRequestService, ClientRequest } from "@/services/clientRequestService";
import { adminService } from "@/services/adminService";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Check, X, Loader2 } from "lucide-react";

const Admin = () => {
  const [technicians, setTechnicians] = useState<NewTechnician[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await adminService.isAdmin();
      
      if (!isAdmin) {
        navigate('/');
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administrateur.",
          variant: "destructive"
        });
        return;
      }

      loadData();
    };

    checkAdmin();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    const [technicianData, requestData] = await Promise.all([
      newTechnicianService.getAllTechnicians(),
      clientRequestService.getAllRequests()
    ]);
    
    setTechnicians(technicianData);
    setRequests(requestData);
    setLoading(false);
  };

  const handleValidate = async (id: string) => {
    setProcessingId(id);
    const success = await newTechnicianService.validateTechnician(id);
    
    if (success) {
      toast({
        title: "Succès",
        description: "Le technicien a été validé.",
      });
      await loadData();
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
    const success = await newTechnicianService.deleteTechnician(id);
    
    if (success) {
      toast({
        title: "Succès",
        description: "Le technicien a été supprimé.",
      });
      await loadData();
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive"
      });
    }
    setProcessingId(null);
  };

  const handleAssignTechnician = async (requestId: string, technicianId: string) => {
    const success = await clientRequestService.updateRequestStatus(requestId, 'assigned', technicianId);
    
    if (success) {
      toast({
        title: "Succès",
        description: "Technicien assigné à la demande.",
      });
      await loadData();
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignation.",
        variant: "destructive"
      });
    }
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
        <h1 className="text-3xl font-bold mb-8">Dashboard Administrateur</h1>
        
        <Tabs defaultValue="technicians" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="technicians">Techniciens</TabsTrigger>
            <TabsTrigger value="requests">Demandes Clients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technicians">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Profession</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Ville</TableHead>
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
                      <TableCell>{tech.city}</TableCell>
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
          </TabsContent>
          
          <TabsContent value="requests">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Urgent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.client_name}</TableCell>
                      <TableCell>{request.client_phone}</TableCell>
                      <TableCell>{request.service_type}</TableCell>
                      <TableCell>{request.city}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'pending' ? 'En attente' :
                           request.status === 'assigned' ? 'Assigné' :
                           request.status === 'in_progress' ? 'En cours' :
                           request.status === 'completed' ? 'Terminé' : 'Annulé'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {request.urgent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Urgent
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <select 
                            onChange={(e) => handleAssignTechnician(request.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="">Assigner technicien</option>
                            {technicians.filter(t => t.is_validated).map(tech => (
                              <option key={tech.id} value={tech.id}>
                                {tech.name} - {tech.profession}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
