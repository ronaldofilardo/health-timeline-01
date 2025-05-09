
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Event } from '@/types';
import jsPDF from 'jspdf';

export const exportCalendarToPDF = (
  filteredEvents: Event[],
  selectedDate: Date | undefined,
  filterType: 'day' | 'week' | 'month',
) => {
  // Criar título para o PDF com base no filtro atual
  let title = 'Calendário';
  if (selectedDate) {
    if (filterType === 'day') {
      title += ` - ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`;
    } else if (filterType === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
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
  
  return true;
};
