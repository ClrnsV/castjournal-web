import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';  

export function AdminRoute() {
  const { user } = useAuth();
  if (!user?.roles.includes('Admin')) return <Navigate to="/" replace />;
  return <Outlet />;
}