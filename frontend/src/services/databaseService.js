import axios from 'axios'

class DatabaseService {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3001/api'
  }

  async initialize() {
    try {
      // Vérifier que l'API backend est disponible
      const response = await axios.get(`${this.apiBaseUrl}/health`)
      console.log('Connexion à l\'API backend établie:', response.data)
    } catch (error) {
      console.error('Erreur lors de la connexion à l\'API backend:', error)
      throw new Error('Impossible de se connecter au backend')
    }
  }

  async createTables() {
    // Les tables sont gérées par Prisma
    console.log('Tables gérées par Prisma')
  }

  async saveResult(resultData) {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/results`, resultData)
      return response.data.id
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du résultat:', error)
      throw error
    }
  }

  async getAllResults() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/results`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error)
      throw error
    }
  }

  async getResultById(resultId) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/results/${resultId}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        return null
      }
      console.error('Erreur lors de la récupération du résultat:', error)
      throw error
    }
  }

  async deleteResult(resultId) {
    try {
      await axios.delete(`${this.apiBaseUrl}/results/${resultId}`)
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du résultat:', error)
      throw error
    }
  }

  async searchResults(query) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/results/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      throw error
    }
  }

  async getResultsCount() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/results/count`)
      return response.data.count
    } catch (error) {
      console.error('Erreur lors du comptage des résultats:', error)
      throw error
    }
  }

  async close() {
    // Pas de connexion à fermer pour l'API REST
    console.log('Fermeture de la connexion API')
  }
}

// Export d'une instance singleton
export default new DatabaseService() 