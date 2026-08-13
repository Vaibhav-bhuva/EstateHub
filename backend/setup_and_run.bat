@echo off
echo ============================================
echo  EstateHub - Django Server Setup
echo ============================================

echo.
echo [1/4] Creating virtual environment...
python -m venv venv

echo.
echo [2/4] Activating venv and installing packages...
call venv\Scripts\activate
pip install -r requirements.txt

echo.
echo [3/4] Running migrations...
python manage.py migrate

echo.
echo [4/4] Starting Django server...
python manage.py runserver 0.0.0.0:8000

pause
