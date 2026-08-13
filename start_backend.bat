@echo off
echo ============================================================
echo   EstateVision AI - Backend (Django Server)
echo ============================================================
echo.
cd backend
if exist venv\Scripts\activate (
    call venv\Scripts\activate
)
python manage.py runserver
pause
