
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Event, FileType } from '@/types';
import { useHealth } from '@/context/HealthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, Eye, Trash2, Check } from 'lucide-react';
import { validateFile } from '@/utils/validationUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface FileManagementModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileManagementModal({ event, isOpen, onClose }: FileManagementModalProps) {
  const { addFileToEvent, removeFileFromEvent } = useHealth();
  const { toast } = useToast();
  const [fileToDelete, setFileToDelete] = useState<{ id: number; type: FileType } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fileTypes: FileType[] = [
    'Requisição', 
    'Autorização', 
    'Atestado', 
    'Prescrição', 
    'Laudo/Resultado', 
    'Nota Fiscal'
  ];

  // Modified to only get files for this specific event
  const getFileByType = (type: FileType) => {
    return event.files.find(file => file.type === type && !file.isDeleted);
  };

  const handleFileChange = async (type: FileType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "Erro no arquivo",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Create a unique file path using the event ID and timestamp to avoid duplicates
    const timestamp = new Date().getTime();
    const fakePath = URL.createObjectURL(file) + `?eventId=${event.id}&timestamp=${timestamp}`;
    
    // Add file to this specific event
    addFileToEvent(event.id, type, fakePath);
    
    toast({
      title: "Arquivo salvo",
      description: `Arquivo ${type} salvo com sucesso`,
    });
  };

  const handleDeleteFile = (fileId: number, type: FileType) => {
    setFileToDelete({ id: fileId, type });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteFile = () => {
    if (fileToDelete) {
      removeFileFromEvent(event.id, fileToDelete.id);
      toast({
        title: "Arquivo removido",
        description: `Arquivo ${fileToDelete.type} foi removido com sucesso`,
      });
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleViewFile = (path: string) => {
    // In a real application, we would open the file
    // For now, we'll just open the URL
    window.open(path, '_blank');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Arquivos</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {event.isDeleted && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
                Evento deletado em {new Date(event.deletedAt!).toLocaleDateString('pt-BR')}
              </div>
            )}
            
            {fileTypes.map(type => {
              const existingFile = getFileByType(type);
              
              return (
                <div key={type} className="border rounded-md p-3">
                  <h3 className="font-medium mb-2">{type}</h3>
                  
                  {existingFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm truncate max-w-[150px]">
                          Arquivo salvo
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFile(existingFile.path)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFile(existingFile.id, type)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor={`file-${type}-${event.id}`}>
                        <div className="flex items-center justify-center px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                          <Upload className="h-4 w-4 mr-2" />
                          <span className="text-sm">Selecionar Arquivo</span>
                        </div>
                        <input
                          type="file"
                          id={`file-${type}-${event.id}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(type, e)}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPEG ou PNG. Máx. 5MB
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este arquivo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
