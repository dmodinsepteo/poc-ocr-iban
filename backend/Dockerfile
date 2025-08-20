# Dockerfile pour le backend Node.js
FROM node:18-alpine

# Installer les dépendances système nécessaires pour Prisma
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (inclure les devDependencies pour nodemon)
RUN npm install

# Copier le code source
COPY . .

# Installer Prisma CLI
RUN npm install -g prisma

# Générer le client Prisma
RUN npx prisma generate

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data

# Exposer le port
EXPOSE 3001

# Commande par défaut
CMD ["npm", "start"]
