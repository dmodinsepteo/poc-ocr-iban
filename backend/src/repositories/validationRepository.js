import prisma from '../config/database.js';

export class ValidationRepository {
  async upsert(validationData) {
    const { metadataId, isValid, expectedValue } = validationData;

    return await prisma.fieldValidation.upsert({
      where: { metadataId: parseInt(metadataId) },
      update: {
        isValid,
        expectedValue,
        correctedAt: new Date()
      },
      create: {
        metadataId: parseInt(metadataId),
        isValid,
        expectedValue,
        correctedAt: new Date()
      }
    });
  }

  async findByResultId(resultId) {
    return await prisma.fieldValidation.findMany({
      where: {
        metadata: {
          resultId: parseInt(resultId)
        }
      },
      include: {
        metadata: true
      }
    });
  }

  async findValidationsByResultId(resultId) {
    return await prisma.fieldValidation.findMany({
      where: {
        metadata: {
          resultId: parseInt(resultId)
        }
      }
    });
  }
}
