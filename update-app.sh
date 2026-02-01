#!/bin/bash

# StockAlert Pro - Script di aggiornamento
# Esegui con: ./update-app.sh

echo ""
echo "╔════════════════════════════════════════╗"
echo "║     StockAlert Pro - Aggiornamento     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Vai nella cartella del progetto
cd "$(dirname "$0")"

# Mostra versione attuale
CURRENT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
echo "Versione attuale: v$CURRENT_VERSION"
echo ""

# Chiedi nuova versione
read -p "Nuova versione (es: 1.0.2): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo "❌ Versione non valida. Uscita."
    exit 1
fi

echo ""
echo "📝 Aggiornamento versione a v$NEW_VERSION..."

# Aggiorna package.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json

# Aggiorna anche TopBar.tsx con la nuova versione
sed -i '' "s/const APP_VERSION = '.*'/const APP_VERSION = '$NEW_VERSION'/" components/TopBar.tsx

echo "✅ Versione aggiornata"
echo ""
echo "🔨 Build in corso... (può richiedere qualche minuto)"
echo ""

# Pulisci e fai il build
rm -rf release dist

npm run electron:build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Errore durante il build!"
    exit 1
fi

echo ""
echo "📦 Installazione in Applicazioni..."

# Chiudi l'app se è aperta
pkill -f "StockAlert Pro" 2>/dev/null
sleep 1

# Copia in Applications
rm -rf "/Applications/StockAlert Pro.app"
cp -R "release/mac-arm64/StockAlert Pro.app" "/Applications/"

echo "✅ App installata!"
echo ""
echo "🚀 Avvio StockAlert Pro v$NEW_VERSION..."

# Avvia l'app
open "/Applications/StockAlert Pro.app"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║      Aggiornamento completato! ✅       ║"
echo "╚════════════════════════════════════════╝"
echo ""
