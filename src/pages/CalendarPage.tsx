
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse, startOfWeek, addDays, isEqual, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as ReactCalendar } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft } from 'lucide-react';
import { useHealth } from '@/context/HealthContext';
import CalendarFilter from '@/components/calendar/CalendarFilter';
import { Event } from '@/types';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { events } = useHealth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filterType, setFilterType] = useState<'day' | 'week' | 'month'>('day');
  
  // Get all dates that have events (for highlighting in the calendar)
  const eventDates = events
    .filter(event => !event.isDeleted)
    .map(event => {
      const [day, month, year] = event.eventDate.split('/').map(Number);
      return new Date(year, month - 1, day);
    });
  
  // Filter events based on selected date and filter type
  const handleFilterEvents = (date: Date | undefined, type: 'day' | 'week' | 'month') => {
    if (!date) {
      setFilteredEvents([]);
      return;
    }
    
    const filtered = events.filter(event => {
      if (event.isDeleted) return false;
      
      const [day, month, year] = event.eventDate.split('/').map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      if (type === 'day') {
        // Filter for exact day
        return isEqual(
          new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
          new Date(date.getFullYear(), date.getMonth(), date.getDate())
        );
      } else if (type === 'week') {
        // Filter for the week
        const weekStart = startOfWeek(date, { locale: ptBR });
        const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
        
        return weekDates.some(weekDate => 
          isEqual(
            new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
            new Date(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate())
          )
        );
      } else {
        // Filter for the month
        return (
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      }
    });
    
    // Sort by date and time
    setFilteredEvents(filtered.sort((a, b) => {
      // Compare dates
      const [aDay, aMonth, aYear] = a.eventDate.split('/').map(Number);
      const [bDay, bMonth, bYear] = b.eventDate.split('/').map(Number);
      
      const dateA = new Date(aYear, aMonth - 1, aDay);
      const dateB = new Date(bYear, bMonth - 1, bDay);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // If same date, compare by start time
      return a.startTime.localeCompare(b.startTime);
    }));
  };
  
  // Handle date selection in calendar
  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    handleFilterEvents(date, filterType);
  };
  
  // Handle filter type change
  const handleFilterTypeChange = (type: 'day' | 'week' | 'month') => {
    setFilterType(type);
    handleFilterEvents(selectedDate, type);
  };
  
  // Handle PDF export
  const handleExportPDF = () => {
    if (filteredEvents.length === 0) {
      alert('Não há eventos para exportar.');
      return;
    }
    
    // This is a placeholder for PDF generation functionality
    alert('Exportação de PDF será implementada em uma versão futura.');
  };
  
  return (
    <AppLayout title="Calendário">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a Timeline
        </Button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <div className="bg-white p-4 rounded-lg shadow">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              locale={ptBR}
              className="rounded-md border w-full"
              modifiers={{
                hasEvent: eventDates
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 128, 0, 0.1)'
                }
              }}
            />
            
            <div className="mt-4 flex space-x-2 justify-center">
              <Button 
                variant={filterType === 'day' ? 'default' : 'outline'}
                onClick={() => handleFilterTypeChange('day')}
                className="flex-1"
              >
                Dia
              </Button>
              <Button 
                variant={filterType === 'week' ? 'default' : 'outline'}
                onClick={() => handleFilterTypeChange('week')}
                className="flex-1"
              >
                Semana
              </Button>
              <Button 
                variant={filterType === 'month' ? 'default' : 'outline'}
                onClick={() => handleFilterTypeChange('month')}
                className="flex-1"
              >
                Mês
              </Button>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-medium">
                Eventos
                {selectedDate && ` - ${format(selectedDate, 'MMMM yyyy', { locale: ptBR })}`}
              </h2>
              
              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={filteredEvents.length === 0}
              >
                Exportar PDF
              </Button>
            </div>
            
            <CalendarFilter events={filteredEvents} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
