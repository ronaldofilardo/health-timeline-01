
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HealthProvider } from './context/HealthContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="/files" element={
              <ProtectedRoute>
                <FilesPage />
              </ProtectedRoute>
            } />
            <Route path="/professionals" element={
              <ProtectedRoute>
                <ProfessionalsPage />
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
            <Route path="/backup" element={
              <ProtectedRoute>
                <BackupRestorePage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </HealthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
