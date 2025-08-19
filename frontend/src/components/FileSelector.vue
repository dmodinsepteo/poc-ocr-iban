<template>
  <div class="file-selector">
    <div class="file-input-container">
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.tiff"
        @change="handleFileSelect"
        class="file-input"
        style="display: none"
      />
      <button @click="selectFile" class="btn btn-gradient btn-lg" :disabled="disabled">
        <span v-if="!isProcessing">📁 Sélectionner un fichier RIB</span>
        <span v-else>⏳ Traitement en cours...</span>
      </button>
      <p v-if="selectedFile" class="file-info">
        Fichier sélectionné: {{ selectedFile.name }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, defineEmits, defineProps } from 'vue'

export default {
  name: 'FileSelector',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['file-selected'],
  setup(props, { emit }) {
    const fileInput = ref(null)
    const selectedFile = ref(null)

    const selectFile = () => {
      fileInput.value.click()
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (!file) return

      selectedFile.value = file
      emit('file-selected', file)
    }

    return {
      fileInput,
      selectedFile,
      selectFile,
      handleFileSelect
    }
  }
}
</script>

 