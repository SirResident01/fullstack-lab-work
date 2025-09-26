import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CarCreate, CarUpdate, CarWithOwner, OwnerResponse } from '@/types/api';
// Иконки заменены на эмодзи
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface CarFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CarCreate | CarUpdate) => Promise<void>;
  car?: CarWithOwner;
  owners: OwnerResponse[];
  loading?: boolean;
}

const CarForm: React.FC<CarFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  car,
  owners,
  loading = false,
}) => {
  const isEdit = !!car;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarCreate>({
    defaultValues: {
      brand: '',
      model: '',
      color: '',
      registrationNumber: '',
      modelYear: new Date().getFullYear(),
      price: 0,
      owner_id: owners[0]?.ownerid || 0,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (car) {
      reset({
        brand: car.brand,
        model: car.model,
        color: car.color,
        registrationNumber: car.registrationNumber,
        modelYear: car.modelYear,
        price: car.price,
        owner_id: car.owner_id,
      });
    } else {
      reset({
        brand: '',
        model: '',
        color: '',
        registrationNumber: '',
        modelYear: new Date().getFullYear(),
        price: 0,
        owner_id: owners[0]?.ownerid || 0,
      });
    }
  }, [car, owners, reset]);

  const handleFormSubmit = async (data: CarCreate) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Марка"
            placeholder="Введите марку автомобиля"
            leftIcon={<span className="text-sm">🚗</span>}
            {...register('brand', { 
              required: 'Марка обязательна',
              minLength: { value: 1, message: 'Минимум 1 символ' },
              maxLength: { value: 100, message: 'Максимум 100 символов' }
            })}
            error={errors.brand?.message}
          />

          <Input
            label="Модель"
            placeholder="Введите модель автомобиля"
            leftIcon={<span className="text-sm">🚗</span>}
            {...register('model', { 
              required: 'Модель обязательна',
              minLength: { value: 1, message: 'Минимум 1 символ' },
              maxLength: { value: 100, message: 'Максимум 100 символов' }
            })}
            error={errors.model?.message}
          />

          <Input
            label="Цвет"
            placeholder="Введите цвет автомобиля"
            leftIcon={<span className="text-sm">🎨</span>}
            {...register('color', { 
              required: 'Цвет обязателен',
              minLength: { value: 1, message: 'Минимум 1 символ' },
              maxLength: { value: 40, message: 'Максимум 40 символов' }
            })}
            error={errors.color?.message}
          />

          <Input
            label="Регистрационный номер"
            placeholder="Введите номер"
            leftIcon={<span className="text-sm">🔢</span>}
            {...register('registrationNumber', { 
              required: 'Номер обязателен',
              minLength: { value: 1, message: 'Минимум 1 символ' },
              maxLength: { value: 40, message: 'Максимум 40 символов' }
            })}
            error={errors.registrationNumber?.message}
          />

          <Input
            label="Год выпуска"
            type="number"
            placeholder="Год выпуска"
            leftIcon={<span className="text-sm">📅</span>}
            {...register('modelYear', { 
              required: 'Год обязателен',
              min: { value: 1900, message: 'Минимум 1900 год' },
              max: { value: 2030, message: 'Максимум 2030 год' }
            })}
            error={errors.modelYear?.message}
          />

          <Input
            label="Цена (тенге)"
            type="number"
            placeholder="Цена в тенге"
            leftIcon={<span className="text-sm">💰</span>}
            {...register('price', { 
              required: 'Цена обязательна',
              min: { value: 0, message: 'Цена не может быть отрицательной' },
              valueAsNumber: true
            })}
            error={errors.price?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Владелец
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('owner_id', { 
              required: 'Владелец обязателен',
              valueAsNumber: true
            })}
          >
            <option value="">Выберите владельца</option>
            {owners.map((owner) => (
              <option key={owner.ownerid} value={owner.ownerid}>
                {owner.firstname} {owner.lastname}
              </option>
            ))}
          </select>
          {errors.owner_id && (
            <p className="mt-1 text-sm text-red-600">{errors.owner_id.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={loading}
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CarForm;
