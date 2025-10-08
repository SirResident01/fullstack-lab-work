#!/usr/bin/env python3
"""
Скрипт для создания первого администратора в системе
Используйте этот скрипт только для первоначальной настройки
"""

import os
import sys
from pathlib import Path

# Добавляем путь к приложению
sys.path.append(str(Path(__file__).parent))

from app.db import SessionLocal
from app.models import AppUser
from passlib.context import CryptContext

def create_admin():
    """Создает первого администратора"""
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    with SessionLocal() as db:
        # Проверяем, есть ли уже администраторы
        existing_admin = db.query(AppUser).filter(AppUser.role == "ADMIN").first()
        if existing_admin:
            print("❌ Администратор уже существует в системе!")
            print(f"   Имя: {existing_admin.username}")
            return
        
        # Создаем нового администратора
        username = input("Введите имя пользователя для администратора: ").strip()
        if not username:
            print("❌ Имя пользователя не может быть пустым!")
            return
        
        password = input("Введите пароль для администратора: ").strip()
        if not password:
            print("❌ Пароль не может быть пустым!")
            return
        
        if len(password) < 6:
            print("❌ Пароль должен содержать минимум 6 символов!")
            return
        
        # Проверяем, что пользователь с таким именем не существует
        existing_user = db.query(AppUser).filter(AppUser.username == username).first()
        if existing_user:
            print(f"❌ Пользователь с именем '{username}' уже существует!")
            return
        
        # Создаем администратора
        hashed_password = pwd_context.hash(password)
        admin = AppUser(
            username=username,
            password_hash=hashed_password,
            role="ADMIN"
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Администратор успешно создан!")
        print(f"   ID: {admin.id}")
        print(f"   Имя: {admin.username}")
        print(f"   Роль: {admin.role}")

if __name__ == "__main__":
    print("🔧 Создание первого администратора")
    print("=" * 40)
    create_admin()
