# Dockerfile pour le backend Express + Prisma en production
FROM node:20-alpine

# Installation des dépendances système nécessaires pour Prisma
RUN apk add --no-cache openssl libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Installer Prisma CLI globalement
RUN npm install -g prisma

# Générer le client Prisma
RUN npx prisma generate

# Créer le dossier de données
RUN mkdir -p /app/data

# Exposer le port
EXPOSE 3001

# Script de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
