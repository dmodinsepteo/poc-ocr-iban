<template>
  <div class="ocr-tester">
    <h2>🔍 Test des Limites de l'OCR</h2>
    <p class="description">
      Testez la robustesse de l'OCR en appliquant différentes transformations sur vos documents.
      Le premier test servira de référence pour comparer les résultats avec transformations.
    </p>

    <!-- Section de sélection de fichier -->
    <div class="file-selection-section">
      <h3>📁 Sélection du fichier à tester</h3>
      <div class="file-input-container">
        <input 
          type="file" 
          @change="handleFileSelected" 
          accept="image/*,.pdf"
          class="file-input"
          id="ocr-test-file"
        />
        <label for="ocr-test-file" class="file-input-label">
          <span class="file-input-icon">📄</span>
          <span class="file-input-text">
            {{ selectedFile ? selectedFile.name : 'Choisir un fichier...' }}
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

      <!-- Boutons de contrôle -->
      <div class="test-controls">
        <button 
          @click="startOCRTests" 
          class="btn btn-primary btn-large"
          :disabled="isTesting || !hasSelectedTransformations"
        >
          {{ isTesting ? '⏳ Tests en cours...' : '🚀 Lancer les tests OCR' }}
        </button>
        
        <div v-if="isTesting" class="testing-progress">
          <div class="progress-info">
            <span class="progress-text">{{ currentTestName }}</span>
            <span class="progress-count">{{ completedTests }}/{{ totalTests }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
        
        <button 
          @click="clearResults" 
          class="btn btn-secondary"
          :disabled="isTesting"
        >
          🗑️ Effacer les résultats
        </button>
      </div>
    </div>

    <!-- Section des résultats -->
    <div v-if="testResults.length > 0" class="results-section">
      <h3>📊 Résultats des tests OCR</h3>
      
      <!-- Statistiques globales -->
      <div class="global-stats">
        <div class="stat-card">
          <span class="stat-number">{{ testResults.length }}</span>
          <span class="stat-label">Tests effectués</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ averageConfidence.toFixed(1) }}%</span>
          <span class="stat-label">Confiance moyenne</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ bestResult.confidence.toFixed(1) }}%</span>
          <span class="stat-label">Meilleur résultat</span>
        </div>
      </div>

      <!-- Liste des résultats -->
      <div class="results-list">
        <div 
          v-for="(result, index) in testResults" 
          :key="index"
          class="result-card"
          :class="{ 'reference-result': result.isReference }"
        >
          <div class="result-header">
            <div class="result-title">
              <h4>{{ result.name }}</h4>
              <span v-if="result.isReference" class="reference-badge">🎯 Référence</span>
            </div>
            <div class="result-metrics">
              <span class="confidence-score" :class="getConfidenceClass(result.confidence)">
                {{ result.confidence.toFixed(1) }}%
              </span>
              <span class="text-length">{{ result.textLength }} caractères</span>
            </div>
          </div>
          
          <div class="result-content">
            <div class="result-info">
              <div class="result-icon">
                <span v-if="result.isReference" class="icon">🎯</span>
                <span v-else class="icon">🔄</span>
              </div>
              <div class="result-details">
                <span class="result-type">{{ result.isReference ? 'Document original' : 'Document transformé' }}</span>
                <span class="result-name">{{ result.name }}</span>
              </div>
            </div>
            
            <div class="result-text">
              <div class="text-header">
                <span class="text-label">Texte extrait :</span>
                <button @click="toggleTextExpansion(index)" class="btn btn-sm btn-outline">
                  {{ result.textExpanded ? 'Réduire' : 'Voir tout' }}
                </button>
              </div>
              <div class="text-content" :class="{ 'expanded': result.textExpanded }">
                {{ result.text }}
              </div>
            </div>
          </div>
          
          <div class="result-actions">
            <button @click="copyToClipboard(result.text)" class="btn btn-sm btn-outline">
              📋 Copier le texte
            </button>
            <button @click="downloadResult(result)" class="btn btn-sm btn-outline">
              💾 Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si aucun fichier sélectionné -->
    <div v-if="!selectedFile" class="no-file-message">
      <div class="message-content">
        <h3>📁 Aucun fichier sélectionné</h3>
        <p>Sélectionnez un fichier image ou PDF pour commencer les tests OCR.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ocrService from '../services/ocrService.js'
import imageTransformationService from '../services/imageTransformationService.js'

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

    // Computed properties
    const hasSelectedTransformations = computed(() => {
      return Object.values(transformations.value).some(value => value === true)
    })

    const averageConfidence = computed(() => {
      if (testResults.value.length === 0) return 0
      const total = testResults.value.reduce((sum, result) => sum + result.confidence, 0)
      return total / testResults.value.length
    })

    const bestResult = computed(() => {
      if (testResults.value.length === 0) return { confidence: 0 }
      return testResults.value.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      )
    })

    const progressPercentage = computed(() => {
      if (totalTests.value === 0) return 0
      return (completedTests.value / totalTests.value) * 100
    })

    // Méthodes
    const handleFileSelected = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
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
      return file.type || 'Type inconnu'
    }

    const getConfidenceClass = (confidence) => {
      if (confidence >= 80) return 'high'
      if (confidence >= 60) return 'medium'
      return 'low'
    }

    const toggleTextExpansion = (index) => {
      testResults.value[index].textExpanded = !testResults.value[index].textExpanded
    }

    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        // TODO: Afficher une notification de succès
      } catch (error) {
        console.error('Erreur lors de la copie:', error)
      }
    }

    const downloadResult = (result) => {
      const blob = new Blob([result.text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ocr-result-${result.name.replace(/[^a-zA-Z0-9]/g, '-')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const clearResults = () => {
      testResults.value = []
    }

    const startOCRTests = async () => {
      if (!selectedFile.value || isTesting.value) return
      
      isTesting.value = true
      testResults.value = []
      completedTests.value = 0
      
      try {
        // Compter le nombre total de tests
        let testCount = 1 // Test de référence
        if (transformations.value.rotation90) testCount++
        if (transformations.value.rotation180) testCount++
        if (transformations.value.rotation270) testCount++
        if (transformations.value.skew5) testCount++
        if (transformations.value.skew10) testCount++
        if (transformations.value.skew15) testCount++
        if (transformations.value.contrastLow) testCount++
        if (transformations.value.contrastHigh) testCount++
        if (transformations.value.contrastInverted) testCount++
        if (transformations.value.brightnessLow) testCount++
        if (transformations.value.brightnessHigh) testCount++
        if (transformations.value.noiseLow) testCount++
        if (transformations.value.noiseHigh) testCount++
        
        totalTests.value = testCount
        
        // Test de référence (sans transformation)
        currentTestName.value = 'Test de référence...'
        console.log('🎯 Test de référence...')
        const referenceResult = await performOCRTest(selectedFile.value, 'Référence (sans transformation)', true)
        testResults.value.push(referenceResult)
        completedTests.value++
        
        // Tests avec transformations
        const transformationTests = []
        
        // Rotations
        if (transformations.value.rotation90) {
          transformationTests.push(createTransformationTest('Rotation 90°', { rotation: 90 }))
        }
        if (transformations.value.rotation180) {
          transformationTests.push(createTransformationTest('Rotation 180°', { rotation: 180 }))
        }
        if (transformations.value.rotation270) {
          transformationTests.push(createTransformationTest('Rotation 270°', { rotation: 270 }))
        }
        
        // Inclinaisons
        if (transformations.value.skew5) {
          transformationTests.push(createTransformationTest('Inclinaison 5°', { skew: 5 }))
        }
        if (transformations.value.skew10) {
          transformationTests.push(createTransformationTest('Inclinaison 10°', { skew: 10 }))
        }
        if (transformations.value.skew15) {
          transformationTests.push(createTransformationTest('Inclinaison 15°', { skew: 15 }))
        }
        
        // Contraste
        if (transformations.value.contrastLow) {
          transformationTests.push(createTransformationTest('Contraste faible', { contrast: 0.5 }))
        }
        if (transformations.value.contrastHigh) {
          transformationTests.push(createTransformationTest('Contraste élevé', { contrast: 2.0 }))
        }
        if (transformations.value.contrastInverted) {
          transformationTests.push(createTransformationTest('Contraste inversé', { invert: true }))
        }
        
        // Luminosité
        if (transformations.value.brightnessLow) {
          transformationTests.push(createTransformationTest('Luminosité faible', { brightness: 0.3 }))
        }
        if (transformations.value.brightnessHigh) {
          transformationTests.push(createTransformationTest('Luminosité élevée', { brightness: 1.7 }))
        }
        
        // Bruit
        if (transformations.value.noiseLow) {
          transformationTests.push(createTransformationTest('Bruit faible', { noise: 0.1 }))
        }
        if (transformations.value.noiseHigh) {
          transformationTests.push(createTransformationTest('Bruit élevé', { noise: 0.3 }))
        }
        
        // Exécuter tous les tests
        for (const test of transformationTests) {
          currentTestName.value = `Test: ${test.name}...`
          console.log(`🔄 Test: ${test.name}...`)
          const transformedFile = await applyTransformation(selectedFile.value, test.transform)
          const result = await performOCRTest(transformedFile, test.name, false, test.transform)
          testResults.value.push(result)
          completedTests.value++
        }
        
        console.log('✅ Tous les tests terminés!')
        
      } catch (error) {
        console.error('❌ Erreur lors des tests OCR:', error)
        alert('Erreur lors des tests OCR. Vérifiez la console pour plus de détails.')
      } finally {
        isTesting.value = false
        currentTestName.value = ''
        completedTests.value = 0
        totalTests.value = 0
      }
    }

    const createTransformationTest = (name, transform) => {
      return { name, transform }
    }

    const applyTransformation = async (file, transform) => {
      try {
        return await imageTransformationService.applyTransformation(file, transform)
      } catch (error) {
        console.error('Erreur lors de la transformation:', error)
        // En cas d'erreur, retourner le fichier original
        return file
      }
    }

    const performOCRTest = async (file, testName, isReference, transform = null) => {
      try {
        // Appel à l'API OCR
        const ocrText = await ocrService.performOCR(file)
        
        // Simuler un score de confiance basé sur la longueur du texte
        // Dans une vraie implémentation, l'API devrait retourner ce score
        const confidence = ocrText && ocrText.length > 0 ? Math.min(95, 60 + (ocrText.length / 100)) : 0
        
        return {
          name: testName,
          isReference,
          text: ocrText || '',
          confidence: confidence,
          textLength: (ocrText || '').length,
          textExpanded: false
        }
      } catch (error) {
        console.error(`Erreur OCR pour ${testName}:`, error)
        return {
          name: testName,
          isReference,
          text: `Erreur lors de l'OCR: ${error.message}`,
          confidence: 0,
          textLength: 0,
          textExpanded: false
        }
      }
    }

    return {
      selectedFile,
      isTesting,
      testResults,
      transformations,
      hasSelectedTransformations,
      averageConfidence,
      bestResult,
      currentTestName,
      completedTests,
      totalTests,
      progressPercentage,
      handleFileSelected,
      clearFile,
      formatFileSize,
      getFileType,
      getConfidenceClass,
      toggleTextExpansion,
      copyToClipboard,
      downloadResult,
      clearResults,
      startOCRTests
    }
  }
}
</script>

<style scoped>
.ocr-tester {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.ocr-tester h2 {
  color: #4d54d1;
  margin-bottom: 10px;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
}

.description {
  text-align: center;
  color: #6c757d;
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.5;
}

/* Section de sélection de fichier */
.file-selection-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}

.file-selection-section h3 {
  color: #4d54d1;
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 600;
}

.file-input-container {
  position: relative;
  margin-bottom: 15px;
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
  gap: 12px;
  padding: 15px 20px;
  border: 2px dashed #4d54d1;
  border-radius: 8px;
  background: #f8f9ff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-input-label:hover {
  background: #e8ecff;
  border-color: #3a3f9e;
}

.file-input-icon {
  font-size: 1.5rem;
}

.file-input-text {
  font-weight: 500;
  color: #4d54d1;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.file-details {
  display: flex;
  gap: 15px;
  align-items: center;
}

.file-name {
  font-weight: 600;
  color: #495057;
}

.file-size, .file-type {
  font-size: 0.9rem;
  color: #6c757d;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
}

/* Configuration des tests */
.test-configuration {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}

.test-configuration h3 {
  color: #4d54d1;
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 600;
}

.transformation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.transformation-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.transformation-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transformation-card.reference {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  border-color: #4d54d1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.card-badge {
  background: #4d54d1;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-content p {
  margin: 0 0 10px 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.file-info-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.file-icon {
  font-size: 1.2rem;
}

.file-name {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
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
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.option-item:hover {
  background-color: white;
}

.option-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #4d54d1;
  cursor: pointer;
}

.option-item span {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

/* Contrôles de test */
.test-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.testing-progress {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #dee2e6;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-text {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.progress-count {
  font-size: 0.8rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
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
  background: linear-gradient(90deg, #4d54d1, #64e4dd);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Section des résultats */
.results-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}

.results-section h3 {
  color: #4d54d1;
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 600;
}

.global-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #dee2e6;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #4d54d1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.result-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-card.reference-result {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  border-color: #4d54d1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-title h4 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.reference-badge {
  background: #4d54d1;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.result-metrics {
  display: flex;
  gap: 15px;
  align-items: center;
}

.confidence-score {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.confidence-score.high {
  background: #d4edda;
  color: #155724;
}

.confidence-score.medium {
  background: #fff3cd;
  color: #856404;
}

.confidence-score.low {
  background: #f8d7da;
  color: #721c24;
}

.text-length {
  font-size: 0.85rem;
  color: #6c757d;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 15px;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  border: 2px solid #dee2e6;
}

.result-icon .icon {
  font-size: 1.2rem;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-type {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.result-name {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 600;
}

.result-text {
  flex: 1;
}

.text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.text-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.text-content {
  background: white;
  border-radius: 4px;
  padding: 12px;
  border: 1px solid #dee2e6;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  max-height: 100px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.text-content.expanded {
  max-height: none;
}

.result-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Message si aucun fichier */
.no-file-message {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}

.message-content h3 {
  color: #6c757d;
  margin-bottom: 10px;
}

.message-content p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .transformation-grid {
    grid-template-columns: 1fr;
  }
  
  .result-content {
    flex-direction: column;
  }
  
  .result-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .result-metrics {
    justify-content: center;
  }
  
  .test-controls {
    align-items: stretch;
  }
  
  .global-stats {
    grid-template-columns: 1fr;
  }
  
  .result-info {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>
