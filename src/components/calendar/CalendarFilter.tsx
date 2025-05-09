
import React from 'react';
import { Event } from '@/types';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export interface CalendarFilterProps {
  events: Event[];
  onFilterChange?: (filteredEvents: Event[]) => void;
}

export const CalendarFilter: React.FC<CalendarFilterProps> = ({ events }) => {
  // Agrupar eventos por data
  const eventsByDate = events.reduce<Record<string, Event[]>>((acc, event) => {
    if (!acc[event.eventDate]) {
      acc[event.eventDate] = [];
    }
    acc[event.eventDate].push(event);
    return acc;
  }, {});

  // Ordenar datas
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA.getTime() - dateB.getTime();
  });

  // Get event status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'past':
        return 'bg-gray-100 text-gray-700';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'today':
        return 'bg-blue-100 text-blue-800';
      case 'future':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4 mb-4">
      {sortedDates.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum evento encontrado.</p>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              {format(parse(date, 'dd/MM/yyyy', new Date()), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
            </h3>
            <div className="space-y-2">
              {eventsByDate[date].map((event) => (
                <Card key={event.id} className="p-3 border-l-4" style={{ borderLeftColor: event.type === 'Consulta' ? '#4f46e5' : event.type === 'Sessões' ? '#059669' : event.type === 'Prescrição' ? '#d97706' : '#6b7280' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{event.startTime} - {event.endTime || ''}</span>
                        <Badge variant="outline" className={getStatusColor(event.status || 'future')}>
                          {event.status === 'past' ? 'Passado' : 
                           event.status === 'ongoing' ? 'Em andamento' : 
                           event.status === 'today' ? 'Hoje' : 'Futuro'}
                        </Badge>
                      </div>
                      <p className="font-bold mt-1">{event.type}</p>
                      <p className="text-sm text-gray-600">{event.professionalName}</p>
                      {event.observation && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.observation}</p>
                      )}
                    </div>
                    {event.files && event.files.length > 0 && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <FileText size={14} />
                        <span className="text-xs">{event.files.filter(f => !f.isDeleted).length}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CalendarFilter;
