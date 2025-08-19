#!/bin/bash

echo "🚀 Démarrage du projet RIB OCR..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js et npm détectés"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm run install:all
fi

# Configurer l'environnement backend si nécessaire
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Configuration de l'environnement backend..."
    cp backend/env.example backend/.env
fi

# Générer Prisma si nécessaire
if [ ! -d "backend/node_modules/.prisma" ]; then
    echo "🗄️  Génération du client Prisma..."
    npm run db:generate
fi

# Pousser le schéma de base de données
echo "🗄️  Configuration de la base de données..."
npm run db:push

echo "🎉 Configuration terminée !"
echo "🌐 Démarrage des services..."
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:3001"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les services"

# Démarrer les services
npm run dev 