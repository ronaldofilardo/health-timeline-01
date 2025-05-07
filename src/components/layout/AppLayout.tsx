
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import { Menu, X, CalendarDays, Users, FolderArchive, Settings, Download, Upload } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useMobile();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };
  
  const handleSignOut = () => {
    navigate('/login');
    toast({
      title: 'Sessão encerrada',
      description: 'Você foi desconectado da sua conta.'
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar for desktop and overlay menu for mobile */}
      <div
        className={`${
          isMobile
            ? `fixed inset-0 z-50 transform ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out`
            : "relative w-64 min-w-64"
        } bg-white border-r border-gray-200 pt-16`}
      >
        {isMobile && (
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-gray-500"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="px-4 py-6">
          <h2 className="text-xl font-semibold mb-6 px-4">Menu</h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={() => handleNavigate('/')}
            >
              <FolderArchive className="h-5 w-5 mr-3" />
              <span>Timeline</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={() => handleNavigate('/calendar')}
            >
              <CalendarDays className="h-5 w-5 mr-3" />
              <span>Calendário</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={() => handleNavigate('/professionals')}
            >
              <Users className="h-5 w-5 mr-3" />
              <span>Profissionais</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={() => handleNavigate('/files')}
            >
              <FolderArchive className="h-5 w-5 mr-3" />
              <span>Arquivos</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={() => handleNavigate('/backup')}
            >
              <Download className="h-5 w-5 mr-3" />
              <span>Backup e Restauração</span>
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 opacity-50 cursor-not-allowed"
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Configurações</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600"
              onClick={handleSignOut}
            >
              <X className="h-5 w-5 mr-3" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
          <div>{/* Placeholder for right-aligned content */}</div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}
    </div>
  );
}
