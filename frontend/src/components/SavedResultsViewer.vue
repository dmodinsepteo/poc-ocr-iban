<template>
  <div class="saved-results-viewer">
    <h2>Consultation et validation des résultats</h2>
    
    <!-- Sélection du résultat -->
    <div class="selection-section">
      <label for="result-select" class="select-label">Sélectionner un résultat :</label>
      <select 
        id="result-select"
        v-model="selectedResultId" 
        @change="onResultSelected"
        class="select"
      >
        <option value="">-- Choisir un résultat --</option>
        <option 
          v-for="result in savedResults" 
          :key="result.id" 
          :value="result.id"
        >
          {{ result.fileName }} ({{ formatDate(result.savedAt) }})
        </option>
      </select>
      
      <button 
        v-if="selectedResult" 
        @click="deleteResult" 
        class="btn btn-danger"
        title="Supprimer ce résultat"
      >
        🗑️ Supprimer
      </button>
    </div>

    <!-- Statistiques de validation -->
    <div v-if="validationStats" class="validation-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{{ validationStats.total }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-number valid">{{ validationStats.valid }}</span>
          <span class="stat-label">Validés</span>
        </div>
        <div class="stat-item">
          <span class="stat-number invalid">{{ validationStats.invalid }}</span>
          <span class="stat-label">Invalides</span>
        </div>
        <div class="stat-item">
          <span class="stat-number unvalidated">{{ validationStats.unvalidated }}</span>
          <span class="stat-label">Non validés</span>
        </div>
      </div>
    </div>

    <!-- Affichage du résultat sélectionné -->
    <div v-if="selectedResult && metadata" class="result-display">
      <div class="result-header">
        <h3>Résultat : {{ selectedResult.fileName }}</h3>
        <div class="result-info">
          <span class="file-size">Taille : {{ formatFileSize(selectedResult.fileSize) }}</span>
          <span class="saved-date">Sauvegardé le : {{ formatDate(selectedResult.savedAt) }}</span>
        </div>
      </div>

      <!-- Tableau des données avec validation -->
      <div class="table-container">
        <table class="table table-orange">
          <thead>
            <tr>
              <th>Nom du champ</th>
              <th>Type</th>
              <th>Valeur</th>
              <th>Validation</th>
              <th>Texte d'extraction</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in metadata" :key="field.id">
              <td>{{ field.fieldName }}</td>
              <td>{{ field.fieldType }}</td>
              <td>
                <div v-if="getDisplayValue(field)" class="value-display">
                  <span v-if="isMultipleValues(field)" class="multiple-values">
                    <span class="values-label">Valeurs multiples :</span>
                    <ul class="values-list">
                      <li v-for="(value, index) in getDisplayValue(field)" :key="index">
                        {{ value }}
                      </li>
                    </ul>
                  </span>
                  <span v-else class="single-value">
                    {{ getDisplayValue(field) }}
                  </span>
                </div>
                <span v-else class="no-value">-</span>
              </td>
              <td>
                <FieldValidator 
                  :field="field" 
                  :metadata-id="field.id"
                  @validation-updated="onValidationUpdated"
                />
              </td>
              <td>{{ field.fieldTextExtraction || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- JSON complet et Résultat OCR (collapsible) -->
      <div class="json-container">
        <div class="buttons-row">
          <button @click="toggleJson" class="btn btn-info">
            {{ showJson ? 'Masquer' : 'Afficher' }} le JSON complet
          </button>
          <button v-if="selectedResult.ocrText" @click="toggleOCR" class="btn btn-primary">
            {{ showOCR ? 'Masquer' : 'Afficher' }} le résultat OCR
          </button>
        </div>
        <pre v-if="showJson" class="text-area text-area-code">{{ JSON.stringify(selectedResult.data, null, 2) }}</pre>
        <pre v-if="showOCR && selectedResult.ocrText" class="text-area text-area-ocr">{{ selectedResult.ocrText }}</pre>
      </div>
    </div>

    <!-- Message si aucun résultat sauvegardé -->
    <div v-else-if="savedResults.length === 0" class="no-results">
      <p>Aucun résultat sauvegardé pour le moment.</p>
      <p>Effectuez une extraction et sauvegardez le résultat pour le voir apparaître ici.</p>
    </div>

    <!-- Message si aucun résultat sélectionné -->
    <div v-else class="no-selection">
      <p>Sélectionnez un résultat dans la liste ci-dessus pour l'afficher.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import apiResultsService from '../services/apiResultsService.js'
import validationService from '../services/validationService.js'
import FieldValidator from './FieldValidator.vue'

export default {
  name: 'SavedResultsViewer',
  components: {
    FieldValidator
  },
  setup() {
    const savedResults = ref([])
    const selectedResultId = ref('')
    const showJson = ref(false)
    const showOCR = ref(false)
    const metadata = ref([])
    const validationStats = ref(null)

    const selectedResult = computed(() => {
      return savedResults.value.find(result => result.id === selectedResultId.value)
    })

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
        metadata.value = await apiResultsService.getResultMetadata(resultId)
      } catch (error) {
        console.error('Erreur lors du chargement des métadonnées:', error)
        metadata.value = []
      }
    }

    const loadValidationStats = async (resultId) => {
      try {
        validationStats.value = await validationService.getValidationStats(resultId)
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        validationStats.value = null
      }
    }

    const onResultSelected = async () => {
      showJson.value = false
      showOCR.value = false
      
      if (selectedResultId.value) {
        await loadMetadata(selectedResultId.value)
        await loadValidationStats(selectedResultId.value)
      } else {
        metadata.value = []
        validationStats.value = null
      }
    }

    const onValidationUpdated = async () => {
      // Recharger les statistiques après une validation
      if (selectedResultId.value) {
        await loadValidationStats(selectedResultId.value)
      }
    }

    const deleteResult = async () => {
      if (!selectedResult.value) return
      
      if (confirm(`Êtes-vous sûr de vouloir supprimer le résultat "${selectedResult.value.fileName}" ?`)) {
        try {
          await apiResultsService.deleteResult(selectedResultId.value)
          await loadSavedResults() // Recharger la liste
          selectedResultId.value = ''
          metadata.value = []
          validationStats.value = null
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          alert('Erreur lors de la suppression du résultat')
        }
      }
    }

    const toggleJson = () => {
      showJson.value = !showJson.value
    }

    const toggleOCR = () => {
      showOCR.value = !showOCR.value
    }

    const getDisplayValue = (field) => {
      if (field.fieldValues && Array.isArray(field.fieldValues) && field.fieldValues.length > 0) {
        return field.fieldValues
      }
      if (field.fieldValue) {
        return field.fieldValue
      }
      return null
    }

    const isMultipleValues = (field) => {
      return field.fieldValues && Array.isArray(field.fieldValues) && field.fieldValues.length > 0
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

    onMounted(async () => {
      await loadSavedResults()
    })

    return {
      savedResults,
      selectedResultId,
      selectedResult,
      showJson,
      showOCR,
      metadata,
      validationStats,
      onResultSelected,
      onValidationUpdated,
      deleteResult,
      toggleJson,
      toggleOCR,
      getDisplayValue,
      isMultipleValues,
      formatDate,
      formatFileSize
    }
  }
}
</script>

 
 