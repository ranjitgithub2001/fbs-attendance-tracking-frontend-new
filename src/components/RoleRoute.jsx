import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleToDashboard = {
  ADMIN: '/admin/dashboard',
  TRAINER: '/trainer/dashboard',
  STUDENT: '/student/dashboard',
};

export default function RoleRoute({ children, role }) {
  const { user } = useAuth();

  // Not authenticated -> login
  if (!user) return <Navigate to="/login" replace />;

  // If user's role doesn't match requested role, redirect to their dashboard
  if (user.role !== role) {
    const dest = roleToDashboard[user.role] || '/';
    return <Navigate to={dest} replace />;
  }

  return children;
}
