import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  // If logged in, send to their dashboard instead of allowing public pages like /login
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'TRAINER') return <Navigate to="/trainer/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}
