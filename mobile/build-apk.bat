#!/bin/bash
# Windows (GitBash / PowerShell)

@echo off
echo 🚀 RaiderOk - Build APK для BlueStacks (Windows)
echo.

echo Проверяю Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не установлен!
    echo Скачай: https://nodejs.org/ (LTS)
    pause
    exit /b 1
)

echo ✅ Node.js найден
echo.

cd mobile

echo 📥 Устанавливаю зависимости...
call npm install

echo.
echo 🔨 Собираю APK для BlueStacks...
echo.

echo Выбери способ:
echo 1 = Локальная сборка (если установлен Android SDK)
echo 2 = Облачная через Expo (рекомендуется)
echo.

set /p choice="Введи 1 или 2: "

if "%choice%"=="1" (
    echo Локальная сборка...
    call npx expo run:android
    echo.
    echo ✅ APK готов в: android\app\build\outputs\apk\
) else if "%choice%"=="2" (
    echo Облачная сборка...
    call npx eas login
    call npx eas build --platform android --profile preview
    echo.
    echo ✅ APK готов для скачивания (ссылка выше)
) else (
    echo ❌ Неправильный выбор
    pause
    exit /b 1
)

echo.
echo 🎉 Готово!
echo.
echo Откройте BlueStacks и перетащите APK в окно
echo.
pause
