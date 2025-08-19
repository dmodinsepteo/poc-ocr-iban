# 🏗️ Architecture du Projet RIB OCR

## Vue d'Ensemble

Ce projet suit une architecture **monorepo** avec séparation claire entre le backend et le frontend, utilisant des technologies modernes et des bonnes pratiques de développement.

## 📁 Structure du Projet

```
rib-ocr-project/
├── 📁 frontend/                 # Application Vue.js 3
│   ├── 📁 src/
│   │   ├── 📁 components/       # Composants Vue réutilisables
│   │   ├── 📁 services/         # Services API et métier
│   │   ├── 📁 styles/           # Styles CSS/SCSS
│   │   ├── App.vue              # Composant racine
│   │   └── main.js              # Point d'entrée
│   ├── package.json             # Dépendances frontend
│   └── vite.config.js           # Configuration Vite
│
├── 📁 backend/                  # API Express + Prisma
│   ├── 📁 prisma/
│   │   └── schema.prisma        # Schéma de base de données
│   ├── server.js                # Serveur Express
│   ├── package.json             # Dépendances backend
│   └── env.example              # Variables d'environnement
│
├── package.json                 # Scripts principaux
├── docker-compose.yml           # Configuration Docker
├── .gitignore                   # Fichiers ignorés par Git
├── README.md                    # Documentation principale
└── ARCHITECTURE.md              # Cette documentation
```

## 🔧 Technologies Utilisées

### **Frontend**
- **Vue.js 3** : Framework JavaScript progressif
- **Vite** : Build tool moderne et rapide
- **Axios** : Client HTTP pour les requêtes API
- **Composition API** : API de composition Vue 3

### **Backend**
- **Express.js** : Framework web pour Node.js
- **Prisma** : ORM moderne pour la base de données
- **SQLite** : Base de données légère et portable
- **CORS** : Middleware pour les requêtes cross-origin

### **Outils de Développement**
- **Concurrently** : Exécution parallèle de scripts
- **Nodemon** : Redémarrage automatique du serveur
- **Docker** : Conteneurisation (optionnel)

## 🗄️ Base de Données

### **Schéma Prisma**

```prisma
model ExtractionResult {
  id           Int      @id @default(autoincrement())
  fileName     String
  fileSize     Int
  savedAt      DateTime @default(now())
  ocrText      String?
  extractedData String  // JSON string
  metadata     FileMetadata[]
  
  @@map("extraction_results")
}

model FileMetadata {
  id                  Int             @id @default(autoincrement())
  resultId            Int
  fieldName           String
  fieldType           String
  fieldValue          String?
  fieldTextExtraction String?
  fieldValues         String?         // JSON string for multiple values
  result              ExtractionResult @relation(fields: [resultId], references: [id], onDelete: Cascade)
  
  @@map("file_metadata")
}
```

### **Relations**
- **One-to-Many** : Un résultat peut avoir plusieurs métadonnées
- **Cascade Delete** : Suppression automatique des métadonnées
- **Index optimisés** : Performance des requêtes

## 🔌 API REST

### **Endpoints Principaux**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/results` | Liste tous les résultats |
| `GET` | `/api/results/:id` | Récupère un résultat spécifique |
| `POST` | `/api/results` | Sauvegarde un nouveau résultat |
| `DELETE` | `/api/results/:id` | Supprime un résultat |
| `GET` | `/api/results/search?q=query` | Recherche dans les résultats |
| `GET` | `/api/results/count` | Compte les résultats |
| `GET` | `/api/health` | Vérification de l'état du serveur |

### **Format des Données**

#### **POST /api/results**
```json
{
  "fileName": "rib-example.pdf",
  "fileSize": 1024000,
  "ocrText": "Texte extrait par OCR...",
  "extractedData": [
    {
      "field_name": "iban",
      "field_type": "string",
      "field_value": "FR7630001007941234567890185",
      "field_text_extraction": "IBAN: FR7630001007941234567890185"
    }
  ]
}
```

## 🔄 Flux de Données

### **1. Upload de Fichier**
```
Frontend → Backend API → OCR Service → Extraction → Base de Données
```

### **2. Consultation des Résultats**
```
Frontend → Backend API → Base de Données → Frontend
```

### **3. Sauvegarde**
```
Frontend → Backend API → Validation → Base de Données → Confirmation
```

## 🛡️ Sécurité

### **Mesures Implémentées**
- **CORS** : Configuration pour les requêtes cross-origin
- **Validation** : Vérification des données d'entrée
- **Gestion d'erreurs** : Messages d'erreur appropriés
- **Base de données** : Protection contre les injections SQL (Prisma)

### **Recommandations**
- **HTTPS** : En production
- **Rate Limiting** : Limitation des requêtes
- **Authentication** : Système d'authentification
- **Logs** : Journalisation des actions

## 🚀 Déploiement

### **Développement**
```bash
npm run dev  # Démarre backend + frontend
```

### **Production**
```bash
npm run build  # Build du frontend
npm run start  # Démarre le backend
```

### **Docker**
```bash
docker-compose up  # Démarre les conteneurs
```

## 📊 Monitoring

### **Logs**
- **Backend** : Logs Express avec timestamps
- **Frontend** : Console browser
- **Base de données** : Logs Prisma

### **Métriques**
- **Performance** : Temps de réponse API
- **Erreurs** : Taux d'erreur par endpoint
- **Utilisation** : Nombre de requêtes

## 🔧 Configuration

### **Variables d'Environnement**

#### **Backend**
```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
```

#### **Frontend**
```javascript
// Configuration API
const API_BASE_URL = 'http://localhost:3001/api'
```

## 🧪 Tests

### **Structure Recommandée**
```
├── 📁 tests/
│   ├── 📁 unit/           # Tests unitaires
│   ├── 📁 integration/    # Tests d'intégration
│   └── 📁 e2e/           # Tests end-to-end
```

### **Outils Suggérés**
- **Jest** : Tests unitaires
- **Supertest** : Tests API
- **Cypress** : Tests E2E

## 🔄 Workflow de Développement

### **1. Feature Branch**
```bash
git checkout -b feature/nouvelle-fonctionnalite
```

### **2. Développement**
```bash
npm run dev  # Démarre l'environnement de dev
```

### **3. Tests**
```bash
npm test     # Lance les tests
```

### **4. Commit**
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
```

### **5. Pull Request**
```bash
git push origin feature/nouvelle-fonctionnalite
```

## 📈 Évolutions Futures

### **Court Terme**
- [ ] Tests automatisés
- [ ] Documentation API (Swagger)
- [ ] Logs structurés

### **Moyen Terme**
- [ ] Authentification JWT
- [ ] Upload de fichiers multiples
- [ ] Cache Redis

### **Long Terme**
- [ ] Microservices
- [ ] Base de données PostgreSQL
- [ ] Monitoring avancé 