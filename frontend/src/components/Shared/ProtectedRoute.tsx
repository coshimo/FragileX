import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, usuario } = useAuth();
  const location = useLocation();

  if (!token || !usuario) {
    // Redireciona para o login e salva a localização de onde o usuário tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
