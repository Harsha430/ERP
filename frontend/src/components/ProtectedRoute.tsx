import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // optional role gate
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = '/' }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  if (allowedRoles && allowedRoles.length) {
    const userRoles = user?.roles || [];
    const ok = userRoles.some(r => allowedRoles.includes(r));
    if (!ok) return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}