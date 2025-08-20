// Script de test pour vérifier le processus d'inscription
const testRegistration = async () => {
  const testData = {
    firstName: "Test",
    lastName: "User",
    email: `test-${Date.now()}@example.com`,
    password: "password123",
    company: "Test Company",
    role: "client"
  }

  console.log('🧪 Test d\'inscription avec:', testData.email)

  try {
    // Test 1: Création du compte
    console.log('\n1️⃣ Test création de compte...')
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const registerResult = await registerResponse.json()
    console.log('Status:', registerResponse.status)
    console.log('Réponse:', registerResult)

    if (registerResponse.ok) {
      console.log('✅ Compte créé avec succès')
      
      // Test 2: Vérifier que l'utilisateur existe en base
      console.log('\n2️⃣ Test vérification en base...')
      const userResponse = await fetch(`http://localhost:3000/api/debug/user?email=${testData.email}`)
      const userResult = await userResponse.json()
      console.log('Utilisateur en base:', userResult)

      // Test 3: Test de connexion (devrait échouer car email non vérifié)
      console.log('\n3️⃣ Test connexion (devrait échouer)...')
      const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testData.email,
          password: testData.password
        })
      })

      const loginResult = await loginResponse.json()
      console.log('Status login:', loginResponse.status)
      console.log('Résultat login:', loginResult)

    } else {
      console.log('❌ Erreur création de compte:', registerResult.message)
    }

  } catch (error) {
    console.error('❌ Erreur test:', error)
  }
}

// Exécuter le test
testRegistration() 