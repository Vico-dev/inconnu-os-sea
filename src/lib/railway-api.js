const config = require('./config.js')

class RailwayApiClient {
  constructor() {
    this.baseURL = config.BACKEND_URL
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
      console.error('Railway API request failed:', error)
      throw error
    }
  }

  // Méthodes spécifiques
  async auth(method, data) {
    return this.request(`/api/auth/${method}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async health() {
    return this.request('/api/health')
  }

  async admin(endpoint, data = null) {
    const options = {
      method: data ? 'POST' : 'GET'
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    return this.request(`/api/admin${endpoint}`, options)
  }

  async tickets(endpoint, data = null) {
    const options = {
      method: data ? 'POST' : 'GET'
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    return this.request(`/api/tickets${endpoint}`, options)
  }

  async googleAds(endpoint, data = null) {
    const options = {
      method: data ? 'POST' : 'GET'
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    return this.request(`/api/google-ads${endpoint}`, options)
  }

  async subscription(endpoint, data = null) {
    const options = {
      method: data ? 'POST' : 'GET'
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    return this.request(`/api/subscription${endpoint}`, options)
  }
}

// Instance singleton
const railwayApi = new RailwayApiClient()

module.exports = railwayApi 