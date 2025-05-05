import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useHealth } from '@/context/HealthContext';
import { Event } from '@/types';
import { formatDateHeader } from '@/utils/dateUtils';
import EventCard from './EventCard';
import EventDetailsModal from './EventDetailsModal';

export default function Timeline() {
  const { events, holidays } = useHealth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [groupedEvents, setGroupedEvents] = useState<Record<string, Event[]>>({});

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
    <div className="timeline-container">
      <div className="timeline-line"></div>
      
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
            
            {groupedEvents[date].map((event, eventIndex) => {
              // Alternate between left and right for events on different days
              // Keep events on the same day on the same side
              const isLeft = dateIndex % 2 === 0;
              
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
