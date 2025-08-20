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

# Démarrer avec Docker
docker-compose up -d

# Voir les logs
docker-compose logs -f
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
docker-compose up -d     # Démarrer en arrière-plan
docker-compose down      # Arrêter les conteneurs
docker-compose logs -f   # Voir les logs en temps réel
docker-compose build     # Reconstruire les images
docker-compose restart   # Redémarrer les services
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

Aucune configuration supplémentaire requise. Les variables d'environnement sont définies dans `docker-compose.yml`.

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
- **Docker rapide** : [DOCKER-QUICKSTART.md](./DOCKER-QUICKSTART.md)
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

### **Validation**
- `POST /api/validations` - Sauvegarder une validation
- `GET /api/validations/result/:resultId` - Récupérer les validations d'un résultat
- `GET /api/validations/stats/:resultId` - Statistiques de validation

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
- **FieldValidation** : Validations des champs extraits

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

# Docker
docker-compose logs -f
```

## 🐛 Dépannage Docker

### **Problèmes courants**

#### **1. Ports déjà utilisés**
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Arrêter les processus utilisant les ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9
```

#### **2. Problèmes de build**
```bash
# Nettoyer complètement
docker-compose down --rmi all --volumes --remove-orphans
docker system prune -f

# Reconstruire
docker-compose build --no-cache
docker-compose up -d
```

#### **3. Base de données corrompue**
```bash
# Supprimer le volume de la base de données
docker-compose down -v
docker volume rm rib-ocr-project_backend_data

# Redémarrer pour recréer la base
docker-compose up -d
```

#### **4. Erreur "nodemon: not found"**
```bash
# Reconstruire le backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

#### **5. Erreur Prisma OpenSSL**
```bash
# Reconstruire le backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

## 🚀 Production

### **Build et Démarrage**
```bash
# Build du frontend
npm run build

# Démarrage en production
npm run start
```

### **Docker Production**
```bash
# Modifier docker-compose.yml pour la production
# Changer NODE_ENV=production
docker-compose up -d
```

## 📝 Notes

- Le backend doit être démarré avant le frontend
- La base de données SQLite est créée automatiquement dans `backend/dev.db`
- Les migrations Prisma sont appliquées automatiquement au démarrage
- Utilisez `npm run dev` pour démarrer les deux services simultanément
- En Docker, les volumes sont persistants pour la base de données

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request 