#!/bin/bash

# Script pour basculer entre Alpine et Debian pour le backend

echo "🔄 Basculement de l'image backend..."

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

# Vérifier l'argument
if [ "$1" != "alpine" ] && [ "$1" != "debian" ]; then
    echo "Usage: $0 [alpine|debian]"
    echo ""
    echo "Options :"
    echo "  alpine  - Utiliser l'image Alpine (plus légère, peut avoir des problèmes OpenSSL)"
    echo "  debian  - Utiliser l'image Debian (plus stable, meilleure compatibilité OpenSSL)"
    exit 1
fi

TARGET=$1

echo ""
echo "=== Basculement vers $TARGET ==="

# Arrêter le backend
echo ""
echo "=== Arrêt du backend ==="
docker-compose stop backend
if [ $? -eq 0 ]; then
    print_status 0 "Backend arrêté"
else
    print_status 1 "Erreur lors de l'arrêt du backend"
fi

# Sauvegarder le Dockerfile actuel
echo ""
echo "=== Sauvegarde du Dockerfile actuel ==="
if [ -f "backend/Dockerfile" ]; then
    cp backend/Dockerfile backend/Dockerfile.backup
    print_status 0 "Dockerfile sauvegardé"
fi

# Basculer vers la version demandée
echo ""
echo "=== Basculement vers $TARGET ==="
if [ "$TARGET" = "debian" ]; then
    if [ -f "backend/Dockerfile.debian" ]; then
        cp backend/Dockerfile.debian backend/Dockerfile
        print_status 0 "Basculement vers Debian"
    else
        print_status 1 "Dockerfile.debian non trouvé"
        exit 1
    fi
else
    # Restaurer la version Alpine
    if [ -f "backend/Dockerfile.backup" ]; then
        cp backend/Dockerfile.backup backend/Dockerfile
        print_status 0 "Basculement vers Alpine"
    else
        print_status 1 "Dockerfile.backup non trouvé"
        exit 1
    fi
fi

# Supprimer l'image du backend
echo ""
echo "=== Suppression de l'image backend ==="
docker-compose down backend
docker rmi rib-ocr-project_backend 2>/dev/null
print_status 0 "Image backend supprimée"

# Reconstruire le backend
echo ""
echo "=== Reconstruction du backend avec $TARGET ==="
docker-compose build --no-cache backend
if [ $? -eq 0 ]; then
    print_status 0 "Backend reconstruit avec succès"
else
    print_status 1 "Erreur lors de la reconstruction du backend"
    exit 1
fi

# Redémarrer le backend
echo ""
echo "=== Redémarrage du backend ==="
docker-compose up -d backend
if [ $? -eq 0 ]; then
    print_status 0 "Backend redémarré"
else
    print_status 1 "Erreur lors du redémarrage du backend"
    exit 1
fi

# Attendre que le backend soit prêt
echo ""
echo "=== Attente du démarrage du backend ==="
sleep 15

# Vérifier les logs
echo ""
echo "=== Vérification des logs ==="
if docker-compose logs backend | grep -q "Error:"; then
    print_status 1 "Erreurs détectées dans les logs"
    echo "Derniers logs du backend :"
    docker-compose logs --tail=20 backend
else
    print_status 0 "Aucune erreur dans les logs"
fi

# Vérifier la santé du backend
echo ""
echo "=== Test de santé du backend ==="
sleep 5
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status 0 "Backend accessible et fonctionnel"
else
    print_status 1 "Backend non accessible"
    echo "Logs du backend :"
    docker-compose logs --tail=10 backend
fi

echo ""
echo "🎉 Basculement vers $TARGET terminé !"
echo ""
echo "Image actuelle : $TARGET"
echo "Si vous avez des problèmes, vous pouvez basculer vers l'autre version :"
echo "  $0 alpine   # Pour Alpine (plus léger)"
echo "  $0 debian   # Pour Debian (plus stable)"
