import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
// Иконки заменены на эмодзи
import { apiClient } from '@/lib/api';
import { CarWithOwner, CarCreate, CarUpdate, OwnerResponse } from '@/types/api';
import { formatPrice } from '@/lib/utils';
import { useSearchState } from '@/hooks/useSearchState';
import { useDataRefresh } from '@/hooks/useDataRefresh';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CardHeader, CardBody } from '@/components/ui/Card';
import CarCard from '@/components/cars/CarCard';
import CarForm from '@/components/cars/CarForm';
import SearchFilters from '@/components/search/SearchFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';

export default function CarsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useDataRefresh();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<CarWithOwner | null>(null);
  const [deletingCar, setDeletingCar] = useState<CarWithOwner | null>(null);
  const [searchQuery, setSearchQuery] = useSearchState('carsSearchState');

  // Fetch cars
  const { data: cars = [], isLoading: carsLoading, error: carsError } = useQuery(
    ['cars', searchQuery],
    () => apiClient.searchCars(searchQuery),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch owners for form
  const { data: owners = [] } = useQuery(
    'owners',
    () => apiClient.getOwners(0, 1000),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Create car mutation
  const createCarMutation = useMutation(
    (carData: CarCreate) => apiClient.createCar(carData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cars');
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
        setDeletingCar(null);
      },
    }
  );

  const handleSearch = (query: any) => {
    setSearchQuery({ ...searchQuery, ...query });
  };

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

  const handleEditCar = (car: CarWithOwner) => {
    setEditingCar(car);
  };

  const handleDeleteClick = (car: CarWithOwner) => {
    setDeletingCar(car);
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
                  <span className="text-xl">🚗</span>
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
                ➕
                <span>Добавить автомобиль</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Filters */}
          <div className="mb-8">
            <SearchFilters
              onSearch={handleSearch}
              loading={carsLoading}
            />
          </div>

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
                  <span className="text-6xl text-gray-400 mx-auto mb-4">🚗</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Автомобили не найдены
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Попробуйте изменить параметры поиска или добавьте новый автомобиль
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    Добавить автомобиль
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onEdit={handleEditCar}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Forms and Modals */}
        <CarForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateCar}
          owners={owners}
          loading={createCarMutation.isLoading}
        />

        <CarForm
          isOpen={!!editingCar}
          onClose={() => setEditingCar(null)}
          onSubmit={handleUpdateCar}
          car={editingCar || undefined}
          owners={owners}
          loading={updateCarMutation.isLoading}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingCar}
          onClose={() => setDeletingCar(null)}
          title="Удалить автомобиль"
        >
          {deletingCar && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Вы уверены, что хотите удалить автомобиль{' '}
                <span className="font-semibold">
                  {deletingCar.brand} {deletingCar.model}
                </span>?
              </p>
              <p className="text-sm text-gray-500">
                Это действие нельзя отменить.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingCar(null)}
                  disabled={deleteCarMutation.isLoading}
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
          )}
        </Modal>
      </div>
    </>
  );
}
