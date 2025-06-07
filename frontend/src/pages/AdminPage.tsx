import { useContext } from 'react';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { useNavigate } from 'react-router-dom';
import { UserManagement } from '../components/dashboard/UserManagement';

export default function AdminPage() {
  const { isAuthenticated, userRole } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();

  if (isAuthenticated === false) {
    navigate('/auth', { replace: true });
    return null;
  }

  if (isAuthenticated === null) {
    return <div className="p-6">Loading admin panel...</div>;
  }

  if (userRole?.toLowerCase() !== 'admin' && userRole?.toLowerCase() !== 'superadmin') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <UserManagement />
    </div>
  );
}