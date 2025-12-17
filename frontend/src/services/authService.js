import axios from 'axios'
import { ref } from 'vue'

class AuthService {
  constructor() {
    this.authUrl = '/auth-api' // Utilise le proxy local
    this.credentials = {
      softlaw_client_id: import.meta.env.VITE_SOFTLAW_CLIENT_ID || '',
      external_user_id: import.meta.env.VITE_EXTERNAL_USER_ID || '1234',
      client_id: import.meta.env.VITE_CLIENT_ID || '',
      client_secret: import.meta.env.VITE_CLIENT_SECRET || '',
      pop_uri: import.meta.env.VITE_POP_URI || 'https://notaryllm-dev.softlaw.ai'
    }
    // Utiliser des refs Vue pour la réactivité
    this.token = ref(null)
    this.tokenExpiry = ref(null)
    
    // Initialiser depuis localStorage si disponible
    const storedToken = localStorage.getItem('auth_token')
    const storedExpiry = localStorage.getItem('token_expiry')
    
    if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
      this.token.value = storedToken
      this.tokenExpiry.value = parseInt(storedExpiry)
    }
  }

  async generateToken() {
    try {
      const formData = new FormData()
      formData.append('softlaw_client_id', this.credentials.softlaw_client_id)
      formData.append('external_user_id', this.credentials.external_user_id)
      formData.append('client_id', this.credentials.client_id)
      formData.append('client_secret', this.credentials.client_secret)
      formData.append('pop_uri', this.credentials.pop_uri)

      const response = await axios.post(`${this.authUrl}/token`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Extraire le token depuis la propriété access_token
      this.token.value = response.data.access_token
      
      // Utiliser la date d'expiration fournie par l'API (en UTC)
      if (response.data.expiration_datetime) {
        // S'assurer que la date UTC est correctement parsée
        const expiryDate = new Date(response.data.expiration_datetime + 'Z')
        this.tokenExpiry.value = expiryDate.getTime()
      } else {
        // Fallback: Token expire après 1 heure si pas de date fournie
        this.tokenExpiry.value = Date.now() + 3600000
      }
      
      // Stocker le token dans localStorage
      localStorage.setItem('auth_token', this.token.value)
      localStorage.setItem('token_expiry', this.tokenExpiry.value.toString())

      return this.token.value
    } catch (error) {
      throw new Error(`Erreur lors de la génération du token: ${error.response?.data?.message || error.message}`)
    }
  }

  getToken() {
    // Vérifier si on a un token valide en cache
    if (this.token.value && this.tokenExpiry.value && Date.now() < this.tokenExpiry.value) {
      return this.token.value
    }

    // Vérifier localStorage
    const storedToken = localStorage.getItem('auth_token')
    const storedExpiry = localStorage.getItem('token_expiry')
    
    if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
      this.token.value = storedToken
      this.tokenExpiry.value = parseInt(storedExpiry)
      return this.token.value
    }

    return null
  }

  async getValidToken() {
    const token = this.getToken()
    if (token) {
      return token
    }
    
    return await this.generateToken()
  }

  clearToken() {
    this.token.value = null
    this.tokenExpiry.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('token_expiry')
  }

  isTokenValid() {
    return this.getToken() !== null
  }

  getTokenExpiryTime() {
    if (!this.tokenExpiry.value) return null
    return new Date(this.tokenExpiry.value).toLocaleString('fr-FR')
  }
}

export default new AuthService() 