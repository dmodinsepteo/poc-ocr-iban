<template>
  <div id="app">
    <header class="header">
      <h1>Extracteur de Coordonnées Bancaires</h1>
      <p>Sélectionnez un fichier RIB pour extraire automatiquement les informations</p>
    </header>

    <main class="main">
      <!-- Section d'authentification -->
      <section class="auth-section">
        <div class="auth-container">
          <h2>🔐 Authentification</h2>
          <AuthManager @token-updated="handleTokenUpdate" />
        </div>
      </section>

      <!-- Section principale de l'application -->
      <section class="app-section">
        <!-- Onglets de navigation -->
        <div class="tabs-container">
          <button 
            @click="() => { activeTab = 'extraction'; saveActiveTab('extraction'); }" 
            :class="['tab-btn', { active: activeTab === 'extraction' }]"
          >
            🔍 Extraction
          </button>
          <button 
            @click="() => { activeTab = 'consultation'; saveActiveTab('consultation'); }" 
            :class="['tab-btn', { active: activeTab === 'consultation' }]"
          >
            📋 Consultation
          </button>
          <button 
            @click="() => { activeTab = 'pdf'; saveActiveTab('pdf'); }" 
            :class="['tab-btn', { active: activeTab === 'pdf' }]"
          >
            📄 Génération PDF
          </button>
          <button 
            @click="() => { activeTab = 'comparison'; saveActiveTab('comparison'); }" 
            :class="['tab-btn', { active: activeTab === 'comparison' }]"
          >
            🔄 Comparaison
          </button>
          <button 
            @click="() => { activeTab = 'ocr-test'; saveActiveTab('ocr-test'); }" 
            :class="['tab-btn', { active: activeTab === 'ocr-test' }]"
          >
            🔍 Test OCR
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

        <div v-else-if="activeTab === 'pdf'" class="tab-content">
          <!-- Génération PDF -->
          <PDFGenerator />
        </div>

        <div v-else-if="activeTab === 'comparison'" class="tab-content">
          <!-- Comparaison de résultats -->
          <ResultsComparison />
        </div>

        <div v-else-if="activeTab === 'ocr-test'" class="tab-content">
          <!-- Test des limites de l'OCR -->
          <OCRTester />
        </div>

        <!-- Section d'erreur -->
        <section v-if="error" class="error-section">
          <div class="error-message">
            <h3>Erreur</h3>
            <p>{{ error }}</p>
          </div>
        </section>
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
import PDFGenerator from './components/PDFGenerator.vue'
import ResultsComparison from './components/ResultsComparison.vue'
import OCRTester from './components/OCRTester.vue'
import authService from './services/authService.js'
import resultsService from './services/resultsService.js'
import './styles/main.css'

export default {
  name: 'App',
  components: {
    AuthManager,
    ProcessingSteps,
    ResultsDisplay,
    SavedResultsViewer,
    PDFGenerator,
    ResultsComparison,
    OCRTester
  },
  setup() {
    const selectedFile = ref(null)
    const extractedData = ref(null)
    const ocrText = ref('')
    const isProcessing = ref(false)
    const error = ref(null)
    const activeTab = ref('extraction')

    // Fonction pour sauvegarder l'onglet actif
    const saveActiveTab = (tab) => {
      localStorage.setItem('activeTab', tab)
    }

    // Fonction pour charger l'onglet actif depuis le localStorage
    const loadActiveTab = () => {
      const savedTab = localStorage.getItem('activeTab')
      if (savedTab && ['extraction', 'consultation', 'pdf', 'comparison', 'ocr-test'].includes(savedTab)) {
        activeTab.value = savedTab
      }
    }

    // Initialiser la base de données au démarrage
    onMounted(async () => {
      try {
        // Charger l'onglet actif depuis le localStorage
        loadActiveTab()
        
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
      saveActiveTab,
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
/* Section d'authentification */
.auth-section {
  background: linear-gradient(135deg, #64e4dd, #4d54d1 50%, #ff96de 75%, #ff8e8b 90%, #ff614c);
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.auth-container {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.auth-container h2 {
  color: white;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Section principale de l'application */
.app-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Styles pour les onglets */
.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  padding: 20px 20px 0 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
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
  color: #4d54d1;
}

.tab-btn.active {
  background: linear-gradient(135deg, #64e4dd, #4d54d1);
  color: white;
  border-color: #4d54d1;
  box-shadow: 0 2px 8px rgba(77, 84, 209, 0.3);
}

.tab-content {
  background: white;
  border: none;
  border-radius: 0;
  margin-top: 0;
  min-height: 400px;
}

@media (max-width: 768px) {
  .auth-section {
    padding: 20px 15px;
    margin-bottom: 20px;
  }
  
  .auth-container h2 {
    font-size: 1.3rem;
  }
  
  .tabs-container {
    flex-direction: column;
    gap: 5px;
    padding: 15px 15px 0 15px;
  }
  
  .tab-btn {
    border-radius: 8px;
    border-bottom: 1px solid #dee2e6;
  }
  
  .tab-content {
    border-radius: 0;
  }
}
</style> 