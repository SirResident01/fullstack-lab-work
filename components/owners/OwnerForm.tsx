import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { OwnerCreate, OwnerUpdate, OwnerResponse } from '@/types/api';
// Иконки заменены на эмодзи
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface OwnerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OwnerCreate | OwnerUpdate) => Promise<void>;
  owner?: OwnerResponse;
  loading?: boolean;
}

const OwnerForm: React.FC<OwnerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  owner,
  loading = false,
}) => {
  const isEdit = !!owner;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ firstname?: string; lastname?: string }>({
    defaultValues: {
      firstname: '',
      lastname: '',
    },
  });

  useEffect(() => {
    if (owner) {
      reset({
        firstname: owner.firstname,
        lastname: owner.lastname,
      });
    } else {
      reset({
        firstname: '',
        lastname: '',
      });
    }
  }, [owner, reset]);

  const handleFormSubmit = async (data: { firstname?: string; lastname?: string }) => {
    setIsSubmitting(true);
    try {
      // Убеждаемся, что все обязательные поля заполнены
      if (!data.firstname || !data.lastname) {
        throw new Error('Все поля обязательны для заполнения');
      }
      const ownerData: OwnerCreate = {
        firstname: data.firstname,
        lastname: data.lastname,
      };
      await onSubmit(ownerData);
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
      title={isEdit ? 'Редактировать владельца' : 'Добавить владельца'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Имя"
            placeholder="Введите имя"
            leftIcon={<span className="text-sm">👤</span>}
            {...register('firstname', { 
              required: 'Имя обязательно',
              minLength: { value: 2, message: 'Минимум 2 символа' },
              pattern: {
                value: /^[а-яА-ЯёЁa-zA-Z\s]+$/,
                message: 'Только буквы разрешены'
              }
            })}
            error={errors.firstname?.message}
          />

          <Input
            label="Фамилия"
            placeholder="Введите фамилию"
            leftIcon={<span className="text-sm">👤</span>}
            {...register('lastname', { 
              required: 'Фамилия обязательна',
              minLength: { value: 2, message: 'Минимум 2 символа' },
              pattern: {
                value: /^[а-яА-ЯёЁa-zA-Z\s]+$/,
                message: 'Только буквы разрешены'
              }
            })}
            error={errors.lastname?.message}
          />
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

export default OwnerForm;
