
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse, startOfWeek, addDays, isEqual } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { useHealth } from '@/context/HealthContext';
import { Event } from '@/types';
import { useToast } from "@/hooks/use-toast";
import CalendarDateSelector from '@/components/calendar/CalendarDateSelector';
import EventsList from '@/components/calendar/EventsList';
import { exportCalendarToPDF } from '@/utils/pdfExport';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { events } = useHealth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filterType, setFilterType] = useState<'day' | 'week' | 'month'>('day');
  const calendarContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
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
  const handleExportPDF = async () => {
    if (filteredEvents.length === 0) {
      toast({
        title: "Sem eventos para exportar",
        description: "Não há eventos para exportar neste período.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto o PDF é gerado..."
      });

      const success = exportCalendarToPDF(filteredEvents, selectedDate, filterType);
      
      if (success) {
        toast({
          title: "PDF gerado com sucesso",
          description: "O arquivo foi baixado para o seu dispositivo."
        });
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um problema ao gerar o arquivo PDF.",
        variant: "destructive"
      });
    }
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
          <CalendarDateSelector
            selectedDate={selectedDate}
            onSelectDate={handleSelect}
            filterType={filterType}
            onFilterTypeChange={handleFilterTypeChange}
            eventDates={eventDates}
          />
        </div>
        
        <div className="w-full lg:w-1/2" ref={calendarContentRef}>
          <EventsList
            selectedDate={selectedDate}
            filteredEvents={filteredEvents}
            onExportPDF={handleExportPDF}
            filterType={filterType}
            ref={calendarContentRef}
          />
        </div>
      </div>
    </AppLayout>
  );
}
