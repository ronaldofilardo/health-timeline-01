
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { HealthProvider } from "@/context/HealthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import EventPage from "./pages/EventPage";
import ProfessionalsPage from "./pages/ProfessionalsPage";
import FilesPage from "./pages/FilesPage";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      
      <Route path="/event/new" element={
        <ProtectedRoute>
          <EventPage />
        </ProtectedRoute>
      } />
      
      <Route path="/event/edit/:id" element={
        <ProtectedRoute>
          <EventPage />
        </ProtectedRoute>
      } />
      
      <Route path="/professionals" element={
        <ProtectedRoute>
          <ProfessionalsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/files" element={
        <ProtectedRoute>
          <FilesPage />
        </ProtectedRoute>
      } />
      
      <Route path="/calendar" element={
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <HealthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </HealthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
