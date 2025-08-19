const API_BASE_URL = 'http://localhost:3001/api';

class ValidationService {
  // Sauvegarder une validation
  async saveValidation(metadataId, validationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/validations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadataId,
          isValid: validationData.isValid,
          expectedValue: validationData.expectedValue || null
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la validation:', error);
      throw error;
    }
  }

  // Récupérer toutes les validations d'un résultat
  async getValidationsForResult(resultId) {
    try {
      const response = await fetch(`${API_BASE_URL}/validations/result/${resultId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des validations:', error);
      throw error;
    }
  }

  // Récupérer une validation spécifique
  async getValidation(metadataId) {
    try {
      const response = await fetch(`${API_BASE_URL}/validations/${metadataId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Validation non trouvée
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la validation:', error);
      throw error;
    }
  }

  // Supprimer une validation
  async deleteValidation(metadataId) {
    try {
      const response = await fetch(`${API_BASE_URL}/validations/${metadataId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression de la validation:', error);
      throw error;
    }
  }

  // Récupérer les statistiques de validation
  async getValidationStats(resultId) {
    try {
      const response = await fetch(`${API_BASE_URL}/validations/stats/${resultId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Créer un map des validations par metadataId pour un accès rapide
  createValidationMap(validations) {
    const validationMap = new Map();
    
    validations.forEach(validation => {
      validationMap.set(validation.metadataId, validation);
    });
    
    return validationMap;
  }
}

export default new ValidationService();
