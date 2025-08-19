const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ValidationService {
  // Sauvegarder ou mettre à jour une validation
  async saveValidation(metadataId, validationData) {
    try {
      const { isValid, expectedValue } = validationData;
      
      const validation = await prisma.fieldValidation.upsert({
        where: {
          metadataId: metadataId
        },
        update: {
          isValid: isValid,
          expectedValue: expectedValue,
          correctedAt: new Date()
        },
        create: {
          metadataId: metadataId,
          isValid: isValid,
          expectedValue: expectedValue
        }
      });
      
      return validation;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la validation:', error);
      throw error;
    }
  }

  // Récupérer toutes les validations pour un résultat
  async getValidationsForResult(resultId) {
    try {
      const validations = await prisma.fieldValidation.findMany({
        where: {
          metadata: {
            resultId: resultId
          }
        },
        include: {
          metadata: {
            select: {
              id: true,
              fieldName: true,
              fieldType: true,
              fieldValue: true,
              fieldTextExtraction: true,
              fieldValues: true
            }
          }
        }
      });
      
      return validations;
    } catch (error) {
      console.error('Erreur lors de la récupération des validations:', error);
      throw error;
    }
  }

  // Récupérer une validation spécifique
  async getValidation(metadataId) {
    try {
      const validation = await prisma.fieldValidation.findUnique({
        where: {
          metadataId: metadataId
        },
        include: {
          metadata: {
            select: {
              id: true,
              fieldName: true,
              fieldType: true,
              fieldValue: true,
              fieldTextExtraction: true,
              fieldValues: true
            }
          }
        }
      });
      
      return validation;
    } catch (error) {
      console.error('Erreur lors de la récupération de la validation:', error);
      throw error;
    }
  }

  // Supprimer une validation
  async deleteValidation(metadataId) {
    try {
      await prisma.fieldValidation.delete({
        where: {
          metadataId: metadataId
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la validation:', error);
      throw error;
    }
  }

  // Récupérer les statistiques de validation pour un résultat
  async getValidationStats(resultId) {
    try {
      const totalFields = await prisma.fileMetadata.count({
        where: {
          resultId: resultId
        }
      });
      
      const validatedFields = await prisma.fieldValidation.count({
        where: {
          metadata: {
            resultId: resultId
          }
        }
      });
      
      const validFields = await prisma.fieldValidation.count({
        where: {
          metadata: {
            resultId: resultId
          },
          isValid: true
        }
      });
      
      const invalidFields = await prisma.fieldValidation.count({
        where: {
          metadata: {
            resultId: resultId
          },
          isValid: false
        }
      });
      
      return {
        total: totalFields,
        validated: validatedFields,
        valid: validFields,
        invalid: invalidFields,
        unvalidated: totalFields - validatedFields
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

module.exports = new ValidationService();
