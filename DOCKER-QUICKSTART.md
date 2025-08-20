# 🐳 Docker - Démarrage Rapide

## **Démarrage Simple**

```bash
# 1. Démarrer l'application
docker-compose up -d

# 2. Voir les logs
docker-compose logs -f

# 3. Accéder à l'application
# Frontend : http://localhost:3000
# Backend : http://localhost:3001
```

## **Commandes Utiles**

```bash
# Arrêter l'application
docker-compose down

# Redémarrer
docker-compose restart

# Reconstruire les images
docker-compose build --no-cache

# Voir le statut
docker-compose ps
```

## **Dépannage**

### **Problème de port**
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
```

### **Problème de build**
```bash
# Nettoyer et reconstruire
docker-compose down --rmi all --volumes
docker-compose build --no-cache
docker-compose up -d
```

### **Problème de base de données**
```bash
# Supprimer la base et redémarrer
docker-compose down -v
docker-compose up -d
```

## **Configuration**

- **Frontend** : Port 3000 (Vue.js + Vite)
- **Backend** : Port 3001 (Express + Prisma)
- **Base de données** : SQLite (persistante)
- **Volumes** : Code source monté pour le développement

## **Logs**

```bash
# Tous les services
docker-compose logs -f

# Backend seulement
docker-compose logs -f backend

# Frontend seulement
docker-compose logs -f frontend
```

---

**C'est tout !** L'application est prête à utiliser. 🎉
