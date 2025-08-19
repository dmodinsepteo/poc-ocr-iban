const API_BASE_URL = 'http://localhost:3001/api';

class ApiResultsService {
  // Récupérer tous les résultats
  async getAllResults() {
    try {
      const response = await fetch(`${API_BASE_URL}/results`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error);
      throw error;
    }
  }

  // Récupérer un résultat par ID
  async getResultById(resultId) {
    try {
      const response = await fetch(`${API_BASE_URL}/results/${resultId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du résultat:', error);
      throw error;
    }
  }

  // Récupérer les métadonnées d'un résultat
  async getResultMetadata(resultId) {
    try {
      const response = await fetch(`${API_BASE_URL}/results/${resultId}/metadata`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
      throw error;
    }
  }

  // Supprimer un résultat
  async deleteResult(resultId) {
    try {
      const response = await fetch(`${API_BASE_URL}/results/${resultId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression du résultat:', error);
      throw error;
    }
  }

  // Rechercher des résultats
  async searchResults(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/results/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }

  // Compter les résultats
  async getResultsCount() {
    try {
      const response = await fetch(`${API_BASE_URL}/results/count`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Erreur lors du comptage:', error);
      throw error;
    }
  }
}

export default new ApiResultsService();
