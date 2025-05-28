import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Loading from '../ui/Loading';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login', { 
        replace: true,
        state: { from: window.location.pathname } 
      });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <Loading message="Authenticating..." />;
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;