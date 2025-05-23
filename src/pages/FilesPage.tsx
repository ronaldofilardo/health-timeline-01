
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import FileRepository from '@/components/files/FileRepository';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function FilesPage() {
  const navigate = useNavigate();
  
  return (
    <MainLayout title="Repositório de Arquivos">
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
      
      <FileRepository />
    </MainLayout>
  );
}
