import BACKEND_CONFIG from '../../config/backend.js'

class ApiClient {
  constructor() {
    this.baseURL = BACKEND_CONFIG.API_BASE_URL
  }

  // Méthode générique pour les appels API
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include', // Pour les cookies de session
      ...options
    }

    try {
      const response = await fetch(url, defaultOptions)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Méthodes spécifiques pour chaque endpoint
  async auth(method, data) {
    return this.request(`${BACKEND_CONFIG.ENDPOINTS.AUTH}/${method}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async health() {
    return this.request(BACKEND_CONFIG.ENDPOINTS.HEALTH)
  }

  async admin(endpoint, data = null) {
    const options = {
      method: data ? 'POST' : 'GET'
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    return this.request(`${BACKEND_CONFIG.ENDPOINTS.ADMIN}${endpoint}`, options)
  }

  async tickets(endpoint, data = null) {
    const options = {
      method: data ? 'POST' : 'GET'
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    return this.request(`${BACKEND_CONFIG.ENDPOINTS.TICKETS}${endpoint}`, options)
  }

  async googleAds(endpoint, data = null) {
    const options = {
      method: data ? 'POST' : 'GET'
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    return this.request(`${BACKEND_CONFIG.ENDPOINTS.GOOGLE_ADS}${endpoint}`, options)
  }

  async subscription(endpoint, data = null) {
    const options = {
      method: data ? 'POST' : 'GET'
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    return this.request(`${BACKEND_CONFIG.ENDPOINTS.SUBSCRIPTION}${endpoint}`, options)
  }
}

// Instance singleton
const apiClient = new ApiClient()

export default apiClient 