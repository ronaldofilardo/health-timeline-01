
import { useState } from 'react';
import { useHealth } from '@/context/HealthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Eye, Trash2 } from 'lucide-react';
import { FileType } from '@/types';
import { formatDateHeader } from '@/utils/dateUtils';
import FileManagementModal from './FileManagementModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function FileRepository() {
  const { events, holidays, removeAllFilesFromEvent } = useHealth();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isFileManagementOpen, setIsFileManagementOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDeleteFiles, setEventToDeleteFiles] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Get events with files
  const eventsWithFiles = events.filter(event => 
    event.files.some(file => !file.isDeleted)
  );
  
  // Sort events by date
  const sortedEvents = [...eventsWithFiles].sort((a, b) => {
    const [dayA, monthA, yearA] = a.eventDate.split('/').map(Number);
    const [dayB, monthB, yearB] = b.eventDate.split('/').map(Number);
    return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
  });
  
  const handleManageFiles = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsFileManagementOpen(true);
  };

  const handleDeleteFilesClick = (eventId: number) => {
    setEventToDeleteFiles(eventId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteFiles = () => {
    if (eventToDeleteFiles) {
      removeAllFilesFromEvent(eventToDeleteFiles);
      toast({
        title: "Arquivos excluídos",
        description: "Todos os arquivos deste evento foram excluídos com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setEventToDeleteFiles(null);
    }
  };
  
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Repositório de Arquivos</h2>
      
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Não há arquivos cadastrados.</p>
          <p className="text-gray-400 text-sm mt-2">Adicione arquivos aos seus eventos para visualizá-los aqui.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedEvents.map(event => {
            const fileTypes = event.files
              .filter(file => !file.isDeleted)
              .map(file => file.type);
            
            return (
              <Card key={event.id} className={event.isDeleted ? 'border-red-200' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                      {event.type} - {event.professionalName}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFilesClick(event.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir Arquivos
                      </Button>
                      {event.isDeleted && (
                        <span className="text-sm text-red-500 font-normal">
                          Evento deletado em {new Date(event.deletedAt!).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {formatDateHeader(event.eventDate, holidays)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {(['Requisição', 'Autorização', 'Atestado', 'Prescrição', 'Laudo/Resultado', 'Nota Fiscal'] as FileType[]).map(fileType => {
                      const hasFile = fileTypes.includes(fileType);
                      
                      return (
                        <Button
                          key={fileType}
                          variant={hasFile ? 'default' : 'outline'}
                          className={cn(
                            "h-auto py-3 justify-start",
                            hasFile ? 'bg-health-secondary' : 'opacity-50'
                          )}
                          disabled={!hasFile}
                          onClick={() => handleManageFiles(event.id)}
                        >
                          {hasFile ? (
                            <Eye className="h-4 w-4 mr-2" />
                          ) : (
                            <File className="h-4 w-4 mr-2" />
                          )}
                          {fileType}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {selectedEventId !== null && (
        <FileManagementModal
          event={events.find(e => e.id === selectedEventId)!}
          isOpen={isFileManagementOpen}
          onClose={() => {
            setIsFileManagementOpen(false);
            setSelectedEventId(null);
          }}
        />
      )}

      {/* Delete files confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão de arquivos</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir todos os arquivos deste evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteFiles}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper function to conditionally apply classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
