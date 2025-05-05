
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Professional } from '@/types';
import ProfessionalForm from './ProfessionalForm';
import { useHealth } from '@/context/HealthContext';

interface ProfessionalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfessionalAdded?: (professional: Professional) => void;
  professional?: Professional;
}

export default function ProfessionalFormModal({ 
  isOpen, 
  onClose, 
  onProfessionalAdded,
  professional
}: ProfessionalFormModalProps) {
  const { addProfessional, updateProfessional } = useHealth();
  
  const handleSubmit = (professionalData: Omit<Professional, 'id'>) => {
    if (professional) {
      // Update existing professional
      const updatedProfessional = {
        ...professional,
        ...professionalData
      };
      updateProfessional(updatedProfessional);
      onClose();
    } else {
      // Add new professional
      const newProfessionalId = addProfessional(professionalData);
      
      // Find the newly added professional
      if (onProfessionalAdded) {
        onProfessionalAdded({
          id: newProfessionalId as unknown as number,
          ...professionalData
        });
      } else {
        onClose();
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {professional ? 'Editar Profissional' : 'Cadastrar Profissional'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ProfessionalForm
            professional={professional}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
