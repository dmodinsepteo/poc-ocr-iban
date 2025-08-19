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
      try {
        ocrText.value = await ocrService.performOCR(props.selectedFile)
        emit('ocr-completed', ocrText.value)
      } catch (error) {
        console.error('Erreur OCR:', error)
      } finally {
        isOcring.value = false
      }
    }

    const extractData = async () => {
      if (!ocrText.value) return
      
      isExtracting.value = true
      try {
        const data = await ocrService.extractData(ocrText.value)
        extractedData.value = data
        emit('extraction-completed', data)
      } catch (error) {
        console.error('Erreur extraction:', error)
      } finally {
        isExtracting.value = false
      }
    }

    const processComplete = async () => {
      if (!props.selectedFile) return
      
      isProcessing.value = true
      try {
        const result = await ocrService.processFile(props.selectedFile)
        ocrText.value = result.ocrText
        extractedData.value = result.extractedData
        emit('processing-completed', result)
      } catch (error) {
        console.error('Erreur traitement complet:', error)
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

 