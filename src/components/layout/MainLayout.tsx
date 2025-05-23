
import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X, CalendarDays, Users, FolderArchive, Settings, PlusCircle } from 'lucide-react';

export interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: 'Timeline', path: '/', icon: CalendarDays },
    { label: 'Criar Evento', path: '/event/new', icon: PlusCircle },
    { label: 'Calendário', path: '/calendar', icon: CalendarDays },
    { label: 'Gerenciar Profissionais', path: '/professionals', icon: Users },
    { label: 'Arquivos', path: '/files', icon: FolderArchive },
    { label: 'Backup e Restauração', path: '/backup', icon: Settings },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado com apenas o menu hambúrguer */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-2 sm:px-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <div className="px-2 py-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Health Timeline</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors ${
                          location.pathname === item.path
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-lg font-semibold text-center flex-1">
              {title}
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-4 sm:py-6 px-2 sm:px-4">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">Tudo o que importa em suas mãos!</p>
        </div>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-3 sm:py-4 mt-auto">
        <div className="container text-center text-xs sm:text-sm text-muted-foreground">
          HealthTimeline, {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
