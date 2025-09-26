import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { CarCreate } from '@/types/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function TestApiPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState<CarCreate>({
    brand: 'Toyota',
    model: 'Camry',
    color: 'White',
    registrationNumber: 'TEST-123',
    modelYear: 2023,
    price: 50000,
    owner_id: 1,
  });

  const testCreateCar = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await apiClient.createCar(carData);
      setResult(`✅ Успешно создан автомобиль: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Ошибка: ${error.message}\n\nДетали: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCars = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await apiClient.getCars();
      setResult(`✅ Успешно получены автомобили: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Ошибка: ${error.message}\n\nДетали: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetOwners = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await apiClient.getOwners();
      setResult(`✅ Успешно получены владельцы: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Ошибка: ${error.message}\n\nДетали: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тестирование API</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Данные автомобиля</h2>
              <div className="space-y-4">
                <Input
                  label="Марка"
                  value={carData.brand}
                  onChange={(e) => setCarData({ ...carData, brand: e.target.value })}
                />
                <Input
                  label="Модель"
                  value={carData.model}
                  onChange={(e) => setCarData({ ...carData, model: e.target.value })}
                />
                <Input
                  label="Цвет"
                  value={carData.color}
                  onChange={(e) => setCarData({ ...carData, color: e.target.value })}
                />
                <Input
                  label="Регистрационный номер"
                  value={carData.registrationNumber}
                  onChange={(e) => setCarData({ ...carData, registrationNumber: e.target.value })}
                />
                <Input
                  label="Год выпуска"
                  type="number"
                  value={carData.modelYear}
                  onChange={(e) => setCarData({ ...carData, modelYear: parseInt(e.target.value) })}
                />
                <Input
                  label="Цена"
                  type="number"
                  value={carData.price}
                  onChange={(e) => setCarData({ ...carData, price: parseInt(e.target.value) })}
                />
                <Input
                  label="ID владельца"
                  type="number"
                  value={carData.owner_id}
                  onChange={(e) => setCarData({ ...carData, owner_id: parseInt(e.target.value) })}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Тесты API</h2>
              <div className="space-y-4">
                <Button
                  onClick={testGetOwners}
                  loading={loading}
                  className="w-full"
                >
                  Получить владельцев
                </Button>
                <Button
                  onClick={testGetCars}
                  loading={loading}
                  className="w-full"
                >
                  Получить автомобили
                </Button>
                <Button
                  onClick={testCreateCar}
                  loading={loading}
                  className="w-full"
                >
                  Создать автомобиль
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {result && (
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Результат</h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {result}
              </pre>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
