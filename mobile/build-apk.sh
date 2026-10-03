#!/bin/bash

set -e

echo "🚀 RaiderOk - Build APK для BlueStacks"
echo ""

# Проверка Node.js
echo "📦 Проверяю Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Скачай отсюда: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

echo ""
echo "📂 Переходу в папку mobile..."
cd mobile || exit 1

echo ""
echo "📥 Устанавливаю зависимости..."
npm install

echo ""
echo "🔨 Собираю APK..."
echo ""
echo "Выбери вариант:"
echo "1) Локальная сборка (нужен Android SDK)"
echo "2) Облачная сборка через Expo (рекомендуется)"
echo ""
read -p "Введи 1 или 2: " choice

case $choice in
    1)
        echo "🔧 Локальная сборка (нужен Android SDK установлен)..."
        npx expo run:android
        echo ""
        echo "✅ APK собран!"
        echo "📍 Найди его здесь: android/app/build/outputs/apk/"
        ;;
    2)
        echo "☁️  Облачная сборка (Expo)..."
        echo "Нужно залогиниться в Expo:"
        npx eas login
        echo ""
        echo "Собираю..."
        npx eas build --platform android --profile preview
        echo ""
        echo "✅ APK готов для скачивания!"
        echo "Ссылка будет выше в логе ↑"
        ;;
    *)
        echo "❌ Неправильный выбор"
        exit 1
        ;;
esac

echo ""
echo "🎉 Готово!"
echo ""
echo "Следующий шаг:"
echo "1. Открой BlueStacks"
echo "2. Перетащи APK в окно BlueStacks"
echo "3. Приложение установится автоматически"
echo "4. Запусти RaiderOk"
echo "5. Введи номер: +380938926388"
echo ""
