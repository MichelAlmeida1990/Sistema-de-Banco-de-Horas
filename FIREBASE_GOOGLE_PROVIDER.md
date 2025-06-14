# 🔧 Habilitar Provedor Google no Firebase

## ❌ Erro Atual
```
Firebase: The given sign-in provider is disabled for this Firebase project. 
Enable it in the Firebase console, under the sign-in method tab of the Auth section. 
(auth/operation-not-allowed)
```

## 🎯 Solução Passo a Passo

### 1. **Acesse o Firebase Console**
- URL: https://console.firebase.google.com
- Projeto: `banco-de-horas-596ca`

### 2. **Navegue para Authentication**
1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique na aba **"Sign-in method"** (não Settings)

### 3. **Habilite o Provedor Google**
1. Na lista de provedores, encontre **"Google"**
2. Clique no **"Google"** (não no toggle)
3. Clique em **"Enable"** (Ativar)

### 4. **Configure o Provedor Google**
1. **Project support email**: Selecione seu email
2. **Project public-facing name**: "Sistema Banco de Horas"
3. Clique em **"Save"** (Salvar)

## 📱 Interface Visual Esperada

### Antes (Desabilitado):
```
┌─────────────────────────────────────┐
│ Sign-in providers                    │
├─────────────────────────────────────┤
│ Google                         [OFF] │
│ Email/Password                 [OFF] │
│ Phone                          [OFF] │
│ Anonymous                      [OFF] │
└─────────────────────────────────────┘
```

### Depois (Habilitado):
```
┌─────────────────────────────────────┐
│ Sign-in providers                    │
├─────────────────────────────────────┤
│ Google                         [ON]  │
│ Email/Password                 [OFF] │
│ Phone                          [OFF] │
│ Anonymous                      [OFF] │
└─────────────────────────────────────┘
```

## 🔧 Configuração Completa

### Campos Obrigatórios:
- ✅ **Enable**: Ativado
- ✅ **Project support email**: Seu email do Google
- ✅ **Project public-facing name**: Nome do projeto

### Campos Opcionais:
- **Web SDK configuration**: Automático
- **Authorized domains**: Já configurado anteriormente

## 🚨 Problemas Comuns

### 1. **Não encontro "Sign-in method"**
- **Solução**: Certifique-se de estar em Authentication, não em outras seções

### 2. **Google não aparece na lista**
- **Solução**: Verifique se está no projeto correto (`banco-de-horas-596ca`)

### 3. **Erro ao salvar configuração**
- **Solução**: Verifique se selecionou um email de suporte válido

### 4. **Ainda não funciona após configurar**
- **Solução**: Aguarde 2-3 minutos para propagação

## 📋 Checklist de Configuração

- [ ] Acessei Firebase Console
- [ ] Selecionei projeto `banco-de-horas-596ca`
- [ ] Fui em Authentication > Sign-in method
- [ ] Cliquei em "Google" na lista de provedores
- [ ] Ativei o provedor (Enable)
- [ ] Configurei email de suporte
- [ ] Configurei nome público do projeto
- [ ] Salvei as configurações
- [ ] Aguardei alguns minutos
- [ ] Testei o login

## 🔄 Domínios com Porta

### Problema: Não consigo adicionar `127.0.0.1:8000`

#### **Solução 1: Adicionar sem porta**
Na seção "Authorized domains", adicione apenas:
```
127.0.0.1
localhost
```

#### **Solução 2: Usar localhost**
Acesse o sistema via:
```
http://localhost:8000
```
Em vez de:
```
http://127.0.0.1:8000
```

#### **Solução 3: Configuração manual**
Se precisar da porta específica, alguns usuários relatam que funciona adicionando:
```
127.0.0.1:8000
localhost:8000
```

## 🛠️ Verificação Final

### Teste no Console do Navegador:
```javascript
// Abra F12 > Console e digite:
console.log('Firebase disponível:', window.isFirebaseAvailable());
console.log('Domínio autorizado:', window.isDomainAuthorized());
console.log('Provedor Google:', firebase.auth().currentUser);
```

### Teste de Login:
1. Clique em "Entrar com Google"
2. Deve abrir popup do Google
3. Faça login com sua conta
4. Deve redirecionar para o sistema

## 🎯 Configuração Recomendada Final

### Authentication > Sign-in method:
- ✅ **Google**: Habilitado
- ✅ **Email de suporte**: Configurado
- ✅ **Nome público**: Configurado

### Authentication > Settings > Authorized domains:
- ✅ `localhost`
- ✅ `127.0.0.1`
- ✅ `banco-de-horas-596ca.firebaseapp.com`
- ✅ `banco-de-horas-596ca.web.app`

## 🆘 Se Nada Funcionar

### Alternativas:
1. **Use Modo Offline**: Funciona imediatamente
2. **Recrie o projeto**: Às vezes resolve problemas de configuração
3. **Use outro navegador**: Para testar se é problema local

### Suporte:
- Documentação oficial: https://firebase.google.com/docs/auth
- Console Firebase: https://console.firebase.google.com

---

**💡 Dica**: O modo offline funciona perfeitamente enquanto você configura o Firebase! 