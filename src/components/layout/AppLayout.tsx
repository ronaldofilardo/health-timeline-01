
import { useState, ReactNode } from 'react';
import { Menu, X, Calendar, Users, FilePlus, Settings, LogOut, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AppLayout({ children, title = "Health Timeline" }: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <div className="py-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/event/new')}
                    >
                      <FilePlus className="mr-2 h-5 w-5" />
                      Criar Evento
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/professionals')}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Profissionais
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/files')}
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      Repositório de Arquivos
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/calendar')}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Calendário
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start opacity-50"
                      disabled
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Configurações
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Sair
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="hidden md:flex md:items-center">
              <Button
                variant="ghost"
                className="p-2"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <h1 className="text-xl font-bold">
              {title || "Health Timeline – Tudo o que importa em suas mãos"}
            </h1>
          </div>
          
          {location.pathname === '/' && (
            <Button
              onClick={() => navigate('/event/new')}
              className="bg-health-primary hover:bg-green-600 text-white"
            >
              <FilePlus className="mr-2 h-5 w-5" />
              Criar Evento
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
