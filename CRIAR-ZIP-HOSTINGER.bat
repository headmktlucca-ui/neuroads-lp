@echo off
title Criando ZIP para Hostinger...
echo.
echo ============================================
echo    Criando pacote de deploy para Hostinger
echo ============================================
echo.

cd /d "%~dp0"

powershell -ExecutionPolicy Bypass -File "scripts\ops\create-hostinger-zip.ps1"

echo.
if %ERRORLEVEL% EQU 0 (
    echo [OK] ZIP criado com sucesso em: dist\deploy-hostinger.zip
    explorer "dist"
) else (
    echo [ERRO] Falha ao criar o ZIP. Verifique a saida acima.
)

pause
