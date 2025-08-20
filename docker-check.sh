#!/bin/bash

# Script de vérification Docker pour l'application RIB OCR

echo "🔍 Vérification de l'environnement Docker..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Vérifier Docker
echo ""
echo "=== Vérification Docker ==="
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status 0 "Docker installé: $DOCKER_VERSION"
    
    # Vérifier si Docker daemon fonctionne
    if docker info &> /dev/null; then
        print_status 0 "Docker daemon fonctionne"
    else
        print_status 1 "Docker daemon ne fonctionne pas"
        print_warning "Démarrez Docker Desktop ou le service Docker"
    fi
else
    print_status 1 "Docker non installé"
    print_info "Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop"
fi

# Vérifier Docker Compose
echo ""
echo "=== Vérification Docker Compose ==="
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_status 0 "Docker Compose installé: $COMPOSE_VERSION"
elif docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    print_status 0 "Docker Compose installé (plugin): $COMPOSE_VERSION"
else
    print_status 1 "Docker Compose non installé"
    print_info "Docker Compose est généralement inclus avec Docker Desktop"
fi

# Vérifier les ports
echo ""
echo "=== Vérification des ports ==="
if netstat -tulpn 2>/dev/null | grep -q ":3000 "; then
    print_warning "Le port 3000 est déjà utilisé"
else
    print_status 0 "Le port 3000 est disponible"
fi

if netstat -tulpn 2>/dev/null | grep -q ":3001 "; then
    print_warning "Le port 3001 est déjà utilisé"
else
    print_status 0 "Le port 3001 est disponible"
fi

# Vérifier les fichiers Docker
echo ""
echo "=== Vérification des fichiers Docker ==="
if [ -f "docker-compose.yml" ]; then
    print_status 0 "docker-compose.yml trouvé"
else
    print_status 1 "docker-compose.yml manquant"
fi

if [ -f "backend/Dockerfile" ]; then
    print_status 0 "backend/Dockerfile trouvé"
else
    print_status 1 "backend/Dockerfile manquant"
fi

if [ -f "frontend/Dockerfile" ]; then
    print_status 0 "frontend/Dockerfile trouvé"
else
    print_status 1 "frontend/Dockerfile manquant"
fi

# Vérifier les scripts
echo ""
echo "=== Vérification des scripts ==="
if [ -f "docker-start.sh" ]; then
    if [ -x "docker-start.sh" ]; then
        print_status 0 "docker-start.sh trouvé et exécutable"
    else
        print_warning "docker-start.sh trouvé mais non exécutable"
        print_info "Exécutez: chmod +x docker-start.sh"
    fi
else
    print_status 1 "docker-start.sh manquant"
fi

if [ -f "docker-stop.sh" ]; then
    if [ -x "docker-stop.sh" ]; then
        print_status 0 "docker-stop.sh trouvé et exécutable"
    else
        print_warning "docker-stop.sh trouvé mais non exécutable"
        print_info "Exécutez: chmod +x docker-stop.sh"
    fi
else
    print_status 1 "docker-stop.sh manquant"
fi

# Vérifier l'espace disque
echo ""
echo "=== Vérification de l'espace disque ==="
DISK_SPACE=$(df -h . | awk 'NR==2 {print $4}')
print_info "Espace disque disponible: $DISK_SPACE"

# Vérifier la mémoire
echo ""
echo "=== Vérification de la mémoire ==="
if command -v free &> /dev/null; then
    MEMORY=$(free -h | awk 'NR==2 {print $7}')
    print_info "Mémoire disponible: $MEMORY"
else
    print_warning "Impossible de vérifier la mémoire"
fi

# Résumé
echo ""
echo "=== Résumé ==="
print_info "Pour démarrer l'application :"
echo "  ./docker-start.sh"
echo ""
print_info "Pour arrêter l'application :"
echo "  ./docker-stop.sh"
echo ""
print_info "URLs d'accès :"
echo "  Frontend: http://localhost:3000"
echo "  Backend: http://localhost:3001"
echo ""
print_info "Documentation complète :"
echo "  Voir le fichier DOCKER.md"
