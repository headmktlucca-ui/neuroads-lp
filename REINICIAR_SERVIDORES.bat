@echo off
title Reiniciando Servidores...
echo.
echo ============================================
echo           Reiniciando Servidores
echo ============================================
echo.

cd /d "%~dp0"

echo 1. Parando o servidor de preview...
python .agent/scripts/auto_preview.py stop
echo.

echo 2. Iniciando o servidor de preview...
python .agent/scripts/auto_preview.py start
echo.

echo ============================================
echo   Servidor reiniciado com sucesso!
echo ============================================
echo.
pause
