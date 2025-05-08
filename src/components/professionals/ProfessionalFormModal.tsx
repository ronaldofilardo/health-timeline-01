
import { useState, useEffect } from 'react';
import { useHealth } from '@/context/HealthContext';
import { Professional } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ProfessionalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional?: Professional;
  onProfessionalAdded?: (professional: Professional) => void;
}

export default function ProfessionalFormModal({
  isOpen,
  onClose,
  onProfessionalAdded,
  professional
}: ProfessionalFormModalProps) {
  const { toast } = useToast();
  const { specialties, locations, addProfessional, updateProfessional, addSpecialty, addLocation } = useHealth();
  
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialtyId: 0,
    specialtyName: '',
    locationId: 0,
    locationName: '',
    newSpecialty: '',
    newLocation: ''
  });
  
  // Reset form data when modal opens or professional changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: professional?.name || '',
        specialtyId: professional?.specialtyId || 0,
        specialtyName: professional?.specialtyName || '',
        locationId: professional?.locationId || 0,
        locationName: professional?.locationName || '',
        newSpecialty: '',
        newLocation: ''
      });
    }
  }, [isOpen, professional]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.specialtyId && !formData.newSpecialty) {
      newErrors.specialty = 'Especialidade é obrigatória';
    }
    
    if (!formData.locationId && !formData.newLocation) {
      newErrors.location = 'Local é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when field is filled
    if (value && errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleSpecialtySelect = (value: string) => {
    if (value === 'new') {
      setFormData(prev => ({ 
        ...prev, 
        specialtyId: 0,
        specialtyName: '',
        newSpecialty: '' 
      }));
    } else {
      const selectedSpecialty = specialties.find(s => s.id === parseInt(value));
      if (selectedSpecialty) {
        setFormData(prev => ({ 
          ...prev, 
          specialtyId: selectedSpecialty.id,
          specialtyName: selectedSpecialty.name,
          newSpecialty: '' 
        }));
      }
    }
    
    // Clear specialty error if it exists
    if (errors.specialty) {
      setErrors(prev => {
        const { specialty, ...rest } = prev;
        return rest;
      });
    }
  };
  
  const handleLocationSelect = (value: string) => {
    if (value === 'new') {
      setFormData(prev => ({ 
        ...prev, 
        locationId: 0,
        locationName: '',
        newLocation: '' 
      }));
    } else {
      const selectedLocation = locations.find(l => l.id === parseInt(value));
      if (selectedLocation) {
        setFormData(prev => ({ 
          ...prev, 
          locationId: selectedLocation.id,
          locationName: selectedLocation.name,
          newLocation: '' 
        }));
      }
    }
    
    // Clear location error if it exists
    if (errors.location) {
      setErrors(prev => {
        const { location, ...rest } = prev;
        return rest;
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Handle specialty
    let specialtyId = formData.specialtyId;
    let specialtyName = formData.specialtyName;
    
    if (formData.newSpecialty) {
      const newSpecialtyId = addSpecialty(formData.newSpecialty);
      if (typeof newSpecialtyId === 'number') {
        specialtyId = newSpecialtyId;
        specialtyName = formData.newSpecialty;
      }
    }
    
    // Handle location
    let locationId = formData.locationId;
    let locationName = formData.locationName;
    
    if (formData.newLocation) {
      const newLocationId = addLocation(formData.newLocation);
      if (typeof newLocationId === 'number') {
        locationId = newLocationId;
        locationName = formData.newLocation;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      specialtyId,
      specialtyName,
      locationId,
      locationName
    }));
    
    setIsReviewOpen(true);
  };
  
  const handleConfirm = () => {
    try {
      const professionalData = {
        id: professional?.id || 0,
        name: formData.name,
        specialtyId: formData.specialtyId,
        specialtyName: formData.specialtyName,
        locationId: formData.locationId,
        locationName: formData.locationName,
        isDeleted: false
      };
      
      if (professional) {
        updateProfessional({
          ...professionalData,
          id: professional.id
        });
      } else {
        addProfessional(professionalData);
      }
      
      if (onProfessionalAdded) {
        onProfessionalAdded({
          ...professionalData,
          id: professional?.id || professionalData.id
        });
      }
      
      setIsReviewOpen(false);
      onClose();
    } catch (error) {
      console.error("Error saving professional:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o profissional",
        variant: "destructive",
      });
    }
  };
  
  const handleCloseDialog = () => {
    onClose();
    // Reset errors when dialog closes
    setErrors({});
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {professional ? 'Editar Profissional' : 'Novo Profissional'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade *</Label>
              <Select
                value={formData.specialtyId ? formData.specialtyId.toString() : 'new'}
                onValueChange={handleSpecialtySelect}
              >
                <SelectTrigger 
                  id="specialty" 
                  className={errors.specialty ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem 
                      key={specialty.id} 
                      value={specialty.id.toString()}
                    >
                      {specialty.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Adicionar Novo</SelectItem>
                </SelectContent>
              </Select>
              
              {formData.specialtyId === 0 && (
                <Input
                  placeholder="Digite a nova especialidade"
                  value={formData.newSpecialty}
                  onChange={(e) => handleChange('newSpecialty', e.target.value)}
                  className={`mt-2 ${errors.specialty ? 'border-red-500' : ''}`}
                />
              )}
              
              {errors.specialty && (
                <p className="text-xs text-red-500">{errors.specialty}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Local de Atendimento *</Label>
              <Select
                value={formData.locationId ? formData.locationId.toString() : 'new'}
                onValueChange={handleLocationSelect}
              >
                <SelectTrigger 
                  id="location" 
                  className={errors.location ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem 
                      key={location.id} 
                      value={location.id.toString()}
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Adicionar Novo</SelectItem>
                </SelectContent>
              </Select>
              
              {formData.locationId === 0 && (
                <Input
                  placeholder="Digite o novo local"
                  value={formData.newLocation}
                  onChange={(e) => handleChange('newLocation', e.target.value)}
                  className={`mt-2 ${errors.location ? 'border-red-500' : ''}`}
                />
              )}
              
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {professional ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog 
        open={isReviewOpen} 
        onOpenChange={(open) => {
          setIsReviewOpen(open);
          if (!open && !isOpen) {
            handleCloseDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revisar Profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Confirme os dados do profissional antes de salvar:
              
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Nome:</div>
                  <div className="text-sm">{formData.name}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Especialidade:</div>
                  <div className="text-sm">
                    {formData.specialtyId 
                      ? formData.specialtyName 
                      : formData.newSpecialty
                    }
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Local:</div>
                  <div className="text-sm">
                    {formData.locationId 
                      ? formData.locationName 
                      : formData.newLocation
                    }
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsReviewOpen(false)}>Corrigir</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {professional ? 'Atualizar' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
