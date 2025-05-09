
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useHealth } from '@/context/HealthContext';
import { Event } from '@/types';
import { formatDateHeader } from '@/utils/dateUtils';
import EventCard from './EventCard';
import EventDetailsModal from './EventDetailsModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Timeline() {
  const { events, holidays } = useHealth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [groupedEvents, setGroupedEvents] = useState<Record<string, Event[]>>({});
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Group events by date
    const grouped = events
      .filter(event => !event.isDeleted)
      .reduce<Record<string, Event[]>>((acc, event) => {
        if (!acc[event.eventDate]) {
          acc[event.eventDate] = [];
        }
        acc[event.eventDate].push(event);
        return acc;
      }, {});

    // Sort events within each date by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });

    setGroupedEvents(grouped);
  }, [events]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  // Get dates sorted in ascending order
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);
    return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
  });

  // Check if a date is today
  const isToday = (dateString: string) => {
    const today = format(new Date(), 'dd/MM/yyyy');
    return dateString === today;
  };

  return (
    <div className="timeline-container relative">
      {/* Botão de atalho para criar evento */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button 
          onClick={() => navigate('/event/new')} 
          size="lg" 
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      <div className={`timeline-line ${isMobile ? 'hidden' : ''}`}></div>
      
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Não há eventos cadastrados.</p>
          <p className="text-gray-400 text-sm mt-2">Clique em "Criar Evento" para adicionar um evento.</p>
        </div>
      ) : (
        sortedDates.map((date, dateIndex) => (
          <div key={date} className="mb-10">
            <div 
              className={`timeline-date-header ${isToday(date) ? 'font-bold' : ''}`}
            >
              {formatDateHeader(date, holidays)}
            </div>
            
            <div className={`events-container ${isMobile ? 'mobile-events' : ''}`}>
              {groupedEvents[date].map((event, eventIndex) => {
                // No mobile, todos ficam em uma única coluna
                // Em desktop, alterna entre esquerda e direita para eventos em dias diferentes
                // Mantém eventos do mesmo dia no mesmo lado
                const isLeft = !isMobile && dateIndex % 2 === 0;
                
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    position={isLeft ? 'left' : 'right'}
                    onClick={() => handleEventClick(event)}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}
      
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
}
