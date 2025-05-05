
import { useState } from 'react';
import { useHealth } from '@/context/HealthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Professional } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ProfessionalFormModal from './ProfessionalFormModal';

export default function ProfessionalsManagement() {
  const { professionals, events, deleteProfessional } = useHealth();
  const { toast } = useToast();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  const handleEditClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedProfessional) {
      deleteProfessional(selectedProfessional.id);
      toast({
        title: "Profissional excluído",
        description: "O profissional foi excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
    }
  };
  
  const hasProfessionalEvents = (professionalId: number) => {
    return events.some(event => 
      event.professionalId === professionalId && !event.isDeleted
    );
  };
  
  const activeProfessionals = professionals.filter(p => !p.isDeleted);
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profissionais</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Profissional
        </Button>
      </div>
      
      {activeProfessionals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Não há profissionais cadastrados.</p>
          <p className="text-gray-400 text-sm mt-2">Clique em "Adicionar Profissional" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeProfessionals.map(professional => (
            <Card key={professional.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{professional.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 mb-4">
                  <p>{professional.specialtyName}</p>
                  <p>{professional.locationName}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(professional)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(professional)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Professional Modal */}
      <ProfessionalFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      {/* Edit Professional Modal */}
      {selectedProfessional && (
        <ProfessionalFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProfessional(null);
          }}
          professional={selectedProfessional}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProfessional && hasProfessionalEvents(selectedProfessional.id) ? (
                <div>
                  <div className="flex items-center text-yellow-600 mb-2">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Atenção</span>
                  </div>
                  <p>
                    Este profissional tem eventos cadastrados. Os eventos serão mantidos,
                    mas não será mais possível selecionar este profissional para novos eventos.
                  </p>
                </div>
              ) : (
                <p>Tem certeza que deseja excluir este profissional?</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
