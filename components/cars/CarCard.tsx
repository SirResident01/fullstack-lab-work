import React from 'react';
import { CarWithOwner } from '@/types/api';
import { formatPrice } from '@/lib/utils';
// Иконки заменены на эмодзи
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface CarCardProps {
  car: CarWithOwner;
  onEdit?: (car: CarWithOwner) => void;
  onDelete?: (car: CarWithOwner) => void;
  showActions?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">📅</span>
              <span className="text-sm text-gray-600">{car.modelYear}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">💰</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(car.price)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm">👤</span>
              <span className="text-sm text-gray-600">
                {car.owner || 'Не назначен'}
              </span>
            </div>
            <Badge variant="primary" size="sm">
              {car.color}
            </Badge>
          </div>
        </div>

        {showActions && onEdit && onDelete && (
          <div className="flex space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(car)}
              className="p-2"
            >
              ✏️
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(car)}
              className="p-2"
            >
              🗑️
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarCard;
