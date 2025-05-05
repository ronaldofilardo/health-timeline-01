
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Health Timeline</h1>
          <p className="mt-2 text-sm text-gray-600">
            Tudo o que importa em suas mãos
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
