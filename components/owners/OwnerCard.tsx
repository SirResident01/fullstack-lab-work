import React from 'react';
import { OwnerResponse } from '@/types/api';
import { getInitials } from '@/lib/utils';
// Иконки заменены на эмодзи
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface OwnerCardProps {
  owner: OwnerResponse;
  onEdit?: (owner: OwnerResponse) => void;
  onDelete?: (owner: OwnerResponse) => void;
  showActions?: boolean;
}

const OwnerCard: React.FC<OwnerCardProps> = ({
  owner,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const initials = getInitials(owner.firstname, owner.lastname);
  const carCount = owner.cars.length;
  
  // Отладочная информация
  console.log('🔍 OwnerCard Debug:', {
    ownerId: owner.ownerid,
    showActions,
    hasOnEdit: !!onEdit,
    hasOnDelete: !!onDelete
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
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

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🚗</span>
              <span className="text-sm text-gray-600">
                {carCount} {carCount === 1 ? 'автомобиль' : 'автомобилей'}
              </span>
            </div>
            <Badge 
              variant={carCount > 0 ? 'success' : 'secondary'} 
              size="sm"
            >
              {carCount > 0 ? 'Активный' : 'Без автомобилей'}
            </Badge>
          </div>

          {carCount > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Автомобили:</p>
              <div className="space-y-1">
                {owner.cars.slice(0, 3).map((car) => (
                  <div key={car.id} className="text-sm text-gray-600">
                    {car.brand} {car.model} ({car.registrationNumber})
                  </div>
                ))}
                {carCount > 3 && (
                  <div className="text-sm text-gray-500">
                    и еще {carCount - 3} автомобилей...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* КНОПКИ ПОЛНОСТЬЮ УБРАНЫ - НЕ ПОКАЗЫВАЮТСЯ НИКОГДА */}
        {false && (
          <div className="flex space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(owner)}
              className="p-2"
            >
              ✏️
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(owner)}
              className="p-2"
            >
              🗑️
            </Button>
          </div>
        )}
        
        {/* Принудительно скрываем кнопки для отладки */}
        {!showActions && (
          <div className="text-xs text-gray-400 ml-4">
            showActions: {String(showActions)}, onEdit: {String(!!onEdit)}, onDelete: {String(!!onDelete)}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerCard;
