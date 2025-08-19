import databaseService from './databaseService.js'

class ResultsService {
  constructor() {
    this.isInitialized = false
  }

  async initialize() {
    if (!this.isInitialized) {
      await databaseService.initialize()
      this.isInitialized = true
    }
  }

  async saveResult(resultData) {
    await this.initialize()
    
    try {
      const resultId = await databaseService.saveResult(resultData)
      console.log(`Résultat sauvegardé avec l'ID: ${resultId}`)
      return resultId
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du résultat:', error)
      throw new Error(`Impossible de sauvegarder le résultat: ${error.message}`)
    }
  }

  async getAllResults() {
    await this.initialize()
    
    try {
      const results = await databaseService.getAllResults()
      return results
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error)
      throw new Error(`Impossible de récupérer les résultats: ${error.message}`)
    }
  }

  async getResultById(resultId) {
    await this.initialize()
    
    try {
      const result = await databaseService.getResultById(resultId)
      return result
    } catch (error) {
      console.error('Erreur lors de la récupération du résultat:', error)
      throw new Error(`Impossible de récupérer le résultat: ${error.message}`)
    }
  }

  async deleteResult(resultId) {
    await this.initialize()
    
    try {
      const deleted = await databaseService.deleteResult(resultId)
      if (deleted) {
        console.log(`Résultat ${resultId} supprimé avec succès`)
        return true
      } else {
        throw new Error('Résultat non trouvé')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du résultat:', error)
      throw new Error(`Impossible de supprimer le résultat: ${error.message}`)
    }
  }

  async searchResults(query) {
    await this.initialize()
    
    try {
      const results = await databaseService.searchResults(query)
      return results
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      throw new Error(`Impossible de rechercher les résultats: ${error.message}`)
    }
  }

  async getResultsCount() {
    await this.initialize()
    
    try {
      const count = await databaseService.getResultsCount()
      return count
    } catch (error) {
      console.error('Erreur lors du comptage des résultats:', error)
      throw new Error(`Impossible de compter les résultats: ${error.message}`)
    }
  }

  async migrateFromLocalStorage() {
    try {
      const savedResults = JSON.parse(localStorage.getItem('savedResults') || '[]')
      
      if (savedResults.length > 0) {
        console.log(`Migration de ${savedResults.length} résultats depuis localStorage...`)
        
        for (const result of savedResults) {
          await this.saveResult({
            fileName: result.fileName,
            fileSize: result.fileSize,
            ocrText: result.ocrText || '',
            extractedData: result.data
          })
        }
        
        // Supprimer les données du localStorage après migration
        localStorage.removeItem('savedResults')
        console.log('Migration terminée avec succès')
      }
    } catch (error) {
      console.error('Erreur lors de la migration depuis localStorage:', error)
      // Ne pas faire échouer l'application si la migration échoue
    }
  }

  async close() {
    if (this.isInitialized) {
      await databaseService.close()
      this.isInitialized = false
    }
  }
}

export default new ResultsService() 