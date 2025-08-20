# 🐳 Guide Docker - Application RIB OCR

Ce guide vous explique comment déployer et utiliser l'application RIB OCR avec Docker.

## 📋 Prérequis

### Logiciels requis
- **Docker Desktop** (Windows/Mac) ou **Docker Engine** (Linux)
- **Docker Compose** (inclus avec Docker Desktop)
- **Git** (pour cloner le projet)

### Vérification de l'installation
```bash
# Vérifier Docker
docker --version

# Vérifier Docker Compose
docker-compose --version
```

## 🚀 Démarrage rapide

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd rib-ocr-project
```

### 2. Démarrer l'application
```bash
# Utiliser le script automatique (recommandé)
./docker-start.sh

# Ou synchroniser manuellement puis démarrer
./docker-sync.sh
docker-compose up -d

# Ou utiliser Docker Compose directement (risque d'erreur de sync)
docker-compose up -d
```

### 3. Accéder à l'application
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:3001

## 📁 Structure Docker

```
rib-ocr-project/
├── docker-compose.yml          # Configuration des services
├── docker-start.sh             # Script de démarrage
├── docker-stop.sh              # Script d'arrêt
├── backend/
│   ├── Dockerfile              # Image du backend
│   └── .dockerignore           # Fichiers ignorés
└── frontend/
    ├── Dockerfile              # Image du frontend
    └── .dockerignore           # Fichiers ignorés
```

## 🔧 Configuration

### Services Docker

#### Backend (Node.js + Prisma)
- **Port** : 3001
- **Base de données** : SQLite (persistante via volume)
- **Variables d'environnement** :
  - `NODE_ENV=development`
  - `DATABASE_URL=file:./data/dev.db`
  - `PORT=3001`

#### Frontend (Vue.js + Vite)
- **Port** : 3000
- **Mode** : Développement avec hot reload
- **Variables d'environnement** :
  - `NODE_ENV=development`

### Volumes persistants
- `backend_data` : Base de données SQLite
- `./backend:/app` : Code source du backend (développement)
- `./frontend:/app` : Code source du frontend (développement)

### Réseau
- `rib-ocr-network` : Réseau isolé pour la communication inter-services

## 🛠️ Commandes utiles

### Gestion des conteneurs

```bash
# Démarrer l'application
docker-compose up -d

# Démarrer avec logs en temps réel
docker-compose up

# Arrêter l'application
docker-compose down

# Redémarrer les services
docker-compose restart

# Voir le statut des conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Gestion des images

```bash
# Reconstruire les images
docker-compose build --no-cache

# Reconstruire un service spécifique
docker-compose build --no-cache backend

# Supprimer les images
docker-compose down --rmi all

# Nettoyer Docker
docker system prune -f
```

### Accès aux conteneurs

```bash
# Accéder au shell du backend
docker-compose exec backend sh

# Accéder au shell du frontend
docker-compose exec frontend sh

# Exécuter une commande dans le backend
docker-compose exec backend npm run migrate

# Exécuter une commande dans le frontend
docker-compose exec frontend npm run build
```

## 🔍 Scripts automatiques

### Script de démarrage (`docker-start.sh`)
```bash
./docker-start.sh
```

**Fonctionnalités :**
- ✅ Vérification de Docker
- 🛑 Arrêt des conteneurs existants
- 🧹 Nettoyage optionnel des images
- 🔨 Construction des images
- 🚀 Démarrage des services
- 📊 Affichage du statut
- 📝 Affichage des logs

### Script d'arrêt (`docker-stop.sh`)
```bash
./docker-stop.sh
```

**Fonctionnalités :**
- 🛑 Arrêt des conteneurs
- 🧹 Nettoyage optionnel complet
- 📦 Suppression des volumes

## 🐛 Dépannage

### Problèmes courants

#### 1. Erreur de synchronisation package-lock.json
```bash
# Erreur : "npm ci can only install packages when your package.json and package-lock.json are in sync"

# Solution : Synchroniser les fichiers
./docker-sync.sh

# Ou synchroniser manuellement
cd backend && npm install --package-lock-only && cd ..
cd frontend && npm install --package-lock-only && cd ..

# Puis reconstruire
docker-compose build --no-cache
```

#### 2. Ports déjà utilisés
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Arrêter les processus utilisant les ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9
```

#### 2. Problèmes de permissions
```bash
# Donner les permissions aux scripts
chmod +x docker-start.sh docker-stop.sh

# Corriger les permissions des volumes
sudo chown -R $USER:$USER ./backend/data
```

#### 3. Base de données corrompue
```bash
# Supprimer le volume de la base de données
docker-compose down -v
docker volume rm rib-ocr-project_backend_data

# Redémarrer pour recréer la base
docker-compose up -d
```

#### 4. Problèmes de build
```bash
# Nettoyer complètement
docker-compose down --rmi all --volumes --remove-orphans
docker system prune -f

# Synchroniser les fichiers package-lock.json
./docker-sync.sh

# Reconstruire
docker-compose build --no-cache
docker-compose up -d
```

#### 5. Erreur "spawn xdg-open ENOENT"
```bash
# Erreur : Le conteneur essaie d'ouvrir automatiquement le navigateur

# Solution : L'ouverture automatique est désactivée dans Docker
# Accédez manuellement à http://localhost:3000

# Si le problème persiste, vérifiez la configuration Vite
# Le fichier vite.config.js doit avoir open: false pour Docker
```

#### 6. Erreur Prisma OpenSSL
```bash
# Erreur : "Prisma failed to detect the libssl/openssl version to use"
# Erreur : "Could not parse schema engine response"

# Solution 1 : Reconstruire le backend avec OpenSSL (Alpine)
./docker-rebuild-backend.sh

# Solution 2 : Basculer vers Debian (plus stable)
./docker-switch-backend.sh debian

# Solution 3 : Reconstruire manuellement
docker-compose stop backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

#### 7. Erreur "nodemon: not found"
```bash
# Erreur : Le conteneur ne trouve pas nodemon

# Solution : Reconstruire le backend avec toutes les dépendances
./docker-fix-nodemon.sh

# Ou reconstruire manuellement
docker-compose stop backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Logs de débogage

```bash
# Logs détaillés du backend
docker-compose logs -f backend

# Logs détaillés du frontend
docker-compose logs -f frontend

# Logs de tous les services
docker-compose logs -f

# Logs avec timestamps
docker-compose logs -f -t
```

## 🔄 Développement

### Mode développement
L'application est configurée pour le développement avec :
- **Hot reload** : Les modifications du code sont automatiquement rechargées
- **Volumes montés** : Le code source est monté dans les conteneurs
- **Logs en temps réel** : Affichage des logs de développement

### Modifier le code
1. Modifiez les fichiers dans `./backend/` ou `./frontend/`
2. Les changements sont automatiquement détectés
3. L'application se recharge automatiquement

### Ajouter des dépendances
```bash
# Backend
docker-compose exec backend npm install <package>

# Frontend
docker-compose exec frontend npm install <package>
```

## 🚀 Production

### Configuration de production
Pour déployer en production, modifiez `docker-compose.yml` :

```yaml
environment:
  - NODE_ENV=production
```

### Build de production
```bash
# Frontend
docker-compose exec frontend npm run build

# Backend
docker-compose exec backend npm run start
```

## 📊 Monitoring

### Ressources utilisées
```bash
# Voir l'utilisation des ressources
docker stats

# Voir l'espace disque utilisé
docker system df
```

### Santé des services
```bash
# Vérifier la santé du backend
curl http://localhost:3001/health

# Vérifier la santé du frontend
curl http://localhost:3000
```

## 🔐 Sécurité

### Bonnes pratiques
- ✅ Utiliser des images officielles
- ✅ Ne pas exposer de ports inutiles
- ✅ Utiliser des volumes pour les données persistantes
- ✅ Limiter les permissions des conteneurs
- ✅ Mettre à jour régulièrement les images

### Variables d'environnement sensibles
```bash
# Créer un fichier .env pour les secrets
echo "DATABASE_URL=file:./data/prod.db" > .env
echo "JWT_SECRET=your-secret-key" >> .env
```

## 📚 Commandes de référence

### Docker Compose
```bash
# Services
docker-compose up -d          # Démarrer en arrière-plan
docker-compose down           # Arrêter
docker-compose restart        # Redémarrer
docker-compose ps            # Statut

# Build
docker-compose build         # Construire
docker-compose build --no-cache  # Reconstruire

# Logs
docker-compose logs -f       # Logs en temps réel
docker-compose logs -f service  # Logs d'un service

# Nettoyage
docker-compose down -v       # Supprimer les volumes
docker-compose down --rmi all  # Supprimer les images
```

### Docker
```bash
# Images
docker images                # Lister les images
docker rmi image            # Supprimer une image
docker system prune         # Nettoyer

# Conteneurs
docker ps                   # Conteneurs actifs
docker ps -a               # Tous les conteneurs
docker exec -it container sh  # Accéder au shell

# Volumes
docker volume ls            # Lister les volumes
docker volume rm volume     # Supprimer un volume
```

## 🆘 Support

### En cas de problème
1. Vérifiez les logs : `docker-compose logs -f`
2. Redémarrez les services : `docker-compose restart`
3. Reconstruisez les images : `docker-compose build --no-cache`
4. Nettoyez complètement : `docker-compose down --rmi all --volumes`

### Ressources utiles
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Best Practices Docker](https://docs.docker.com/develop/dev-best-practices/)

---

## 🎉 Félicitations !

Votre application RIB OCR est maintenant prête à être utilisée avec Docker ! 

**URLs d'accès :**
- 🌐 **Frontend** : http://localhost:3000
- 🔧 **Backend** : http://localhost:3001

**Prochaines étapes :**
1. Ouvrez http://localhost:3000 dans votre navigateur
2. Générez un token d'authentification
3. Sélectionnez un fichier RIB
4. Testez l'extraction OCR !

---

*Dernière mise à jour : $(date)*
