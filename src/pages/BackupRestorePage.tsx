
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHealth } from '@/context/HealthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Upload, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BackupRestorePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { exportData, importData, events } = useHealth();
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'ready' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [includeFiles, setIncludeFiles] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExportData = () => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      link.download = `health-timeline-backup-${formattedDate}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      setExportStatus('success');
      
      toast({
        title: "Backup realizado com sucesso",
        description: "Os dados foram exportados para um arquivo JSON.",
      });
    } catch (error) {
      setExportStatus('error');
      toast({
        title: "Erro ao exportar dados",
        description: "Ocorreu um problema ao gerar o arquivo de backup.",
        variant: "destructive",
      });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImportFile(event.target.files[0]);
      setImportStatus('ready');
    }
  };
  
  const handleImportData = () => {
    if (!importFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo JSON para importar.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const result = importData(jsonData);
        
        if (result.success) {
          setImportStatus('success');
          setImportMessage(result.message);
          toast({
            title: "Importação concluída",
            description: result.message,
          });
        } else {
          setImportStatus('error');
          setImportMessage(result.message);
          toast({
            title: "Erro na importação",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        setImportStatus('error');
        setImportMessage((error as Error).message);
        toast({
          title: "Erro na importação",
          description: "O arquivo selecionado não é um backup válido.",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      setImportStatus('error');
      setImportMessage("Erro ao ler o arquivo.");
      toast({
        title: "Erro na importação",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive",
      });
    };
    
    reader.readAsText(importFile);
  };
  
  const handleFileBackup = () => {
    // Esta seria uma implementação futura para backup de arquivos
    toast({
      title: "Em desenvolvimento",
      description: "O backup de arquivos será implementado em uma versão futura.",
    });
  };
  
  // Calculate statistics
  const eventsCount = events.filter(event => !event.isDeleted).length;
  const filesCount = events.reduce((count, event) => {
    return count + event.files.filter(file => !file.isDeleted).length;
  }, 0);
  
  return (
    <AppLayout title="Backup e Restauração">
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
      
      <div className="space-y-6">
        <Tabs defaultValue="backup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="restore">Restauração</TabsTrigger>
          </TabsList>
          
          <TabsContent value="backup" className="space-y-4 mt-4">
            <Alert className="bg-blue-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                O backup de dados inclui todos os seus eventos, profissionais e configurações. 
                Os arquivos devem ser gerenciados separadamente.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Backup de Dados</CardTitle>
                  <CardDescription>
                    Exporte todos os eventos e profissionais para um arquivo JSON
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-deleted" 
                        checked={includeFiles} 
                        onCheckedChange={(checked) => setIncludeFiles(!!checked)}
                      />
                      <Label htmlFor="include-deleted">Incluir eventos deletados</Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleExportData} 
                    className="w-full"
                    variant="default"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Backup de Arquivos</CardTitle>
                  <CardDescription>
                    Faça cópias de todos os arquivos vinculados aos eventos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Total de arquivos: {filesCount} ({eventsCount} eventos)
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleFileBackup} 
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Backup de Arquivos
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {exportStatus === 'success' && (
              <Alert className="bg-green-50">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>Backup concluído com sucesso</AlertTitle>
                <AlertDescription>
                  Seus dados foram exportados para um arquivo JSON. Guarde este arquivo em um local seguro.
                </AlertDescription>
              </Alert>
            )}
            
            {exportStatus === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro no backup</AlertTitle>
                <AlertDescription>
                  Ocorreu um erro ao exportar seus dados. Por favor tente novamente.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="restore" className="space-y-4 mt-4">
            <Alert className="bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                A restauração importará dados sem substituir os existentes. 
                Eventos e profissionais duplicados serão tratados automaticamente.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Restaurar Dados</CardTitle>
                <CardDescription>
                  Importe eventos e profissionais de um backup JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    style={{ display: 'none' }}
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar arquivo de backup
                  </Button>
                  
                  {importFile && (
                    <div className="mt-2 text-sm">
                      Arquivo selecionado: <span className="font-medium">{importFile.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleImportData} 
                  disabled={importStatus !== 'ready'}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Restaurar Dados
                </Button>
              </CardFooter>
            </Card>
            
            {importStatus === 'success' && (
              <Alert className="bg-green-50">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>Restauração concluída</AlertTitle>
                <AlertDescription>{importMessage}</AlertDescription>
              </Alert>
            )}
            
            {importStatus === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro na restauração</AlertTitle>
                <AlertDescription>{importMessage}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
