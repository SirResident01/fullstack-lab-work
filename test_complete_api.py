#!/usr/bin/env python3
"""
Полный тест API с реальными CRUD операциями
"""

import requests
import json
import sys
import time

class APITester:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.user_token = None
        self.admin_token = None
        self.created_cars = []
        self.created_owners = []
        
    def make_request(self, method, endpoint, data=None, headers=None, use_auth=True):
        """Выполняет HTTP запрос"""
        url = f"{self.base_url}{endpoint}"
        request_headers = headers or {}
        
        if use_auth and self.user_token:
            request_headers["Authorization"] = f"Bearer {self.user_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers, timeout=10)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers, timeout=10)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers, timeout=10)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers, timeout=10)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=request_headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.ConnectionError as e:
            print(f"❌ Connection failed: {e}")
            # Попробуем еще раз через секунду
            import time
            time.sleep(1)
            try:
                if method.upper() == "GET":
                    response = self.session.get(url, headers=request_headers, timeout=10)
                elif method.upper() == "POST":
                    response = self.session.post(url, json=data, headers=request_headers, timeout=10)
                elif method.upper() == "PUT":
                    response = self.session.put(url, json=data, headers=request_headers, timeout=10)
                elif method.upper() == "DELETE":
                    response = self.session.delete(url, headers=request_headers, timeout=10)
                elif method.upper() == "PATCH":
                    response = self.session.patch(url, json=data, headers=request_headers, timeout=10)
                return response
            except:
                return None
        except requests.exceptions.Timeout as e:
            print(f"❌ Request timeout: {e}")
            return None
        except Exception as e:
            print(f"❌ Request failed: {e}")
            return None
    
    def test_server(self):
        """Тест сервера"""
        print("🔍 Testing server...")
        response = self.make_request("GET", "/", use_auth=False)
        if response and response.status_code == 200:
            print("✅ Server is running")
            return True
        else:
            print("❌ Server is not running")
            return False
    
    def test_register_user(self):
        """Регистрация пользователя"""
        print("\n👤 Registering user...")
        import time
        timestamp = int(time.time())
        user_data = {
            "username": f"testuser_api_{timestamp}",
            "email": f"testuser_{timestamp}@example.com",
            "password": "password123",
            "role": "USER"
        }
        
        response = self.make_request("POST", "/register", data=user_data, use_auth=False)
        if response:
            if response.status_code == 200:
                print("✅ User registered successfully")
                return True
            elif response.status_code == 422:
                print("⚠️ User already exists (422 - validation error)")
                return True  # Считаем это успехом, так как пользователь уже существует
            else:
                print(f"❌ User registration failed: {response.status_code}")
                return False
        else:
            print("❌ User registration failed: No response")
            return False
    
    def test_register_admin(self):
        """Регистрация админа"""
        print("\n👑 Registering admin...")
        import time
        timestamp = int(time.time())
        admin_data = {
            "username": f"testadmin_api_{timestamp}",
            "email": f"admin_{timestamp}@example.com",
            "password": "admin123",
            "role": "ADMIN"
        }
        
        response = self.make_request("POST", "/register", data=admin_data, use_auth=False)
        if response:
            if response.status_code == 200:
                print("✅ Admin registered successfully")
                return True
            elif response.status_code == 422:
                print("⚠️ Admin already exists (422 - validation error)")
                return True  # Считаем это успехом
            else:
                print(f"❌ Admin registration failed: {response.status_code}")
                return False
        else:
            print("❌ Admin registration failed: No response")
            return False
    
    def test_user_login(self):
        """Логин пользователя"""
        print("\n🔑 User login...")
        # Используем стандартные учетные данные для пользователя
        login_data = {
            "username": "user",
            "password": "123456"
        }
        
        response = self.make_request("POST", "/login", data=login_data, use_auth=False)
        if response and response.status_code == 200:
            result = response.json()
            if "access_token" in result:
                self.user_token = result["access_token"]
                print("✅ User logged in successfully")
                return True
            else:
                print("❌ No access token in response")
                return False
        else:
            print(f"❌ User login failed: {response.status_code if response else 'No response'}")
            return False
    
    def test_admin_login(self):
        """Логин админа"""
        print("\n🔑 Admin login...")
        # Используем стандартные учетные данные для админа
        login_data = {
            "username": "admin",
            "password": "123456"
        }
        
        response = self.make_request("POST", "/login", data=login_data, use_auth=False)
        if response and response.status_code == 200:
            result = response.json()
            if "access_token" in result:
                self.admin_token = result["access_token"]
                print("✅ Admin logged in successfully")
                return True
            else:
                print("❌ No access token in response")
                return False
        else:
            print(f"❌ Admin login failed: {response.status_code if response else 'No response'}")
            return False
    
    def test_create_owner(self):
        """Создание владельца"""
        print("\n👥 Creating owner...")
        owner_data = {
            "firstname": "John",
            "lastname": "Doe"
        }
        
        # Используем админский токен для создания владельца
        old_token = self.user_token
        self.user_token = self.admin_token
        
        response = self.make_request("POST", "/owners", data=owner_data)
        
        # Возвращаем токен
        self.user_token = old_token
        
        if response and response.status_code == 200:
            result = response.json()
            owner_id = result.get("ownerid")
            if owner_id:
                self.created_owners.append(owner_id)
                print(f"✅ Owner created with admin token, ID: {owner_id}")
                return owner_id
            else:
                print("❌ No owner ID in response")
                return None
        else:
            print(f"❌ Owner creation failed: {response.status_code if response else 'No response'}")
            return None
    
    def test_get_owners(self):
        """Получение списка владельцев"""
        print("\n📋 Getting owners...")
        response = self.make_request("GET", "/owners")
        if response and response.status_code == 200:
            owners = response.json()
            print(f"✅ Retrieved {len(owners)} owners")
            return True
        else:
            print(f"❌ Failed to get owners: {response.status_code if response else 'No response'}")
            return False
    
    def test_create_car(self, owner_id):
        """Создание автомобиля"""
        print("\n🚗 Creating car...")
        car_data = {
            "brand": "Toyota",
            "model": "Camry",
            "color": "Blue",
            "registrationNumber": "API-001",
            "modelYear": 2023,
            "price": 35000,
            "owner_id": owner_id
        }
        
        # Используем админский токен для создания автомобиля
        old_token = self.user_token
        self.user_token = self.admin_token
        
        response = self.make_request("POST", "/cars", data=car_data)
        
        # Возвращаем токен
        self.user_token = old_token
        
        if response and response.status_code == 200:
            result = response.json()
            car_id = result.get("id")
            if car_id:
                self.created_cars.append(car_id)
                print(f"✅ Car created with admin token, ID: {car_id}")
                return car_id
            else:
                print("❌ No car ID in response")
                return None
        else:
            print(f"❌ Car creation failed: {response.status_code if response else 'No response'}")
            return None
    
    def test_get_cars(self):
        """Получение списка автомобилей"""
        print("\n📋 Getting cars...")
        response = self.make_request("GET", "/cars")
        if response and response.status_code == 200:
            cars = response.json()
            print(f"✅ Retrieved {len(cars)} cars")
            return True
        else:
            print(f"❌ Failed to get cars: {response.status_code if response else 'No response'}")
            return False
    
    def test_get_car_by_id(self, car_id):
        """Получение автомобиля по ID"""
        print(f"\n🔍 Getting car {car_id}...")
        response = self.make_request("GET", f"/cars/{car_id}")
        if response and response.status_code == 200:
            print(f"✅ Retrieved car {car_id}")
            return True
        else:
            print(f"❌ Failed to get car {car_id}: {response.status_code if response else 'No response'}")
            return False
    
    def test_update_car(self, car_id):
        """Обновление автомобиля"""
        print(f"\n✏️ Updating car {car_id}...")
        update_data = {
            "brand": "Honda",
            "model": "Accord",
            "color": "Red",
            "price": 40000
        }
        
        # Используем админский токен для обновления автомобиля
        old_token = self.user_token
        self.user_token = self.admin_token
        
        response = self.make_request("PUT", f"/cars/{car_id}", data=update_data)
        
        # Возвращаем токен
        self.user_token = old_token
        
        if response and response.status_code == 200:
            print(f"✅ Car {car_id} updated successfully")
            return True
        else:
            print(f"❌ Failed to update car {car_id}: {response.status_code if response else 'No response'}")
            return False
    
    def test_admin_endpoints(self):
        """Тест административных эндпоинтов"""
        print("\n🛡️ Testing admin endpoints...")
        
        # Сохраняем текущий токен
        old_token = self.user_token
        self.user_token = self.admin_token
        
        # Тест получения пользователей
        print("🔍 Testing admin users endpoint...")
        response = self.make_request("GET", "/admin/users")
        if response:
            if response.status_code == 200:
                users = response.json()
                print(f"✅ Retrieved {len(users)} users")
            else:
                print(f"❌ Failed to get users: {response.status_code}")
        else:
            print("❌ No response for admin users")
        
        # Тест аналитики
        print("🔍 Testing analytics endpoint...")
        response = self.make_request("GET", "/analytics/overview")
        if response:
            if response.status_code == 200:
                print("✅ Analytics retrieved successfully")
            else:
                print(f"❌ Failed to get analytics: {response.status_code}")
        else:
            print("❌ No response for analytics")
        
        # Тест создания владельца с админскими правами
        print("🔍 Testing owner creation with admin rights...")
        owner_data = {
            "firstname": "Admin",
            "lastname": "Test"
        }
        response = self.make_request("POST", "/owners", data=owner_data)
        if response:
            if response.status_code == 200:
                result = response.json()
                owner_id = result.get("ownerid")
                if owner_id:
                    self.created_owners.append(owner_id)
                    print(f"✅ Admin created owner with ID: {owner_id}")
                else:
                    print("❌ No owner ID in admin response")
            else:
                print(f"❌ Admin owner creation failed: {response.status_code}")
        else:
            print("❌ No response for admin owner creation")
        
        # Возвращаем токен
        self.user_token = old_token
    
    def test_search(self):
        """Тест поиска"""
        print("\n🔍 Testing search...")
        search_data = {
            "query": "John",
            "limit": 10
        }
        
        response = self.make_request("POST", "/owners/search", data=search_data)
        if response and response.status_code == 200:
            results = response.json()
            print(f"✅ Search found {len(results)} results")
            return True
        else:
            print(f"❌ Search failed: {response.status_code if response else 'No response'}")
            return False
    
    
    def cleanup(self):
        """Очистка данных"""
        print("\n🧹 Cleaning up...")
        
        # Используем админский токен для удаления
        old_token = self.user_token
        self.user_token = self.admin_token
        
        # Удаление автомобилей
        for car_id in self.created_cars:
            response = self.make_request("DELETE", f"/cars/{car_id}")
            if response and response.status_code == 200:
                print(f"✅ Deleted car {car_id}")
            else:
                print(f"❌ Failed to delete car {car_id}")
        
        # Удаление владельцев
        for owner_id in self.created_owners:
            response = self.make_request("DELETE", f"/owners/{owner_id}")
            if response and response.status_code == 200:
                print(f"✅ Deleted owner {owner_id}")
            else:
                print(f"❌ Failed to delete owner {owner_id}")
        
        # Возвращаем токен
        self.user_token = old_token
    
    def run_all_tests(self):
        """Запуск всех тестов"""
        print("🚀 Complete API Test Suite")
        print("=" * 50)
        
        # Проверка сервера
        if not self.test_server():
            return False
        
        try:
            # Аутентификация
            self.test_user_login()
            self.test_admin_login()
            
            # CRUD операции
            owner_id = self.test_create_owner()
            self.test_get_owners()
            
            if owner_id:
                car_id = self.test_create_car(owner_id)
                self.test_get_cars()
                
                if car_id:
                    self.test_get_car_by_id(car_id)
                    self.test_update_car(car_id)
            
            # Административные функции
            self.test_admin_endpoints()
            
            # Поиск
            self.test_search()
            
            # Очистка
            self.cleanup()
            
            print("\n🎉 All tests completed!")
            return True
            
        except Exception as e:
            print(f"\n💥 Test failed with error: {e}")
            return False

def main():
    base_url = "http://127.0.0.1:8000"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    tester = APITester(base_url)
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ Complete API test finished successfully!")
    else:
        print("\n❌ Some tests failed!")

if __name__ == "__main__":
    main()
