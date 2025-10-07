<template>
  <div class="results-comparison">
    <h2>Comparaison de résultats</h2>
    
    <!-- Sélection des deux résultats à comparer -->
    <div class="selection-section">
      <div class="result-selector">
        <label for="result1-select" class="select-label">Résultat 1 :</label>
        <select 
          id="result1-select"
          v-model="selectedResult1Id" 
          @change="onResult1Selected"
          class="select"
        >
          <option value="">-- Choisir le premier résultat --</option>
          <option 
            v-for="result in savedResults" 
            :key="result.id" 
            :value="result.id"
          >
            {{ getResultLabel(result) }}
          </option>
        </select>
      </div>
      
      <div class="result-selector">
        <label for="result2-select" class="select-label">Résultat 2 :</label>
        <select 
          id="result2-select"
          v-model="selectedResult2Id" 
          @change="onResult2Selected"
          class="select"
        >
          <option value="">-- Choisir le deuxième résultat --</option>
          <option 
            v-for="result in savedResults" 
            :key="result.id" 
            :value="result.id"
          >
            {{ getResultLabel(result) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Affichage de la comparaison -->
    <div v-if="selectedResult1 && selectedResult2 && metadata1 && metadata2" class="comparison-display">
      <!-- En-têtes des résultats -->
      <div class="comparison-headers">
        <div class="result-header">
          <div class="result-title-section">
            <h3>{{ selectedResult1.fileName }}</h3>
            <div v-if="isV2Result(selectedResult1)" class="api-version-badge v2">
              🚀 API v2
            </div>
          </div>
          <div class="result-info">
            <span class="file-size">Taille : {{ formatFileSize(selectedResult1.fileSize) }}</span>
            <span class="saved-date">Sauvegardé le : {{ formatDate(selectedResult1.savedAt) }}</span>
          </div>
        </div>
        
        <div class="vs-separator">
          <span class="vs-text">VS</span>
        </div>
        
        <div class="result-header">
          <div class="result-title-section">
            <h3>{{ selectedResult2.fileName }}</h3>
            <div v-if="isV2Result(selectedResult2)" class="api-version-badge v2">
              🚀 API v2
            </div>
          </div>
          <div class="result-info">
            <span class="file-size">Taille : {{ formatFileSize(selectedResult2.fileSize) }}</span>
            <span class="saved-date">Sauvegardé le : {{ formatDate(selectedResult2.savedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Statistiques de comparaison -->
      <div v-if="comparisonStats" class="comparison-stats">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">{{ comparisonStats.totalFields }}</span>
            <span class="stat-label">Champs total</span>
          </div>
          <div class="stat-item">
            <span class="stat-number identical">{{ comparisonStats.identical }}</span>
            <span class="stat-label">Identiques</span>
          </div>
          <div class="stat-item">
            <span class="stat-number different">{{ comparisonStats.different }}</span>
            <span class="stat-label">Différents</span>
          </div>
          <div class="stat-item">
            <span class="stat-number missing">{{ comparisonStats.missing }}</span>
            <span class="stat-label">Manquants</span>
          </div>
        </div>
      </div>

      <!-- Tableau de comparaison -->
      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Nom du champ</th>
              <th class="result1-column">Résultat 1</th>
              <th class="comparison-column">Comparaison</th>
              <th class="result2-column">Résultat 2</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fieldComparison in fieldComparisons" :key="fieldComparison.fieldName">
              <td class="field-name">{{ fieldComparison.fieldName }}</td>
              
              <!-- Valeur du résultat 1 -->
              <td class="result1-column">
                <div class="field-value" :class="getValueClass(fieldComparison.result1)">
                  <span v-if="fieldComparison.result1" class="value">
                    {{ getDisplayValue(fieldComparison.result1) }}
                  </span>
                  <span v-else class="no-value">-</span>
                </div>
              </td>
              
              <!-- Indicateur de comparaison -->
              <td class="comparison-column">
                <div class="comparison-indicator" :class="fieldComparison.status">
                  <span v-if="fieldComparison.status === 'identical'" class="indicator-icon">✅</span>
                  <span v-else-if="fieldComparison.status === 'different'" class="indicator-icon">❌</span>
                  <span v-else-if="fieldComparison.status === 'missing1'" class="indicator-icon">⚠️</span>
                  <span v-else-if="fieldComparison.status === 'missing2'" class="indicator-icon">⚠️</span>
                  <span v-else class="indicator-icon">❓</span>
                </div>
              </td>
              
              <!-- Valeur du résultat 2 -->
              <td class="result2-column">
                <div class="field-value" :class="getValueClass(fieldComparison.result2)">
                  <span v-if="fieldComparison.result2" class="value">
                    {{ getDisplayValue(fieldComparison.result2) }}
                  </span>
                  <span v-else class="no-value">-</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Options d'affichage -->
      <div class="comparison-options">
        <div class="filter-options">
          <label class="filter-label">
            <input 
              type="checkbox" 
              v-model="showOnlyDifferences"
              @change="updateFieldComparisons"
            >
            Afficher seulement les différences
          </label>
        </div>
        
        <div class="view-options">
          <button @click="toggleJson1" class="btn btn-info">
            {{ showJson1 ? 'Masquer' : 'Afficher' }} JSON 1
          </button>
          <button @click="toggleJson2" class="btn btn-info">
            {{ showJson2 ? 'Masquer' : 'Afficher' }} JSON 2
          </button>
        </div>
      </div>

      <!-- JSON des résultats (collapsible) -->
      <div class="json-container">
        <pre v-if="showJson1" class="text-area text-area-code">
          <strong>Résultat 1 ({{ selectedResult1.fileName }}):</strong>
          {{ JSON.stringify(selectedResult1.data, null, 2) }}
        </pre>
        <pre v-if="showJson2" class="text-area text-area-code">
          <strong>Résultat 2 ({{ selectedResult2.fileName }}):</strong>
          {{ JSON.stringify(selectedResult2.data, null, 2) }}
        </pre>
      </div>
    </div>

    <!-- Messages d'état -->
    <div v-else-if="savedResults.length === 0" class="no-results">
      <p>Aucun résultat sauvegardé pour le moment.</p>
      <p>Effectuez des extractions et sauvegardez les résultats pour pouvoir les comparer.</p>
    </div>

    <div v-else-if="!selectedResult1 || !selectedResult2" class="no-selection">
      <p>Sélectionnez deux résultats dans les listes ci-dessus pour les comparer.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import apiResultsService from '../services/apiResultsService.js'
import validationService from '../services/validationService.js'

export default {
  name: 'ResultsComparison',
  setup() {
    const savedResults = ref([])
    const selectedResult1Id = ref('')
    const selectedResult2Id = ref('')
    const metadata1 = ref([])
    const metadata2 = ref([])
    const showJson1 = ref(false)
    const showJson2 = ref(false)
    const showOnlyDifferences = ref(false)
    const validationStatsCache = ref(new Map())

    const selectedResult1 = computed(() => {
      return savedResults.value.find(result => result.id === selectedResult1Id.value)
    })

    const selectedResult2 = computed(() => {
      return savedResults.value.find(result => result.id === selectedResult2Id.value)
    })

    const fieldComparisons = ref([])
    const comparisonStats = ref(null)

    const loadSavedResults = async () => {
      try {
        savedResults.value = await apiResultsService.getAllResults()
      } catch (error) {
        console.error('Erreur lors du chargement des résultats:', error)
        savedResults.value = []
      }
    }

    const loadMetadata = async (resultId) => {
      try {
        return await apiResultsService.getResultMetadata(resultId)
      } catch (error) {
        console.error('Erreur lors du chargement des métadonnées:', error)
        return []
      }
    }

    const loadValidationStats = async (resultId) => {
      try {
        const stats = await validationService.getValidationStats(resultId)
        validationStatsCache.value.set(resultId, stats)
        return stats
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        return null
      }
    }

    const onResult1Selected = async () => {
      if (selectedResult1Id.value) {
        metadata1.value = await loadMetadata(selectedResult1Id.value)
        await loadValidationStats(selectedResult1Id.value)
        updateFieldComparisons()
      } else {
        metadata1.value = []
        updateFieldComparisons()
      }
    }

    const onResult2Selected = async () => {
      if (selectedResult2Id.value) {
        metadata2.value = await loadMetadata(selectedResult2Id.value)
        await loadValidationStats(selectedResult2Id.value)
        updateFieldComparisons()
      } else {
        metadata2.value = []
        updateFieldComparisons()
      }
    }

    const updateFieldComparisons = () => {
      if (!metadata1.value.length && !metadata2.value.length) {
        fieldComparisons.value = []
        comparisonStats.value = null
        return
      }

      // Créer un map des champs pour faciliter la comparaison
      const fields1Map = new Map()
      const fields2Map = new Map()

      metadata1.value.forEach(field => {
        fields1Map.set(field.fieldName, field)
      })

      metadata2.value.forEach(field => {
        fields2Map.set(field.fieldName, field)
      })

      // Obtenir tous les noms de champs uniques
      const allFieldNames = new Set([
        ...fields1Map.keys(),
        ...fields2Map.keys()
      ])

      const comparisons = []
      let identical = 0
      let different = 0
      let missing = 0

      allFieldNames.forEach(fieldName => {
        const field1 = fields1Map.get(fieldName)
        const field2 = fields2Map.get(fieldName)

        let status = 'unknown'
        if (field1 && field2) {
          const value1 = getFieldValue(field1)
          const value2 = getFieldValue(field2)
          
          if (JSON.stringify(value1) === JSON.stringify(value2)) {
            status = 'identical'
            identical++
          } else {
            status = 'different'
            different++
          }
        } else if (field1 && !field2) {
          status = 'missing2'
          missing++
        } else if (!field1 && field2) {
          status = 'missing1'
          missing++
        }

        comparisons.push({
          fieldName,
          result1: field1,
          result2: field2,
          status
        })
      })

      // Filtrer si on ne veut que les différences
      if (showOnlyDifferences.value) {
        fieldComparisons.value = comparisons.filter(comp => 
          comp.status === 'different' || comp.status === 'missing1' || comp.status === 'missing2'
        )
      } else {
        fieldComparisons.value = comparisons
      }

      comparisonStats.value = {
        totalFields: allFieldNames.size,
        identical,
        different,
        missing
      }
    }

    const getFieldValue = (field) => {
      if (field.fieldValues && Array.isArray(field.fieldValues) && field.fieldValues.length > 0) {
        return field.fieldValues
      }
      if (field.fieldValue) {
        return field.fieldValue
      }
      return null
    }

    const getDisplayValue = (field) => {
      const value = getFieldValue(field)
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      return value
    }

    const getValueClass = (field) => {
      if (!field) return 'no-value'
      const value = getFieldValue(field)
      if (!value) return 'no-value'
      return 'has-value'
    }

    // Vérifier si un résultat est de la v2 de l'API (après le 01/10/2025)
    const isV2Result = (result) => {
      const v2Date = new Date('2025-10-01')
      const resultDate = new Date(result.savedAt)
      return resultDate >= v2Date
    }

    const getResultLabel = (result) => {
      const stats = validationStatsCache.value.get(result.id)
      const isV2 = isV2Result(result)
      const baseLabel = `${result.fileName} (${formatDate(result.savedAt)})`
      
      let prefix = ''
      if (isV2) {
        prefix = '🚀 ' // Badge pour v2
      }
      
      if (!stats) {
        return `${prefix}${baseLabel}`
      }
      
      const isFullyValidated = stats.unvalidated === 0
      
      if (isFullyValidated) {
        return `${prefix}✅ ${baseLabel}`
      } else {
        return `${prefix}⏳ ${baseLabel}`
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('fr-FR')
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const toggleJson1 = () => {
      showJson1.value = !showJson1.value
    }

    const toggleJson2 = () => {
      showJson2.value = !showJson2.value
    }

    // Watcher pour mettre à jour les comparaisons quand le filtre change
    watch(showOnlyDifferences, () => {
      updateFieldComparisons()
    })

    onMounted(async () => {
      await loadSavedResults()
    })

    return {
      savedResults,
      selectedResult1Id,
      selectedResult2Id,
      selectedResult1,
      selectedResult2,
      metadata1,
      metadata2,
      fieldComparisons,
      comparisonStats,
      showJson1,
      showJson2,
      showOnlyDifferences,
      onResult1Selected,
      onResult2Selected,
      getDisplayValue,
      getValueClass,
      getResultLabel,
      formatDate,
      formatFileSize,
      toggleJson1,
      toggleJson2,
      updateFieldComparisons,
      isV2Result
    }
  }
}
</script>

<style scoped>
.results-comparison {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.results-comparison h2 {
  color: #4d54d1;
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
}

.selection-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  width: 100%;
  box-sizing: border-box;
}

.result-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.select-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.select {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.select:focus {
  outline: none;
  border-color: #4d54d1;
  box-shadow: 0 0 0 2px rgba(77, 84, 209, 0.1);
}

.comparison-display {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.comparison-headers {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.result-header h3 {
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: #d6d6d6;
}

.vs-separator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-text {
  background: linear-gradient(135deg, #64e4dd, #4d54d1);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(77, 84, 209, 0.3);
}

.comparison-stats {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-number.identical {
  color: #28a745;
}

.stat-number.different {
  color: #dc3545;
}

.stat-number.missing {
  color: #ffc107;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.comparison-table-container {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.comparison-table th {
  background: #4d54d1;
  color: white;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  border: 1px solid #3a3f9e;
}

.comparison-table td {
  padding: 12px 8px;
  border: 1px solid #dee2e6;
  vertical-align: top;
}

.field-name {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  width: 200px;
}

.result1-column {
  background: #e3f2fd;
  width: 25%;
}

.result2-column {
  background: #f3e5f5;
  width: 25%;
}

.comparison-column {
  background: #fff3e0;
  text-align: center;
  width: 80px;
}

.field-value {
  word-break: break-word;
}

.field-value.has-value {
  color: #495057;
}

.field-value.no-value {
  color: #6c757d;
  font-style: italic;
}

.comparison-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.indicator-icon {
  font-size: 1.2rem;
}

.comparison-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.filter-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
}

.view-options {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.json-container {
  padding: 20px;
  background: #f8f9fa;
}

.text-area {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 15px;
}

.no-results, .no-selection {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.no-results p, .no-selection p {
  margin: 10px 0;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .selection-section {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
  }
  
  .comparison-headers {
    grid-template-columns: 1fr;
    gap: 15px;
    text-align: center;
  }
  
  .vs-separator {
    order: -1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .comparison-options {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .view-options {
    justify-content: center;
  }
  
  .comparison-table {
    font-size: 0.8rem;
  }
  
  .comparison-table th,
  .comparison-table td {
    padding: 8px 4px;
  }
}

/* Styles pour la section de titre et le badge API */
.result-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.api-version-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.api-version-badge.v2 {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 2px 8px rgba(238, 90, 36, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(238, 90, 36, 0.3);
  }
  50% {
    box-shadow: 0 2px 12px rgba(238, 90, 36, 0.5);
  }
  100% {
    box-shadow: 0 2px 8px rgba(238, 90, 36, 0.3);
  }
}

/* Responsive pour le badge dans la comparaison */
@media (max-width: 768px) {
  .result-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .api-version-badge {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}
</style>
