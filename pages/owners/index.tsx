import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
// Иконки заменены на эмодзи
import { apiClient } from '@/lib/api';
import { OwnerResponse, OwnerCreate, OwnerUpdate } from '@/types/api';
import { getInitials } from '@/lib/utils';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useDataRefresh } from '@/hooks/useDataRefresh';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CardHeader, CardBody } from '@/components/ui/Card';
import OwnerCard from '@/components/owners/OwnerCard';
import OwnerForm from '@/components/owners/OwnerForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { GetServerSideProps } from 'next';

// Отключаем статическую генерацию для этой страницы
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function OwnersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAdmin, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showError } = useNotification();
  
  // Все хуки должны быть вызваны до любых условных возвратов
  useDataRefresh();
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<OwnerResponse | null>(null);
  const [deletingOwner, setDeletingOwner] = useState<OwnerResponse | null>(null);
  const [searchTerm, setSearchTerm] = usePersistedState('ownersSearchTerm', '');
  
  // ПРИНУДИТЕЛЬНО СКРЫВАЕМ КНОПКИ ДЛЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ КРОМЕ ADMIN
  const isReallyAdmin = isAuthenticated && user?.role === 'ADMIN';
  
  // Перенаправление на клиенте через useEffect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);
  
  // ПРИНУДИТЕЛЬНАЯ ПРОВЕРКА - ЕСЛИ НЕ АВТОРИЗОВАН, ТО НЕ АДМИН
  if (!isAuthenticated) {
    console.log('🚨 Пользователь не авторизован! Кнопки должны быть скрыты!');
  }
  
  // Отладочная информация
  console.log('🔍 OwnersPage Debug:', {
    isAdmin,
    isReallyAdmin,
    user,
    isAuthenticated,
    userRole: user?.role,
    userRoleType: typeof user?.role,
    userRoleEqualsAdmin: user?.role === 'ADMIN',
    userRoleEqualsUser: user?.role === 'USER'
  });
  
  // Принудительно показываем отладочную информацию на странице
  if (!isReallyAdmin) {
    console.log('🚨 Пользователь НЕ является администратором! Кнопки должны быть скрыты!');
    console.log('🚨 Детали:', {
      isAuthenticated,
      userRole: user?.role,
      isReallyAdmin
    });
  }
  
  // Показываем загрузку во время проверки авторизации или если не авторизован
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Fetch owners
  const { data: owners = [], isLoading: ownersLoading, error: ownersError } = useQuery(
    ['owners', searchTerm],
    () => searchTerm 
      ? apiClient.searchOwnersByTerm(searchTerm)
      : apiClient.getOwners(0, 1000),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Create owner mutation
  const createOwnerMutation = useMutation(
    (ownerData: OwnerCreate) => apiClient.createOwner(ownerData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('owners');
        setShowForm(false);
      },
      onError: (error: any) => {
        console.error('Ошибка создания владельца:', error);
        if (error.response?.status === 403) {
          showError('У вас нет прав для создания владельцев');
        }
      },
    }
  );

  // Update owner mutation
  const updateOwnerMutation = useMutation(
    ({ id, data }: { id: number; data: OwnerUpdate }) => apiClient.updateOwner(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('owners');
        setEditingOwner(null);
      },
      onError: (error: any) => {
        console.error('Ошибка обновления владельца:', error);
        if (error.response?.status === 403) {
          showError('У вас нет прав для редактирования владельцев');
        }
      },
    }
  );

  // Delete owner mutation
  const deleteOwnerMutation = useMutation(
    (id: number) => apiClient.deleteOwner(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('owners');
        setDeletingOwner(null);
      },
      onError: (error: any) => {
        console.error('Ошибка удаления владельца:', error);
        if (error.response?.status === 403) {
          showError('У вас нет прав для удаления владельцев');
        }
      },
    }
  );

  const handleCreateOwner = async (ownerData: OwnerCreate | OwnerUpdate) => {
    // При создании все поля обязательны
    if (!ownerData.firstname || !ownerData.lastname) {
      throw new Error('Все поля обязательны для заполнения');
    }
    await createOwnerMutation.mutateAsync({
      firstname: ownerData.firstname,
      lastname: ownerData.lastname,
    });
  };

  const handleUpdateOwner = async (ownerData: OwnerCreate | OwnerUpdate) => {
    if (editingOwner) {
      await updateOwnerMutation.mutateAsync({ id: editingOwner.ownerid, data: ownerData });
    }
  };

  const handleDeleteOwner = async () => {
    if (deletingOwner) {
      await deleteOwnerMutation.mutateAsync(deletingOwner.ownerid);
    }
  };

  const handleEditOwner = (owner: OwnerResponse) => {
    setEditingOwner(owner);
  };

  const handleDeleteClick = (owner: OwnerResponse) => {
    setDeletingOwner(owner);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };


  return (
    <>
      <Head>
        <title>Владельцы - Система управления</title>
        <meta name="description" content="Управление владельцами в системе" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <span className="text-xl">👥</span>
                  <span>← Назад</span>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Владельцы</h1>
                  <p className="text-sm text-gray-500">
                    Управление владельцами в системе
                  </p>
                </div>
              </div>
              {isReallyAdmin && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2"
                >
                  ➕
                  <span>Добавить владельца</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Отладочная информация */}
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm">
              <strong>Отладка:</strong> isReallyAdmin = {String(isReallyAdmin)}, 
              user.role = {user?.role}, 
              isAuthenticated = {String(isAuthenticated)}
            </p>
          </div>
          {/* Search */}
          <div className="mb-8">
            <Card>
              <CardBody>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Поиск по имени или фамилии..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      leftIcon={<span className="text-sm">🔍</span>}
                    />
                  </div>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => handleSearch('')}
                    >
                      Очистить
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {ownersLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : ownersError ? (
              <Card>
                <CardBody className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    Ошибка загрузки данных
                  </div>
                  <Button onClick={() => queryClient.invalidateQueries('owners')}>
                    Попробовать снова
                  </Button>
                </CardBody>
              </Card>
            ) : owners.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <span className="text-6xl text-gray-400 mx-auto mb-4">👥</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Владельцы не найдены' : 'Владельцы отсутствуют'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Попробуйте изменить поисковый запрос'
                      : isReallyAdmin ? 'Добавьте первого владельца в систему' : 'Владельцы отсутствуют'
                    }
                  </p>
                  {isReallyAdmin && (
                    <Button onClick={() => setShowForm(true)}>
                      Добавить владельца
                    </Button>
                  )}
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {owners.map((owner) => (
                  <OwnerCard
                    key={owner.ownerid}
                    owner={owner}
                    onEdit={isReallyAdmin ? handleEditOwner : undefined}
                    onDelete={isReallyAdmin ? handleDeleteClick : undefined}
                    showActions={isReallyAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Forms and Modals - только для администраторов */}
        {isReallyAdmin && (
          <>
            <OwnerForm
              isOpen={showForm}
              onClose={() => setShowForm(false)}
              onSubmit={handleCreateOwner}
              loading={createOwnerMutation.isLoading}
            />

            <OwnerForm
              isOpen={!!editingOwner}
              onClose={() => setEditingOwner(null)}
              onSubmit={handleUpdateOwner}
              owner={editingOwner || undefined}
              loading={updateOwnerMutation.isLoading}
            />
          </>
        )}

        {/* Delete Confirmation Modal - только для администраторов */}
        {isReallyAdmin && (
          <Modal
            isOpen={!!deletingOwner}
            onClose={() => setDeletingOwner(null)}
            title="Удалить владельца"
          >
          {deletingOwner && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Вы уверены, что хотите удалить владельца{' '}
                <span className="font-semibold">
                  {deletingOwner.firstname} {deletingOwner.lastname}
                </span>?
              </p>
              {deletingOwner.cars.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ⚠️ Внимание: У этого владельца есть {deletingOwner.cars.length} автомобилей. 
                    Все автомобили также будут удалены!
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Это действие нельзя отменить.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingOwner(null)}
                  disabled={deleteOwnerMutation.isLoading}
                >
                  Отмена
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteOwner}
                  loading={deleteOwnerMutation.isLoading}
                >
                  Удалить
                </Button>
              </div>
            </div>
          )}
          </Modal>
        )}
      </div>
    </>
  );
}
