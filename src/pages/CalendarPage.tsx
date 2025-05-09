
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse, startOfWeek, addDays, isEqual, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, FileDown } from 'lucide-react';
import { useHealth } from '@/context/HealthContext';
import CalendarFilter from '@/components/calendar/CalendarFilter';
import { Event } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";

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

      // Criar título para o PDF com base no filtro atual
      let title = 'Calendário';
      if (selectedDate) {
        if (filterType === 'day') {
          title += ` - ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`;
        } else if (filterType === 'week') {
          const weekStart = startOfWeek(selectedDate, { locale: ptBR });
          const weekEnd = addDays(weekStart, 6);
          title += ` - Semana ${format(weekStart, 'dd/MM/yyyy', { locale: ptBR })} a ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`;
        } else {
          title += ` - ${format(selectedDate, 'MMMM yyyy', { locale: ptBR })}`;
        }
      }

      // Criar o documento PDF
      const doc = new jsPDF('p', 'pt', 'a4');
      
      // Adicionar título
      doc.setFontSize(18);
      doc.text(title, 40, 40);
      
      // Adicionar data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 40, 60);
      
      // Adicionar tabela de eventos
      doc.setFontSize(12);
      doc.text('Lista de Eventos:', 40, 90);
      
      let yPos = 110;
      
      // Cabeçalho da tabela
      doc.setFont('helvetica', 'bold');
      doc.text('Data', 40, yPos);
      doc.text('Horário', 130, yPos);
      doc.text('Tipo', 200, yPos);
      doc.text('Profissional', 280, yPos);
      doc.text('Observações', 410, yPos);
      
      yPos += 20;
      doc.setFont('helvetica', 'normal');
      
      // Ordenar eventos por data e hora
      const sortedEvents = [...filteredEvents].sort((a, b) => {
        // Comparar por data
        const dateA = parse(a.eventDate, 'dd/MM/yyyy', new Date());
        const dateB = parse(b.eventDate, 'dd/MM/yyyy', new Date());
        
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        
        // Se mesma data, comparar por hora
        return a.startTime.localeCompare(b.startTime);
      });
      
      // Adicionar linhas de eventos
      sortedEvents.forEach(event => {
        if (yPos > 750) {
          doc.addPage();
          yPos = 40;
          
          // Adicionar cabeçalho na nova página
          doc.setFont('helvetica', 'bold');
          doc.text('Data', 40, yPos);
          doc.text('Horário', 130, yPos);
          doc.text('Tipo', 200, yPos);
          doc.text('Profissional', 280, yPos);
          doc.text('Observações', 410, yPos);
          
          yPos += 20;
          doc.setFont('helvetica', 'normal');
        }
        
        doc.text(event.eventDate, 40, yPos);
        doc.text(`${event.startTime} - ${event.endTime || ''}`, 130, yPos);
        doc.text(event.type.substring(0, 15), 200, yPos);
        doc.text((event.professionalName || '').substring(0, 20), 280, yPos);
        
        // Truncar observações longas
        const observation = event.observation || '';
        doc.text(observation.length > 20 ? observation.substring(0, 17) + '...' : observation, 410, yPos);
        
        yPos += 20;
      });
      
      // Salvar o PDF
      doc.save(`calendario_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O arquivo foi baixado para o seu dispositivo."
      });
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
        
        <div className="w-full lg:w-1/2" ref={calendarContentRef}>
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
        </div>
      </div>
    </AppLayout>
  );
}
