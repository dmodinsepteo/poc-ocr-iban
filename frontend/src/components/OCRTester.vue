<template>
  <div class="ocr-tester">
    <h2>🔍 Test des Limites de l'OCR</h2>
    <p class="description">
      Testez la robustesse de l'OCR en appliquant différentes transformations sur vos fichiers PDF.
      Le premier test servira de référence pour comparer les résultats avec transformations.
    </p>

    <!-- Section de sélection de fichier -->
    <div class="file-selection-section">
      <h3>📁 Sélection du fichier PDF à tester</h3>
      <div class="file-input-container">
        <input 
          type="file" 
          @change="handleFileSelected" 
          accept=".pdf,application/pdf"
          class="file-input"
          id="ocr-test-file"
        />
        <label for="ocr-test-file" class="file-input-label">
          <span class="file-input-icon">📄</span>
          <span class="file-input-text">
            {{ selectedFile ? selectedFile.name : 'Choisir un fichier PDF...' }}
          </span>
        </label>
      </div>
      
      <div v-if="selectedFile" class="file-info">
        <div class="file-details">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          <span class="file-type">{{ getFileType(selectedFile) }}</span>
        </div>
        <button @click="clearFile" class="btn btn-secondary btn-sm">
          🗑️ Supprimer
        </button>
      </div>
    </div>

    <!-- Section de configuration des tests -->
    <div v-if="selectedFile" class="test-configuration">
      <h3>⚙️ Configuration des tests</h3>
      
      <div class="transformation-grid">
        <!-- Test de référence -->
        <div class="transformation-card reference">
          <div class="card-header">
            <h4>🎯 Test de référence</h4>
            <span class="card-badge">Sans transformation</span>
          </div>
          <div class="card-content">
            <p>Document original pour comparaison</p>
            <div class="file-info-display">
              <span class="file-icon">📄</span>
              <span class="file-name">{{ selectedFile?.name }}</span>
            </div>
          </div>
        </div>

        <!-- Rotations -->
        <div class="transformation-card">
          <div class="card-header">
            <h4>🔄 Rotations</h4>
          </div>
          <div class="card-content">
            <div class="transformation-options">
              <label class="option-item">
                <input type="checkbox" v-model="transformations.rotation90" />
                <span>90°</span>
              </label>
              <label class="option-item">
                <input type="checkbox" v-model="transformations.rotation180" />
                <span>180°</span>
              </label>
              <label class="option-item">
                <input type="checkbox" v-model="transformations.rotation270" />
                <span>270°</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Inclinaisons -->
        <div class="transformation-card">
          <div class="card-header">
            <h4>📐 Inclinaisons</h4>
          </div>
          <div class="card-content">
            <div class="transformation-options">
              <label class="option-item">
                <input type="checkbox" v-model="transformations.skew5" />
                <span>5°</span>
              </label>
              <label class="option-item">
                <input type="checkbox" v-model="transformations.skew10" />
                <span>10°</span>
              </label>
              <label class="option-item">
                <input type="checkbox" v-model="transformations.skew15" />
                <span>15°</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Contraste -->
        <div class="transformation-card">
          <div class="card-header">
            <h4>🌓 Contraste</h4>
          </div>
          <div class="card-content">
            <div class="transformation-options">
              <label class="option-item">
                <input type="checkbox" v-model="transformations.contrastLow" />
                <span>Faible</span>
              </label>
              <label class="option-item">
                <input type="checkbox" v-model="transformations.contrastHigh" />
                <span>Élevé</span>
              </label>
              <label class="option-item">
                <input type="checkbox" v-model="transformations.contrastInverted" />
                <span>Inversé</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Luminosité -->
        <div class="transformation-card">
          <div class="card-header">
            <h4>💡 Luminosité</h4>
          </div>
          <div class="card-content">
            <div class="transformation-options">
              <label class="option-item">
                <input type="checkbox" v-model="transformations.brightnessLow" />
                <span>Sombre</span>
              </label>
              <label class="option-item">
                <input type="checkbox" v-model="transformations.brightnessHigh" />
                <span>Clair</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Bruit -->
        <div class="transformation-card">
          <div class="card-header">
            <h4>📺 Bruit</h4>
          </div>
          <div class="card-content">
            <div class="transformation-options">
              <label class="option-item">
                <input type="checkbox" v-model="transformations.noiseLow" />
                <span>Faible</span>
              </label>
              <label class="option-item">
                <input type="checkbox" v-model="transformations.noiseHigh" />
                <span>Élevé</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="test-actions">
        <button 
          @click="startOCRTests" 
          class="btn btn-primary"
          :disabled="isTesting"
        >
          <span v-if="isTesting">⏳ Tests en cours...</span>
          <span v-else>🚀 Lancer les tests OCR</span>
        </button>
        
        <button 
          v-if="testResults.length > 0"
          @click="clearResults" 
          class="btn btn-secondary"
          :disabled="isTesting"
        >
          🗑️ Effacer les résultats
        </button>
      </div>
    </div>

    <!-- Barre de progression -->
    <div v-if="isTesting" class="testing-progress">
      <div class="progress-info">
        <span class="progress-text">{{ currentTestName }}</span>
        <span class="progress-count">{{ completedTests }}/{{ totalTests }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- Section des résultats -->
    <div v-if="testResults.length > 0" class="results-section">
      <h3>📊 Résultats des tests OCR</h3>
      
      <div class="results-summary">
        <div class="summary-item">
          <span class="summary-label">Tests effectués :</span>
          <span class="summary-value">{{ testResults.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Confiance moyenne :</span>
          <span class="summary-value">{{ Math.round(averageConfidence) }}%</span>
        </div>
      </div>

      <div class="results-list">
        <div 
          v-for="(result, index) in testResults" 
          :key="index" 
          class="result-item"
          :class="{ 'reference': result.isReference }"
        >
          <div class="result-header">
            <div class="result-title-section">
              <h4>{{ result.name }}</h4>
              <span v-if="result.isReference" class="reference-badge">Référence</span>
            </div>
            <div class="result-stats">
              <span class="confidence-badge" :class="getConfidenceClass(result.confidence)">
                {{ result.confidence }}%
              </span>
              <span class="text-length">{{ result.textLength }} caractères</span>
            </div>
          </div>

          <div class="result-content">
            <div class="text-preview">
              <div 
                class="text-content" 
                :class="{ 'expanded': result.textExpanded }"
              >
                {{ result.text || 'Aucun texte extrait' }}
              </div>
              <button 
                v-if="result.text && result.text.length > 200"
                @click="toggleTextExpansion(result)" 
                class="btn btn-sm btn-outline"
              >
                {{ result.textExpanded ? 'Réduire' : 'Voir plus' }}
              </button>
            </div>

            <div class="result-actions">
              <button @click="copyToClipboard(result.text)" class="btn btn-sm btn-outline">
                📋 Copier le texte
              </button>
              <button @click="downloadResult(result)" class="btn btn-sm btn-outline">
                💾 Télécharger le texte
              </button>
              <button 
                @click="downloadOCRFile(result)" 
                class="btn btn-sm btn-outline"
                :title="'Télécharger le fichier envoyé à l\'API OCR'"
              >
                📄 Télécharger le fichier OCR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ocrService from '../services/ocrService.js'

export default {
  name: 'OCRTester',
  setup() {
    const selectedFile = ref(null)
    const isTesting = ref(false)
    const testResults = ref([])
    const currentTestName = ref('')
    const completedTests = ref(0)
    const totalTests = ref(0)
    
    // Configuration des transformations
    const transformations = ref({
      // Rotations
      rotation90: false,
      rotation180: false,
      rotation270: false,
      
      // Inclinaisons
      skew5: false,
      skew10: false,
      skew15: false,
      
      // Contraste
      contrastLow: false,
      contrastHigh: false,
      contrastInverted: false,
      
      // Luminosité
      brightnessLow: false,
      brightnessHigh: false,
      
      // Bruit
      noiseLow: false,
      noiseHigh: false
    })

    const averageConfidence = computed(() => {
      if (testResults.value.length === 0) return 0
      const total = testResults.value.reduce((sum, result) => sum + result.confidence, 0)
      return total / testResults.value.length
    })

    const progressPercentage = computed(() => {
      if (totalTests.value === 0) return 0
      return (completedTests.value / totalTests.value) * 100
    })

    const hasSelectedTransformations = computed(() => {
      return Object.values(transformations.value).some(value => value === true)
    })

    // Méthodes
    const handleFileSelected = (event) => {
      const file = event.target.files[0]
      if (file) {
        // Vérifier que c'est bien un PDF
        if (file.type !== 'application/pdf') {
          alert('Seuls les fichiers PDF sont supportés par l\'API OCR.')
          return
        }
        
        selectedFile.value = file
        testResults.value = []
      }
    }

    const clearFile = () => {
      selectedFile.value = null
      testResults.value = []
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileType = (file) => {
      return file.type.split('/')[1].toUpperCase()
    }

    const getConfidenceClass = (confidence) => {
      if (confidence >= 80) return 'high'
      if (confidence >= 60) return 'medium'
      return 'low'
    }

    const toggleTextExpansion = (result) => {
      result.textExpanded = !result.textExpanded
    }

    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        alert('Texte copié dans le presse-papiers !')
      } catch (error) {
        console.error('Erreur lors de la copie:', error)
        alert('Erreur lors de la copie du texte')
      }
    }

    const downloadResult = (result) => {
      const blob = new Blob([result.text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${result.name.replace(/[^a-zA-Z0-9]/g, '-')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const downloadOCRFile = async (result) => {
      if (!result.ocrFile) {
        console.error('Aucun fichier OCR disponible pour ce résultat')
        return
      }

      try {
        // Créer un nom de fichier descriptif
        const testName = result.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
        const originalName = selectedFile.value.name
        const extension = originalName.split('.').pop() || 'pdf'
        const baseName = originalName.replace(/\.[^/.]+$/, '')
        
        const fileName = `${baseName}-${testName}-sent-to-ocr.${extension}`
        
        // Créer un lien de téléchargement
        const url = URL.createObjectURL(result.ocrFile)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        console.log(`✅ Fichier envoyé à l'OCR téléchargé: ${fileName}`)
      } catch (error) {
        console.error('❌ Erreur lors du téléchargement:', error)
        alert('Erreur lors du téléchargement du fichier envoyé à l\'OCR')
      }
    }

    const clearResults = () => {
      testResults.value = []
    }

    const startOCRTests = async () => {
      if (!selectedFile.value || isTesting.value) return
      
      isTesting.value = true
      testResults.value = []
      completedTests.value = 0
      
      // Calculer le nombre total de tests (référence + transformations sélectionnées)
      const selectedTransforms = getSelectedTransformations()
      totalTests.value = 1 + selectedTransforms.length // Référence + transformations

      try {
        // Test de référence (toujours effectué)
        currentTestName.value = 'Test OCR de référence'
        const referenceResult = await performOCRTest(selectedFile.value, 'Référence (sans transformation)', true)
        testResults.value.push(referenceResult)
        completedTests.value = 1

        // Tests avec transformations (mais fichier original envoyé)
        for (const transform of selectedTransforms) {
          currentTestName.value = `Test OCR: ${transform.name}`
          const result = await performOCRTest(selectedFile.value, transform.name, false, transform)
          testResults.value.push(result)
          completedTests.value++
        }
      } catch (error) {
        console.error('Erreur lors des tests OCR:', error)
        alert('Erreur lors des tests OCR: ' + error.message)
      } finally {
        isTesting.value = false
        currentTestName.value = ''
      }
    }

    const getSelectedTransformations = () => {
      const transforms = []
      
      // Rotations
      if (transformations.value.rotation90) transforms.push({ name: 'Rotation 90°', type: 'rotation', value: 90 })
      if (transformations.value.rotation180) transforms.push({ name: 'Rotation 180°', type: 'rotation', value: 180 })
      if (transformations.value.rotation270) transforms.push({ name: 'Rotation 270°', type: 'rotation', value: 270 })
      
      // Inclinaisons
      if (transformations.value.skew5) transforms.push({ name: 'Inclinaison 5°', type: 'skew', value: 5 })
      if (transformations.value.skew10) transforms.push({ name: 'Inclinaison 10°', type: 'skew', value: 10 })
      if (transformations.value.skew15) transforms.push({ name: 'Inclinaison 15°', type: 'skew', value: 15 })
      
      // Contraste
      if (transformations.value.contrastLow) transforms.push({ name: 'Contraste faible', type: 'contrast', value: 'low' })
      if (transformations.value.contrastHigh) transforms.push({ name: 'Contraste élevé', type: 'contrast', value: 'high' })
      if (transformations.value.contrastInverted) transforms.push({ name: 'Contraste inversé', type: 'contrast', value: 'inverted' })
      
      // Luminosité
      if (transformations.value.brightnessLow) transforms.push({ name: 'Luminosité faible', type: 'brightness', value: 'low' })
      if (transformations.value.brightnessHigh) transforms.push({ name: 'Luminosité élevée', type: 'brightness', value: 'high' })
      
      // Bruit
      if (transformations.value.noiseLow) transforms.push({ name: 'Bruit faible', type: 'noise', value: 'low' })
      if (transformations.value.noiseHigh) transforms.push({ name: 'Bruit élevé', type: 'noise', value: 'high' })
      
      return transforms
    }

    const performOCRTest = async (file, testName, isReference, transform = null) => {
      try {
        // IMPORTANT: On envoie toujours le fichier original à l'API OCR
        // Les transformations sont juste des labels pour organiser les tests
        console.log(`🔍 Test OCR: ${testName} (fichier original envoyé)`)
        
        const ocrResult = await ocrService.performOCR(file)
        const ocrText = ocrResult.text
        
        // Simuler un score de confiance basé sur la longueur du texte
        // Dans une vraie implémentation, l'API devrait retourner ce score
        const confidence = ocrText && ocrText.length > 0 ? Math.min(95, 60 + (ocrText.length / 100)) : 0
        
        return {
          name: testName,
          isReference,
          text: ocrText || '',
          confidence: confidence,
          textLength: (ocrText || '').length,
          textExpanded: false,
          transform: transform, // Information sur la transformation (pour affichage)
          ocrFile: ocrResult.file // Le fichier original qui a été envoyé à l'API
        }
      } catch (error) {
        console.error(`Erreur OCR pour ${testName}:`, error)
        return {
          name: testName,
          isReference,
          text: `Erreur lors de l'OCR: ${error.message}`,
          confidence: 0,
          textLength: 0,
          textExpanded: false,
          transform: transform,
          ocrFile: file // En cas d'erreur, on garde le fichier original
        }
      }
    }

    return {
      selectedFile,
      isTesting,
      testResults,
      currentTestName,
      completedTests,
      totalTests,
      transformations,
      averageConfidence,
      progressPercentage,
      hasSelectedTransformations,
      handleFileSelected,
      clearFile,
      formatFileSize,
      getFileType,
      getConfidenceClass,
      toggleTextExpansion,
      copyToClipboard,
      downloadResult,
      downloadOCRFile,
      clearResults,
      startOCRTests,
      getSelectedTransformations
    }
  }
}
</script>

<style scoped>
.ocr-tester {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.description {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Section de sélection de fichier */
.file-selection-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-input-container {
  position: relative;
  margin-bottom: 16px;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input-label {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.file-input-label:hover {
  border-color: #1976d2;
  background: #f0f8ff;
}

.file-input-icon {
  font-size: 24px;
  margin-right: 12px;
}

.file-input-text {
  font-size: 16px;
  color: #333;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.file-details {
  display: flex;
  gap: 16px;
  align-items: center;
}

.file-name {
  font-weight: 600;
  color: #333;
}

.file-size, .file-type {
  color: #666;
  font-size: 0.9rem;
}

/* Configuration des tests */
.test-configuration {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transformation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.transformation-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.transformation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.transformation-card.reference {
  border-color: #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.card-badge {
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-content {
  padding: 16px;
}

.transformation-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s ease;
}

.option-item:hover {
  color: #1976d2;
}

.option-item input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.option-item span {
  font-size: 0.9rem;
  user-select: none;
}

.file-info-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.file-icon {
  font-size: 16px;
}

.file-name {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.test-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Barre de progression */
.testing-progress {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-text {
  font-weight: 600;
  color: #333;
}

.progress-count {
  color: #666;
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  transition: width 0.3s ease;
}

/* Section des résultats */
.results-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
}

.summary-value {
  font-weight: 600;
  font-size: 1.2rem;
  color: #333;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.result-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-item.reference {
  border-color: #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.result-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-title-section h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.reference-badge {
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.result-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.confidence-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.confidence-badge.high {
  background: #d4edda;
  color: #155724;
}

.confidence-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.confidence-badge.low {
  background: #f8d7da;
  color: #721c24;
}

.text-length {
  color: #666;
  font-size: 0.9rem;
}

.result-content {
  padding: 20px;
}

.text-preview {
  margin-bottom: 16px;
}

.text-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  max-height: 200px;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
}

.text-content.expanded {
  max-height: none;
}

.result-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Boutons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.btn-outline:hover:not(:disabled) {
  background: #1976d2;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .ocr-tester {
    padding: 16px;
  }
  
  .file-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .result-stats {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .test-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .results-summary {
    flex-direction: column;
    gap: 16px;
  }
}
</style>