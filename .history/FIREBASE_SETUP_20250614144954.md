# 🔥 Configuração Segura do Firebase

## ⚠️ Importante - Segurança

Os dados sensíveis do Firebase foram removidos do código por segurança. Para usar o sistema:

### 📋 Para Desenvolvimento Local

O sistema detecta automaticamente se está rodando em `localhost` e usa configurações de desenvolvimento.

### 🚀 Para Produção

1. **Configure as variáveis de ambiente:**
   ```bash
   FIREBASE_API_KEY=sua_api_key_aqui
   FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   FIREBASE_PROJECT_ID=seu-projeto-id
   FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789012
   FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345678
   FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. **Obter credenciais do Firebase:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Selecione seu projeto
   - Vá em **Configurações do projeto** > **Geral**
   - Role até "Seus apps" e clique no ícone da web
   - Copie as configurações

3. **Configurar regras de segurança do Firestore:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /registros/{document} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
       }
     }
   }
   ```

### 🔒 Segurança Implementada

- ✅ Dados sensíveis removidos do código
- ✅ Configuração por variáveis de ambiente
- ✅ Detecção automática de ambiente
- ✅ Regras de segurança do Firestore
- ✅ Autenticação obrigatória
- ✅ Isolamento de dados por usuário

### 🛠️ Estrutura do Banco de Dados

```
firestore/
├── registros/
│   ├── {registroId}/
│   │   ├── uid: string
│   │   ├── data: string
│   │   ├── entrada: string
│   │   ├── saida: string
│   │   ├── pausa: number
│   │   ├── valorHora: number
│   │   ├── feriado: boolean
│   │   ├── fimDeSemana: boolean
│   │   ├── observacoes: string
│   │   └── timestamp: timestamp
```

### 📝 Notas Importantes

- Nunca commite credenciais no Git
- Use sempre HTTPS em produção
- Configure CORS adequadamente
- Monitore uso e custos no Firebase Console
- Faça backup regular dos dados 