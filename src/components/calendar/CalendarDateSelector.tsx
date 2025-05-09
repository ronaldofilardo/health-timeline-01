
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface CalendarDateSelectorProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  filterType: 'day' | 'week' | 'month';
  onFilterTypeChange: (type: 'day' | 'week' | 'month') => void;
  eventDates: Date[];
}

export const CalendarDateSelector: React.FC<CalendarDateSelectorProps> = ({
  selectedDate,
  onSelectDate,
  filterType,
  onFilterTypeChange,
  eventDates,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
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
          onClick={() => onFilterTypeChange('day')}
          className="flex-1"
        >
          Dia
        </Button>
        <Button 
          variant={filterType === 'week' ? 'default' : 'outline'}
          onClick={() => onFilterTypeChange('week')}
          className="flex-1"
        >
          Semana
        </Button>
        <Button 
          variant={filterType === 'month' ? 'default' : 'outline'}
          onClick={() => onFilterTypeChange('month')}
          className="flex-1"
        >
          Mês
        </Button>
      </div>
    </div>
  );
};

export default CalendarDateSelector;
