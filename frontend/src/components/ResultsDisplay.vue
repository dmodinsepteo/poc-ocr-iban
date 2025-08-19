<template>
  <div v-if="extractedData" class="results-display">
    <h2>Résultats de l'extraction</h2>
    
    <!-- Tableau récapitulatif -->
    <div class="table-container">
      <h3>Données extraites</h3>
      <table class="table table-blue">
        <thead>
          <tr>
            <th>Nom du champ</th>
            <th>Type</th>
            <th>Valeur</th>
            <th>Texte d'extraction</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in extractedData" :key="field.field_name">
            <td>{{ field.field_name }}</td>
            <td>{{ field.field_type }}</td>
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
            <td>{{ field.field_text_extraction || '-' }}</td>
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
        <button @click="toggleOCR" class="btn btn-primary">
          {{ showOCR ? 'Masquer' : 'Afficher' }} le résultat OCR
        </button>
      </div>
      <pre v-if="showJson" class="text-area text-area-code">{{ JSON.stringify(extractedData, null, 2) }}</pre>
      <pre v-if="showOCR" class="text-area text-area-ocr">{{ ocrText }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, defineProps } from 'vue'

export default {
  name: 'ResultsDisplay',
  props: {
    extractedData: {
      type: Array,
      default: null
    },
    ocrText: {
      type: String,
      default: ''
    }
  },
  setup() {
    const showJson = ref(false)
    const showOCR = ref(false)

    const toggleJson = () => {
      showJson.value = !showJson.value
    }

    const toggleOCR = () => {
      showOCR.value = !showOCR.value
    }

    const getDisplayValue = (field) => {
      // Priorité aux valeurs multiples si elles existent
      if (field.field_values && Array.isArray(field.field_values) && field.field_values.length > 0) {
        return field.field_values
      }
      // Sinon utiliser la valeur simple
      if (field.field_value) {
        return field.field_value
      }
      return null
    }

    const isMultipleValues = (field) => {
      return field.field_values && Array.isArray(field.field_values) && field.field_values.length > 0
    }

    return {
      showJson,
      showOCR,
      toggleJson,
      toggleOCR,
      getDisplayValue,
      isMultipleValues
    }
  }
}
</script>

 