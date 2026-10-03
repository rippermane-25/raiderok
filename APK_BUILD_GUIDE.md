# RaiderOk Android APK для BlueStacks

## Быстрый старт (2 минуты)

### Шаг 1: Установи Node.js и npm
- Скачай: https://nodejs.org/ (LTS версия)
- Установи
- Проверь в терминале:
  ```
  node --version
  npm --version
  ```

### Шаг 2: Клонируй репозиторий
```bash
git clone https://github.com/rippermane-25/raiderok.git
cd raiderok
```

### Шаг 3: Установи зависимости
```bash
cd mobile
npm install
```

### Шаг 4: Собери APK для локального тестирования
```bash
npx expo run:android
```
Или если нужен файл APK (без эмулятора):
```bash
npx eas build --platform android --profile preview --local
```

### Шаг 5: Или собери вручную без EAS (самый простой способ)

Если хочешь самый быстрый вариант - используй готовый скрипт:

```bash
bash build-apk.sh
```

## Установка в BlueStacks

1. Запусти BlueStacks
2. Найди полученный APK файл (обычно в папке `android/app/build/outputs/apk/`)
3. Перетащи APK в окно BlueStacks
4. Приложение установится автоматически
5. Запусти RaiderOk
6. Введи номер телефона: `+380938926388`
7. Код из консоли backend: посмотри в терминале где запущен backend

## Если что-то не работает

Попробуй это:

```bash
# Очистить кэш
cd mobile
rm -rf node_modules
rm package-lock.json
npm install

# Собрать заново
npx expo run:android
```

## Нужен готовый APK без установки?

Скачай pre-built APK (будет готов после первой сборки):

https://github.com/rippermane-25/raiderok/releases/

(после публикации релиза)

## API должен быть запущен!

До запуска приложения убедись, что backend работает:

```bash
# В отдельном терминале:
cd backend
npm install
npm run start:dev

# Или через Docker:
docker-compose up -d
```

Тогда в приложении поменяй API_URL в App.js на локальный IP (обычно 192.168.x.x или localhost).
