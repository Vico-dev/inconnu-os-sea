// Système de tracking des prospects
export class ProspectTracker {
  private static instance: ProspectTracker
  private trackingData: any = {}

  static getInstance(): ProspectTracker {
    if (!ProspectTracker.instance) {
      ProspectTracker.instance = new ProspectTracker()
    }
    return ProspectTracker.instance
  }

  // Initialiser le tracking pour un prospect
  initTracking(prospectId: string, email: string) {
    this.trackingData = {
      prospectId,
      email,
      sessionStart: new Date(),
      interactions: []
    }
    
    // Démarrer le tracking des interactions
    this.trackPageViews()
    this.trackFormSubmissions()
    this.trackContentDownloads()
    this.trackEmailInteractions()
  }

  // Tracker les visites de pages
  private trackPageViews() {
    let lastPage = window.location.pathname
    
    // Tracker les changements de page
    const observer = new MutationObserver(() => {
      const currentPage = window.location.pathname
      if (currentPage !== lastPage) {
        this.recordInteraction('site_visit', {
          from: lastPage,
          to: currentPage,
          timestamp: new Date()
        })
        lastPage = currentPage
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Tracker la visite initiale
    this.recordInteraction('site_visit', {
      page: window.location.pathname,
      timestamp: new Date()
    })
  }

  // Tracker les soumissions de formulaires
  private trackFormSubmissions() {
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      if (form) {
        this.recordInteraction('form_submission', {
          formId: form.id || form.className,
          formAction: form.action,
          timestamp: new Date()
        })
      }
    })
  }

  // Tracker les téléchargements de contenu
  private trackContentDownloads() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a') as HTMLAnchorElement
        const href = link?.href
        
        if (href && this.isDownloadLink(href)) {
          this.recordInteraction('content_download', {
            file: href,
            timestamp: new Date()
          })
        }
      }
    })
  }

  // Tracker les interactions avec les emails
  private trackEmailInteractions() {
    // Tracker les ouvertures d'emails (via pixel tracking)
    if (window.location.search.includes('email_open=true')) {
      this.recordInteraction('email_open', {
        emailId: new URLSearchParams(window.location.search).get('email_id'),
        timestamp: new Date()
      })
    }

    // Tracker les clics sur les liens d'emails
    if (window.location.search.includes('email_click=true')) {
      this.recordInteraction('email_click', {
        emailId: new URLSearchParams(window.location.search).get('email_id'),
        link: new URLSearchParams(window.location.search).get('link'),
        timestamp: new Date()
      })
    }
  }

  // Vérifier si un lien est un téléchargement
  private isDownloadLink(href: string): boolean {
    const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar']
    return downloadExtensions.some(ext => href.toLowerCase().includes(ext))
  }

  // Enregistrer une interaction
  private async recordInteraction(action: string, details: any) {
    if (!this.trackingData.prospectId) return

    const interaction = {
      action,
      details,
      timestamp: new Date()
    }

    this.trackingData.interactions.push(interaction)

    // Envoyer l'interaction au serveur
    try {
      const response = await fetch('/api/prospects/engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospectId: this.trackingData.prospectId,
          action,
          details
        })
      })

      if (response.ok) {
        console.log(`✅ Interaction enregistrée: ${action}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'interaction:', error)
    }
  }

  // Méthodes publiques pour déclencher des actions spécifiques
  static trackDemoRequest(prospectId: string) {
    ProspectTracker.getInstance().recordInteraction('demo_request', {
      timestamp: new Date()
    })
  }

  static trackAppointmentRequest(prospectId: string) {
    ProspectTracker.getInstance().recordInteraction('appointment_request', {
      timestamp: new Date()
    })
  }

  static trackPricingView(prospectId: string) {
    ProspectTracker.getInstance().recordInteraction('pricing_view', {
      timestamp: new Date()
    })
  }

  static trackCaseStudyView(prospectId: string, caseStudyId: string) {
    ProspectTracker.getInstance().recordInteraction('case_study_view', {
      caseStudyId,
      timestamp: new Date()
    })
  }

  static trackVideoWatch(prospectId: string, videoId: string, duration: number) {
    ProspectTracker.getInstance().recordInteraction('video_watch', {
      videoId,
      duration,
      timestamp: new Date()
    })
  }

  static trackSocialMediaClick(prospectId: string, platform: string) {
    ProspectTracker.getInstance().recordInteraction('social_media_click', {
      platform,
      timestamp: new Date()
    })
  }

  static trackNewsletterSignup(prospectId: string) {
    ProspectTracker.getInstance().recordInteraction('newsletter_signup', {
      timestamp: new Date()
    })
  }

  static trackChatInteraction(prospectId: string, messageCount: number) {
    ProspectTracker.getInstance().recordInteraction('chat_interaction', {
      messageCount,
      timestamp: new Date()
    })
  }

  // Obtenir les données de tracking
  getTrackingData() {
    return this.trackingData
  }
}

// Fonction utilitaire pour initialiser le tracking
export function initProspectTracking(prospectId: string, email: string) {
  if (typeof window !== 'undefined') {
    ProspectTracker.getInstance().initTracking(prospectId, email)
  }
}

// Fonction pour tracker les demandes de démo
export function trackDemoRequest(prospectId: string) {
  if (typeof window !== 'undefined') {
    ProspectTracker.trackDemoRequest(prospectId)
  }
}

// Fonction pour tracker les demandes de rendez-vous
export function trackAppointmentRequest(prospectId: string) {
  if (typeof window !== 'undefined') {
    ProspectTracker.trackAppointmentRequest(prospectId)
  }
}

// Nouvelles fonctions de tracking
export function trackPricingView(prospectId: string) {
  if (typeof window !== 'undefined') {
    ProspectTracker.trackPricingView(prospectId)
  }
}

export function trackCaseStudyView(prospectId: string, caseStudyId: string) {
  if (typeof window !== 'undefined') {
    ProspectTracker.trackCaseStudyView(prospectId, caseStudyId)
  }
}

export function trackVideoWatch(prospectId: string, videoId: string, duration: number) {
  if (typeof window !== 'undefined') {
    ProspectTracker.trackVideoWatch(prospectId, videoId, duration)
  }
}

export function trackSocialMediaClick(prospectId: string, platform: string) {
  if (typeof window !== 'undefined') {
    ProspectTracker.trackSocialMediaClick(prospectId, platform)
  }
}

export function trackNewsletterSignup(prospectId: string) {
  if (typeof window !== 'undefined') {
    ProspectTracker.trackNewsletterSignup(prospectId)
  }
}

export function trackChatInteraction(prospectId: string, messageCount: number) {
  if (typeof window !== 'undefined') {
    ProspectTracker.trackChatInteraction(prospectId, messageCount)
  }
} 