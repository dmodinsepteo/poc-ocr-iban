import { ResultRepository } from '../repositories/resultRepository.js';

const resultRepository = new ResultRepository();

export async function getAllResults() {
  return await resultRepository.findAll();
}

export async function getResultById(id) {
  return await resultRepository.findById(id);
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
