@echo off
echo === VIVIW — Python Dependencies Installer ===
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python tidak ditemukan.
    echo Download Python 3.10+ dari https://python.org/downloads
    echo Pastikan "Add Python to PATH" dicentang saat install.
    pause
    exit /b 1
)

echo Python ditemukan. Menginstall dependencies...
echo.

:: Upgrade pip
python -m pip install --upgrade pip

:: Install faster-whisper
echo.
echo [1/3] Installing faster-whisper...
pip install faster-whisper

:: Install numpy (usually comes with faster-whisper but just in case)
echo.
echo [2/3] Installing numpy...
pip install numpy

:: Install torch CPU (for faster-whisper backend)
echo.
echo [3/3] Installing PyTorch CPU...
pip install torch --index-url https://download.pytorch.org/whl/cpu

echo.
echo === Instalasi selesai! ===
echo Jalankan VIVIW dan klik "Listen" untuk memulai.
echo.
pause
