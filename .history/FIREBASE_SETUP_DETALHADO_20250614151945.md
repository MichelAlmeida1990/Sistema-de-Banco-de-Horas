# 🔥 Guia Completo: Resolver Erro de Domínio Firebase

## ❌ Erro Atual
```
Firebase: This domain is not authorized for OAuth operations for your Firebase project. 
Edit the list of authorized domains from the Firebase console. (auth/unauthorized-domain)
```

## 🎯 Solução Rápida

### 1. **Acesse o Firebase Console**
- Vá para: https://console.firebase.google.com
- Selecione seu projeto: `banco-de-horas-596ca`

### 2. **Configure Domínios Autorizados**
1. No menu lateral, clique em **"Authentication"**
2. Clique na aba **"Settings"**
3. Role até **"Authorized domains"**
4. Clique em **"Add domain"**
5. Adicione estes domínios:
   ```
   localhost
   127.0.0.1
   localhost:8000
   127.0.0.1:8000
   ```

### 3. **Salvar e Testar**
- Clique em **"Save"**
- Aguarde alguns minutos para propagação
- Teste o login novamente

## 🔧 Configuração Detalhada

### Domínios Necessários para Desenvolvimento:
```
localhost                 # Para http://localhost
127.0.0.1                # Para http://127.0.0.1
localhost:8000           # Para http://localhost:8000
127.0.0.1:8000          # Para http://127.0.0.1:8000
localhost:3000          # Para outros servidores
127.0.0.1:3000         # Para outros servidores
```

### Domínios para Produção:
```
seu-dominio.com
www.seu-dominio.com
banco-de-horas-596ca.firebaseapp.com
banco-de-horas-596ca.web.app
```

## 📱 Passo a Passo com Imagens

### 1. Firebase Console - Autenticação
```
Firebase Console > Seu Projeto > Authentication > Settings
```

### 2. Seção Authorized Domains
```
┌─────────────────────────────────────┐
│ Authorized domains                   │
├─────────────────────────────────────┤
│ ✅ localhost                        │
│ ✅ 127.0.0.1                       │
│ ✅ localhost:8000                   │
│ ✅ 127.0.0.1:8000                  │
│ ✅ banco-de-horas-596ca.web.app     │
│                                     │
│ [+ Add domain]                      │
└─────────────────────────────────────┘
```

## 🚨 Problemas Comuns

### 1. **Erro persiste após adicionar domínio**
- **Causa**: Cache do navegador
- **Solução**: 
  - Limpe cache (Ctrl+Shift+Delete)
  - Ou use aba anônima
  - Aguarde 5-10 minutos

### 2. **Domínio não aceito**
- **Causa**: Formato incorreto
- **Solução**: Use exatamente como mostrado:
  ```
  ❌ http://localhost:8000
  ❌ https://localhost:8000
  ✅ localhost:8000
  ```

### 3. **Projeto não encontrado**
- **Causa**: Projeto incorreto
- **Solução**: Verifique se está no projeto `banco-de-horas-596ca`

## 🔄 Alternativas Enquanto Configura

### 1. **Use Modo Offline**
- Clique em "Usar Modo Offline"
- Funciona imediatamente
- Dados salvos localmente

### 2. **Use Localhost Padrão**
- Acesse: `http://localhost:8000`
- Em vez de: `http://127.0.0.1:8000`

### 3. **Configure Hosts (Avançado)**
```bash
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts
127.0.0.1 banco-horas.local
```

## 🛠️ Verificação de Configuração

### 1. **Teste no Console do Navegador**
```javascript
// Abra F12 > Console e digite:
console.log('Domínio atual:', window.location.hostname);
console.log('Porta atual:', window.location.port);
console.log('Firebase disponível:', window.isFirebaseAvailable());
console.log('Domínio autorizado:', window.isDomainAuthorized());
```

### 2. **Verificar Configuração Firebase**
```javascript
// No console:
console.log('Config Firebase:', firebase.app().options);
```

## 📋 Checklist de Configuração

- [ ] Projeto Firebase criado
- [ ] Authentication habilitado
- [ ] Google Provider configurado
- [ ] Domínios autorizados adicionados:
  - [ ] localhost
  - [ ] 127.0.0.1
  - [ ] localhost:8000
  - [ ] 127.0.0.1:8000
- [ ] Configurações salvas
- [ ] Cache limpo
- [ ] Teste realizado

## 🎯 Configuração Completa do Projeto

### 1. **Firestore Database**
```
Firestore Database > Rules:
```
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/registros/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/configuracoes/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2. **Authentication Providers**
- ✅ Google (habilitado)
- ✅ Email/Password (opcional)

### 3. **Hosting (opcional)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🆘 Suporte Adicional

### Se nada funcionar:
1. **Recrie o projeto Firebase**
2. **Use apenas modo offline**
3. **Configure Supabase (alternativa)**

### Logs úteis:
```javascript
// Verificar erros detalhados
window.addEventListener('error', console.error);
```

---

**💡 Dica**: O modo offline funciona perfeitamente enquanto você configura o Firebase! 