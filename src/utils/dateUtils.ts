
import { format, isValid, parse, isWeekend, isToday, formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Holiday } from '@/types';

// Format date to DD/MM/YYYY
export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

// Parse date from DD/MM/YYYY string
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
  return isValid(parsedDate) ? parsedDate : null;
};

// Format time to HH:mm
export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

// Parse time string HH:mm to Date
export const parseTime = (timeString: string, baseDate: Date): Date | null => {
  if (!timeString) return null;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Get formatted date with day of week
export const getFormattedDateWithDay = (dateString: string): string => {
  const date = parseDate(dateString);
  if (!date) return '';
  
  return format(date, "dd/MM/yyyy - EEEE", { locale: ptBR });
};

// Feriados nacionais fixos
export const FIXED_HOLIDAYS: Holiday[] = [
  { id: 1, date: '2025-01-01', name: 'Confraternização Universal', isRecurring: true },
  { id: 2, date: '2025-04-18', name: 'Sexta-Feira Santa', isRecurring: false },
  { id: 3, date: '2025-04-21', name: 'Tiradentes', isRecurring: true },
  { id: 4, date: '2025-05-01', name: 'Dia do Trabalho', isRecurring: true },
  { id: 5, date: '2025-09-07', name: 'Independência do Brasil', isRecurring: true },
  { id: 6, date: '2025-10-12', name: 'Dia das Crianças', isRecurring: true },
  { id: 7, date: '2025-11-02', name: 'Finados', isRecurring: true },
  { id: 8, date: '2025-11-15', name: 'Proclamação da República', isRecurring: true },
  { id: 9, date: '2025-12-25', name: 'Natal', isRecurring: true }
];

// Check if a date is a holiday
export const isHoliday = (date: Date, holidays: Holiday[]): Holiday | null => {
  // Convert date to YYYY-MM-DD for comparison
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Combine fixed holidays with provided holidays
  const allHolidays = [...FIXED_HOLIDAYS, ...holidays];
  
  // Check for exact match (recurring and non-recurring)
  const exactMatch = allHolidays.find(holiday => holiday.date === dateStr);
  if (exactMatch) return exactMatch;
  
  // Check for recurring holidays (match month and day)
  const monthDay = format(date, 'MM-dd');
  const recurringMatch = allHolidays.find(holiday => {
    if (!holiday.isRecurring) return false;
    const holidayMonthDay = holiday.date.substring(5); // Get MM-DD part
    return holidayMonthDay === monthDay;
  });
  
  return recurringMatch || null;
};

// Check if date is weekend or holiday
export const isWeekendOrHoliday = (date: Date, holidays: Holiday[]): { isOff: boolean, reason: string } => {
  if (isWeekend(date)) {
    const dayName = format(date, 'EEEE', { locale: ptBR });
    return { isOff: true, reason: dayName };
  }
  
  const holiday = isHoliday(date, holidays);
  if (holiday) {
    return { isOff: true, reason: `Feriado - ${holiday.name}` };
  }
  
  return { isOff: false, reason: '' };
};

// Format date for display in timeline headers
export const formatDateHeader = (dateString: string, holidays: Holiday[]): string => {
  const date = parseDate(dateString);
  if (!date) return '';
  
  const dayOfWeek = format(date, 'EEEE', { locale: ptBR });
  const formattedDate = format(date, 'dd/MM/yyyy');
  
  const holiday = isHoliday(date, holidays);
  const holidayInfo = holiday ? ` - <span class="text-red-500 font-medium">FERIADO - ${holiday.name}</span>` : '';
  
  const isCurrentDay = isToday(date) ? ' (HOJE)' : '';
  
  return `${formattedDate} - ${dayName(dayOfWeek)}${holidayInfo}${isCurrentDay}`;
};

// Helper to capitalize day name
const dayName = (day: string): string => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

// Check if time is within business hours
export const isBusinessHours = (date: Date): boolean => {
  const hours = date.getHours();
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Monday to Friday: 7:00-19:00
  if (day >= 1 && day <= 5) {
    return hours >= 7 && hours < 19;
  }
  
  // Saturday: 9:00-13:00
  if (day === 6) {
    return hours >= 9 && hours < 13;
  }
  
  // Sunday: closed
  return false;
};

// Format relative time for display
export const getRelativeTime = (date: Date): string => {
  return formatDistance(date, new Date(), { addSuffix: true, locale: ptBR });
};

// Mask input for date format DD/MM/YYYY
export const maskDateInput = (value: string): string => {
  // Remove non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply mask
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }
};

// Mask input for time format HH:MM
export const maskTimeInput = (value: string): string => {
  // Remove non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply mask
  if (digits.length <= 2) {
    return digits;
  } else {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  }
};

// Validate date format DD/MM/YYYY
export const isValidDateFormat = (value: string): boolean => {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
};

// Validate time format HH:MM
export const isValidTimeFormat = (value: string): boolean => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
};
