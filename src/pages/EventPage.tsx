
  // Update the EventPage component to correctly load event data when editing
  
  // Inside the useEffect that fetches event data for editing:
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
