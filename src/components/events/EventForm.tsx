
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHealth } from '@/context/HealthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Event, EventType, Professional } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { maskDateInput, maskTimeInput, getFormattedDateWithDay, isValidDateFormat, isValidTimeFormat } from '@/utils/dateUtils';
import { validateDate, validateTime, checkEventOverlaps } from '@/utils/validationUtils';
import ProfessionalFormModal from '../professionals/ProfessionalFormModal';

export default function EventForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    events, 
    professionals, 
    holidays, 
    addEvent, 
    updateEvent, 
    getEventById 
  } = useHealth();

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [formState, setFormState] = useState<Partial<Event>>({
    type: 'Consulta',
    eventDate: new Date().toLocaleDateString('pt-BR'),
    startTime: '',
    endTime: '',
    professionalId: 0,
    professionalName: '',
    specialtyName: '',
    locationName: '',
    observation: '',
    isFirstConsultation: false,
    preparation: '',
    isConfirmed: false,
    files: []
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formWarnings, setFormWarnings] = useState<Record<string, string>>({});

  // Load event data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const event = getEventById(parseInt(id, 10));
      if (event) {
        setFormState(event);
      } else {
        toast({
          title: "Evento não encontrado",
          description: "O evento que você está tentando editar não existe.",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [isEditMode, id, getEventById, navigate, toast]);

  // Validate date whenever it changes
  useEffect(() => {
    if (formState.eventDate) {
      const validation = validateDate(formState.eventDate, holidays);
      
      if (!validation.isValid) {
        setFormErrors(prev => ({ ...prev, eventDate: validation.error }));
      } else {
        setFormErrors(prev => {
          const { eventDate, ...rest } = prev;
          return rest;
        });
        
        if (validation.warning) {
          setFormWarnings(prev => ({ ...prev, eventDate: validation.warning }));
        } else {
          setFormWarnings(prev => {
            const { eventDate, ...rest } = prev;
            return rest;
          });
        }
      }
    }
  }, [formState.eventDate, holidays]);

  // Validate time whenever it changes
  useEffect(() => {
    if (formState.startTime || formState.endTime) {
      const validation = validateTime(
        formState.startTime || '',
        formState.endTime || null,
        formState.type as EventType || 'Consulta',
        formState.eventDate || ''
      );
      
      if (!validation.startTimeValid) {
        setFormErrors(prev => ({ ...prev, startTime: validation.startTimeError }));
      } else {
        setFormErrors(prev => {
          const { startTime, ...rest } = prev;
          return rest;
        });
      }
      
      if (!validation.endTimeValid) {
        setFormErrors(prev => ({ ...prev, endTime: validation.endTimeError }));
      } else {
        setFormErrors(prev => {
          const { endTime, ...rest } = prev;
          return rest;
        });
      }
      
      if (validation.warning) {
        setFormWarnings(prev => ({ ...prev, time: validation.warning }));
      } else {
        setFormWarnings(prev => {
          const { time, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [formState.startTime, formState.endTime, formState.type, formState.eventDate]);

  // Check for scheduling conflicts (overlaps with other events)
  useEffect(() => {
    if (
      formState.eventDate && 
      formState.startTime && 
      (formState.endTime || formState.type === 'Prescrição') &&
      formState.locationName
    ) {
      // Don't check overlaps for events that are being edited
      const currentEvents = events.filter(e => 
        !e.isDeleted && (isEditMode ? e.id !== parseInt(id!, 10) : true)
      );
      
      const overlapCheck = checkEventOverlaps(formState, currentEvents);
      
      if (overlapCheck.hasOverlap) {
        setFormErrors(prev => ({ 
          ...prev, 
          overlap: overlapCheck.message || 'Conflito com outro evento' 
        }));
      } else {
        setFormErrors(prev => {
          const { overlap, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [
    formState.eventDate, 
    formState.startTime, 
    formState.endTime, 
    formState.type,
    formState.locationName,
    events,
    isEditMode,
    id
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'eventDate') {
      setFormState(prev => ({ ...prev, [name]: maskDateInput(value) }));
    } else if (name === 'startTime' || name === 'endTime') {
      setFormState(prev => ({ ...prev, [name]: maskTimeInput(value) }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'type') {
      // Reset type-specific fields
      setFormState(prev => ({ 
        ...prev, 
        [name]: value,
        isFirstConsultation: value === 'Consulta' ? prev.isFirstConsultation : false,
        preparation: value === 'Exame' ? prev.preparation : '',
        endTime: value === 'Prescrição' ? '' : prev.endTime
      }));
    } else if (name === 'professionalId') {
      const selectedProfessional = professionals.find(p => p.id === parseInt(value, 10));
      if (selectedProfessional) {
        setFormState(prev => ({ 
          ...prev, 
          professionalId: selectedProfessional.id,
          professionalName: selectedProfessional.name,
          specialtyName: selectedProfessional.specialtyName,
          locationName: selectedProfessional.locationName
        }));
      }
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields: Record<string, any> = {
      type: formState.type,
      professionalId: formState.professionalId,
      eventDate: formState.eventDate,
      startTime: formState.startTime
    };
    
    // End time is required for all event types except 'Prescrição'
    if (formState.type !== 'Prescrição') {
      requiredFields.endTime = formState.endTime;
    }
    
    // Check for empty required fields
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);
    
    if (missingFields.length > 0) {
      // Update errors for each missing field
      const newErrors: Record<string, string> = {};
      missingFields.forEach(field => {
        newErrors[field] = 'Campo obrigatório';
      });
      
      setFormErrors(prev => ({ ...prev, ...newErrors }));
      
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      
      return;
    }
    
    // Format validation
    const invalidFormatFields: string[] = [];
    
    if (formState.eventDate && !isValidDateFormat(formState.eventDate)) {
      invalidFormatFields.push('eventDate');
    }
    
    if (formState.startTime && !isValidTimeFormat(formState.startTime)) {
      invalidFormatFields.push('startTime');
    }
    
    if (formState.type !== 'Prescrição' && formState.endTime && !isValidTimeFormat(formState.endTime)) {
      invalidFormatFields.push('endTime');
    }
    
    if (invalidFormatFields.length > 0) {
      toast({
        title: "Formato inválido",
        description: "Verifique o formato dos campos destacados",
        variant: "destructive",
      });
      
      return;
    }
    
    // If we have any errors, don't proceed
    if (Object.keys(formErrors).length > 0) {
      toast({
        title: "Erros no formulário",
        description: "Corrija os erros antes de continuar",
        variant: "destructive",
      });
      
      return;
    }
    
    // Open review dialog
    setIsReviewDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    // Create or update the event
    try {
      if (isEditMode && id) {
        updateEvent(formState as Event);
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso",
        });
      } else {
        addEvent(formState as Omit<Event, 'id' | 'status'>);
        toast({
          title: "Evento criado",
          description: "Evento adicionado à sua timeline",
        });
      }
      
      // Close the dialog and navigate back to the timeline
      setIsReviewDialogOpen(false);
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o evento",
        variant: "destructive",
      });
    }
  };

  const handleProfessionalAdded = (newProfessional: Professional) => {
    setFormState(prev => ({
      ...prev,
      professionalId: newProfessional.id,
      professionalName: newProfessional.name,
      specialtyName: newProfessional.specialtyName,
      locationName: newProfessional.locationName
    }));
    setIsProfessionalModalOpen(false);
  };

  const isFormValid = () => {
    // Check if we have any errors
    if (Object.keys(formErrors).length > 0) return false;
    
    // Check required fields
    if (!formState.type || !formState.professionalId || !formState.eventDate || !formState.startTime) {
      return false;
    }
    
    // End time is required for all event types except 'Prescrição'
    if (formState.type !== 'Prescrição' && !formState.endTime) {
      return false;
    }
    
    return true;
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Editar Evento' : 'Criar Evento'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type of Event */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Evento *</Label>
              <Select
                value={formState.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type" className={formErrors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Exame">Exame</SelectItem>
                  <SelectItem value="Sessões">Sessões</SelectItem>
                  <SelectItem value="Prescrição">Prescrição</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.type && (
                <p className="text-sm text-red-500 mt-1">{formErrors.type}</p>
              )}
              
              {/* Type-specific fields */}
              {formState.type === 'Consulta' && (
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="isFirstConsultation"
                    checked={formState.isFirstConsultation}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('isFirstConsultation', !!checked)
                    }
                  />
                  <label
                    htmlFor="isFirstConsultation"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    1ª consulta
                  </label>
                </div>
              )}
              
              {formState.type === 'Exame' && (
                <div className="mt-2">
                  <Label htmlFor="preparation">Preparo</Label>
                  <Textarea
                    id="preparation"
                    name="preparation"
                    value={formState.preparation || ''}
                    onChange={handleInputChange}
                    placeholder="Ex.: Jejum de 8h"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            
            {/* Professional */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="professionalId">Profissional *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProfessionalModalOpen(true)}
                >
                  Novo
                </Button>
              </div>
              <Select
                value={formState.professionalId ? formState.professionalId.toString() : ''}
                onValueChange={(value) => handleSelectChange('professionalId', value)}
              >
                <SelectTrigger id="professionalId" className={formErrors.professionalId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals
                    .filter(p => !p.isDeleted)
                    .map(professional => (
                      <SelectItem 
                        key={professional.id} 
                        value={professional.id.toString()}
                      >
                        {professional.name} - {professional.specialtyName}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {formErrors.professionalId && (
                <p className="text-sm text-red-500 mt-1">{formErrors.professionalId}</p>
              )}
            </div>
            
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="eventDate">Data do Evento *</Label>
              <Input
                id="eventDate"
                name="eventDate"
                value={formState.eventDate || ''}
                onChange={handleInputChange}
                placeholder="DD/MM/YYYY"
                className={formErrors.eventDate ? 'border-red-500' : ''}
              />
              {formState.eventDate && isValidDateFormat(formState.eventDate) && (
                <p className="text-xs text-gray-500 mt-1">
                  {getFormattedDateWithDay(formState.eventDate)}
                </p>
              )}
              {formErrors.eventDate && (
                <p className="text-sm text-red-500 mt-1">{formErrors.eventDate}</p>
              )}
              {formWarnings.eventDate && (
                <p className="text-sm text-yellow-500 mt-1">{formWarnings.eventDate}</p>
              )}
            </div>
            
            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Início *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  value={formState.startTime || ''}
                  onChange={handleInputChange}
                  placeholder="HH:MM"
                  className={formErrors.startTime ? 'border-red-500' : ''}
                />
                {formErrors.startTime && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.startTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">
                  Hora de Fim {formState.type !== 'Prescrição' ? '*' : ''}
                </Label>
                <Input
                  id="endTime"
                  name="endTime"
                  value={formState.endTime || ''}
                  onChange={handleInputChange}
                  placeholder="HH:MM"
                  disabled={formState.type === 'Prescrição'}
                  className={formErrors.endTime ? 'border-red-500' : ''}
                />
                {formErrors.endTime && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.endTime}</p>
                )}
              </div>
            </div>
            
            {formWarnings.time && (
              <p className="text-sm text-yellow-500">{formWarnings.time}</p>
            )}
            
            {formErrors.overlap && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{formErrors.overlap}</p>
            )}
            
            {/* Observation */}
            <div className="space-y-2">
              <Label htmlFor="observation">Observação</Label>
              <Textarea
                id="observation"
                name="observation"
                value={formState.observation || ''}
                onChange={handleInputChange}
                placeholder="Adicione informações relevantes (máx. 500 caracteres)"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formState.observation?.length || 0)}/500 caracteres
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid()}
            >
              {isEditMode ? 'Atualizar Evento' : 'Criar Evento'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Review Dialog */}
      <AlertDialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revisar Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Confira os detalhes do evento antes de confirmar:
              
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Tipo:</div>
                  <div className="text-sm">{formState.type}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Profissional:</div>
                  <div className="text-sm">{formState.professionalName}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Especialidade:</div>
                  <div className="text-sm">{formState.specialtyName}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Local:</div>
                  <div className="text-sm">{formState.locationName}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Data:</div>
                  <div className="text-sm">{formState.eventDate}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Horário:</div>
                  <div className="text-sm">
                    {formState.type === 'Prescrição' ? 
                      formState.startTime : 
                      `${formState.startTime} - ${formState.endTime}`
                    }
                  </div>
                </div>
                
                {Object.values(formWarnings).length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-md mt-3">
                    <p className="text-sm font-medium text-yellow-700">Atenção:</p>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                      {Object.values(formWarnings).map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Corrigir</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              {isEditMode ? 'Atualizar' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Professional Form Modal */}
      <ProfessionalFormModal
        isOpen={isProfessionalModalOpen}
        onClose={() => setIsProfessionalModalOpen(false)}
        onProfessionalAdded={handleProfessionalAdded}
      />
    </>
  );
}
