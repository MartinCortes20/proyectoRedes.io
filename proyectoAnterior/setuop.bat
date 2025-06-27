@echo off
echo ========================================
echo Centro Luna - Configuracion de VMs
echo Equipo 3: Carmona Viana Israel - Cortes Buendia Martin
echo ========================================

echo.
echo [1/5] Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python no encontrado. Instala Python primero.
    pause
    exit
)

echo.
echo [2/5] Instalando dependencias...
pip install flask flask-cors requests ipaddress

echo.
echo [3/5] Creando estructura de directorios...
if not exist "static" mkdir static
if not exist "logs" mkdir logs

echo.
echo [4/5] Configurando firewall Windows...
netsh advfirewall firewall add rule name="Centro Luna HTTP" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="Centro Luna SYSLOG" dir=in action=allow protocol=UDP localport=514
netsh advfirewall firewall add rule name="Centro Luna SYSLOG HTTP" dir=in action=allow protocol=TCP localport=514

echo.
echo [5/5] Verificando configuracion de red...
ipconfig | findstr "IPv4"

echo.
echo ========================================
echo ✅ Configuracion completada!
echo.
echo IMPORTANTE: 
echo 1. En VM1: Copia los archivos web a la carpeta 'static'
echo 2. En VM1: Ejecuta 'python servidor_web.py'
echo 3. En VM2: Ejecuta 'python servidor_syslog.py'
echo.
echo URLs de prueba:
echo - VM1 Web: http://172.19.5.146:8080
echo - VM2 Health: http://172.19.5.147:514/health
echo ========================================
pause