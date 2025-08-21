const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration de la base de données
const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

// Initialisation de Prisma avec configuration explicite
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes API

// GET /api/results - Récupérer tous les résultats
app.get('/api/results', async (req, res) => {
  try {
    const results = await prisma.extractionResult.findMany({
      orderBy: {
        savedAt: 'desc'
      }
    });

    const formattedResults = results.map(result => ({
      id: result.id,
      fileName: result.fileName,
      fileSize: result.fileSize,
      savedAt: result.savedAt.toISOString(),
      ocrText: result.ocrText,
      data: JSON.parse(result.extractedData)
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/results/:id - Récupérer un résultat par ID
app.get('/api/results/:id', async (req, res) => {
  try {
    const result = await prisma.extractionResult.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    });

    if (!result) {
      return res.status(404).json({ error: 'Résultat non trouvé' });
    }

    const formattedResult = {
      id: result.id,
      fileName: result.fileName,
      fileSize: result.fileSize,
      savedAt: result.savedAt.toISOString(),
      ocrText: result.ocrText,
      data: JSON.parse(result.extractedData)
    };

    res.json(formattedResult);
  } catch (error) {
    console.error('Erreur lors de la récupération du résultat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/results/:id/metadata - Récupérer les métadonnées d'un résultat avec validations
app.get('/api/results/:id/metadata', async (req, res) => {
  try {
    const metadata = await prisma.fileMetadata.findMany({
      where: {
        resultId: parseInt(req.params.id)
      },
      include: {
        validation: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    const formattedMetadata = metadata.map(item => ({
      id: item.id,
      fieldName: item.fieldName,
      fieldType: item.fieldType,
      fieldValue: item.fieldValue,
      fieldTextExtraction: item.fieldTextExtraction,
      fieldValues: item.fieldValues ? JSON.parse(item.fieldValues) : null,
      validation: item.validation ? {
        isValid: item.validation.isValid,
        expectedValue: item.validation.expectedValue,
        correctedAt: item.validation.correctedAt
      } : null
    }));

    res.json(formattedMetadata);
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/results - Sauvegarder un nouveau résultat
app.post('/api/results', async (req, res) => {
  try {
    const { fileName, fileSize, ocrText, extractedData } = req.body;

    if (!fileName || !fileSize || !extractedData) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const result = await prisma.extractionResult.create({
      data: {
        fileName,
        fileSize,
        ocrText: ocrText || null,
        extractedData: JSON.stringify(extractedData)
      }
    });

    // Créer les métadonnées pour chaque champ avec validation par défaut
    for (const field of extractedData) {
      await prisma.fileMetadata.create({
        data: {
          resultId: result.id,
          fieldName: field.field_name,
          fieldType: field.field_type,
          fieldValue: field.field_value || null,
          fieldTextExtraction: field.field_text_extraction || null,
          fieldValues: field.field_values ? JSON.stringify(field.field_values) : null,
          validation: {
            create: {
              isValid: null, // null = non validé par défaut
              expectedValue: null,
              correctedAt: new Date()
            }
          }
        }
      });
    }

    res.status(201).json({ 
      id: result.id,
      message: 'Résultat sauvegardé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/results/:id - Supprimer un résultat
app.delete('/api/results/:id', async (req, res) => {
  try {
    const result = await prisma.extractionResult.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });

    res.json({ message: 'Résultat supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/results/search?q=query - Rechercher des résultats
app.get('/api/results/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Paramètre de recherche requis' });
    }

    const results = await prisma.extractionResult.findMany({
      where: {
        OR: [
          {
            fileName: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            ocrText: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    const formattedResults = results.map(result => ({
      id: result.id,
      fileName: result.fileName,
      fileSize: result.fileSize,
      savedAt: result.savedAt.toISOString(),
      ocrText: result.ocrText,
      data: JSON.parse(result.extractedData)
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/results/count - Compter les résultats
app.get('/api/results/count', async (req, res) => {
  try {
    const count = await prisma.extractionResult.count();
    res.json({ count });
  } catch (error) {
    console.error('Erreur lors du comptage:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes de validation
const validationService = require('./validationService');

// POST /api/validations - Sauvegarder une validation
app.post('/api/validations', async (req, res) => {
  try {
    const { metadataId, isValid, expectedValue } = req.body;
    
    if (metadataId === undefined || isValid === undefined) {
      return res.status(400).json({ error: 'metadataId et isValid sont requis' });
    }
    
    const validation = await validationService.saveValidation(metadataId, {
      isValid,
      expectedValue: expectedValue || null
    });
    
    res.json(validation);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la validation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/validations/result/:resultId - Récupérer toutes les validations d'un résultat
app.get('/api/validations/result/:resultId', async (req, res) => {
  try {
    const resultId = parseInt(req.params.resultId);
    const validations = await validationService.getValidationsForResult(resultId);
    res.json(validations);
  } catch (error) {
    console.error('Erreur lors de la récupération des validations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/validations/:metadataId - Récupérer une validation spécifique
app.get('/api/validations/:metadataId', async (req, res) => {
  try {
    const metadataId = parseInt(req.params.metadataId);
    const validation = await validationService.getValidation(metadataId);
    
    if (!validation) {
      return res.status(404).json({ error: 'Validation non trouvée' });
    }
    
    res.json(validation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la validation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/validations/:metadataId - Supprimer une validation
app.delete('/api/validations/:metadataId', async (req, res) => {
  try {
    const metadataId = parseInt(req.params.metadataId);
    await validationService.deleteValidation(metadataId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la validation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/validations/stats/:resultId - Récupérer les statistiques de validation
app.get('/api/validations/stats/:resultId', async (req, res) => {
  try {
    const resultId = parseInt(req.params.resultId);
    const stats = await validationService.getValidationStats(resultId);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Fonction d'initialisation de la base de données
async function initializeDatabase() {
  try {
    // Tester la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');
    
    // Vérifier que les tables existent
    await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log('✅ Tables de base de données vérifiées');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Démarrage du serveur
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
    console.log(`🗄️  Base de données: ${DATABASE_URL}`);
  });
}

startServer();

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  console.log('Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
}); 