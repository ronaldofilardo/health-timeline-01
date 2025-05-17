
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import ProfessionalsManagement from '@/components/professionals/ProfessionalsManagement';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

export default function ProfessionalsPage() {
  const navigate = useNavigate();
  
  // Usar useMemo para evitar renderizações desnecessárias do componente
  const professionalManagement = useMemo(() => <ProfessionalsManagement />, []);
  
  return (
    <AppLayout title="Gerenciar Profissionais">
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
      
      {professionalManagement}
    </AppLayout>
  );
}
