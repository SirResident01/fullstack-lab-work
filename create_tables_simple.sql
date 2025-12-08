-- ============================================
-- Упрощенный SQL скрипт для создания таблиц
-- Без тестовых данных
-- ============================================

-- 1. Таблица пользователей
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_app_users_username ON app_users(username);

-- 2. Таблица владельцев
CREATE TABLE IF NOT EXISTS owner (
    ownerid SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL
);

-- 3. Таблица автомобилей
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

CREATE INDEX IF NOT EXISTS ix_car_owner_id ON car(owner_id);


