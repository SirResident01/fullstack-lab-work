import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Head from 'next/head';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { OwnerResponse, OwnerCreate, OwnerUpdate } from '@/types/api';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function SimpleOwnersPage() {
  const queryClient = useQueryClient();
  const { isAdmin, user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<OwnerResponse | null>(null);
  const [deletingOwner, setDeletingOwner] = useState<OwnerResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Проверяем, что пользователь является администратором
  const isReallyAdmin = isAuthenticated && user?.role === 'ADMIN';

  // Fetch owners
  const { data: owners = [], isLoading: ownersLoading, error: ownersError } = useQuery(
    ['owners', searchTerm],
    () => searchTerm 
      ? apiClient.searchOwnersByTerm(searchTerm)
      : apiClient.getOwners(0, 1000),
    {
      keepPreviousData: true,
    }
  );

  // Create owner mutation
  const createOwnerMutation = useMutation(
    (ownerData: OwnerCreate) => apiClient.createOwner(ownerData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('owners');
        queryClient.invalidateQueries('carStatistics');
        queryClient.invalidateQueries('ownerStatistics');
        setShowForm(false);
      },
    }
  );

  // Update owner mutation
  const updateOwnerMutation = useMutation(
    ({ id, data }: { id: number; data: OwnerUpdate }) => apiClient.updateOwner(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('owners');
        queryClient.invalidateQueries('carStatistics');
        queryClient.invalidateQueries('ownerStatistics');
        setEditingOwner(null);
      },
    }
  );

  // Delete owner mutation
  const deleteOwnerMutation = useMutation(
    (id: number) => apiClient.deleteOwner(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('owners');
        queryClient.invalidateQueries('carStatistics');
        queryClient.invalidateQueries('ownerStatistics');
        setDeletingOwner(null);
      },
    }
  );

  const handleCreateOwner = async (ownerData: OwnerCreate) => {
    await createOwnerMutation.mutateAsync(ownerData);
  };

  const handleUpdateOwner = async (ownerData: OwnerUpdate) => {
    if (editingOwner) {
      await updateOwnerMutation.mutateAsync({ id: editingOwner.ownerid, data: ownerData });
    }
  };

  const handleDeleteOwner = async () => {
    if (deletingOwner) {
      await deleteOwnerMutation.mutateAsync(deletingOwner.ownerid);
    }
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
                  <span>← Назад</span>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Владельцы</h1>
                  <p className="text-sm text-gray-500">
                    Управление владельцами в системе
                  </p>
                </div>
              </div>
              {/* КНОПКА ДОБАВИТЬ ТОЛЬКО ДЛЯ АДМИНОВ */}
              {isReallyAdmin && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Добавить владельца</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <div className="mb-8">
            <Card>
              <CardBody>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Поиск по имени или фамилии..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                  <span className="text-6xl mb-4">👥</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Владельцы не найдены' : 'Владельцы отсутствуют'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Попробуйте изменить поисковый запрос'
                      : 'Добавьте первого владельца в систему'
                    }
                  </p>
                  {/* КНОПКА ДОБАВИТЬ ТОЛЬКО ДЛЯ АДМИНОВ */}
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
                  <Card key={owner.ownerid} className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            <span className="text-2xl">👤</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {owner.firstname} {owner.lastname}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ID: {owner.ownerid}
                            </p>
                          </div>
                        </div>
                        {/* КНОПКИ ТОЛЬКО ДЛЯ АДМИНОВ */}
                        {isReallyAdmin && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingOwner(owner)}
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeletingOwner(owner)}
                            >
                              🗑️
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Автомобилей:</span>
                          <span className="text-sm font-semibold text-primary-600">
                            {owner.cars.length}
                          </span>
                        </div>
                        {owner.cars.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Автомобили:</p>
                            <div className="space-y-1">
                              {owner.cars.slice(0, 3).map((car) => (
                                <div key={car.id} className="text-sm text-gray-600">
                                  {car.brand} {car.model} ({car.registrationNumber})
                                </div>
                              ))}
                              {owner.cars.length > 3 && (
                                <div className="text-sm text-gray-500">
                                  и еще {owner.cars.length - 3} автомобилей...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Simple Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowForm(false)} />
              <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Добавить владельца
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const ownerData: OwnerCreate = {
                      firstname: formData.get('firstname') as string,
                      lastname: formData.get('lastname') as string,
                    };
                    handleCreateOwner(ownerData);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Имя
                        </label>
                        <input
                          name="firstname"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Фамилия
                        </label>
                        <input
                          name="lastname"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        loading={createOwnerMutation.isLoading}
                      >
                        Добавить
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingOwner && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setDeletingOwner(null)} />
              <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Удалить владельца
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Вы уверены, что хотите удалить владельца{' '}
                    <span className="font-semibold">
                      {deletingOwner.firstname} {deletingOwner.lastname}
                    </span>?
                  </p>
                  {deletingOwner.cars.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-sm text-red-800">
                        ⚠️ Внимание: У этого владельца есть {deletingOwner.cars.length} автомобилей. 
                        Все автомобили также будут удалены!
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setDeletingOwner(null)}
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
              </div>
            </div>
          </div>
        )}

        {/* Edit Owner Modal */}
        {editingOwner && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setEditingOwner(null)} />
              <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Редактировать владельца
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const ownerData: OwnerUpdate = {
                      firstname: formData.get('firstname') as string,
                      lastname: formData.get('lastname') as string,
                    };
                    handleUpdateOwner(ownerData);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Имя
                        </label>
                        <input
                          type="text"
                          name="firstname"
                          defaultValue={editingOwner.firstname}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Фамилия
                        </label>
                        <input
                          type="text"
                          name="lastname"
                          defaultValue={editingOwner.lastname}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingOwner(null)}
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        loading={updateOwnerMutation.isLoading}
                      >
                        Сохранить
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
