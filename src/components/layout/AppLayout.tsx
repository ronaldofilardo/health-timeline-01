
import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, X, CalendarDays, Users, FolderArchive, Settings, Download, Upload, PlusCircle } from 'lucide-react';

export interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-2 sm:px-4">
          <div className="mr-2 sm:mr-4 flex">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="px-2 py-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Menu</h2>
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
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                          location.pathname === item.path
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link 
              to="/" 
              className="flex items-center gap-2 font-semibold truncate text-sm sm:text-base"
            >
              Health Timeline
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-between overflow-x-auto">
            <nav className="hidden md:flex gap-3 sm:gap-6 ml-2 sm:ml-6 overflow-x-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
                    location.pathname === item.path
                      ? "text-foreground font-medium"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-4 sm:py-6 px-2 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{title}</h1>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-3 sm:py-4 mt-auto">
        <div className="container text-center text-xs sm:text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Health Timeline
        </div>
      </footer>
    </div>
  );
}
