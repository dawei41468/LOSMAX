import { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ConfirmDeleteDialog from '../ui/ConfirmDeleteDialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { logout } from '../../services/auth';
import { Trash2, Edit, Search, RefreshCw, Mail } from 'lucide-react';
import { Select, SelectItem } from '@/components/ui/select';
import { useAdminUsers, useAdminUserDetails, useDeleteAdminUser, useUpdateAdminUserRole } from '../../hooks/useAdmin';
import { AUTH_ROUTE } from '../../routes/constants';

interface Preferences {
  morning_deadline: string;
  evening_deadline: string;
  notifications_enabled: boolean;
  language: string;
}

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  language?: string;
  preferences?: Preferences;
};

const ITEMS_PER_PAGE = 10;

export function UserManagement() {
  const { setAuthState } = useAuth();
  const { error: toastError } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // UI spinner while first query loads
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('user');
  const [userDetailsId, setUserDetailsId] = useState<string | undefined>(undefined);

  // Queries & Mutations
  const usersQuery = useAdminUsers({ page: currentPage, limit: ITEMS_PER_PAGE, search: searchQuery || undefined, role: roleFilter });
  const users: User[] = usersQuery.data?.users ?? [];
  const deleteUserMutation = useDeleteAdminUser();
  const updateUserRoleMutation = useUpdateAdminUserRole();
  const userDetailsQuery = useAdminUserDetails(userDetailsId);

  useEffect(() => {
    // Tie UI loading to the initial query load
    setLoading(usersQuery.isLoading && users.length === 0);
  }, [usersQuery.isLoading, users.length]);

  const handleDelete = async (userId: string) => {
    try {
      setIsDeleting(true);
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toastError('toast.error.userManagement.deleteUser');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    // Pre-populate with what we already have
    setUserDetailsId(user.id);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await updateUserRoleMutation.mutateAsync({ userId: editingUser.id, role: selectedRole });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update user:', error);
      toastError('toast.error.userManagement.updateUser');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {isEditDialogOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div className="bg-card p-6 rounded-lg w-full max-w-md" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}>
            <h3 className="text-lg font-medium mb-4">Edit User</h3>
            {userDetailsQuery.isLoading ? (
              <div className="flex justify-center items-center h-32">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading details...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    type="text"
                    value={editingUser.id}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={userDetailsQuery.data?.name || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <Select
                    variant="subtle"
                    size="sm"
                    value={selectedRole}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRole(e.target.value)}
                    className="min-w-[100px]"
                  >
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <input
                    type="text"
                    value={userDetailsQuery.data?.language || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Morning Deadline</label>
                  <input
                    type="text"
                    value={userDetailsQuery.data?.preferences?.morning_deadline || 'Not set'}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Evening Deadline</label>
                  <input
                    type="text"
                    value={userDetailsQuery.data?.preferences?.evening_deadline || 'Not set'}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notifications</label>
                  <input
                    type="text"
                    value={userDetailsQuery.data?.preferences?.notifications_enabled ? 'Enabled' : 'Disabled'}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setIsEditDialogOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 border rounded"
            onClick={async () => {
              await logout(setAuthState);
              navigate(AUTH_ROUTE);
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search users..."
              className="pl-9 border rounded p-2 w-full"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <Select
            variant="subtle"
            size="sm"
            value={roleFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value)}
            className="min-w-[120px]"
          >
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </Select>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading users...</span>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 bg-gray-100 p-3 font-medium text-sm">
              <div className="col-span-4">User</div>
              <div className="col-span-3 hidden md:block">Role</div>
              <div className="col-span-5 text-right">Actions</div>
            </div>
            
            {users.map(user => (
              <div key={user.id} className="grid grid-cols-12 gap-4 p-3 border-t items-center">
                <div className="col-span-4">
                  <div className="font-medium">{user.name || 'No name'}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                
                <div className="col-span-3 hidden md:block">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="col-span-5 flex justify-end space-x-2">
                  <button
                   className="p-2 hover:bg-gray-100 rounded"
                   onClick={() => handleEditClick(user)}
                 >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded"
                    onClick={() => {}}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded text-red-600 hover:text-red-700"
                    onClick={() => {
                      setUserToDelete(user);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
        
              </div>
            ))}
          </div>
        )}

        <ConfirmDeleteDialog
          isOpen={isDeleteDialogOpen}
          itemName={userToDelete?.email || ''}
          onConfirm={() => userToDelete && handleDelete(userToDelete.id)}
          onClose={() => setIsDeleteDialogOpen(false)}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}