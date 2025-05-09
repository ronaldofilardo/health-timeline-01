
import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { Event } from '@/types';
import CalendarFilter from '@/components/calendar/CalendarFilter';

interface EventsListProps {
  selectedDate: Date | undefined;
  filteredEvents: Event[];
  onExportPDF: () => Promise<void>;
  filterType: 'day' | 'week' | 'month';
}

export const EventsList = forwardRef<HTMLDivElement, EventsListProps>(
  ({ selectedDate, filteredEvents, onExportPDF, filterType }, ref) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow" ref={ref}>
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
          <h2 className="text-xl font-medium">
            Eventos
            {selectedDate && ` - ${format(selectedDate, 'MMMM yyyy', { locale: ptBR })}`}
          </h2>
          
          <Button
            variant="outline"
            onClick={onExportPDF}
            disabled={filteredEvents.length === 0}
            className="w-full sm:w-auto"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
        
        <div className="events-list">
          {filteredEvents.length === 0 ? (
            <p className="text-center text-gray-500 my-8">
              Não há eventos para o período selecionado.
            </p>
          ) : (
            <CalendarFilter events={filteredEvents} />
          )}
        </div>
      </div>
    );
  }
);

EventsList.displayName = 'EventsList';

export default EventsList;
