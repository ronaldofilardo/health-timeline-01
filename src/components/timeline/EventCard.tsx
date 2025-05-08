import { useState } from 'react';
import { Edit, Trash2, File, CheckCircle, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { useHealth } from '@/context/HealthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import FileManagementModal from '../files/FileManagementModal';

interface EventCardProps {
  event: Event;
  position: 'left' | 'right';
  onClick: () => void;
}

export default function EventCard({ event, position, onClick }: EventCardProps) {
  const navigate = useNavigate();
  const { confirmEvent, deleteEvent } = useHealth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteFiles, setDeleteFiles] = useState(false);
  const [isFileManagementOpen, setIsFileManagementOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Determine background color based on event status
  const getCardStyles = () => {
    switch (event.status) {
      case 'past':
        return 'bg-white opacity-50';
      case 'ongoing':
        return 'bg-white border-health-ongoing animate-border-pulse';
      case 'today':
        return 'bg-health-today';
      case 'future':
        return 'bg-white';
      default:
        return 'bg-white';
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.status === 'past' || event.status === 'ongoing') {
      toast({
        title: "Ação não permitida",
        description: "Eventos passados ou em andamento não podem ser editados.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/event/edit/${event.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.status === 'past' || event.status === 'ongoing') {
      toast({
        title: "Ação não permitida",
        description: "Eventos passados ou em andamento não podem ser deletados.",
        variant: "destructive",
      });
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmationOpen(true);
  };

  const handleConfirmYes = () => {
    confirmEvent(event.id, true);
    toast({
      title: "Evento confirmado",
      description: "O evento foi confirmado com sucesso.",
    });
    setIsConfirmationOpen(false);
  };

  const handleConfirmNo = () => {
    confirmEvent(event.id, false);
    toast({
      title: "Evento não atendido",
      description: "O evento foi marcado como não atendido.",
    });
    setIsConfirmationOpen(false);
  };

  const handleDeleteConfirm = () => {
    // Make sure we're only deleting this specific event
    deleteEvent(event.id);
    toast({
      title: "Evento deletado",
      description: "O evento foi removido da sua timeline.",
    });
    setIsDeleteDialogOpen(false);
  };

  const handleFilesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFileManagementOpen(true);
  };

  // Check if event can be confirmed (sessions and prescriptions only, within time window)
  const canConfirm = () => {
    // Already confirmed events can't be confirmed again
    if (event.isConfirmed !== undefined) return false;
    
    // Only sessions and prescriptions can be confirmed
    if (event.type !== 'Sessões' && event.type !== 'Prescrição') return false;
    
    // Need confirmation deadline to be set
    if (!event.confirmationDeadline) return false;
    
    // Can confirm if now is between start time and confirmation deadline
    const now = new Date();
    const deadline = new Date(event.confirmationDeadline);
    
    // Must be past or ongoing event to be confirmable
    if (event.status !== 'past' && event.status !== 'ongoing') return false;
    
    return now <= deadline;
  };

  // Format times for display
  const getTimeDisplay = () => {
    if (event.type === 'Prescrição') {
      return event.startTime;
    }
    return `${event.startTime} - ${event.endTime}`;
  };

  return (
    <>
      <div 
        className={`${position === 'left' ? 'timeline-card-left' : 'timeline-card-right'} ${getCardStyles()}`}
        onClick={onClick}
      >
        {event.status === 'ongoing' && (
          <div className="absolute top-0 right-0 bg-health-ongoing text-xs font-medium px-2 py-1 rounded-bl-md rounded-tr-md">
            Evento em andamento
          </div>
        )}
        
        <div className="mb-2">
          <h3 className="font-medium">{event.type} - {event.professionalName}</h3>
          <p className="text-sm text-gray-600">{getTimeDisplay()}</p>
        </div>
        
        <div className="flex justify-end space-x-2 mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFilesClick}
            className="text-xs"
          >
            <File className="h-3.5 w-3.5 mr-1" />
            Arquivos
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditClick}
            disabled={event.status === 'past' || event.status === 'ongoing'}
            className="text-xs"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Editar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDeleteClick}
            disabled={event.status === 'past' || event.status === 'ongoing'}
            className="text-xs text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Deletar
          </Button>
          
          {(event.type === 'Sessões' || event.type === 'Prescrição') && (
            canConfirm() ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleConfirmClick}
                className="text-xs text-green-600 hover:text-green-800"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Confirmar
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="text-xs opacity-50"
              >
                {event.isConfirmed === true ? "Confirmado" : event.isConfirmed === false ? "Não Atendido" : "Não Confirmado"}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este evento?
              {event.files.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="delete-files"
                      checked={deleteFiles}
                      onCheckedChange={(checked) => setDeleteFiles(!!checked)}
                    />
                    <label htmlFor="delete-files" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Excluir também os arquivos relacionados a este evento
                    </label>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de evento com botões Sim/Não */}
      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              Você compareceu a este {event.type.toLowerCase()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleConfirmNo} className="gap-2">
              <X className="h-4 w-4" />
              Não
            </Button>
            <Button variant="default" onClick={handleConfirmYes} className="gap-2">
              <Check className="h-4 w-4" />
              Sim
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File management modal */}
      <FileManagementModal
        event={event}
        isOpen={isFileManagementOpen}
        onClose={() => setIsFileManagementOpen(false)}
      />
    </>
  );
}
