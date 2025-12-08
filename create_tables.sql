-- ============================================
-- SQL скрипт для создания таблиц базы данных
-- Для PostgreSQL / Supabase
-- ============================================

-- Таблица пользователей системы
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' NOT NULL
);

-- Создаем индекс для быстрого поиска по username
CREATE INDEX IF NOT EXISTS ix_app_users_username ON app_users(username);

-- Таблица владельцев автомобилей
CREATE TABLE IF NOT EXISTS owner (
    ownerid SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL
);

-- Таблица автомобилей
CREATE TABLE IF NOT EXISTS car (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(40) NOT NULL,
    "registrationNumber" VARCHAR(40) NOT NULL,
    "modelYear" INTEGER NOT NULL,
    price INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
    CONSTRAINT fk_car_owner FOREIGN KEY (owner_id) REFERENCES owner(ownerid) ON DELETE CASCADE
);

-- Создаем индекс для быстрого поиска по owner_id
CREATE INDEX IF NOT EXISTS ix_car_owner_id ON car(owner_id);

-- ============================================
-- Опционально: Вставка тестовых данных
-- ============================================

-- Вставляем тестовых владельцев (только если таблица пустая)
INSERT INTO owner (firstname, lastname)
SELECT 'John', 'Johnson'
WHERE NOT EXISTS (SELECT 1 FROM owner WHERE firstname = 'John' AND lastname = 'Johnson');

INSERT INTO owner (firstname, lastname)
SELECT 'Mary', 'Robinson'
WHERE NOT EXISTS (SELECT 1 FROM owner WHERE firstname = 'Mary' AND lastname = 'Robinson');

-- Вставляем тестовые автомобили (только если таблица пустая)
INSERT INTO car (brand, model, color, "registrationNumber", "modelYear", price, owner_id)
SELECT 'Ford', 'Mustang', 'Red', 'ADF-1121', 2023, 59000, 
       (SELECT ownerid FROM owner WHERE firstname = 'John' AND lastname = 'Johnson' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM car WHERE "registrationNumber" = 'ADF-1121');

INSERT INTO car (brand, model, color, "registrationNumber", "modelYear", price, owner_id)
SELECT 'Nissan', 'Leaf', 'White', 'SSJ-3002', 2020, 29000,
       (SELECT ownerid FROM owner WHERE firstname = 'Mary' AND lastname = 'Robinson' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM car WHERE "registrationNumber" = 'SSJ-3002');

INSERT INTO car (brand, model, color, "registrationNumber", "modelYear", price, owner_id)
SELECT 'Toyota', 'Prius', 'Silver', 'KKO-0212', 2022, 39000,
       (SELECT ownerid FROM owner WHERE firstname = 'Mary' AND lastname = 'Robinson' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM car WHERE "registrationNumber" = 'KKO-0212');

-- ============================================
-- Проверка созданных таблиц
-- ============================================

-- Показать все таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Показать структуру таблиц
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('app_users', 'owner', 'car')
ORDER BY table_name, ordinal_position;


