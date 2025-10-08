import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface AdminRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const AdminRegisterForm: React.FC<AdminRegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { registerAdmin, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      const success = await registerAdmin(formData.username, formData.password, formData.confirmPassword);
      if (success) {
        onSuccess?.();
      } else {
        setError('Ошибка регистрации администратора');
      }
    } catch (error) {
      setError('Ошибка регистрации администратора');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="text-center">
          <span className="text-4xl">👑</span>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Регистрация администратора
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Создайте аккаунт администратора
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Имя пользователя
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя"
              className="mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              className="mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Подтвердите пароль
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Подтвердите пароль"
              className="mt-1"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрировать администратора'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Войти
            </button>
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default AdminRegisterForm;
