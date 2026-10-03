#!/bin/bash

echo "🚀 RaiderOk Mobile App Setup"
echo ""

echo "📦 Checking Node.js and npm..."
node --version
npm --version

echo ""
echo "📱 Installing Expo CLI..."
npm install -g expo-cli

echo ""
echo "📂 Installing dependencies..."
cd mobile
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the app:"
echo "  cd mobile"
echo "  npm start"
echo ""
echo "Then:"
echo "  - Press 'a' to open Android Emulator"
echo "  - Press 'w' to open Web"
echo "  - Scan QR with Expo Go app on your phone"
echo ""
