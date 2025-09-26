import React, { useState } from 'react';
// Иконки заменены на эмодзи
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CarQuery } from '@/types/api';

interface SearchFiltersProps {
  onSearch: (query: CarQuery) => void;
  loading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, loading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<CarQuery>({
    brand: '',
    color: '',
    modelYear: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    sort_by: 'id',
    sort_order: 'asc',
    limit: 20,
    offset: 0,
  });

  const handleInputChange = (field: keyof CarQuery, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: CarQuery = {
      brand: '',
      color: '',
      modelYear: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort_by: 'id',
      sort_order: 'asc',
      limit: 20,
      offset: 0,
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined && value !== 'id' && value !== 'asc' && value !== 20 && value !== 0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔍</span>
          <h3 className="text-lg font-medium text-gray-900">Поиск и фильтры</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1"
          >
            🔧
            <span>{isExpanded ? 'Скрыть' : 'Показать'} фильтры</span>
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center space-x-1"
            >
              ✕
              <span>Сбросить</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Input
          label="Марка"
          placeholder="Например: Toyota"
          value={filters.brand || ''}
          onChange={(e) => handleInputChange('brand', e.target.value)}
        />
        <Input
          label="Цвет"
          placeholder="Например: Красный"
          value={filters.color || ''}
          onChange={(e) => handleInputChange('color', e.target.value)}
        />
        <Input
          label="Год выпуска"
          type="number"
          placeholder="Например: 2023"
          value={filters.modelYear || ''}
          onChange={(e) => handleInputChange('modelYear', e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Input
            label="Минимальная цена"
            type="number"
            placeholder="0"
            value={filters.minPrice || ''}
            onChange={(e) => handleInputChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
          />
          <Input
            label="Максимальная цена"
            type="number"
            placeholder="1000000"
            value={filters.maxPrice || ''}
            onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сортировка
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.sort_by}
              onChange={(e) => handleInputChange('sort_by', e.target.value)}
            >
              <option value="id">ID</option>
              <option value="brand">Марка</option>
              <option value="model">Модель</option>
              <option value="price">Цена</option>
              <option value="modelYear">Год</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Порядок
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.sort_order}
              onChange={(e) => handleInputChange('sort_order', e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSearch}
          loading={loading}
          className="flex items-center space-x-2"
        >
          🔍
          <span>Найти</span>
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;
