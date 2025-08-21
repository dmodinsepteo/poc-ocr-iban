import { ResultRepository } from '../repositories/resultRepository.js';

const resultRepository = new ResultRepository();

export async function getAllResults() {
  const results = await resultRepository.findAll();

  const formattedResults = results.map(result => ({
    id: result.id,
    fileName: result.fileName,
    fileSize: result.fileSize,
    savedAt: result.savedAt.toISOString(),
    ocrText: result.ocrText,
    data: JSON.parse(result.extractedData)
  }));
  
  return formattedResults;
}

export async function getResultById(id) {
  return await resultRepository.findById(id);
}

export async function getResultMetadata(id) {
  const metadata = await resultRepository.findMetadataByResultId(id);
  
  // Formater les métadonnées comme dans l'ancien server.js
  return metadata.map(item => ({
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
}

export async function createResult(data) {
  return await resultRepository.create(data);
}

export async function deleteResult(id) {
  return await resultRepository.delete(id);
}

export async function searchResults(query) {
  return await resultRepository.search(query);
}

export async function getResultsCount() {
  return await resultRepository.count();
}
