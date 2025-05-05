
import { useState, useEffect } from 'react';
import { format, parse, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useHealth } from '@/context/HealthContext';
import { Event } from '@/types';
import { parseDate } from '@/utils/dateUtils';

interface CalendarFilterProps {
  onEventsFiltered: (filteredEvents: Event[]) => void;
}

export default function CalendarFilter({ onEventsFiltered }: CalendarFilterProps) {
  const { events } = useHealth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filterType, setFilterType] = useState<'day' | 'week' | 'month' | 'custom'>('day');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  useEffect(() => {
    if (!date) return;
    
    let start: Date, end: Date;
    
    switch (filterType) {
      case 'day':
        start = date;
        end = date;
        break;
      case 'week':
        start = startOfWeek(date, { locale: ptBR });
        end = endOfWeek(date, { locale: ptBR });
        break;
      case 'month':
        start = startOfMonth(date);
        end = endOfMonth(date);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = startDate;
          end = endDate;
        } else {
          return; // Don't filter without a valid range
        }
        break;
      default:
        start = date;
        end = date;
    }
    
    setStartDate(start);
    setEndDate(end);
    
    // Filter events by date range
    filterEvents(start, end);
  }, [date, filterType, startDate, endDate, events]);
  
  const filterEvents = (start: Date, end: Date) => {
    if (!start || !end) return;
    
    // Reset hours to compare dates correctly
    const startWithoutTime = new Date(start);
    startWithoutTime.setHours(0, 0, 0, 0);
    
    const endWithoutTime = new Date(end);
    endWithoutTime.setHours(23, 59, 59, 999);
    
    // Filter events
    const filtered = events.filter(event => {
      if (event.isDeleted) return false;
      
      const eventDate = parseDate(event.eventDate);
      if (!eventDate) return false;
      
      return isWithinInterval(eventDate, {
        start: startWithoutTime,
        end: endWithoutTime
      });
    });
    
    onEventsFiltered(filtered);
  };
  
  const handleFilterTypeChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomRange(true);
      setFilterType('custom');
    } else {
      setIsCustomRange(false);
      setFilterType(value as 'day' | 'week' | 'month');
    }
  };
  
  const formatDateRange = (): string => {
    if (!startDate || !endDate) return '';
    
    if (filterType === 'day' || startDate.getTime() === endDate.getTime()) {
      return format(startDate, 'dd/MM/yyyy', { locale: ptBR });
    }
    
    return `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Select value={filterType} onValueChange={handleFilterTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Dia</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="custom">Período Específico</SelectItem>
          </SelectContent>
        </Select>
        
        {isCustomRange ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Data inicial</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setStartDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Data final</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => setEndDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={ptBR}
                  disabled={(date) => date < (startDate || new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'dd/MM/yyyy') : <span>Selecionar data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        {startDate && endDate && (
          <p className="font-medium">
            Exibindo eventos de: {formatDateRange()}
          </p>
        )}
      </div>
    </div>
  );
}
