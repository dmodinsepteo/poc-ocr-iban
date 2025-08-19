#!/bin/bash

echo "🔧 Initialisation du repository Git..."

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "🎉 Initial commit: RIB OCR Extractor avec backend Express/Prisma et frontend Vue.js

- Backend Express avec API REST
- Base de données SQLite gérée par Prisma
- Frontend Vue.js 3 avec Vite
- Architecture monorepo avec scripts unifiés
- Configuration Docker et VS Code
- Documentation complète"

echo "✅ Repository Git initialisé avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Ajouter votre remote origin :"
echo "   git remote add origin <votre-repo-url>"
echo ""
echo "2. Pousser vers GitHub/GitLab :"
echo "   git push -u origin main"
echo ""
echo "3. Démarrer le projet :"
echo "   ./start.sh" 