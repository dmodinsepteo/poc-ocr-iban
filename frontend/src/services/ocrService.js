import axios from 'axios'
import authService from './authService.js'

class OCRService {
  constructor() {
    this.apiUrl = '/api' // Utilise le proxy local
    this.maxRetries = 3
    this.retryDelay = 2000 // 2 secondes entre les tentatives
  }

  // Fonction utilitaire pour attendre
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Fonction pour vérifier si une erreur est retryable (502, 503)
  isRetryableError(error) {
    const status = error.response?.status
    return status === 502 || status === 503
  }

  // Fonction générique pour retry avec gestion d'erreurs
  async retryRequest(requestFn, operationName) {
    let lastError = null
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error
        
        if (this.isRetryableError(error)) {
          console.warn(`⚠️ ${operationName} - Tentative ${attempt}/${this.maxRetries} échouée (${error.response?.status})`)
          
          if (attempt < this.maxRetries) {
            console.log(`⏳ Attente de ${this.retryDelay}ms avant la prochaine tentative...`)
            await this.sleep(this.retryDelay)
          } else {
            console.error(`❌ ${operationName} - Échec après ${this.maxRetries} tentatives`)
          }
        } else {
          // Erreur non retryable, on arrête immédiatement
          console.error(`❌ ${operationName} - Erreur non retryable (${error.response?.status})`)
          break
        }
      }
    }
    
    // Si on arrive ici, toutes les tentatives ont échoué
    const errorMessage = lastError.response?.data?.message || lastError.message
    const statusCode = lastError.response?.status || 'UNKNOWN'
    throw new Error(`${operationName} - Échec après ${this.maxRetries} tentatives (${statusCode}): ${errorMessage}`)
  }

  async performOCR(file) {
    return this.retryRequest(async () => {
      const token = await authService.getValidToken()
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${this.apiUrl}/ocr/di`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data.text
    }, 'OCR')
  }

  async extractData(ocrText) {
    return this.retryRequest(async () => {
      const token = await authService.getValidToken()

      const response = await axios.post(`${this.apiUrl}/document/rib`, ocrText, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      })

      return response.data
    }, 'Extraction de données')
  }

  async processFile(file) {
    try {
      console.log('🚀 Début du traitement du fichier...')
      
      // Étape 1: OCR avec retry
      console.log('📷 Étape 1: Extraction OCR...')
      const ocrText = await this.performOCR(file)
      console.log('✅ OCR terminé avec succès')
      
      // Étape 2: Extraction des données avec retry
      console.log('🔍 Étape 2: Extraction des données...')
      const extractedData = await this.extractData(ocrText)
      console.log('✅ Extraction des données terminée avec succès')
      
      return {
        ocrText,
        extractedData
      }
    } catch (error) {
      console.error('❌ Erreur finale lors du traitement:', error.message)
      throw error
    }
  }
}

export default new OCRService() 