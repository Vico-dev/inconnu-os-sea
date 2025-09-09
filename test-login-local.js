// Test de connexion locale avec l'API de l'application
const testLocalLogin = async () => {
  console.log('🔐 Test de connexion locale...\n');

  const baseUrl = 'http://localhost:3000';

  // Test 1: Vérifier que l'application fonctionne
  console.log('1️⃣ Vérification de l\'application...');
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Application locale accessible');
    } else {
      console.log('❌ Application non accessible:', healthResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ Erreur application:', error.message);
    return;
  }

  // Test 2: Essayer de créer un utilisateur via l'API
  console.log('\n2️⃣ Test de création d\'utilisateur...');
  
  const testUsers = [
    {
      email: 'admin@test.local',
      password: 'Test123!',
      firstName: 'Admin',
      lastName: 'Test',
      role: 'ADMIN'
    },
    {
      email: 'test@local.com',
      password: 'Test123!',
      firstName: 'User',
      lastName: 'Test',
      role: 'USER'
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n🔄 Test avec ${user.email}...`);
      
      // Essayer de créer l'utilisateur
      const createResponse = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });

      if (createResponse.ok) {
        const data = await createResponse.json();
        console.log(`✅ Utilisateur ${user.email} créé:`, data);
        console.log(`🔑 Identifiants: ${user.email} / ${user.password}`);
      } else {
        const errorData = await createResponse.json();
        console.log(`⚠️ Erreur création ${user.email}:`, createResponse.status, errorData);
        
        // Essayer de se connecter
        console.log(`🔄 Tentative de connexion avec ${user.email}...`);
        const loginResponse = await fetch(`${baseUrl}/api/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log(`✅ Connexion réussie avec ${user.email}:`, loginData);
          console.log(`🔑 Utilise ces identifiants pour tester l'interface GMC:`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Mot de passe: ${user.password}`);
        } else {
          const loginError = await loginResponse.json();
          console.log(`❌ Connexion échouée avec ${user.email}:`, loginResponse.status, loginError);
        }
      }
    } catch (error) {
      console.log(`❌ Erreur avec ${user.email}:`, error.message);
    }
  }

  console.log('\n🏁 Test de connexion terminé !');
  console.log('\n💡 Pour tester l\'interface GMC:');
  console.log('1. Aller sur http://localhost:3000/login');
  console.log('2. Se connecter avec un des utilisateurs de test');
  console.log('3. Aller sur /admin/feed-manager');
  console.log('4. Cliquer sur "Export GMC"');
  console.log('5. Saisir un Merchant ID (ex: 123456789)');
  console.log('6. Cliquer sur "Exporter"');
  console.log('7. Voir les résultats simulés');
};

// Lancer le test
testLocalLogin().catch(console.error); 