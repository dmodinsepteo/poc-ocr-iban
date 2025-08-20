#!/bin/bash

# Script pour arrêter l'application RIB OCR avec Docker

echo "🛑 Arrêt de l'application RIB OCR..."

# Arrêter les conteneurs
echo "⏹️ Arrêt des conteneurs..."
docker-compose down

echo "✅ Application arrêtée avec succès !"

# Option pour nettoyer complètement
read -p "Voulez-vous supprimer les volumes et images ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Nettoyage complet..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    echo "✅ Nettoyage terminé !"
fi
