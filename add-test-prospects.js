const testProspects = [
  {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    company: 'Tech Solutions SARL',
    message: 'Bonjour, nous cherchons à optimiser nos campagnes Google Ads. Notre budget est de 2000€/mois.',
    source: 'WEBSITE',
    status: 'NEW',
    notes: 'Prospect intéressé par l\'optimisation. Budget confirmé.'
  },
  {
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@startup.fr',
    phone: '06 98 76 54 32',
    company: 'Startup Innovante',
    message: 'Nous lançons un nouveau produit et avons besoin d\'aide pour nos campagnes publicitaires.',
    source: 'WEBSITE',
    status: 'CONTACTED',
    notes: 'Premier appel effectué. Très réceptive. Rendez-vous de suivi prévu.'
  },
  {
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'pierre.bernard@ecommerce.com',
    phone: '06 11 22 33 44',
    company: 'E-commerce Plus',
    message: 'Notre ROAS est actuellement de 1.5x, nous voulons l\'améliorer.',
    source: 'WEBSITE',
    status: 'QUALIFIED',
    notes: 'Prospect qualifié. Budget de 3000€/mois. Prêt à signer.'
  },
  {
    firstName: 'Sophie',
    lastName: 'Leroy',
    email: 'sophie.leroy@agence.fr',
    phone: '06 55 66 77 88',
    company: 'Agence Marketing',
    message: 'Nous cherchons un expert pour nos clients.',
    source: 'REFERRAL',
    status: 'CONVERTED',
    notes: 'Contrat signé ! Démarrage le 1er du mois prochain.'
  },
  {
    firstName: 'Thomas',
    lastName: 'Moreau',
    email: 'thomas.moreau@pme.fr',
    phone: '06 99 88 77 66',
    company: 'PME Traditionnelle',
    message: 'Nous avons un petit budget mais nous voulons essayer.',
    source: 'WEBSITE',
    status: 'LOST',
    notes: 'Budget trop faible (500€/mois). Pas rentable pour nous.'
  }
]

async function addTestProspects() {
  try {
    console.log('Ajout des prospects de test via l\'API Railway...')
    
    // URL de Railway (à remplacer par votre URL)
    const baseUrl = 'https://inconnu-os-sea-production.up.railway.app'
    
    for (const prospect of testProspects) {
      const response = await fetch(`${baseUrl}/api/prospects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prospect)
      })
      
      if (response.ok) {
        console.log(`✅ Prospect ajouté: ${prospect.firstName} ${prospect.lastName}`)
      } else {
        const errorText = await response.text()
        console.log(`❌ Erreur pour ${prospect.firstName} ${prospect.lastName}: ${response.status} - ${errorText}`)
      }
    }
    
    console.log('\n🎉 Prospects de test ajoutés avec succès !')
    console.log(`Total: ${testProspects.length} prospects créés`)
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout des prospects:', error)
  }
}

addTestProspects() 