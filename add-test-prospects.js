const testProspects = [
  {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    phone: "0123456789",
    company: "TechStart SARL",
    industry: "TECHNOLOGY",
    website: "https://techstart.fr",
    budget: 5000,
    source: "WEBSITE",
    notes: "Intéressé par nos services Google Ads"
  },
  {
    firstName: "Marie",
    lastName: "Martin",
    email: "marie.martin@ecommerce.fr",
    phone: "0987654321",
    company: "E-Commerce Plus",
    industry: "E-COMMERCE",
    website: "https://ecommerce-plus.fr",
    budget: 8000,
    source: "REFERRAL",
    notes: "Recommandée par un client existant"
  },
  {
    firstName: "Pierre",
    lastName: "Bernard",
    email: "pierre.bernard@services.fr",
    phone: "0555666777",
    company: "Services Pro",
    industry: "SERVICES",
    website: "https://services-pro.fr",
    budget: 3000,
    source: "LINKEDIN",
    notes: "Contacté via LinkedIn"
  }
]

async function addTestProspects() {
  for (const prospect of testProspects) {
    try {
      const response = await fetch("https://inconnu-os-sea-production.up.railway.app/api/prospects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": "next-auth.session-token=YOUR_SESSION_TOKEN" // À remplacer par un vrai token
        },
        body: JSON.stringify(prospect)
      })
      
      if (response.ok) {
        console.log(`✅ Prospect ${prospect.firstName} ${prospect.lastName} ajouté`)
      } else {
        console.log(`❌ Erreur pour ${prospect.firstName}:`, await response.text())
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${prospect.firstName}:`, error)
    }
  }
}

console.log("🚀 Ajout de prospects de test...")
addTestProspects()
