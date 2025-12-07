import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CarCreate, CarUpdate, CarWithOwner, OwnerResponse } from '@/types/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
} from '@mui/material';

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
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Марка"
                placeholder="Введите марку автомобиля"
                fullWidth
                {...register('brand', { 
                  required: 'Марка обязательна',
                  minLength: { value: 1, message: 'Минимум 1 символ' },
                  maxLength: { value: 100, message: 'Максимум 100 символов' }
                })}
                error={!!errors.brand}
                helperText={errors.brand?.message}
              />

              <TextField
                label="Модель"
                placeholder="Введите модель автомобиля"
                fullWidth
                {...register('model', { 
                  required: 'Модель обязательна',
                  minLength: { value: 1, message: 'Минимум 1 символ' },
                  maxLength: { value: 100, message: 'Максимум 100 символов' }
                })}
                error={!!errors.model}
                helperText={errors.model?.message}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Цвет"
                placeholder="Введите цвет автомобиля"
                fullWidth
                {...register('color', { 
                  required: 'Цвет обязателен',
                  minLength: { value: 1, message: 'Минимум 1 символ' },
                  maxLength: { value: 40, message: 'Максимум 40 символов' }
                })}
                error={!!errors.color}
                helperText={errors.color?.message}
              />

              <TextField
                label="Регистрационный номер"
                placeholder="Введите номер"
                fullWidth
                {...register('registrationNumber', { 
                  required: 'Номер обязателен',
                  minLength: { value: 1, message: 'Минимум 1 символ' },
                  maxLength: { value: 40, message: 'Максимум 40 символов' }
                })}
                error={!!errors.registrationNumber}
                helperText={errors.registrationNumber?.message}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Год выпуска"
                type="number"
                placeholder="Год выпуска"
                fullWidth
                {...register('modelYear', { 
                  required: 'Год обязателен',
                  min: { value: 1900, message: 'Минимум 1900 год' },
                  max: { value: 2030, message: 'Максимум 2030 год' },
                  valueAsNumber: true
                })}
                error={!!errors.modelYear}
                helperText={errors.modelYear?.message}
              />

              <TextField
                label="Цена (тенге)"
                type="number"
                placeholder="Цена в тенге"
                fullWidth
                {...register('price', { 
                  required: 'Цена обязательна',
                  min: { value: 0, message: 'Цена не может быть отрицательной' },
                  valueAsNumber: true
                })}
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            </Stack>

            <TextField
              label="Владелец"
              select
              fullWidth
              {...register('owner_id', { 
                required: 'Владелец обязателен',
                valueAsNumber: true
              })}
              error={!!errors.owner_id}
              helperText={errors.owner_id?.message}
            >
              <MenuItem value="">
                <em>Выберите владельца</em>
              </MenuItem>
              {owners.map((owner) => (
                <MenuItem key={owner.ownerid} value={owner.ownerid}>
                  {owner.firstname} {owner.lastname}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CarForm;
