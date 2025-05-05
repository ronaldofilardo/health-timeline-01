
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Event } from '@/types';
import { formatDateHeader } from '@/utils/dateUtils';
import { useHealth } from '@/context/HealthContext';

interface EventDetailsModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const { holidays } = useHealth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{event.type} - {event.professionalName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 text-sm font-medium">Data:</div>
            <div className="col-span-2 text-sm">{formatDateHeader(event.eventDate, holidays)}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 text-sm font-medium">Horário:</div>
            <div className="col-span-2 text-sm">
              {event.type === 'Prescrição' ? event.startTime : `${event.startTime} - ${event.endTime}`}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 text-sm font-medium">Especialidade:</div>
            <div className="col-span-2 text-sm">{event.specialtyName}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 text-sm font-medium">Local:</div>
            <div className="col-span-2 text-sm">{event.locationName}</div>
          </div>
          
          {event.type === 'Consulta' && event.isFirstConsultation && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-sm font-medium">Tipo:</div>
              <div className="col-span-2 text-sm">Primeira consulta</div>
            </div>
          )}
          
          {event.type === 'Exame' && event.preparation && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-sm font-medium">Preparo:</div>
              <div className="col-span-2 text-sm">{event.preparation}</div>
            </div>
          )}
          
          {event.observation && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-sm font-medium">Observação:</div>
              <div className="col-span-2 text-sm whitespace-pre-line">{event.observation}</div>
            </div>
          )}
          
          {event.files.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-sm font-medium">Arquivos:</div>
              <div className="col-span-2">
                <ul className="list-disc list-inside text-sm">
                  {event.files.filter(f => !f.isDeleted).map(file => (
                    <li key={file.id}>{file.type}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {(event.type === 'Sessões' || event.type === 'Prescrição') && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-sm font-medium">Status:</div>
              <div className="col-span-2 text-sm">
                {event.isConfirmed ? 'Confirmado' : 'Não confirmado'}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
