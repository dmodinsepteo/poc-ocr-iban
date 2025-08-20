#!/bin/bash

# Script pour synchroniser les fichiers package-lock.json avant le build Docker

echo "🔄 Synchronisation des fichiers package-lock.json..."

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Synchroniser le backend
echo ""
echo "=== Synchronisation Backend ==="
if [ -f "backend/package.json" ]; then
    cd backend
    echo "📦 Mise à jour du package-lock.json du backend..."
    npm install --package-lock-only
    if [ $? -eq 0 ]; then
        print_status 0 "Backend synchronisé"
    else
        print_status 1 "Erreur lors de la synchronisation du backend"
    fi
    cd ..
else
    print_warning "package.json du backend non trouvé"
fi

# Synchroniser le frontend
echo ""
echo "=== Synchronisation Frontend ==="
if [ -f "frontend/package.json" ]; then
    cd frontend
    echo "📦 Mise à jour du package-lock.json du frontend..."
    npm install --package-lock-only
    if [ $? -eq 0 ]; then
        print_status 0 "Frontend synchronisé"
    else
        print_status 1 "Erreur lors de la synchronisation du frontend"
    fi
    cd ..
else
    print_warning "package.json du frontend non trouvé"
fi

echo ""
echo "🎉 Synchronisation terminée !"
echo ""
echo "Vous pouvez maintenant construire les images Docker :"
echo "  docker-compose build --no-cache"
echo "  ou"
echo "  ./docker-start.sh"
