#!/bin/bash

# Script pour démarrer l'application RIB OCR avec Docker

echo "🚀 Démarrage de l'application RIB OCR avec Docker..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker Desktop."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose."
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Synchroniser les fichiers package-lock.json
echo "🔄 Synchronisation des fichiers package-lock.json..."
if [ -f "docker-sync.sh" ]; then
    chmod +x docker-sync.sh
    ./docker-sync.sh
else
    echo "⚠️ Script de synchronisation non trouvé, synchronisation manuelle..."
    if [ -f "backend/package.json" ]; then
        cd backend && npm install --package-lock-only && cd ..
    fi
    if [ -f "frontend/package.json" ]; then
        cd frontend && npm install --package-lock-only && cd ..
    fi
fi

# Nettoyer les images (optionnel)
read -p "Voulez-vous nettoyer les images Docker existantes ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Nettoyage des images Docker..."
    docker-compose down --rmi all --volumes --remove-orphans
fi

# Construire et démarrer les conteneurs
echo "🔨 Construction des images Docker..."
docker-compose build --no-cache

echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs :"
docker-compose ps

echo ""
echo "✅ Application démarrée avec succès !"
echo ""
echo "🌐 Frontend : http://localhost:3000"
echo "🔧 Backend : http://localhost:3001"
echo ""
echo "📝 Commandes utiles :"
echo "  - Voir les logs : docker-compose logs -f"
echo "  - Arrêter : docker-compose down"
echo "  - Redémarrer : docker-compose restart"
echo "  - Reconstruire : docker-compose up --build"
echo ""
echo "🔍 Logs en temps réel :"
docker-compose logs -f
