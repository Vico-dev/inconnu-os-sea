// Klaro configuration with Google Consent Mode v2 integration
window.klaroConfig = {
  version: 1,
  elementID: 'klaro',
  acceptAll: true,
  hideDeclineAll: false,
  default: false,
  mustConsent: false,
  translations: {
    fr: {
      consentModal: {
        title: 'Gestion des cookies',
        description:
          "Nous utilisons des cookies pour améliorer votre expérience, mesurer l'audience et personnaliser la publicité.",
      },
      consentNotice: {
        changeDescription: 'Vous pouvez modifier vos préférences à tout moment.',
        description:
          "En cliquant sur 'Tout accepter', vous autorisez le dépôt de cookies analytiques et publicitaires.",
      },
      acceptAll: 'Tout accepter',
      acceptSelected: 'Accepter la sélection',
      decline: 'Tout refuser',
      purposes: {
        essential: 'Essentiels',
        analytics: 'Mesure d’audience',
        ads: 'Publicité',
      },
    },
  },
  services: [
    {
      name: 'gtm',
      title: 'Google Tag Manager',
      purposes: ['essential'],
      required: true,
      default: true,
      callbacks: {
        onInit: () => {},
        onAccept: () => {},
        onDecline: () => {},
      },
    },
    {
      name: 'ga4',
      title: 'Google Analytics 4',
      purposes: ['analytics'],
    },
    {
      name: 'google-ads',
      title: 'Google Ads',
      purposes: ['ads'],
    },
  ],
  // Sync Klaro decisions to Google Consent Mode
  callback: function (consent, service) {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer || []
    function gtag() { window.dataLayer.push(arguments) }

    const analyticsGranted = consent['ga4'] === true
    const adsGranted = consent['google-ads'] === true

    gtag('consent', 'update', {
      'analytics_storage': analyticsGranted ? 'granted' : 'denied',
      'ad_storage': adsGranted ? 'granted' : 'denied',
      'ad_user_data': adsGranted ? 'granted' : 'denied',
      'ad_personalization': adsGranted ? 'granted' : 'denied',
    })

    // Inform GTM of consent update
    window.dataLayer.push({ event: 'consent_updated' })
  },
}


