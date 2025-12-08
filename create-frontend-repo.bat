@echo off
echo ========================================
echo Creating Frontend Repository
echo ========================================
echo.

REM Создать новую папку
cd ..
if exist frontend (
    echo Folder "frontend" already exists!
    echo Please remove it first or choose another name.
    pause
    exit /b 1
)

mkdir frontend
cd frontend
echo Created folder: frontend
echo.

REM Инициализировать git
git init
git branch -M main
echo Initialized git repository
echo.

REM Вернуться в исходную папку для копирования
cd ..\fullstack-lab-work

echo Copying frontend files...
echo.

REM Копировать файлы конфигурации
copy package.json ..\frontend\
copy package-lock.json ..\frontend\
copy next.config.js ..\frontend\
copy tsconfig.json ..\frontend\
copy tailwind.config.js ..\frontend\
copy postcss.config.js ..\frontend\
copy vitest.config.ts ..\frontend\
copy next-env.d.ts ..\frontend\
copy env.production.example ..\frontend\
copy VERCEL_DEPLOYMENT_COMPLETE.md ..\frontend\

REM Копировать папки
xcopy /E /I /Y pages ..\frontend\pages
xcopy /E /I /Y components ..\frontend\components
xcopy /E /I /Y lib ..\frontend\lib
xcopy /E /I /Y contexts ..\frontend\contexts
xcopy /E /I /Y hooks ..\frontend\hooks
xcopy /E /I /Y types ..\frontend\types
xcopy /E /I /Y styles ..\frontend\styles
xcopy /E /I /Y public ..\frontend\public
xcopy /E /I /Y tests ..\frontend\tests

echo.
echo Files copied successfully!
echo.

REM Перейти в новую папку
cd ..\frontend

REM Создать .gitignore
copy ..\fullstack-lab-work\.gitignore.frontend .gitignore
echo Created .gitignore

REM Создать README
copy ..\fullstack-lab-work\README.frontend.md README.md
echo Created README.md

echo.
echo ========================================
echo Frontend repository created!
echo ========================================
echo.
echo Next steps:
echo 1. Review the files in: %CD%
echo 2. Create repository on GitHub
echo 3. Run: git add .
echo 4. Run: git commit -m "Initial commit: Frontend"
echo 5. Run: git remote add origin https://github.com/YOUR_USERNAME/frontend.git
echo 6. Run: git push -u origin main
echo.
pause


