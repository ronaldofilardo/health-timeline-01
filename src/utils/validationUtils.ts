
import { parseDate, parseTime, isBusinessHours, isWeekendOrHoliday } from './dateUtils';
import { Event, Holiday, EventType } from '@/types';

// Validate required fields are present
export const validateRequiredFields = (fields: Record<string, any>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      errors[key] = 'Campo obrigatório';
    }
  });
  
  return errors;
};

// Validate date format and constraints
export const validateDate = (
  dateString: string, 
  holidays: Holiday[]
): { isValid: boolean; error?: string; warning?: string } => {
  if (!dateString) {
    return { isValid: false, error: 'Campo obrigatório' };
  }
  
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return { isValid: false, error: 'Data inválida. Use DD/MM/YYYY, ex.: 06/05/2025' };
  }
  
  const date = parseDate(dateString);
  if (!date) {
    return { isValid: false, error: 'Data inválida. Use DD/MM/YYYY, ex.: 06/05/2025' };
  }
  
  // Check for past date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return { 
      isValid: true, 
      warning: 'Eventos passados não podem ser editados/deletados'
    };
  }
  
  // Check for weekend or holiday
  const offDayCheck = isWeekendOrHoliday(date, holidays);
  if (offDayCheck.isOff) {
    return { 
      isValid: true, 
      warning: `Evento em ${offDayCheck.reason}. Confirme para prosseguir.`
    };
  }
  
  return { isValid: true };
};

// Validate time format and constraints
export const validateTime = (
  startTimeString: string,
  endTimeString: string | null,
  eventType: EventType,
  dateString: string
): { 
  startTimeValid: boolean; 
  endTimeValid: boolean;
  startTimeError?: string;
  endTimeError?: string;
  warning?: string; 
} => {
  const result = {
    startTimeValid: true,
    endTimeValid: true,
    startTimeError: undefined,
    endTimeError: undefined,
    warning: undefined
  };
  
  // Validate start time
  if (!startTimeString) {
    result.startTimeValid = false;
    result.startTimeError = 'Campo obrigatório';
    return result;
  }
  
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTimeString)) {
    result.startTimeValid = false;
    result.startTimeError = 'Hora inválida. Use HH:MM, ex.: 14:30';
    return result;
  }
  
  // Check if end time is required
  const needsEndTime = eventType !== 'Prescrição';
  
  // Validate end time if needed
  if (needsEndTime) {
    if (!endTimeString) {
      result.endTimeValid = false;
      result.endTimeError = 'Hora de fim é obrigatória';
      return result;
    }
    
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(endTimeString)) {
      result.endTimeValid = false;
      result.endTimeError = 'Hora inválida. Use HH:MM, ex.: 15:30';
      return result;
    }
  }
  
  // Validate time constraints
  const date = parseDate(dateString);
  if (!date) return result;
  
  const startTime = parseTime(startTimeString, date);
  if (!startTime) return result;
  
  // Check business hours for start time
  if (!isBusinessHours(startTime)) {
    result.warning = 'Evento fora do horário comercial. Confirme.';
  }
  
  // Additional validations for end time
  if (needsEndTime && endTimeString) {
    const endTime = parseTime(endTimeString, date);
    if (!endTime) return result;
    
    // Check business hours for end time
    if (!isBusinessHours(endTime) && !result.warning) {
      result.warning = 'Evento fora do horário comercial. Confirme.';
    }
    
    // Check end time is after start time
    if (endTime <= startTime) {
      result.endTimeValid = false;
      result.endTimeError = 'Hora de fim deve ser posterior à hora de início';
      return result;
    }
  }
  
  return result;
};

// Check for event overlaps
export const checkEventOverlaps = (
  newEvent: Partial<Event>, 
  existingEvents: Event[]
): { hasOverlap: boolean; message?: string } => {
  if (!newEvent.eventDate || !newEvent.startTime) {
    return { hasOverlap: false };
  }
  
  // Filter events for the same day
  const eventsOnSameDay = existingEvents.filter(event => 
    event.eventDate === newEvent.eventDate && 
    !event.isDeleted &&
    (newEvent.id === undefined || event.id !== newEvent.id)
  );
  
  if (eventsOnSameDay.length === 0) {
    return { hasOverlap: false };
  }
  
  const date = parseDate(newEvent.eventDate);
  if (!date) return { hasOverlap: false };
  
  const startTime = parseTime(newEvent.startTime, date);
  if (!startTime) return { hasOverlap: false };
  
  let endTime;
  if (newEvent.endTime) {
    endTime = parseTime(newEvent.endTime, date);
  } else {
    // For prescriptions, assume 1 hour duration
    endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
  }
  
  // Special case for prescriptions (just log overlaps, don't prevent)
  if (newEvent.type === 'Prescrição') {
    return { hasOverlap: false };
  }
  
  // Check for direct overlaps (same location)
  const directOverlaps = eventsOnSameDay.filter(event => {
    if (event.type === 'Prescrição') return false; // Prescriptions don't cause direct overlaps
    
    const eventStart = parseTime(event.startTime, date);
    const eventEnd = event.endTime ? parseTime(event.endTime, date) : null;
    
    if (!eventStart || !eventEnd) return false;
    
    // Check if locations are the same
    const sameLocation = newEvent.locationName === event.locationName;
    
    // Direct overlap: same location and overlapping times
    return sameLocation && (startTime < eventEnd && endTime! > eventStart);
  });
  
  if (directOverlaps.length > 0) {
    const overlap = directOverlaps[0];
    return { 
      hasOverlap: true, 
      message: `Conflito: Evento "${overlap.type} - ${overlap.professionalName}" 
        às ${overlap.startTime} no mesmo local (${overlap.locationName})`
    };
  }
  
  // Check for interval constraints between different locations
  const intervalViolations = eventsOnSameDay.filter(event => {
    if (event.type === 'Prescrição') return false; // Prescriptions don't cause interval violations
    
    const eventStart = parseTime(event.startTime, date);
    const eventEnd = event.endTime ? parseTime(event.endTime, date) : null;
    
    if (!eventStart || !eventEnd) return false;
    
    // Check if locations are different
    const differentLocation = newEvent.locationName !== event.locationName;
    
    if (differentLocation) {
      // Calculate buffer times
      const oneHourBeforeEventStart = new Date(eventStart);
      oneHourBeforeEventStart.setHours(oneHourBeforeEventStart.getHours() - 1);
      
      const oneHourAfterEventEnd = new Date(eventEnd);
      oneHourAfterEventEnd.setHours(oneHourAfterEventEnd.getHours() + 1);
      
      // New event starts during the 1-hour period before another event
      const newEventStartsInBuffer = startTime >= oneHourBeforeEventStart && startTime <= eventStart;
      
      // New event ends during the 1-hour period after another event
      const newEventEndsInBuffer = endTime! >= eventEnd && endTime! <= oneHourAfterEventEnd;
      
      // New event spans over another event's buffer time
      const newEventSpansBuffer = startTime <= oneHourBeforeEventStart && endTime! >= eventStart;
      
      // New event start time falls within the existing event plus its buffer
      const startsDuringEventOrBuffer = startTime >= oneHourBeforeEventStart && startTime <= oneHourAfterEventEnd;
      
      // New event end time falls within the existing event plus its buffer
      const endsDuringEventOrBuffer = endTime! >= oneHourBeforeEventStart && endTime! <= oneHourAfterEventEnd;
      
      // New event completely encloses the existing event and its buffers
      const enclosesEventAndBuffer = startTime <= oneHourBeforeEventStart && endTime! >= oneHourAfterEventEnd;
      
      return newEventStartsInBuffer || newEventEndsInBuffer || newEventSpansBuffer || 
             startsDuringEventOrBuffer || endsDuringEventOrBuffer || enclosesEventAndBuffer;
    }
    
    return false;
  });
  
  if (intervalViolations.length > 0) {
    const violation = intervalViolations[0];
    return { 
      hasOverlap: true, 
      message: `Necessário intervalo de 1 hora entre eventos em locais diferentes.
        Evento "${violation.type} - ${violation.professionalName}" às ${violation.startTime}`
    };
  }
  
  return { hasOverlap: false };
};

// Validate file type and size
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Arquivo inválido. Use PDF, JPEG ou PNG'
    };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'Arquivo muito grande. Tamanho máximo: 5MB'
    };
  }
  
  return { isValid: true };
};
