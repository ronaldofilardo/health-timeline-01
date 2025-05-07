
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HealthProvider } from './context/HealthContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import CalendarPage from './pages/CalendarPage';
import FilesPage from './pages/FilesPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import EventPage from './pages/EventPage';
import BackupRestorePage from './pages/BackupRestorePage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <HealthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/professionals" element={<ProfessionalsPage />} />
            <Route path="/event/new" element={<EventPage />} />
            <Route path="/event/edit/:id" element={<EventPage />} />
            <Route path="/backup" element={<BackupRestorePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </HealthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
