@echo off
chcp 65001 >nul
echo Testing Car Management System API
echo ==================================

echo.
echo Running complete API test...
echo ---------------------------
python test_complete_api.py

echo.
echo Test completed!
pause

