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
           {{ getResultLabel(result) }}
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
        <div class="result-title-section">
          <h3>Résultat : {{ selectedResult.fileName }}</h3>
          <div v-if="isV2Result(selectedResult)" class="api-version-badge v2">
            🚀 API v2
          </div>
        </div>
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
              <!-- <th>Type</th> -->
              <th>Valeur</th>
              <th>Validation</th>
              <th>Texte d'extraction</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in metadata" :key="field.id">
              <td>{{ field.fieldName }}</td>
              <!-- <td>{{ field.fieldType }}</td> -->
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
     const validationStatsCache = ref(new Map()) // Cache pour les statistiques

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
         const stats = await validationService.getValidationStats(resultId)
         validationStats.value = stats
         // Mettre en cache les statistiques
         validationStatsCache.value.set(resultId, stats)
       } catch (error) {
         console.error('Erreur lors du chargement des statistiques:', error)
         validationStats.value = null
       }
     }

     // Charger les statistiques pour tous les résultats
     const loadAllValidationStats = async () => {
       try {
         const statsPromises = savedResults.value.map(async (result) => {
           try {
             const stats = await validationService.getValidationStats(result.id)
             validationStatsCache.value.set(result.id, stats)
             return { id: result.id, stats }
           } catch (error) {
             console.error(`Erreur lors du chargement des stats pour le résultat ${result.id}:`, error)
             return { id: result.id, stats: null }
           }
         })
         
         await Promise.all(statsPromises)
       } catch (error) {
         console.error('Erreur lors du chargement des statistiques globales:', error)
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
         // Forcer la mise à jour de l'affichage de la combobox
         // en déclenchant une réactivité
         savedResults.value = [...savedResults.value]
       }
     }

     // Vérifier si un résultat est de la v2 de l'API (après le 01/10/2025)
     const isV2Result = (result) => {
       const v2Date = new Date('2025-10-01')
       const resultDate = new Date(result.savedAt)
       return resultDate >= v2Date
     }

     // Générer le label pour un résultat avec case à coche
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
       
       // Vérifier si tous les champs sont validés (validés ou invalides, mais pas non validés)
       const isFullyValidated = stats.unvalidated === 0
       
       if (isFullyValidated) {
         return `${prefix}✅ ${baseLabel}`
       } else {
         return `${prefix}⏳ ${baseLabel}`
       }
     }

    const deleteResult = async () => {
      if (!selectedResult.value) return
      
      if (confirm(`Êtes-vous sûr de vouloir supprimer le résultat "${selectedResult.value.fileName}" ?`)) {
                 try {
           await apiResultsService.deleteResult(selectedResultId.value)
           await loadSavedResults() // Recharger la liste
           await loadAllValidationStats() // Recharger les statistiques
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
       await loadAllValidationStats() // Charger les statistiques pour tous les résultats
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
      formatFileSize,
      getResultLabel,
      isV2Result
    }
  }
  }
</script>

<style scoped>
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

/* Responsive pour le badge */
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
 