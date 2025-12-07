import React, { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from '@/lib/api';
import { UserResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/router';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
  user?: UserResponse;
  loading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSubmit, user, loading }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [role, setRole] = useState(user?.role || 'USER');

  React.useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
    } else {
      setUsername('');
      setRole('USER');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, role });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Редактировать пользователя' : 'Создать пользователя'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Имя пользователя</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Роль</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Отмена</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : (user ? 'Сохранить' : 'Создать')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const UserManagementPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const { showError } = useNotification();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/'); // Redirect to home or a forbidden page
    }
  }, [isAuthenticated, isAdmin, router]);

  const { data: users, isLoading, error } = useQuery<UserResponse[], Error>(
    'users',
    () => apiClient.getAllUsers(),
    {
      enabled: isAdmin, // Only fetch if admin
      onError: (err: unknown) => {
        console.error('Ошибка загрузки пользователей:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('403')) {
          showError('У вас нет прав для просмотра пользователей.');
          router.push('/');
        }
      }
    }
  );

  const updateUserMutation = useMutation(
    ({ userId, userData }: { userId: number; userData: any }) => apiClient.updateUser(userId, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setEditingUser(null);
      },
      onError: (err: any) => {
        console.error('Ошибка обновления пользователя:', err);
        if (err.response?.status === 403) {
          showError('У вас нет прав для редактирования пользователей.');
        } else {
          showError('Произошла ошибка при обновлении пользователя.');
        }
      },
    }
  );

  const deleteUserMutation = useMutation(
    (userId: number) => apiClient.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setDeletingUser(null);
      },
      onError: (err: any) => {
        console.error('Ошибка удаления пользователя:', err);
        if (err.response?.status === 403) {
          showError('У вас нет прав для удаления пользователей.');
        } else {
          showError('Произошла ошибка при удалении пользователя.');
        }
      },
    }
  );

  const handleUpdateUser = (userData: any) => {
    if (editingUser) {
      updateUserMutation.mutate({ userId: editingUser.id, userData });
    }
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return <LoadingSpinner />; // Show spinner while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Управление пользователями</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
          <Button onClick={() => setShowCreateForm(true)}>
            ➕ Добавить пользователя
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-600">Ошибка: {error instanceof Error ? error.message : String(error)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users?.map((u) => (
              <Card key={u.id} className="flex justify-between items-center p-4">
                <div>
                  <h2 className="text-lg font-semibold">{u.username}</h2>
                  <p className="text-xs text-gray-500">Роль: {u.role}</p>
                  <p className="text-xs text-gray-400">ID: {u.id}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingUser(u)}>
                    ✏️
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeletingUser(u)}>
                    🗑️
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit User Form */}
        <UserForm
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
          user={editingUser || undefined}
          loading={updateUserMutation.isLoading}
        />

        {/* Create User Form (reusing UserForm) */}
        <UserForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={(userData) => {
            // For creation, we need to call registerAdmin or register based on role
            // This form is for updating existing users, so we'll simplify for now
            // A separate form for creation might be better, or add password field
            showError('Создание пользователя через эту форму пока не реализовано. Используйте /register или /register-admin.');
            setShowCreateForm(false);
          }}
          loading={false} // No actual creation mutation here
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          title="Удалить пользователя"
        >
          <p>Вы уверены, что хотите удалить пользователя "{deletingUser?.username}"?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeletingUser(null)} disabled={deleteUserMutation.isLoading}>
              Отмена
            </Button>
            <Button variant="danger" onClick={handleDeleteUser} disabled={deleteUserMutation.isLoading}>
              {deleteUserMutation.isLoading ? <LoadingSpinner /> : 'Удалить'}
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default UserManagementPage;
