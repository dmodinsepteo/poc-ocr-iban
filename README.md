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

### **1. Installation Complète**
```bash
# Cloner le projet
git clone <votre-repo>
cd rib-ocr-project

# Installation et configuration automatique
npm run setup
```

### **2. Démarrage en Mode Développement**
```bash
# Démarrer backend ET frontend simultanément
npm run dev
```

## 📋 Scripts Disponibles

### **Développement**
```bash
npm run dev              # Démarre backend + frontend
npm run dev:backend      # Démarre uniquement le backend
npm run dev:frontend     # Démarre uniquement le frontend
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
│   └── package.json
│
├── backend/               # API Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma  # Schéma de base de données
│   ├── server.js          # Serveur Express
│   └── package.json
│
├── package.json           # Scripts principaux
└── README.md
```

## 🔧 Configuration

### **Variables d'Environnement Backend**
```bash
cd backend
cp env.example .env
```

Contenu du `.env` :
```env
DATABASE_URL="file:./dev.db"
PORT=3001
```

## 🌐 Accès aux Applications

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api
- **Prisma Studio** : http://localhost:5555 (après `npm run db:studio`)

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