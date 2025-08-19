<template>
  <div class="auth-manager">
    <!-- Section gauche : Statut et actions -->
    <div class="auth-left">
      <div class="auth-status">
        <div class="status-indicator">
          <span class="status-dot" :class="{ 'valid': isTokenValid, 'invalid': !isTokenValid }"></span>
          <span class="status-text">
            {{ isTokenValid ? 'Token valide' : 'Token invalide ou expiré' }}
          </span>
        </div>
        <p v-if="tokenExpiry" class="token-expiry">
          Expire le: {{ tokenExpiry }}
        </p>
      </div>
      
      <div class="auth-actions">
        <button @click="generateToken" :disabled="isGenerating" class="btn btn-primary">
          <span v-if="!isGenerating">🔑 Générer</span>
          <span v-else>⏳...</span>
        </button>
        <button @click="clearToken" class="btn btn-secondary">
          🗑️ Effacer
        </button>
      </div>
    </div>

    <!-- Section droite : Token généré -->
    <div v-if="currentToken" class="auth-right">
      <div class="token-display">
        <div class="token-header">
          <span class="token-label">Token :</span>
          <button @click="copyToken" class="btn-copy" :title="copyStatus">
            {{ copyStatus === 'Copié !' ? '✅' : '📋' }}
          </button>
        </div>
        <div class="token-container">
          <code class="token-text">{{ currentToken }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import authService from '../services/authService.js'

export default {
  name: 'AuthManager',
  emits: ['token-updated'],
  setup(props, { emit }) {
    const isGenerating = ref(false)
    const tokenExpiry = ref(null)
    const copyStatus = ref('Copier')

    const isTokenValid = computed(() => authService.token.value !== null && authService.tokenExpiry.value && Date.now() < authService.tokenExpiry.value)
    
    const currentToken = computed(() => authService.token.value)

    const generateToken = async () => {
      isGenerating.value = true
      try {
        await authService.generateToken()
        tokenExpiry.value = authService.getTokenExpiryTime()
        emit('token-updated')
      } catch (error) {
        console.error('Erreur lors de la génération du token:', error)
      } finally {
        isGenerating.value = false
      }
    }

    const clearToken = () => {
      authService.clearToken()
      tokenExpiry.value = null
      emit('token-updated')
    }

    const copyToken = async () => {
      try {
        await navigator.clipboard.writeText(currentToken.value)
        copyStatus.value = 'Copié !'
        setTimeout(() => {
          copyStatus.value = 'Copier'
        }, 2000)
      } catch (error) {
        console.error('Erreur lors de la copie:', error)
        copyStatus.value = 'Erreur'
        setTimeout(() => {
          copyStatus.value = 'Copier'
        }, 2000)
      }
    }

    onMounted(() => {
      tokenExpiry.value = authService.getTokenExpiryTime()
    })

    return {
      isGenerating,
      tokenExpiry,
      isTokenValid,
      currentToken,
      copyStatus,
      generateToken,
      clearToken,
      copyToken
    }
  }
}
</script>

 