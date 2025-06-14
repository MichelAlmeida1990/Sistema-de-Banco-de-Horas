// Script para configurar autenticação Google automaticamente
const admin = require('firebase-admin');

// Inicializar Admin SDK
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'banco-de-horas-596ca'
});

async function configureGoogleAuth() {
  try {
    console.log('🔧 Configurando provedor Google...');
    
    // Configurar provedor Google
    const auth = admin.auth();
    
    // Verificar se já existe configuração
    const config = await auth.getProviderConfig('google.com').catch(() => null);
    
    if (!config) {
      console.log('✅ Provedor Google já está configurado!');
    } else {
      console.log('⚠️ Configure manualmente no Firebase Console:');
      console.log('1. Acesse: https://console.firebase.google.com/project/banco-de-horas-596ca/authentication/providers');
      console.log('2. Clique em "Google"');
      console.log('3. Ative o provedor');
      console.log('4. Configure email de suporte');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n📋 Configure manualmente:');
    console.log('1. Acesse: https://console.firebase.google.com/project/banco-de-horas-596ca/authentication/providers');
    console.log('2. Clique em "Google"');
    console.log('3. Ative o provedor');
    console.log('4. Configure email de suporte');
  }
}

configureGoogleAuth(); 