@echo off
echo ========================================
echo Pushing Frontend to GitHub Repository
echo ========================================
echo.

REM Перейти на уровень выше
cd ..

REM Проверить существует ли папка frontend
if exist fullstack-lab-work-front (
    echo Folder "fullstack-lab-work-front" already exists!
    echo Removing old folder...
    rmdir /s /q fullstack-lab-work-front
)

echo Cloning repository...
git clone https://github.com/SirResident01/fullstack-lab-work-front.git
if errorlevel 1 (
    echo Failed to clone repository!
    pause
    exit /b 1
)

cd fullstack-lab-work-front
echo.
echo Repository cloned successfully!
echo.

REM Вернуться в исходную папку для копирования
cd ..\fullstack-lab-work

echo Copying frontend files...
echo.

REM Копировать файлы конфигурации
copy package.json ..\fullstack-lab-work-front\ 2>nul
copy package-lock.json ..\fullstack-lab-work-front\ 2>nul
copy next.config.js ..\fullstack-lab-work-front\ 2>nul
copy tsconfig.json ..\fullstack-lab-work-front\ 2>nul
copy tailwind.config.js ..\fullstack-lab-work-front\ 2>nul
copy postcss.config.js ..\fullstack-lab-work-front\ 2>nul
copy vitest.config.ts ..\fullstack-lab-work-front\ 2>nul
copy next-env.d.ts ..\fullstack-lab-work-front\ 2>nul
copy env.production.example ..\fullstack-lab-work-front\ 2>nul
copy VERCEL_DEPLOYMENT_COMPLETE.md ..\fullstack-lab-work-front\ 2>nul

REM Копировать папки
xcopy /E /I /Y pages ..\fullstack-lab-work-front\pages 2>nul
xcopy /E /I /Y components ..\fullstack-lab-work-front\components 2>nul
xcopy /E /I /Y lib ..\fullstack-lab-work-front\lib 2>nul
xcopy /E /I /Y contexts ..\fullstack-lab-work-front\contexts 2>nul
xcopy /E /I /Y hooks ..\fullstack-lab-work-front\hooks 2>nul
xcopy /E /I /Y types ..\fullstack-lab-work-front\types 2>nul
xcopy /E /I /Y styles ..\fullstack-lab-work-front\styles 2>nul
xcopy /E /I /Y public ..\fullstack-lab-work-front\public 2>nul
xcopy /E /I /Y tests ..\fullstack-lab-work-front\tests 2>nul

echo Files copied!
echo.

REM Перейти в репозиторий
cd ..\fullstack-lab-work-front

REM Создать .gitignore если его нет
if not exist .gitignore (
    copy ..\fullstack-lab-work\.gitignore.frontend .gitignore
    echo Created .gitignore
)

REM Создать README если его нет
if not exist README.md (
    copy ..\fullstack-lab-work\README.frontend.md README.md
    echo Created README.md
)

echo.
echo Adding files to git...
git add .

echo.
echo Committing...
git commit -m "Initial commit: Frontend for Car Management System"

echo.
echo Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo Push failed! You may need to:
    echo 1. Check your GitHub credentials
    echo 2. Run: git push -u origin main manually
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Successfully pushed to GitHub!
    echo Repository: https://github.com/SirResident01/fullstack-lab-work-front
    echo ========================================
)

echo.
pause


