
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import EventForm from '@/components/events/EventForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  return (
    <AppLayout title={isEditMode ? "Editar Evento" : "Criar Evento"}>
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
      
      <EventForm />
    </AppLayout>
  );
}
