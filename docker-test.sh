#!/bin/bash

# Script de test pour vérifier le bon fonctionnement des conteneurs Docker

echo "🧪 Test des conteneurs Docker..."

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

# Vérifier que les conteneurs sont en cours d'exécution
echo ""
echo "=== Vérification des conteneurs ==="

# Vérifier le backend
if docker-compose ps | grep -q "rib-ocr-backend.*Up"; then
    print_status 0 "Backend en cours d'exécution"
else
    print_status 1 "Backend non démarré"
fi

# Vérifier le frontend
if docker-compose ps | grep -q "rib-ocr-frontend.*Up"; then
    print_status 0 "Frontend en cours d'exécution"
else
    print_status 1 "Frontend non démarré"
fi

# Vérifier les ports
echo ""
echo "=== Vérification des ports ==="

# Test du backend
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status 0 "Backend accessible sur le port 3001"
else
    print_status 1 "Backend non accessible sur le port 3001"
fi

# Test du frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_status 0 "Frontend accessible sur le port 3000"
else
    print_status 1 "Frontend non accessible sur le port 3000"
fi

# Vérifier les logs pour les erreurs
echo ""
echo "=== Vérification des logs ==="

# Vérifier les logs du backend
if docker-compose logs backend 2>&1 | grep -q "spawn xdg-open ENOENT"; then
    print_warning "Erreur xdg-open détectée dans les logs du backend (normal)"
else
    print_status 0 "Aucune erreur xdg-open dans les logs du backend"
fi

# Vérifier les logs du frontend
if docker-compose logs frontend 2>&1 | grep -q "spawn xdg-open ENOENT"; then
    print_warning "Erreur xdg-open détectée dans les logs du frontend (normal)"
else
    print_status 0 "Aucune erreur xdg-open dans les logs du frontend"
fi

# Vérifier les erreurs critiques
if docker-compose logs frontend 2>&1 | grep -q "Error:"; then
    print_status 1 "Erreurs détectées dans les logs du frontend"
    echo "Dernières erreurs :"
    docker-compose logs --tail=10 frontend | grep "Error:"
else
    print_status 0 "Aucune erreur critique dans les logs du frontend"
fi

if docker-compose logs backend 2>&1 | grep -q "Error:"; then
    print_status 1 "Erreurs détectées dans les logs du backend"
    echo "Dernières erreurs :"
    docker-compose logs --tail=10 backend | grep "Error:"
else
    print_status 0 "Aucune erreur critique dans les logs du backend"
fi

echo ""
echo "🎉 Test terminé !"
echo ""
echo "Si tout est vert, votre application fonctionne correctement :"
echo "  🌐 Frontend : http://localhost:3000"
echo "  🔧 Backend  : http://localhost:3001"
echo ""
echo "Si vous voyez des erreurs xdg-open, c'est normal en Docker."
echo "L'application fonctionne correctement même avec ces messages."
