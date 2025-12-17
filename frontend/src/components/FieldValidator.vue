<template>
  <div class="field-validator">
    <!-- Indicateur de validation -->
    <div class="validation-indicator">
      <label class="validation-toggle">
        <input 
          type="checkbox" 
          :checked="isValid" 
          @change="toggleValidation"
          class="validation-checkbox"
        />
        <span class="validation-label">
          {{ isValid === null ? '⏳ Non validé' : isValid === true ? '✅ Valide' : '❌ Invalide' }}
        </span>
      </label>
    </div>

    <!-- Zone de correction si invalide -->
    <div v-if="isValid === false" class="correction-section">
      <div class="correction-header">
        <h5>Valeur attendue :</h5>
      </div>
      <div class="correction-input">
        <input 
          v-model="expectedValue" 
          type="text" 
          placeholder="Saisissez la valeur correcte..."
          class="correction-field"
          @blur="saveValidation"
        />
        <button 
          @click="saveValidation" 
          class="btn btn-primary btn-sm save-btn"
          :disabled="saving"
        >
          {{ saving ? '⏳' : '💾' }}
        </button>
      </div>
    </div>

    <!-- Statut de sauvegarde -->
    <div class="save-status" :class="saveStatus">
      {{ saveStatus === 'success' ? '✅ Sauvegardé' : saveStatus === 'error' ? '❌ Erreur' : '' }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import validationService from '../services/validationService.js'

export default {
  name: 'FieldValidator',
  props: {
    field: {
      type: Object,
      required: true
    },
    metadataId: {
      type: Number,
      required: true
    }
  },
  emits: ['validation-updated'],
  setup(props, { emit }) {
    const isValid = ref(true)
    const expectedValue = ref('')
    const saving = ref(false)
    const saveStatus = ref('')
    const currentValidation = ref(null)

    // Valeur affichée pour le champ
    const displayValue = computed(() => {
      if (props.field.field_values && Array.isArray(props.field.field_values) && props.field.field_values.length > 0) {
        return props.field.field_values.join(', ')
      }
      return props.field.field_value || '-'
    })

    // Charger la validation existante depuis les métadonnées
    const loadValidation = () => {
      try {
        if (props.field.validation) {
          currentValidation.value = props.field.validation
          isValid.value = props.field.validation.isValid // peut être null, true, ou false
          expectedValue.value = props.field.validation.expectedValue || ''
        } else {
          // Si pas de validation, on utilise les valeurs par défaut
          isValid.value = null // non validé par défaut
          expectedValue.value = ''
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la validation:', error)
        // En cas d'erreur, on utilise les valeurs par défaut
        isValid.value = null
        expectedValue.value = ''
      }
    }

    // Basculer la validation (null -> true -> false -> null)
    const toggleValidation = () => {
      if (isValid.value === null) {
        isValid.value = true
      } else if (isValid.value === true) {
        isValid.value = false
      } else {
        isValid.value = null
      }
      
      if (isValid.value === true) {
        expectedValue.value = ''
      }
      saveValidation()
    }

    // Sauvegarder la validation
    const saveValidation = async () => {
      if (saving.value) return
      
      saving.value = true
      saveStatus.value = ''
      
      try {
        await validationService.saveValidation(props.metadataId, {
          isValid: isValid.value,
          expectedValue: isValid.value === true ? null : expectedValue.value
        })
        
        saveStatus.value = 'success'
        emit('validation-updated', {
          metadataId: props.metadataId,
          isValid: isValid.value,
          expectedValue: expectedValue.value
        })
        
        // Effacer le statut après 2 secondes
        setTimeout(() => {
          saveStatus.value = ''
        }, 2000)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        saveStatus.value = 'error'
        
        setTimeout(() => {
          saveStatus.value = ''
        }, 3000)
      } finally {
        saving.value = false
      }
    }

    // Surveiller les changements de validation
    watch(isValid, (newValue) => {
      if (newValue === true) {
        expectedValue.value = ''
      }
    })

    onMounted(() => {
      loadValidation()
    })

    return {
      isValid,
      expectedValue,
      saving,
      saveStatus,
      displayValue,
      toggleValidation,
      saveValidation
    }
  }
}
</script>

<style scoped>
.field-validator {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: #f8f9fa;
  min-width: 0; /* Permet au conteneur de se rétrécir */
}

.validation-indicator {
  display: flex;
  align-items: center;
}

.validation-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.validation-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.validation-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #2e3862;
}

.correction-section {
  border-top: 1px solid #dee2e6;
  padding-top: 6px;
}

.correction-header h5 {
  margin: 0 0 4px 0;
  font-size: 0.8rem;
  color: #2e3862;
  font-weight: 600;
}

.correction-input {
  display: flex;
  gap: 6px;
  align-items: center;
}

.correction-field {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.85rem;
  background: white;
  min-width: 0; /* Permet au champ de se rétrécir */
}

.correction-field:focus {
  outline: none;
  border-color: #ff6136;
  box-shadow: 0 0 0 2px rgba(255, 97, 54, 0.2);
}

.save-btn {
  padding: 6px 8px;
  min-width: 32px;
  flex-shrink: 0; /* Empêche le bouton de se rétrécir */
}

.save-status {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
}

.save-status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  opacity: 1;
  visibility: visible;
}

.save-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  opacity: 1;
  visibility: visible;
}
</style>
