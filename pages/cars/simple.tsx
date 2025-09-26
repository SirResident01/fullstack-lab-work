import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Head from 'next/head';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { CarWithOwner, CarCreate, CarUpdate, OwnerResponse } from '@/types/api';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SimpleCarsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<CarWithOwner | null>(null);
  const [deletingCar, setDeletingCar] = useState<CarWithOwner | null>(null);

  // Fetch cars
  const { data: cars = [], isLoading: carsLoading, error: carsError } = useQuery(
    'cars',
    () => apiClient.getCars(0, 100),
    {
      keepPreviousData: true,
    }
  );

  // Fetch owners for form
  const { data: owners = [] } = useQuery(
    'owners',
    () => apiClient.getOwners(0, 1000),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Create car mutation
  const createCarMutation = useMutation(
    (carData: CarCreate) => apiClient.createCar(carData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cars');
        queryClient.invalidateQueries('carStatistics');
        queryClient.invalidateQueries('ownerStatistics');
        setShowForm(false);
      },
    }
  );

  // Update car mutation
  const updateCarMutation = useMutation(
    ({ id, data }: { id: number; data: CarUpdate }) => apiClient.updateCar(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cars');
        queryClient.invalidateQueries('carStatistics');
        queryClient.invalidateQueries('ownerStatistics');
        setEditingCar(null);
      },
    }
  );

  // Delete car mutation
  const deleteCarMutation = useMutation(
    (id: number) => apiClient.deleteCar(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cars');
        queryClient.invalidateQueries('carStatistics');
        queryClient.invalidateQueries('ownerStatistics');
        setDeletingCar(null);
      },
    }
  );

  const handleCreateCar = async (carData: CarCreate) => {
    await createCarMutation.mutateAsync(carData);
  };

  const handleUpdateCar = async (carData: CarUpdate) => {
    if (editingCar) {
      await updateCarMutation.mutateAsync({ id: editingCar.id, data: carData });
    }
  };

  const handleDeleteCar = async () => {
    if (deletingCar) {
      await deleteCarMutation.mutateAsync(deletingCar.id);
    }
  };

  return (
    <>
      <Head>
        <title>Автомобили - Система управления</title>
        <meta name="description" content="Управление автомобилями в системе" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Автомобили</h1>
                  <p className="text-sm text-gray-500">
                    Управление автомобилями в системе
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Добавить автомобиль</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results */}
          <div className="space-y-6">
            {carsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : carsError ? (
              <Card>
                <CardBody className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    Ошибка загрузки данных
                  </div>
                  <Button onClick={() => queryClient.invalidateQueries('cars')}>
                    Попробовать снова
                  </Button>
                </CardBody>
              </Card>
            ) : cars.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <span className="text-6xl mb-4">🚗</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Автомобили не найдены
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Добавьте первый автомобиль в систему
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    Добавить автомобиль
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <Card key={car.id} className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            <span className="text-2xl">🚗</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {car.brand} {car.model}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {car.registrationNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCar(car)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeletingCar(car)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Год:</span>
                          <span className="text-sm font-medium">{car.modelYear}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Цена:</span>
                          <span className="text-sm font-semibold text-primary-600">
                            {formatPrice(car.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Цвет:</span>
                          <span className="text-sm font-medium">{car.color}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Владелец:</span>
                          <span className="text-sm font-medium">
                            {car.owner || 'Не назначен'}
                          </span>
                        </div>
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
              <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Добавить автомобиль
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const carData: CarCreate = {
                      brand: formData.get('brand') as string,
                      model: formData.get('model') as string,
                      color: formData.get('color') as string,
                      registrationNumber: formData.get('registrationNumber') as string,
                      modelYear: parseInt(formData.get('modelYear') as string),
                      price: parseInt(formData.get('price') as string),
                      owner_id: parseInt(formData.get('owner_id') as string),
                    };
                    handleCreateCar(carData);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Марка
                        </label>
                        <input
                          name="brand"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Модель
                        </label>
                        <input
                          name="model"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Цвет
                        </label>
                        <input
                          name="color"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Регистрационный номер
                        </label>
                        <input
                          name="registrationNumber"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Год выпуска
                        </label>
                        <input
                          name="modelYear"
                          type="number"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Цена (тенге)
                        </label>
                        <input
                          name="price"
                          type="number"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Владелец
                        </label>
                        <select
                          name="owner_id"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Выберите владельца</option>
                          {owners.map((owner) => (
                            <option key={owner.ownerid} value={owner.ownerid}>
                              {owner.firstname} {owner.lastname}
                            </option>
                          ))}
                        </select>
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
                        loading={createCarMutation.isLoading}
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
        {deletingCar && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setDeletingCar(null)} />
              <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Удалить автомобиль
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Вы уверены, что хотите удалить автомобиль{' '}
                    <span className="font-semibold">
                      {deletingCar.brand} {deletingCar.model}
                    </span>?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setDeletingCar(null)}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteCar}
                      loading={deleteCarMutation.isLoading}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Car Modal */}
        {editingCar && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setEditingCar(null)} />
              <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Редактировать автомобиль
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const carData: CarUpdate = {
                      brand: formData.get('brand') as string,
                      model: formData.get('model') as string,
                      color: formData.get('color') as string,
                      registrationNumber: formData.get('registrationNumber') as string,
                      modelYear: parseInt(formData.get('modelYear') as string),
                      price: parseInt(formData.get('price') as string),
                      owner_id: parseInt(formData.get('owner_id') as string),
                    };
                    handleUpdateCar(carData);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Марка
                        </label>
                        <input
                          type="text"
                          name="brand"
                          defaultValue={editingCar.brand}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Модель
                        </label>
                        <input
                          type="text"
                          name="model"
                          defaultValue={editingCar.model}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Цвет
                        </label>
                        <input
                          type="text"
                          name="color"
                          defaultValue={editingCar.color}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Регистрационный номер
                        </label>
                        <input
                          type="text"
                          name="registrationNumber"
                          defaultValue={editingCar.registrationNumber}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Год выпуска
                        </label>
                        <input
                          type="number"
                          name="modelYear"
                          defaultValue={editingCar.modelYear}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Цена (тенге)
                        </label>
                        <input
                          type="number"
                          name="price"
                          defaultValue={editingCar.price}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Владелец
                        </label>
                        <select
                          name="owner_id"
                          defaultValue={editingCar.owner_id || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Выберите владельца</option>
                          {owners.map((owner) => (
                            <option key={owner.ownerid} value={owner.ownerid}>
                              {owner.firstname} {owner.lastname}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingCar(null)}
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        loading={updateCarMutation.isLoading}
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
