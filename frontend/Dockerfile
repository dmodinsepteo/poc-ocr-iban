# Dockerfile pour le frontend Vue.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (npm install au lieu de npm ci pour éviter les problèmes de sync)
RUN npm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande par défaut pour le développement
CMD ["npm", "run", "start"]
