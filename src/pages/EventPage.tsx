
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHealth } from '@/context/HealthContext';
import AppLayout from '@/components/layout/AppLayout';
import { format } from 'date-fns';
import { EventForm } from '@/components/events/EventForm';
import { Event } from '@/types';

const EventPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { getEventById } = useHealth();
  
  const isEditMode = Boolean(eventId);
  const [professionalName, setProfessionalName] = useState('');
  const [formData, setFormData] = useState<Partial<Event>>({
    type: 'Consulta',
    professionalId: 0,
    eventDate: format(new Date(), 'dd/MM/yyyy'),
    startTime: format(new Date(), 'HH:mm'),
    endTime: format(new Date(Date.now() + 30 * 60000), 'HH:mm'),
    notes: '',
    recurring: false,
    recurrencePattern: 'weekly',
    recurrenceEndDate: '',
    files: []
  });

  // Load event data when editing
  useEffect(() => {
    // Only attempt to load event data if we're in edit mode and have an eventId
    if (isEditMode && eventId) {
      const eventToEdit = getEventById(parseInt(eventId));
      if (eventToEdit) {
        // Set form data with the exact values from the event
        setFormData({
          type: eventToEdit.type,
          professionalId: eventToEdit.professionalId,
          eventDate: eventToEdit.eventDate,
          startTime: eventToEdit.startTime,
          endTime: eventToEdit.endTime || '',
          notes: eventToEdit.notes || '',
          recurring: eventToEdit.recurring || false,
          recurrencePattern: eventToEdit.recurrencePattern || 'weekly',
          recurrenceEndDate: eventToEdit.recurrenceEndDate || '',
          files: eventToEdit.files || []
        });
        
        // Update related state
        setProfessionalName(eventToEdit.professionalName || '');
      } else {
        navigate('/');
      }
    }
  }, [isEditMode, eventId, getEventById, navigate]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Editar Evento' : 'Novo Evento'}
        </h1>
        
        <EventForm 
          isEdit={isEditMode} 
          initialData={formData}
          professionalName={professionalName}
        />
      </div>
    </AppLayout>
  );
};

export default EventPage;
