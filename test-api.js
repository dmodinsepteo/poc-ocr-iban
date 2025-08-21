// Script de test pour l'API
const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Test de l\'API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Test Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test 2: Liste des résultats
    console.log('\n2️⃣ Test Liste des Résultats...');
    const resultsResponse = await fetch(`${BASE_URL}/results`);
    const resultsData = await resultsResponse.json();
    console.log('✅ Résultats:', resultsData.length, 'éléments');

    // Test 3: Compte des résultats
    console.log('\n3️⃣ Test Compte des Résultats...');
    const countResponse = await fetch(`${BASE_URL}/results/count`);
    const countData = await countResponse.json();
    console.log('✅ Compte:', countData);

    console.log('\n🎉 Tous les tests sont passés !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Assurez-vous que le serveur est démarré :');
    console.log('   cd backend && npm run dev');
  }
}

// Lancer les tests
testAPI();
