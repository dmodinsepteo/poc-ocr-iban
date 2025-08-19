<template>
  <div class="processing-steps">
    <h3>Étapes de traitement</h3>
    
    <div class="steps-container">
      <!-- Étape Sélection de fichier -->
      <div class="step">
        <div class="step-header">
          <div class="step-title">
            <span class="step-number">1</span>
            <h4>Étape 1 : Sélection du fichier</h4>
          </div>
          <span class="status" :class="'status-' + fileSelectionStatus">
            {{ getStatusText(fileSelectionStatus) }}
          </span>
        </div>
        <div class="step-content">
          <div v-if="selectedFile" class="file-display">
            <div class="file-header">
              <h4>Fichier sélectionné :</h4>
            </div>
            <div class="file-container">
              <div class="file-info">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
              </div>
            </div>
          </div>
          <div v-else class="no-file">
            <p>Aucun fichier sélectionné</p>
            <button @click="selectFile" :disabled="!isTokenValid" class="btn btn-primary btn-lg">
              📁 Sélectionner un fichier
            </button>
          </div>
        </div>
      </div>

      <!-- Étape OCR -->
      <div class="step">
        <div class="step-header">
          <div class="step-title">
            <span class="step-number">2</span>
            <h4>Étape 2 : OCR du document</h4>
          </div>
          <span class="status" :class="'status-' + ocrStatus">
            {{ getStatusText(ocrStatus) }}
          </span>
        </div>
        <div class="step-content">
          <button 
            @click="performOCR" 
            :disabled="!selectedFile || isOcring || !isTokenValid"
            class="btn btn-secondary"
          >
            <span v-if="!isOcring">📄 Effectuer l'OCR</span>
            <span v-else>⏳ OCR en cours...</span>
          </button>
          
          <!-- Affichage du texte extrait -->
          <div v-if="ocrText" class="ocr-display">
            <div class="ocr-header">
              <h4>Texte extrait :</h4>
                          <button @click="copyOCRText" class="btn btn-primary" :title="ocrCopyStatus">
              {{ ocrCopyStatus === 'Copié !' ? '✅' : '📋' }}
            </button>
            </div>
            <div class="ocr-container">
              <pre class="ocr-text">{{ ocrText }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape Extraction -->
      <div class="step">
        <div class="step-header">
          <div class="step-title">
            <span class="step-number">3</span>
            <h4>Étape 3 : Extraction des données</h4>
          </div>
          <span class="status" :class="'status-' + extractionStatus">
            {{ getStatusText(extractionStatus) }}
          </span>
        </div>
        <div class="step-content">
          <button 
            @click="extractData" 
            :disabled="!ocrText || isExtracting || !isTokenValid"
            class="btn btn-secondary"
          >
            <span v-if="!isExtracting">📊 Extraire les données</span>
            <span v-else>⏳ Extraction en cours...</span>
          </button>
          
          <!-- Bouton de sauvegarde -->
          <div v-if="extractedData" class="save-section">
            <button @click="saveResult" :disabled="saveStatus === 'saving'" class="btn btn-success">
              <span v-if="saveStatus === 'saving'">⏳ Sauvegarde...</span>
              <span v-else>💾 Sauvegarder le résultat</span>
            </button>
            <span v-if="saveStatus" class="status" :class="'status-' + saveStatus">
              {{ saveStatus === 'success' ? '✅ Sauvegardé !' : saveStatus === 'error' ? '❌ Erreur' : saveStatus === 'saving' ? '⏳ Sauvegarde...' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages de retry et d'erreurs -->
    <div v-if="retryMessages.length > 0" class="retry-messages">
      <div v-for="(message, index) in retryMessages" :key="index" class="retry-message" :class="message.type">
        <span class="retry-icon">{{ message.icon }}</span>
        <span class="retry-text">{{ message.text }}</span>
      </div>
    </div>

    <!-- Bouton traitement complet -->
    <div class="complete-process">
      <button 
        @click="processComplete" 
        :disabled="!selectedFile || isProcessing || !isTokenValid"
        class="btn btn-gradient btn-lg"
      >
        <span v-if="!isProcessing">🚀 Traitement complet</span>
        <span v-else>⏳ Traitement en cours...</span>
      </button>
      <p class="complete-info">
        Effectue automatiquement l'OCR puis l'extraction des données
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import ocrService from '../services/ocrService.js'
import authService from '../services/authService.js'
import resultsService from '../services/resultsService.js'

export default {
  name: 'ProcessingSteps',
  props: {
    selectedFile: {
      type: File,
      default: null
    }
  },
  emits: ['file-selected', 'ocr-completed', 'extraction-completed', 'processing-completed'],
  setup(props, { emit }) {
    const ocrText = ref('')
    const extractedData = ref(null)
    const isOcring = ref(false)
    const isExtracting = ref(false)
    const isProcessing = ref(false)
    const ocrCopyStatus = ref('Copier')
    const saveStatus = ref('')
    const retryMessages = ref([])

    const ocrStatus = computed(() => {
      if (isOcring.value) return 'processing'
      if (ocrText.value) return 'completed'
      return 'pending'
    })

    const fileSelectionStatus = computed(() => {
      if (props.selectedFile) return 'completed'
      return 'pending'
    })

    const extractionStatus = computed(() => {
      if (isExtracting.value) return 'processing'
      if (extractedData.value) return 'completed'
      return 'pending'
    })

    const isTokenValid = computed(() => authService.token.value !== null && authService.tokenExpiry.value && Date.now() < authService.tokenExpiry.value)

    // Fonction pour ajouter un message de retry
    const addRetryMessage = (type, text, icon) => {
      const message = { type, text, icon, timestamp: Date.now() }
      retryMessages.value.push(message)
      
      // Supprimer le message après 10 secondes
      setTimeout(() => {
        const index = retryMessages.value.findIndex(m => m.timestamp === message.timestamp)
        if (index > -1) {
          retryMessages.value.splice(index, 1)
        }
      }, 10000)
    }

    // Fonction pour nettoyer les messages
    const clearRetryMessages = () => {
      retryMessages.value = []
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'pending': return 'En attente'
        case 'processing': return 'En cours'
        case 'completed': return 'Terminé'
        default: return 'En attente'
      }
    }

    const performOCR = async () => {
      if (!props.selectedFile) return
      
      isOcring.value = true
      clearRetryMessages()
      
      try {
        // Intercepter les messages de retry depuis la console
        const originalWarn = console.warn
        const originalLog = console.log
        const originalError = console.error
        
        console.warn = (message) => {
          if (message.includes('Tentative') && message.includes('échouée')) {
            addRetryMessage('warning', message, '⚠️')
          }
          originalWarn(message)
        }
        
        console.log = (message) => {
          if (message.includes('Attente de') && message.includes('avant la prochaine tentative')) {
            addRetryMessage('info', message, '⏳')
          }
          originalLog(message)
        }
        
        console.error = (message) => {
          if (message.includes('Échec après') || message.includes('Erreur non retryable')) {
            addRetryMessage('error', message, '❌')
          }
          originalError(message)
        }
        
        ocrText.value = await ocrService.performOCR(props.selectedFile)
        emit('ocr-completed', ocrText.value)
        
        // Restaurer les fonctions console
        console.warn = originalWarn
        console.log = originalLog
        console.error = originalError
      } catch (error) {
        console.error('Erreur OCR:', error)
        addRetryMessage('error', `Erreur finale: ${error.message}`, '❌')
      } finally {
        isOcring.value = false
      }
    }

    const extractData = async () => {
      if (!ocrText.value) return
      
      isExtracting.value = true
      clearRetryMessages()
      
      try {
        // Intercepter les messages de retry depuis la console
        const originalWarn = console.warn
        const originalLog = console.log
        const originalError = console.error
        
        console.warn = (message) => {
          if (message.includes('Tentative') && message.includes('échouée')) {
            addRetryMessage('warning', message, '⚠️')
          }
          originalWarn(message)
        }
        
        console.log = (message) => {
          if (message.includes('Attente de') && message.includes('avant la prochaine tentative')) {
            addRetryMessage('info', message, '⏳')
          }
          originalLog(message)
        }
        
        console.error = (message) => {
          if (message.includes('Échec après') || message.includes('Erreur non retryable')) {
            addRetryMessage('error', message, '❌')
          }
          originalError(message)
        }
        
        const data = await ocrService.extractData(ocrText.value)
        extractedData.value = data
        emit('extraction-completed', data)
        
        // Restaurer les fonctions console
        console.warn = originalWarn
        console.log = originalLog
        console.error = originalError
      } catch (error) {
        console.error('Erreur extraction:', error)
        addRetryMessage('error', `Erreur finale: ${error.message}`, '❌')
      } finally {
        isExtracting.value = false
      }
    }

    const processComplete = async () => {
      if (!props.selectedFile) return
      
      isProcessing.value = true
      clearRetryMessages()
      
      try {
        // Intercepter les messages de retry depuis la console
        const originalWarn = console.warn
        const originalLog = console.log
        const originalError = console.error
        
        console.warn = (message) => {
          if (message.includes('Tentative') && message.includes('échouée')) {
            addRetryMessage('warning', message, '⚠️')
          }
          originalWarn(message)
        }
        
        console.log = (message) => {
          if (message.includes('Attente de') && message.includes('avant la prochaine tentative')) {
            addRetryMessage('info', message, '⏳')
          }
          originalLog(message)
        }
        
        console.error = (message) => {
          if (message.includes('Échec après') || message.includes('Erreur non retryable')) {
            addRetryMessage('error', message, '❌')
          }
          originalError(message)
        }
        
        const result = await ocrService.processFile(props.selectedFile)
        ocrText.value = result.ocrText
        extractedData.value = result.extractedData
        emit('processing-completed', result)
        
        // Restaurer les fonctions console
        console.warn = originalWarn
        console.log = originalLog
        console.error = originalError
      } catch (error) {
        console.error('Erreur traitement complet:', error)
        addRetryMessage('error', `Erreur finale: ${error.message}`, '❌')
      } finally {
        isProcessing.value = false
      }
    }

    const copyOCRText = async () => {
      try {
        await navigator.clipboard.writeText(ocrText.value)
        ocrCopyStatus.value = 'Copié !'
        setTimeout(() => {
          ocrCopyStatus.value = 'Copier'
        }, 2000)
      } catch (error) {
        console.error('Erreur lors de la copie:', error)
        ocrCopyStatus.value = 'Erreur'
        setTimeout(() => {
          ocrCopyStatus.value = 'Copier'
        }, 2000)
      }
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const selectFile = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf,.jpg,.jpeg,.png,.tiff,.tif'
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          emit('file-selected', file)
        }
      }
      input.click()
    }

    const saveResult = async () => {
      if (!extractedData.value || !props.selectedFile) return
      
      try {
        saveStatus.value = 'saving'
        
        const resultData = {
          fileName: props.selectedFile.name,
          fileSize: props.selectedFile.size,
          ocrText: ocrText.value,
          extractedData: extractedData.value
        }
        
        await resultsService.saveResult(resultData)
        
        saveStatus.value = 'success'
        setTimeout(() => {
          saveStatus.value = ''
        }, 3000)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        saveStatus.value = 'error'
        setTimeout(() => {
          saveStatus.value = ''
        }, 3000)
      }
    }

    return {
      ocrText,
      extractedData,
      isOcring,
      isExtracting,
      isProcessing,
      ocrStatus,
      fileSelectionStatus,
      extractionStatus,
      isTokenValid,
      ocrCopyStatus,
      saveStatus,
      retryMessages,
      getStatusText,
      performOCR,
      extractData,
      processComplete,
      copyOCRText,
      formatFileSize,
      selectFile,
      saveResult
    }
  }
}
</script>

 