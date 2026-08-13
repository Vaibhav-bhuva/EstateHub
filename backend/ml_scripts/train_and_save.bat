@echo off
echo ============================================
echo  EstateHub - ML Model Training
echo ============================================

echo.
echo [1/3] Installing ML dependencies...
pip install -r requirements.txt

echo.
echo [2/3] Generating dataset...
python dataset/generate_dataset.py

echo.
echo [3/3] Training models and saving best...
python train_model.py

echo.
echo Done! Model saved to models/
pause
