import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Event, Professional, Specialty, Location, Holiday, EventType, FileType, EventStatus } from '@/types';
import { format, addHours, parseISO, isToday, isPast, isFuture } from 'date-fns';

interface HealthContextType {
  events: Event[];
  professionals: Professional[];
  specialties: Specialty[];
  locations: Location[];
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
  addEvent: (event: Omit<Event, 'id' | 'status'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: number) => void;
  addProfessional: (professional: Omit<Professional, 'id'>) => void;
  updateProfessional: (professional: Professional) => void;
  deleteProfessional: (professionalId: number) => void;
  addSpecialty: (name: string) => void;
  addLocation: (name: string) => void;
  confirmEvent: (eventId: number) => void;
  getEventById: (eventId: number) => Event | undefined;
  getProfessionalById: (professionalId: number) => Professional | undefined;
  getEventStatus: (event: Event) => EventStatus;
  addFileToEvent: (eventId: number, fileType: FileType, path: string) => void;
  removeFileFromEvent: (eventId: number, fileId: number) => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

// Mock data for the MVP
const mockEvents: Event[] = [];
const mockProfessionals: Professional[] = [
  {
    id: 1,
    name: 'Dr. João Silva',
    specialtyId: 1,
    specialtyName: 'Cardiologia',
    locationId: 1,
    locationName: 'Hospital São Lucas',
    isDeleted: false
  },
  {
    id: 2,
    name: 'Dra. Maria Souza',
    specialtyId: 2,
    specialtyName: 'Neurologia',
    locationId: 2,
    locationName: 'Clínica Vida',
    isDeleted: false
  }
];
const mockSpecialties: Specialty[] = [
  { id: 1, name: 'Cardiologia' },
  { id: 2, name: 'Neurologia' },
  { id: 3, name: 'Ortopedia' }
];
const mockLocations: Location[] = [
  { id: 1, name: 'Hospital São Lucas' },
  { id: 2, name: 'Clínica Vida' },
  { id: 3, name: 'Consultório Dr. Silva' }
];
const mockHolidays: Holiday[] = [
  { id: 1, date: '2025-01-01', name: 'Ano Novo', isRecurring: true },
  { id: 2, date: '2025-05-01', name: 'Dia do Trabalho', isRecurring: true },
  { id: 3, date: '2025-09-07', name: 'Independência do Brasil', isRecurring: true },
  { id: 4, date: '2025-12-25', name: 'Natal', isRecurring: true },
];

export function HealthProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [specialties, setSpecialties] = useState<Specialty[]>(mockSpecialties);
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to determine event status
  const getEventStatus = (event: Event): EventStatus => {
    // Convert string dates to Date objects
    const [day, month, year] = event.eventDate.split('/').map(Number);
    const eventDate = new Date(year, month - 1, day);
    
    const startTimeParts = event.startTime.split(':').map(Number);
    const eventStart = new Date(eventDate);
    eventStart.setHours(startTimeParts[0], startTimeParts[1], 0);
    
    let eventEnd;
    if (event.endTime) {
      const endTimeParts = event.endTime.split(':').map(Number);
      eventEnd = new Date(eventDate);
      eventEnd.setHours(endTimeParts[0], endTimeParts[1], 0);
    } else {
      // For prescriptions without end time
      eventEnd = null;
    }
    
    const now = new Date();

    // Check if event is ongoing
    if (eventEnd && now >= eventStart && now <= eventEnd) {
      return 'ongoing';
    }
    
    // Check if event is in the past
    if (eventEnd && now > eventEnd) {
      return 'past';
    }
    
    if (!eventEnd && now > addHours(eventStart, 1)) {
      return 'past';
    }
    
    // Check if event is today but not ongoing
    if (isToday(eventDate) && now < eventStart) {
      return 'today';
    }
    
    // Otherwise it's a future event
    return 'future';
  };

  // Add a new event
  const addEvent = (eventData: Omit<Event, 'id' | 'status'>) => {
    const newEvent: Event = {
      ...eventData,
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      status: getEventStatus({ ...eventData, id: 0, status: 'future' } as Event)
    };
    setEvents([...events, newEvent]);
  };

  // Update an existing event
  const updateEvent = (updatedEvent: Event) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? 
        { ...updatedEvent, status: getEventStatus(updatedEvent) } : 
        event
    ));
  };

  // Delete an event
  const deleteEvent = (eventId: number) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (eventToDelete) {
      const updatedEvent = { 
        ...eventToDelete, 
        isDeleted: true, 
        deletedAt: new Date().toISOString() 
      };
      setEvents(events.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
    }
  };

  // Add a new professional
  const addProfessional = (professionalData: Omit<Professional, 'id'>) => {
    const newProfessional: Professional = {
      ...professionalData,
      id: professionals.length > 0 ? Math.max(...professionals.map(p => p.id)) + 1 : 1
    };
    setProfessionals([...professionals, newProfessional]);
  };

  // Update an existing professional
  const updateProfessional = (updatedProfessional: Professional) => {
    setProfessionals(professionals.map(professional => 
      professional.id === updatedProfessional.id ? updatedProfessional : professional
    ));
    
    // Update professional name in events
    setEvents(events.map(event => 
      event.professionalId === updatedProfessional.id ? 
        { ...event, professionalName: updatedProfessional.name } : 
        event
    ));
  };

  // Delete a professional
  const deleteProfessional = (professionalId: number) => {
    setProfessionals(professionals.map(professional => 
      professional.id === professionalId ? 
        { ...professional, isDeleted: true } : 
        professional
    ));
  };

  // Add a new specialty
  const addSpecialty = (name: string) => {
    const exists = specialties.some(specialty => 
      specialty.name.toLowerCase() === name.toLowerCase()
    );
    
    if (!exists) {
      const newSpecialty: Specialty = {
        id: specialties.length > 0 ? Math.max(...specialties.map(s => s.id)) + 1 : 1,
        name
      };
      setSpecialties([...specialties, newSpecialty]);
      return newSpecialty.id;
    }
    
    return specialties.find(s => 
      s.name.toLowerCase() === name.toLowerCase()
    )?.id;
  };

  // Add a new location
  const addLocation = (name: string) => {
    const exists = locations.some(location => 
      location.name.toLowerCase() === name.toLowerCase()
    );
    
    if (!exists) {
      const newLocation: Location = {
        id: locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1,
        name
      };
      setLocations([...locations, newLocation]);
      return newLocation.id;
    }
    
    return locations.find(l => 
      l.name.toLowerCase() === name.toLowerCase()
    )?.id;
  };

  // Confirm an event
  const confirmEvent = (eventId: number) => {
    setEvents(events.map(event => 
      event.id === eventId ? 
        { ...event, isConfirmed: true } : 
        event
    ));
  };

  // Add a file to an event
  const addFileToEvent = (eventId: number, fileType: FileType, path: string) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        const newFile = {
          id: event.files.length > 0 ? Math.max(...event.files.map(f => f.id)) + 1 : 1,
          eventId,
          type: fileType,
          path,
          uuid: crypto.randomUUID(),
          isDeleted: false
        };
        
        return {
          ...event,
          files: [...event.files, newFile]
        };
      }
      return event;
    });
    
    setEvents(updatedEvents);
  };

  // Remove a file from an event
  const removeFileFromEvent = (eventId: number, fileId: number) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          files: event.files.map(file => 
            file.id === fileId ? { ...file, isDeleted: true } : file
          )
        };
      }
      return event;
    });
    
    setEvents(updatedEvents);
  };

  // Get an event by ID
  const getEventById = (eventId: number) => {
    return events.find(event => event.id === eventId);
  };

  // Get a professional by ID
  const getProfessionalById = (professionalId: number) => {
    return professionals.find(professional => professional.id === professionalId);
  };

  // Update event status periodically
  useEffect(() => {
    const updateEventStatuses = () => {
      setEvents(prevEvents => 
        prevEvents.map(event => ({
          ...event,
          status: getEventStatus(event)
        }))
      );
    };

    // Update initially
    updateEventStatuses();
    
    // Update every minute
    const intervalId = setInterval(updateEventStatuses, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <HealthContext.Provider value={{
      events,
      professionals,
      specialties,
      locations,
      holidays,
      loading,
      error,
      addEvent,
      updateEvent,
      deleteEvent,
      addProfessional,
      updateProfessional,
      deleteProfessional,
      addSpecialty,
      addLocation,
      confirmEvent,
      getEventById,
      getProfessionalById,
      getEventStatus,
      addFileToEvent,
      removeFileFromEvent
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
