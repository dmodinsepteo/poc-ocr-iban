import prisma from '../config/database.js';

export class ResultRepository {
  async findAll() {
    return await prisma.extractionResult.findMany({
      include: {
        metadata: {
          include: {
            validation: true
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });
  }

  async findById(id) {
    return await prisma.extractionResult.findUnique({
      where: { id: parseInt(id) },
      include: {
        metadata: {
          include: {
            validation: true
          }
        }
      }
    });
  }

  async create(data) {
    const { fileName, fileSize, ocrText, extractedData } = data;

    // Vérifier que extractedData existe et est un tableau
    if (!extractedData || !Array.isArray(extractedData)) {
      throw new Error('extractedData doit être un tableau');
    }

    return await prisma.extractionResult.create({
      data: {
        fileName,
        fileSize,
        ocrText: ocrText || null,
        extractedData: JSON.stringify(extractedData),
        metadata: {
          create: extractedData.map(field => ({
            fieldName: field.field_name || field.name,
            fieldType: field.field_type || field.type || 'text',
            fieldValue: field.field_value || field.value || null,
            fieldTextExtraction: field.field_text_extraction || field.textExtraction || null,
            fieldValues: field.field_values || field.values ? JSON.stringify(field.field_values || field.values) : null,
            validation: {
              create: {
                isValid: null,
                expectedValue: null
              }
            }
          }))
        }
      },
      include: {
        metadata: {
          include: {
            validation: true
          }
        }
      }
    });
  }

  async delete(id) {
    // Supprimer d'abord les métadonnées (cascade)
    await prisma.fileMetadata.deleteMany({
      where: { resultId: parseInt(id) }
    });

    // Puis supprimer le résultat
    return await prisma.extractionResult.delete({
      where: { id: parseInt(id) }
    });
  }

  async search(query) {
    return await prisma.extractionResult.findMany({
      where: {
        OR: [
          { fileName: { contains: query, mode: 'insensitive' } },
          { ocrText: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        metadata: {
          include: {
            validation: true
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });
  }

  async count() {
    return await prisma.extractionResult.count();
  }
}
