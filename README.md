# 🏦 RIB OCR Extractor

Application complète pour l'extraction de coordonnées bancaires depuis des fichiers RIB utilisant l'OCR.

## 🏗️ Architecture

### **Frontend (Vue.js 3)**
- **Localisation** : `frontend/`
- **Technologies** : Vue.js 3, Vite, Axios
- **Port** : 3000

### **Backend (Express + Prisma)**
- **Localisation** : `backend/`
- **Technologies** : Express, Prisma, SQLite
- **Port** : 3001

## 🚀 Installation Rapide

### **Option 1 : Installation Classique**
```bash
# Cloner le projet
git clone <votre-repo>
cd rib-ocr-project

# Installation et configuration automatique
npm run setup

# Démarrage en mode développement
npm run dev
```

### **Option 2 : Installation avec Docker (Recommandé)**
```bash
# Cloner le projet
git clone <votre-repo>
cd rib-ocr-project

# Vérifier l'environnement Docker
./docker-check.sh

# Démarrer avec Docker
./docker-start.sh
```

> **💡 Avantage Docker** : Environnement isolé, pas d'installation de dépendances locales, déploiement simplifié.

## 📋 Scripts Disponibles

### **Développement (Installation Classique)**
```bash
npm run dev              # Démarre backend + frontend
npm run dev:backend      # Démarre uniquement le backend
npm run dev:frontend     # Démarre uniquement le frontend
```

### **Docker**
```bash
./docker-check.sh        # Vérifier l'environnement Docker
./docker-sync.sh         # Synchroniser les fichiers package-lock.json
./docker-start.sh        # Démarrer l'application avec Docker
./docker-stop.sh         # Arrêter l'application Docker
./docker-test.sh         # Tester le bon fonctionnement
./docker-rebuild-backend.sh  # Reconstruire le backend (OpenSSL)
./docker-switch-backend.sh   # Basculer Alpine/Debian
./docker-fix-nodemon.sh      # Corriger le problème nodemon
docker-compose up -d     # Démarrer en arrière-plan
docker-compose down      # Arrêter les conteneurs
docker-compose logs -f   # Voir les logs en temps réel
```

### **Base de Données**
```bash
npm run db:generate      # Génère le client Prisma
npm run db:push          # Pousse le schéma vers la DB
npm run db:migrate       # Crée et applique une migration
npm run db:studio        # Ouvre Prisma Studio
```

### **Production**
```bash
npm run build           # Build du frontend
npm run start           # Démarre le backend en production
```

## 📁 Structure du Projet

```
rib-ocr-project/
├── frontend/              # Application Vue.js
│   ├── src/
│   │   ├── components/    # Composants Vue
│   │   ├── services/      # Services API
│   │   └── ...
│   ├── Dockerfile         # Image Docker frontend
│   └── package.json
│
├── backend/               # API Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma  # Schéma de base de données
│   ├── server.js          # Serveur Express
│   ├── Dockerfile         # Image Docker backend
│   └── package.json
│
├── docker-compose.yml     # Configuration Docker Compose
├── docker-start.sh        # Script de démarrage Docker
├── docker-stop.sh         # Script d'arrêt Docker
├── docker-check.sh        # Script de vérification Docker
├── docker-sync.sh         # Script de synchronisation package-lock.json
├── docker-test.sh         # Script de test des conteneurs
├── docker-rebuild-backend.sh  # Script de reconstruction backend (OpenSSL)
├── docker-switch-backend.sh   # Script de basculement Alpine/Debian
├── docker-fix-nodemon.sh      # Script de correction nodemon
├── DOCKER.md              # Documentation Docker complète
├── package.json           # Scripts principaux
└── README.md
```

## 🔧 Configuration

### **Installation Classique**

#### **Variables d'Environnement Backend**
```bash
cd backend
cp env.example .env
```

Contenu du `.env` :
```env
DATABASE_URL="file:./dev.db"
PORT=3001
```

### **Installation Docker**

#### **Configuration Docker**
```bash
# Copier le fichier d'exemple
cp docker.env.example .env

# Modifier les variables selon vos besoins
nano .env
```

#### **Variables d'Environnement Docker**
```env
# Backend
NODE_ENV=development
DATABASE_URL=file:./data/dev.db
PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001

# Docker
FRONTEND_PORT=3000
BACKEND_PORT=3001
```

## 🌐 Accès aux Applications

### **Installation Classique**
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api
- **Prisma Studio** : http://localhost:5555 (après `npm run db:studio`)

### **Installation Docker**
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api
- **Logs en temps réel** : `docker-compose logs -f`

## 📚 Documentation

- **Guide principal** : Ce README
- **Guide Docker complet** : [DOCKER.md](./DOCKER.md)
- **Architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔌 API Endpoints

### **Résultats**
- `GET /api/results` - Liste tous les résultats
- `GET /api/results/:id` - Récupère un résultat spécifique
- `POST /api/results` - Sauvegarde un nouveau résultat
- `DELETE /api/results/:id` - Supprime un résultat

### **Recherche et Utilitaires**
- `GET /api/results/search?q=query` - Recherche dans les résultats
- `GET /api/results/count` - Compte les résultats
- `GET /api/health` - Vérification de l'état du serveur

## 🛠️ Développement

### **Installation Manuelle (si nécessaire)**
```bash
# Installation des dépendances principales
npm install

# Installation backend
cd backend
npm install
cp env.example .env
npx prisma generate
npx prisma db push

# Installation frontend
cd ../frontend
npm install
```

### **Démarrage Manuel**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📊 Base de Données

### **Schéma Prisma**
- **ExtractionResult** : Résultats d'extraction principaux
- **FileMetadata** : Métadonnées détaillées des champs

### **Commandes Utiles**
```bash
# Ouvrir Prisma Studio
npm run db:studio

# Vérifier la base de données
cd backend
npx prisma studio
```

## 🔍 Debugging

### **Vérifier l'API Backend**
```bash
curl http://localhost:3001/api/health
```

### **Logs du Serveur**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## 🚀 Production

### **Build et Démarrage**
```bash
# Build du frontend
npm run build

# Démarrage en production
npm run start
```

## 📝 Notes

- Le backend doit être démarré avant le frontend
- La base de données SQLite est créée automatiquement dans `backend/dev.db`
- Les migrations Prisma sont appliquées automatiquement au démarrage
- Utilisez `npm run dev` pour démarrer les deux services simultanément

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request 