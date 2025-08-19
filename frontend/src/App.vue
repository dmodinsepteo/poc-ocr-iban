<template>
  <div id="app">
    <header class="header">
      <h1>Extracteur de Coordonnées Bancaires</h1>
      <p>Sélectionnez un fichier RIB pour extraire automatiquement les informations</p>
    </header>

    <main class="main">
      <!-- Gestionnaire d'authentification -->
      <AuthManager @token-updated="handleTokenUpdate" />

      <!-- Onglets de navigation -->
      <div class="tabs-container">
        <button 
          @click="activeTab = 'extraction'" 
          :class="['tab-btn', { active: activeTab === 'extraction' }]"
        >
          🔍 Extraction
        </button>
        <button 
          @click="activeTab = 'consultation'" 
          :class="['tab-btn', { active: activeTab === 'consultation' }]"
        >
          📋 Consultation
        </button>
      </div>

      <!-- Contenu des onglets -->
      <div v-if="activeTab === 'extraction'" class="tab-content">
        <!-- Étapes de traitement -->
        <ProcessingSteps 
          :selected-file="selectedFile"
          @file-selected="handleFileSelected"
          @ocr-completed="handleOCRCompleted"
          @extraction-completed="handleExtractionCompleted"
          @processing-completed="handleProcessingCompleted"
        />

        <!-- Affichage des résultats -->
        <ResultsDisplay 
          v-if="extractedData"
          :extracted-data="extractedData"
          :ocr-text="ocrText"
        />
      </div>

      <div v-else-if="activeTab === 'consultation'" class="tab-content">
        <!-- Consultation des résultats sauvegardés -->
        <SavedResultsViewer />
      </div>

      <!-- Section d'erreur -->
      <section v-if="error" class="error-section">
        <div class="error-message">
          <h3>Erreur</h3>
          <p>{{ error }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import AuthManager from './components/AuthManager.vue'
import ProcessingSteps from './components/ProcessingSteps.vue'
import ResultsDisplay from './components/ResultsDisplay.vue'
import SavedResultsViewer from './components/SavedResultsViewer.vue'
import authService from './services/authService.js'
import resultsService from './services/resultsService.js'
import './styles/main.css'

export default {
  name: 'App',
  components: {
    AuthManager,
    ProcessingSteps,
    ResultsDisplay,
    SavedResultsViewer
  },
  setup() {
    const selectedFile = ref(null)
    const extractedData = ref(null)
    const ocrText = ref('')
    const isProcessing = ref(false)
    const error = ref(null)
    const activeTab = ref('extraction')

    // Initialiser la base de données au démarrage
    onMounted(async () => {
      try {
        await resultsService.initialize()
        await resultsService.migrateFromLocalStorage()
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error)
      }
    })

    const isTokenValid = computed(() => authService.token.value !== null && authService.tokenExpiry.value && Date.now() < authService.tokenExpiry.value)

    const handleTokenUpdate = () => {
      // Réinitialiser les données si le token change
      if (!isTokenValid.value) {
        extractedData.value = null
        error.value = null
      }
    }

    const handleFileSelected = (file) => {
      selectedFile.value = file
      error.value = null
      extractedData.value = null
    }

    const handleOCRCompleted = (text) => {
      ocrText.value = text
      console.log('OCR terminé:', text.substring(0, 100) + '...')
    }

    const handleExtractionCompleted = (data) => {
      extractedData.value = data
      error.value = null
    }

    const handleProcessingCompleted = (result) => {
      extractedData.value = result.extractedData
      ocrText.value = result.ocrText
      error.value = null
    }

    return {
      selectedFile,
      extractedData,
      ocrText,
      isProcessing,
      error,
      activeTab,
      isTokenValid,
      handleTokenUpdate,
      handleFileSelected,
      handleOCRCompleted,
      handleExtractionCompleted,
      handleProcessingCompleted
    }
  }
}
  </script>

<style scoped>
/* Styles pour les onglets */
.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  padding: 0 20px;
}

.tab-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 12px 24px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: none;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #2e3862;
}

.tab-btn.active {
  background: #2e3862;
  color: white;
  border-color: #2e3862;
  box-shadow: 0 2px 8px rgba(46, 56, 98, 0.2);
}

.tab-content {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0 8px 8px 8px;
  margin-top: -1px;
  min-height: 400px;
}

@media (max-width: 768px) {
  .tabs-container {
    flex-direction: column;
    gap: 5px;
  }
  
  .tab-btn {
    border-radius: 8px;
    border-bottom: 1px solid #dee2e6;
  }
  
  .tab-content {
    border-radius: 8px;
    margin-top: 0;
  }
}
</style> 