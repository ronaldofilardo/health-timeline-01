
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import CalendarFilter from '@/components/calendar/CalendarFilter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateHeader } from '@/utils/dateUtils';
import { useHealth } from '@/context/HealthContext';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { holidays } = useHealth();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  const handleEventsFiltered = (events: Event[]) => {
    setFilteredEvents(events);
  };
  
  const handleExportPDF = () => {
    // In a real application, this would generate a PDF
    alert('Em uma aplicação real, isso geraria um PDF com os eventos filtrados.');
  };
  
  // Group events by date
  const eventsByDate = filteredEvents.reduce<Record<string, Event[]>>((acc, event) => {
    if (!acc[event.eventDate]) {
      acc[event.eventDate] = [];
    }
    acc[event.eventDate].push(event);
    return acc;
  }, {});
  
  // Get dates sorted in ascending order
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);
    return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
  });
  
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
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <CalendarFilter onEventsFiltered={handleEventsFiltered} />
            
            <Button 
              onClick={handleExportPDF}
              disabled={filteredEvents.length === 0}
              className="self-end md:self-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Não há eventos no período selecionado.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <Card key={date}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {formatDateHeader(date, holidays)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventsByDate[date]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(event => (
                        <div 
                          key={event.id} 
                          className="p-3 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                              <h3 className="font-medium">
                                {event.type} - {event.professionalName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {event.type === 'Prescrição' ? 
                                  event.startTime : 
                                  `${event.startTime} - ${event.endTime}`
                                }
                              </p>
                              {event.location && (
                                <p className="text-sm text-gray-500">
                                  {event.locationName}
                                </p>
                              )}
                            </div>
                            
                            {event.observation && (
                              <div className="md:ml-4 mt-2 md:mt-0 text-sm bg-gray-50 p-2 rounded">
                                <p className="font-medium text-xs text-gray-500">Observação:</p>
                                <p className="text-gray-600">{event.observation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
