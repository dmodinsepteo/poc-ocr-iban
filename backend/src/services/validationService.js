import { ValidationRepository } from '../repositories/validationRepository.js';

const validationRepository = new ValidationRepository();

export async function saveValidation(validationData) {
  return await validationRepository.upsert(validationData);
}

export async function getValidationsForResult(resultId) {
  return await validationRepository.findByResultId(resultId);
}

export async function getValidationStats(resultId) {
  const validations = await validationRepository.findValidationsByResultId(resultId);

  const total = validations.length;
  const validated = validations.filter(v => v.isValid === true).length;
  const invalid = validations.filter(v => v.isValid === false).length;
  const unvalidated = validations.filter(v => v.isValid === null).length;

  return {
    total,
    validated,
    invalid,
    unvalidated,
    progress: total > 0 ? Math.round((validated + invalid) / total * 100) : 0
  };
}
