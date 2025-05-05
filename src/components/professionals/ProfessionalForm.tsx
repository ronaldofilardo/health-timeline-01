
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useHealth } from '@/context/HealthContext';
import { Professional } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ProfessionalFormProps {
  professional?: Professional;
  onSubmit: (professional: Omit<Professional, 'id'>) => void;
}

export default function ProfessionalForm({ professional, onSubmit }: ProfessionalFormProps) {
  const { specialties, locations, addSpecialty, addLocation } = useHealth();
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  const [formState, setFormState] = useState<{
    name: string;
    specialtyId: number | '';
    specialtyName: string;
    newSpecialty: string;
    locationId: number | '';
    locationName: string;
    newLocation: string;
  }>({
    name: professional?.name || '',
    specialtyId: professional?.specialtyId || '',
    specialtyName: professional?.specialtyName || '',
    newSpecialty: '',
    locationId: professional?.locationId || '',
    locationName: professional?.locationName || '',
    newLocation: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };
  
  const handleSpecialtyChange = (value: string) => {
    if (value === 'new') {
      setFormState(prev => ({ 
        ...prev, 
        specialtyId: '',
        specialtyName: '',
        newSpecialty: '' 
      }));
    } else {
      const selectedSpecialty = specialties.find(s => s.id === parseInt(value, 10));
      if (selectedSpecialty) {
        setFormState(prev => ({ 
          ...prev, 
          specialtyId: selectedSpecialty.id,
          specialtyName: selectedSpecialty.name,
          newSpecialty: '' 
        }));
      }
    }
    
    // Clear error
    if (formErrors.specialty) {
      setFormErrors(prev => {
        const { specialty, ...rest } = prev;
        return rest;
      });
    }
  };
  
  const handleLocationChange = (value: string) => {
    if (value === 'new') {
      setFormState(prev => ({ 
        ...prev, 
        locationId: '',
        locationName: '',
        newLocation: '' 
      }));
    } else {
      const selectedLocation = locations.find(l => l.id === parseInt(value, 10));
      if (selectedLocation) {
        setFormState(prev => ({ 
          ...prev, 
          locationId: selectedLocation.id,
          locationName: selectedLocation.name,
          newLocation: '' 
        }));
      }
    }
    
    // Clear error
    if (formErrors.location) {
      setFormErrors(prev => {
        const { location, ...rest } = prev;
        return rest;
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const errors: Record<string, string> = {};
    
    if (!formState.name.trim()) {
      errors.name = 'Campo obrigatório';
    }
    
    // Specialty validation
    if (!formState.specialtyId && !formState.newSpecialty.trim()) {
      errors.specialty = 'Selecione ou adicione uma especialidade';
    }
    
    // Location validation
    if (!formState.locationId && !formState.newLocation.trim()) {
      errors.location = 'Selecione ou adicione um local';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Open review dialog
    setIsReviewDialogOpen(true);
  };
  
  const handleConfirmSubmit = () => {
    let finalSpecialtyId = formState.specialtyId;
    let finalSpecialtyName = formState.specialtyName;
    let finalLocationId = formState.locationId;
    let finalLocationName = formState.locationName;
    
    // If new specialty was entered, add it
    if (!formState.specialtyId && formState.newSpecialty.trim()) {
      const specialtyId = addSpecialty(formState.newSpecialty.trim());
      if (specialtyId) {
        finalSpecialtyId = specialtyId;
        finalSpecialtyName = formState.newSpecialty.trim();
      }
    }
    
    // If new location was entered, add it
    if (!formState.locationId && formState.newLocation.trim()) {
      const locationId = addLocation(formState.newLocation.trim());
      if (locationId) {
        finalLocationId = locationId;
        finalLocationName = formState.newLocation.trim();
      }
    }
    
    // Submit the professional
    onSubmit({
      name: formState.name.trim(),
      specialtyId: finalSpecialtyId as number,
      specialtyName: finalSpecialtyName,
      locationId: finalLocationId as number,
      locationName: finalLocationName,
      isDeleted: false
    });
    
    setIsReviewDialogOpen(false);
    
    toast({
      title: professional ? "Profissional atualizado" : "Profissional cadastrado",
      description: professional ? 
        "Os dados do profissional foram atualizados com sucesso" : 
        "O profissional foi cadastrado com sucesso",
    });
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{professional ? 'Editar Profissional' : 'Novo Profissional'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                placeholder="Nome do profissional"
                className={formErrors.name ? 'border-red-500' : ''}
                maxLength={100}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            
            {/* Specialty */}
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade *</Label>
              <Select
                value={formState.specialtyId ? formState.specialtyId.toString() : 'new'}
                onValueChange={handleSpecialtyChange}
              >
                <SelectTrigger id="specialty" className={formErrors.specialty ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => (
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
              
              {!formState.specialtyId && (
                <div className="mt-2">
                  <Input
                    name="newSpecialty"
                    value={formState.newSpecialty}
                    onChange={handleInputChange}
                    placeholder="Nova especialidade"
                    className={formErrors.specialty ? 'border-red-500' : ''}
                    maxLength={100}
                  />
                </div>
              )}
              
              {formErrors.specialty && (
                <p className="text-sm text-red-500 mt-1">{formErrors.specialty}</p>
              )}
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Local de Atendimento *</Label>
              <Select
                value={formState.locationId ? formState.locationId.toString() : 'new'}
                onValueChange={handleLocationChange}
              >
                <SelectTrigger id="location" className={formErrors.location ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
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
              
              {!formState.locationId && (
                <div className="mt-2">
                  <Input
                    name="newLocation"
                    value={formState.newLocation}
                    onChange={handleInputChange}
                    placeholder="Novo local"
                    className={formErrors.location ? 'border-red-500' : ''}
                    maxLength={100}
                  />
                </div>
              )}
              
              {formErrors.location && (
                <p className="text-sm text-red-500 mt-1">{formErrors.location}</p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="submit" onClick={handleSubmit}>
            {professional ? 'Atualizar' : 'Confirmar'}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Review Dialog */}
      <AlertDialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revisar dados do profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Confira os detalhes antes de confirmar:
              
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Nome:</div>
                  <div className="text-sm">{formState.name}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Especialidade:</div>
                  <div className="text-sm">
                    {formState.specialtyId ? 
                      formState.specialtyName : 
                      formState.newSpecialty
                    }
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Local:</div>
                  <div className="text-sm">
                    {formState.locationId ? 
                      formState.locationName : 
                      formState.newLocation
                    }
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Corrigir</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              {professional ? 'Atualizar' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
