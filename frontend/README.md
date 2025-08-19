# Extracteur de Coordonnées Bancaires - OCR

Application Vue.js 3 modulaire pour l'extraction automatique de coordonnées bancaires à partir de fichiers RIB via OCR.

## 🏗️ Architecture

L'application suit une architecture modulaire avec séparation des responsabilités :

### 📁 Structure des dossiers
```
rib-ocr-app/
├── src/
│   ├── components/          # Composants Vue.js
│   │   ├── AuthManager.vue      # Gestion de l'authentification
│   │   ├── FileSelector.vue     # Sélection de fichiers
│   │   ├── ProcessingSteps.vue  # Étapes de traitement
│   │   └── ResultsDisplay.vue   # Affichage des résultats
│   ├── services/            # Services métier
│   │   ├── authService.js       # Service d'authentification
│   │   └── ocrService.js        # Service OCR et extraction
│   ├── styles/              # Styles CSS
│   │   └── main.css             # Styles globaux
│   ├── App.vue              # Composant principal
│   └── main.js              # Point d'entrée
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

## 🚀 Fonctionnalités

### 🔐 Gestion d'authentification
- **Génération de token** avec stockage automatique
- **Gestion de l'expiration** (1 heure par défaut)
- **Persistance locale** via localStorage
- **Interface de gestion** avec statut visuel

### 📁 Sélection de fichiers
- Support des formats : PDF, JPG, JPEG, PNG, TIFF
- Interface intuitive avec drag & drop
- Validation des types de fichiers

### ⚙️ Traitement modulaire
- **Étapes séparées** : OCR et extraction indépendantes
- **Boutons individuels** pour chaque étape
- **Bouton traitement complet** pour automatisation
- **Statuts visuels** pour chaque étape

### 📊 Affichage des résultats
- **Tableau structuré** avec toutes les colonnes demandées
- **JSON collapsible** pour debug
- **Design responsive** pour mobile et desktop

## 🛠️ Installation

```bash
cd rib-ocr-app
npm install
```

## 🎯 Utilisation

### Démarrage
```bash
npm run dev
```

### Workflow recommandé

1. **Générer un token** via le gestionnaire d'authentification
2. **Sélectionner un fichier RIB** 
3. **Choisir le mode de traitement** :
   - **Étape par étape** : OCR puis extraction séparément
   - **Traitement complet** : Automatique en une fois

## 🔧 Services

### AuthService
```javascript
// Génération de token
await authService.generateToken()

// Vérification de validité
const isValid = authService.isTokenValid()

// Récupération du token (génère si nécessaire)
const token = await authService.getValidToken()
```

### OCRService
```javascript
// OCR uniquement
const ocrText = await ocrService.performOCR(file)

// Extraction uniquement
const data = await ocrService.extractData(ocrText)

// Traitement complet
const result = await ocrService.processFile(file)
```

## 🎨 Composants

### AuthManager
- Affichage du statut du token
- Boutons de génération/effacement
- Indicateur d'expiration

### FileSelector
- Interface de sélection de fichiers
- Validation des types
- Affichage du fichier sélectionné

### ProcessingSteps
- Étapes OCR et extraction séparées
- Statuts visuels pour chaque étape
- Bouton de traitement complet

### ResultsDisplay
- Tableau des données extraites
- JSON collapsible
- Design responsive

## 🔌 Configuration des APIs

### Proxy CORS
L'application utilise un proxy Vite pour contourner les problèmes CORS :

```javascript
// vite.config.js
proxy: {
  '/auth-api': {
    target: 'https://auth-api.softlaw.ai',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/auth-api/, '')
  },
  '/api': {
    target: 'https://notaryllm-dev.softlaw.ai',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### Endpoints
- **Authentification** : `/auth-api/token` → `https://auth-api.softlaw.ai/token`
- **OCR** : `/api/ocr/di` → `https://notaryllm-dev.softlaw.ai/ocr/di`
- **Extraction** : `/api/document/rib` → `https://notaryllm-dev.softlaw.ai/document/rib`

## 📱 Responsive Design

L'application s'adapte automatiquement aux écrans :
- **Desktop** : Interface complète avec toutes les fonctionnalités
- **Tablet** : Adaptation des tableaux et boutons
- **Mobile** : Interface optimisée pour petits écrans

## 🛡️ Gestion d'erreurs

- **Erreurs réseau** : Messages informatifs
- **Erreurs d'authentification** : Régénération automatique du token
- **Erreurs d'OCR** : Retry possible
- **Erreurs d'extraction** : Debug via JSON
- **Erreurs CORS** : Contournées via proxy Vite

## 🚀 Scripts disponibles

- `npm run dev` : Serveur de développement avec proxy CORS
- `npm run build` : Build de production
- `npm run preview` : Prévisualisation production

## 🔄 Workflow de développement

1. **Modification des services** : Logique métier
2. **Modification des composants** : Interface utilisateur
3. **Modification des styles** : CSS dans `src/styles/`
4. **Tests** : Vérification des fonctionnalités

## 📋 Structure des données

Chaque champ extrait contient :
```javascript
{
  field_name: "first_name_account_holder",
  field_type: "string", 
  field_value: "MARINE",
  field_text_extraction: "Titulaire du compte...",
  field_values: null
}
```

## 🎯 Avantages de l'architecture

- **Modularité** : Composants réutilisables
- **Maintenabilité** : Code organisé et lisible
- **Extensibilité** : Facile d'ajouter de nouvelles fonctionnalités
- **Testabilité** : Services isolés et testables
- **Performance** : Chargement optimisé des composants
- **CORS** : Proxy intégré pour éviter les problèmes de cross-origin

## 🔧 Résolution des problèmes

### Erreur CORS
Si vous rencontrez des erreurs CORS, vérifiez que :
1. Le serveur de développement est démarré avec `npm run dev`
2. Les URLs dans les services utilisent les chemins proxy (`/auth-api`, `/api`)
3. Le proxy est correctement configuré dans `vite.config.js` 