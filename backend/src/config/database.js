import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

// Initialisation de Prisma avec configuration explicite
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

// Fonction d'initialisation de la base de données
export async function initializeDatabase() {
  try {
    // Tester la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');
    
    // Vérifier que les tables existent
    await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log('✅ Tables de base de données vérifiées');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  console.log('Arrêt de la base de données...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
