// src/js/firebase-config-v3.js - Configuração Firebase v3.0.0 - CACHE CLEARED

// ✅ CONFIGURAÇÃO FIREBASE - VERSÃO ATUALIZADA
const firebaseConfig = {
    apiKey: "AIzaSyAsYDPDgw1GO_yOB6prCxvxDfwI3kEfhvE",
    authDomain: "banco-de-horas-596ca.firebaseapp.com",
    projectId: "banco-de-horas-596ca",
    storageBucket: "banco-de-horas-596ca.firebasestorage.app",
    messagingSenderId: "75423178670",
    appId: "1:75423178670:web:b62ce90d78292f8485f23f",
    measurementId: "G-9RBTXPJ3PQ"
};

// ✅ VERIFICAR SE FIREBASE SDK ESTÁ CARREGADO
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK não carregado!');
    throw new Error('Firebase SDK não encontrado');
}

// ✅ INICIALIZAR FIREBASE COM TRATAMENTO DE ERRO
let firebaseInitialized = false;
let authAvailable = false;
let auth = null;
let db = null;

console.log('🔧 Iniciando Firebase v3.0.0...');
console.log('🔑 API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');

try {
    // Verificar se já foi inicializado
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase inicializado com sucesso');
    } else {
        console.log('🔥 Firebase já estava inicializado');
    }
    
    firebaseInitialized = true;
    
    // Configurar serviços
    auth = firebase.auth();
    db = firebase.firestore();
    authAvailable = true;
    
    // ✅ CONFIGURAÇÕES DO FIRESTORE
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });

    // ✅ HABILITAR PERSISTÊNCIA OFFLINE
    db.enablePersistence({ synchronizeTabs: true })
        .then(() => {
            console.log('💾 Persistência offline habilitada');
        })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Persistência falhou: múltiplas abas abertas');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Navegador não suporta persistência');
            } else {
                console.error('❌ Erro na persistência:', err);
            }
        });
        
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    firebaseInitialized = false;
    authAvailable = false;
}

// ✅ FUNÇÃO PARA VERIFICAR SE FIREBASE ESTÁ DISPONÍVEL
function isFirebaseAvailable() {
    return firebaseInitialized && authAvailable && auth && db;
}

// ✅ FUNÇÃO PARA VERIFICAR DOMÍNIO AUTORIZADO - UNIVERSAL
function isDomainAuthorized() {
    const currentDomain = window.location.hostname;
    const currentPort = window.location.port;
    const currentProtocol = window.location.protocol;
    
    // ✅ DOMÍNIOS SEMPRE AUTORIZADOS
    const alwaysAuthorized = [
        // Localhost em todas as variações
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        // Firebase oficial
        'banco-de-horas-596ca.firebaseapp.com',
        'banco-de-horas-596ca.web.app',
        // Netlify, Vercel, GitHub Pages (caso use no futuro)
        'netlify.app',
        'vercel.app',
        'github.io',
        'surge.sh',
        'herokuapp.com'
    ];
    
    // ✅ VERIFICAR DOMÍNIOS ESPECÍFICOS
    const isSpecificDomain = alwaysAuthorized.some(domain => 
        currentDomain === domain || 
        currentDomain.endsWith('.' + domain) ||
        currentDomain.includes(domain)
    );
    
    if (isSpecificDomain) {
        console.log('✅ Domínio autorizado:', currentDomain);
        return true;
    }
    
    // ✅ VERIFICAR PADRÕES DE DESENVOLVIMENTO
    const isDevelopment = 
        currentDomain === 'localhost' ||
        currentDomain === '127.0.0.1' ||
        currentDomain === '0.0.0.0' ||
        currentDomain.startsWith('192.168.') ||  // Rede local
        currentDomain.startsWith('10.') ||       // Rede local
        currentDomain.startsWith('172.') ||      // Rede local
        currentDomain.includes('.local') ||      // mDNS
        currentProtocol === 'file:' ||           // Arquivo local
        currentPort !== '' ||                    // Qualquer porta = desenvolvimento
        currentDomain.includes('ngrok') ||       // Túnel ngrok
        currentDomain.includes('tunnel');        // Outros túneis
    
    if (isDevelopment) {
        console.log('🔧 Ambiente de desenvolvimento detectado:', currentDomain + ':' + currentPort);
        return true;
    }
    
    // ✅ VERIFICAR IPs LOCAIS E MÓVEIS
    const isLocalIP = 
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(currentDomain) ||  // 192.168.x.x
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(currentDomain) || // 10.x.x.x
        /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(currentDomain); // 172.16-31.x.x
    
    if (isLocalIP) {
        console.log('📱 IP de rede local detectado:', currentDomain);
        return true;
    }
    
    // ✅ PARA PRODUÇÃO: ACEITAR QUALQUER DOMÍNIO HTTPS
    if (currentProtocol === 'https:' && !currentPort) {
        console.log('🌐 Domínio HTTPS em produção:', currentDomain);
        return true;
    }
    
    console.warn('⚠️ Domínio não reconhecido:', currentDomain + ':' + currentPort);
    return false; // Só bloqueia se realmente não reconhecer
}

// ✅ EXPORTAR PARA USO GLOBAL
window.auth = auth;
window.db = db;
window.isFirebaseAvailable = isFirebaseAvailable;
window.isDomainAuthorized = isDomainAuthorized;
window.firebaseInitialized = firebaseInitialized;

console.log('✅ Firebase Config v3.0.0 carregado');
console.log('🔥 Firebase disponível:', isFirebaseAvailable());
console.log('🌐 Domínio autorizado:', isDomainAuthorized());
console.log('🕐 Timestamp:', new Date().toISOString()); 