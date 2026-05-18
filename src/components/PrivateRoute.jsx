import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  // Not authenticated -> send to login
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
