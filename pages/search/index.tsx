import React, { useState } from 'react';
import { useQuery } from 'react-query';
import Head from 'next/head';
import Link from 'next/link';
// Иконки заменены на эмодзи
import { apiClient } from '@/lib/api';
import { CarWithOwner, CarQuery } from '@/types/api';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CardHeader, CardBody } from '@/components/ui/Card';
import SearchFilters from '@/components/search/SearchFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState<CarQuery>({
    limit: 50,
    offset: 0,
    sort_by: 'id',
    sort_order: 'asc',
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch search results
  const { data: cars = [], isLoading: carsLoading, error: carsError } = useQuery(
    ['search', searchQuery],
    () => apiClient.searchCars(searchQuery),
    {
      enabled: hasSearched,
      keepPreviousData: true,
    }
  );

  const handleSearch = (query: CarQuery) => {
    setSearchQuery(query);
    setHasSearched(true);
  };

  const handleReset = () => {
    setHasSearched(false);
    setSearchQuery({
      limit: 50,
      offset: 0,
      sort_by: 'id',
      sort_order: 'asc',
    });
  };

  return (
    <>
      <Head>
        <title>Поиск - Система управления</title>
        <meta name="description" content="Расширенный поиск автомобилей" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <span className="text-xl">🔍</span>
                  <span>← Назад</span>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Расширенный поиск</h1>
                  <p className="text-sm text-gray-500">
                    Поиск автомобилей по различным критериям
                  </p>
                </div>
              </div>
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

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl text-gray-400">🔍</span>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Результаты поиска
                  </h2>
                  {cars.length > 0 && (
                    <Badge variant="primary">
                      {cars.length} {cars.length === 1 ? 'найден' : 'найдено'}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Новый поиск
                </Button>
              </div>

              {/* Results */}
              {carsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : carsError ? (
                <Card>
                  <CardBody className="text-center py-12">
                    <div className="text-red-600 mb-4">
                      Ошибка поиска
                    </div>
                    <Button onClick={() => window.location.reload()}>
                      Попробовать снова
                    </Button>
                  </CardBody>
                </Card>
              ) : cars.length === 0 ? (
                <Card>
                  <CardBody className="text-center py-12">
                    <span className="text-6xl text-gray-400 mx-auto mb-4">🔍</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ничего не найдено
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Попробуйте изменить параметры поиска
                    </p>
                    <Button onClick={handleReset}>
                      Новый поиск
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
                              <Car className="h-5 w-5 text-primary-600" />
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
                          <Badge variant="primary" size="sm">
                            {car.color}
                          </Badge>
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
                            <span className="text-sm text-gray-600">Владелец:</span>
                            <span className="text-sm font-medium">
                              {car.owner || 'Не назначен'}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Link href={`/cars/${car.id}`}>
                            <Button variant="outline" size="sm">
                              Подробнее
                            </Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Tips */}
          {!hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600">
                    Используйте различные фильтры для точного поиска автомобилей по марке, 
                    цвету, году выпуска и цене.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Сортировка</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600">
                    Сортируйте результаты по различным критериям: ID, марка, модель, 
                    цена или год выпуска.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl text-purple-600">🔍</span>
                    <h3 className="text-lg font-semibold text-gray-900">Поиск</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600">
                    Начните поиск, заполнив нужные поля и нажав кнопку "Найти". 
                    Результаты появятся ниже.
                  </p>
                </CardBody>
              </Card>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
