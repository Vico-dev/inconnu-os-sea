#!/usr/bin/env tsx

import fetch from 'node-fetch'

async function forceOnboardingComplete() {
  const email = 'victorsoldet@gmail.com'
  
  try {
    console.log(`🔄 Marquage de l'onboarding comme terminé pour ${email}...`)
    
    const response = await fetch('https://agence-inconnu.fr/api/admin/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Succès:', result)
    } else {
      console.log('❌ Erreur:', result)
      console.log('\n💡 Solution: Connecte-toi d\'abord en tant qu\'admin sur https://agence-inconnu.fr/login')
    }
    
  } catch (error) {
    console.error('❌ Erreur réseau:', error)
  }
}

forceOnboardingComplete() 