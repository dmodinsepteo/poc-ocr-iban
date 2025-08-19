import axios from 'axios'
import authService from './authService.js'

class OCRService {
  constructor() {
    this.apiUrl = '/api' // Utilise le proxy local
  }

  async performOCR(file) {
    try {
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
    } catch (error) {
      throw new Error(`Erreur lors de l'OCR: ${error.response?.data?.message || error.message}`)
    }
  }

  async extractData(ocrText) {
    try {
      const token = await authService.getValidToken()

      const response = await axios.post(`${this.apiUrl}/document/rib`, ocrText, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      })

      return response.data
    } catch (error) {
      throw new Error(`Erreur lors de l'extraction des données: ${error.response?.data?.message || error.message}`)
    }
  }

  async processFile(file) {
    try {
      // Étape 1: OCR
      const ocrText = await this.performOCR(file)
      
      // Étape 2: Extraction des données
      const extractedData = await this.extractData(ocrText)
      
      return {
        ocrText,
        extractedData
      }
    } catch (error) {
      throw error
    }
  }
}

export default new OCRService() 