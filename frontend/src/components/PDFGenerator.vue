<template>
  <div class="pdf-generator">
    <h2>📄 Génération de Rapports PDF</h2>
    
    <!-- Section de sélection pour PDF -->
    <div v-if="savedResults.length > 0" class="pdf-selection-section">
      <div class="pdf-selection-header">
        <h3>📄 Sélection pour le rapport PDF</h3>
        <div class="pdf-selection-controls">
          <button @click="selectAllResults" class="btn btn-secondary btn-sm">
            ✅ Tout sélectionner
          </button>
          <button @click="deselectAllResults" class="btn btn-secondary btn-sm">
            ❌ Tout désélectionner
          </button>
        </div>
      </div>
      
      <!-- Filtres par version d'API -->
      <div class="api-version-filters">
        <div class="filter-group">
          <label class="filter-label">Filtrer par version d'API :</label>
          <div class="filter-options">
            <label class="filter-option">
              <input 
                type="radio" 
                v-model="apiVersionFilter" 
                value="all"
                @change="applyFilters"
              >
              <span class="filter-text">Toutes les versions</span>
            </label>
            <label class="filter-option">
              <input 
                type="radio" 
                v-model="apiVersionFilter" 
                value="v1"
                @change="applyFilters"
              >
              <span class="filter-text">API v1 (avant 01/10/2025)</span>
            </label>
            <label class="filter-option">
              <input 
                type="radio" 
                v-model="apiVersionFilter" 
                value="v2"
                @change="applyFilters"
              >
              <span class="filter-text">🚀 API v2 (après 01/10/2025)</span>
            </label>
          </div>
        </div>
        
        <div class="filter-stats">
          <span class="filter-stat">
            Total : {{ savedResults.length }} résultat{{ savedResults.length > 1 ? 's' : '' }}
          </span>
          <span class="filter-stat">
            V1 : {{ v1ResultsCount }} résultat{{ v1ResultsCount > 1 ? 's' : '' }}
          </span>
          <span class="filter-stat">
            V2 : {{ v2ResultsCount }} résultat{{ v2ResultsCount > 1 ? 's' : '' }}
          </span>
        </div>
      </div>
      
      <div class="pdf-selection-list">
        <div 
          v-for="result in filteredResults" 
          :key="result.id" 
          class="pdf-selection-item"
          :class="{ 'v2-result': isV2Result(result) }"
        >
          <label class="pdf-selection-label">
            <input 
              type="checkbox" 
              v-model="selectedForPDF" 
              :value="result.id"
              class="pdf-selection-checkbox"
            />
            <span class="pdf-selection-text">{{ getResultLabel(result) }}</span>
          </label>
        </div>
      </div>
      
      <div class="pdf-generation-section">
        <button 
          @click="generatePDF" 
          class="btn btn-success btn-large"
          title="Générer le rapport de test PDF"
          :disabled="generatingPDF || selectedForPDF.length === 0"
        >
          {{ generatingPDF ? '⏳ Génération en cours...' : `📄 Générer le rapport PDF (${selectedForPDF.length} résultat${selectedForPDF.length > 1 ? 's' : ''})` }}
        </button>
      </div>
    </div>

    <!-- Message si aucun résultat sauvegardé -->
    <div v-else class="no-results">
      <p>Aucun résultat sauvegardé pour le moment.</p>
      <p>Effectuez une extraction et sauvegardez le résultat pour pouvoir générer un rapport PDF.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import apiResultsService from '../services/apiResultsService.js'
import validationService from '../services/validationService.js'
import pdfGeneratorService from '../services/pdfGeneratorService.js'

export default {
  name: 'PDFGenerator',
  setup() {
    const savedResults = ref([])
    const validationStatsCache = ref(new Map()) // Cache pour les statistiques
    const generatingPDF = ref(false)
    const selectedForPDF = ref([]) // Résultats sélectionnés pour le PDF
    const apiVersionFilter = ref('all') // Filtre par version d'API

    const loadSavedResults = async () => {
      try {
        savedResults.value = await apiResultsService.getAllResults()
      } catch (error) {
        console.error('Erreur lors du chargement des résultats:', error)
        savedResults.value = []
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

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('fr-FR')
    }

    // Computed properties pour les filtres
    const v1ResultsCount = computed(() => {
      return savedResults.value.filter(result => !isV2Result(result)).length
    })

    const v2ResultsCount = computed(() => {
      return savedResults.value.filter(result => isV2Result(result)).length
    })

    const filteredResults = computed(() => {
      if (apiVersionFilter.value === 'all') {
        return savedResults.value
      } else if (apiVersionFilter.value === 'v1') {
        return savedResults.value.filter(result => !isV2Result(result))
      } else if (apiVersionFilter.value === 'v2') {
        return savedResults.value.filter(result => isV2Result(result))
      }
      return savedResults.value
    })

    // Appliquer les filtres
    const applyFilters = () => {
      // Désélectionner les résultats qui ne correspondent plus au filtre
      selectedForPDF.value = selectedForPDF.value.filter(id => {
        const result = savedResults.value.find(r => r.id === id)
        return result && filteredResults.value.includes(result)
      })
    }

    // Méthodes pour la sélection PDF
    const selectAllResults = () => {
      selectedForPDF.value = filteredResults.value.map(result => result.id)
    }

    const deselectAllResults = () => {
      selectedForPDF.value = []
    }

    // Générer le PDF du rapport de test
    const generatePDF = async () => {
      if (generatingPDF.value || selectedForPDF.value.length === 0) return
      
      generatingPDF.value = true
      
      try {
        console.log('🔄 Début de la génération du PDF...')
        
        // Filtrer les résultats sélectionnés
        const selectedResults = savedResults.value.filter(result => 
          selectedForPDF.value.includes(result.id)
        )
        
        // Créer les maps pour les métadonnées et statistiques
        const metadataMap = new Map()
        const statsMap = new Map()
        
        // Charger toutes les métadonnées et statistiques pour les résultats sélectionnés
        console.log('📊 Chargement des métadonnées et statistiques...')
        const loadPromises = selectedResults.map(async (result) => {
          try {
            const [metadata, stats] = await Promise.all([
              apiResultsService.getResultMetadata(result.id),
              validationService.getValidationStats(result.id)
            ])
            
            metadataMap.set(result.id, metadata)
            statsMap.set(result.id, stats)
            
            console.log(`✅ Chargé: ${result.fileName}`)
          } catch (error) {
            console.error(`❌ Erreur pour ${result.fileName}:`, error)
            metadataMap.set(result.id, [])
            statsMap.set(result.id, null)
          }
        })
        
        await Promise.all(loadPromises)
        
        console.log('📄 Génération du PDF...')
        
        // Générer le PDF avec les résultats sélectionnés
        const doc = await pdfGeneratorService.generateTestReport(
          selectedResults,
          metadataMap,
          statsMap
        )
        
        // Télécharger le PDF
        const filename = `rapport-test-rib-${new Date().toISOString().split('T')[0]}.pdf`
        pdfGeneratorService.downloadPDF(filename)
        
        console.log('✅ PDF généré avec succès!')
        
      } catch (error) {
        console.error('❌ Erreur lors de la génération du PDF:', error)
        alert('Erreur lors de la génération du PDF. Vérifiez la console pour plus de détails.')
      } finally {
        generatingPDF.value = false
      }
    }

    onMounted(async () => {
      await loadSavedResults()
      await loadAllValidationStats() // Charger les statistiques pour tous les résultats
      // Sélectionner tous les résultats par défaut pour le PDF
      selectedForPDF.value = savedResults.value.map(result => result.id)
    })

    return {
      savedResults,
      selectedForPDF,
      generatingPDF,
      apiVersionFilter,
      v1ResultsCount,
      v2ResultsCount,
      filteredResults,
      getResultLabel,
      isV2Result,
      selectAllResults,
      deselectAllResults,
      applyFilters,
      generatePDF
    }
  }
}
</script>

<style scoped>
.pdf-generator {
  padding: 20px;
}

.pdf-generator h2 {
  color: #2e3862;
  margin-bottom: 30px;
  text-align: center;
}

/* Section de sélection pour PDF */
.pdf-selection-section {
  margin: 20px 0 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.pdf-selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.pdf-selection-header h3 {
  margin: 0;
  color: #4d54d1;
  font-size: 1.2rem;
  font-weight: 600;
}

.pdf-selection-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pdf-selection-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.pdf-selection-item {
  background: white;
  border-radius: 6px;
  padding: 10px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.pdf-selection-item:hover {
  border-color: #4d54d1;
  box-shadow: 0 2px 8px rgba(77, 84, 209, 0.1);
}

.pdf-selection-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
}

.pdf-selection-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #4d54d1;
  cursor: pointer;
}

.pdf-selection-text {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

/* Section de génération PDF */
.pdf-generation-section {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.no-results p {
  margin: 10px 0;
}

@media (max-width: 768px) {
  .pdf-selection-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .pdf-selection-controls {
    justify-content: center;
  }

  .pdf-selection-list {
    grid-template-columns: 1fr;
  }

  .pdf-selection-item {
    padding: 12px;
  }
}

/* Styles pour les filtres par version d'API */
.api-version-filters {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.filter-group {
  margin-bottom: 15px;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  font-size: 1rem;
}

.filter-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.filter-option:hover {
  background-color: #f8f9fa;
}

.filter-option input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: #4d54d1;
  cursor: pointer;
}

.filter-text {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.filter-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.filter-stat {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

/* Styles pour les résultats v2 */
.pdf-selection-item.v2-result {
  border-left: 4px solid #ff6b6b;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.pdf-selection-item.v2-result:hover {
  border-color: #ff6b6b;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
}

/* Responsive pour les filtres */
@media (max-width: 768px) {
  .filter-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-stat {
    text-align: center;
  }
}
</style>
