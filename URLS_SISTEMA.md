# 🌐 URLs do Sistema Banco de Horas

## 🚀 **URLs de Produção (Online)**

### **1. Firebase Hosting (Principal)**
- **URL:** https://banco-de-horas-596ca.web.app
- **Status:** ✅ Ativo
- **Recursos:** Login Google + Todos os recursos
- **Acesso:** Mundial

### **2. GitHub Pages (Alternativo)**
- **URL:** https://michelameida1990.github.io/Banco-de-horas
- **Status:** ✅ Ativo  
- **Recursos:** Login Google + Todos os recursos
- **Acesso:** Mundial

### **3. Firebase App (Backup)**
- **URL:** https://banco-de-horas-596ca.firebaseapp.com
- **Status:** ✅ Ativo
- **Recursos:** Login Google + Todos os recursos
- **Acesso:** Mundial

## 🔧 **URLs de Desenvolvimento (Local)**

### **1. Localhost Padrão**
- **URL:** http://localhost:8000
- **Status:** ✅ Configurado no Firebase
- **Recursos:** Login Google + Todos os recursos
- **Acesso:** Apenas local

### **2. IP Local (127.0.0.1)**
- **URL:** http://127.0.0.1:8000
- **Status:** ✅ Configurado no Firebase
- **Recursos:** Login Google + Todos os recursos
- **Acesso:** Apenas local

### **3. Qualquer Porta Local**
- **URLs:** http://localhost:XXXX ou http://127.0.0.1:XXXX
- **Status:** ✅ Auto-detectado
- **Recursos:** Modo Offline + Todos os recursos
- **Acesso:** Apenas local

## 📱 **Acesso Móvel/Tablet**

### **1. URLs Online (Recomendado)**
```
https://banco-de-horas-596ca.web.app
https://michelameida1990.github.io/Banco-de-horas
```
- ✅ Funciona em qualquer dispositivo
- ✅ Login Google habilitado
- ✅ Sincronização automática

### **2. Rede Local**
```
http://IP_DO_COMPUTADOR:8000
```
- Descubra o IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Exemplo: `http://192.168.1.100:8000`
- Use "Modo Offline" para login

## 🎯 **Qual URL Usar?**

| Situação | URL Recomendada | Motivo |
|----------|----------------|---------|
| **Uso Normal** | Firebase Hosting | Mais rápido e confiável |
| **Backup** | GitHub Pages | Alternativa se Firebase falhar |
| **Desenvolvimento** | localhost:8000 | Para testes locais |
| **Celular/Tablet** | URLs Online | Acesso universal |
| **Sem Internet** | Modo Offline | Funciona offline |

## 🔐 **Configuração de Domínios no Firebase**

### **Domínios Autorizados Atuais:**
```
✅ localhost
✅ banco-de-horas-596ca.firebaseapp.com  
✅ banco-de-horas-596ca.web.app
✅ michelameida1990.github.io
```

### **Para Adicionar Novos Domínios:**
1. Acesse: https://console.firebase.google.com/project/banco-de-horas-596ca/authentication/settings
2. Vá em: Authentication > Settings > Authorized domains
3. Clique: "Add domain"
4. Digite o domínio (sem http/https)
5. Salve e aguarde 2-5 minutos

## 📊 **Status dos Serviços**

### **Firebase (Google)**
- **Uptime:** 99.9%
- **CDN:** Global
- **SSL:** Automático
- **Backup:** Automático

### **GitHub Pages**
- **Uptime:** 99.9%
- **CDN:** Global  
- **SSL:** Automático
- **Deploy:** Automático via Git

## 🚀 **Como Fazer Deploy**

### **Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### **GitHub Pages:**
1. Push para repositório GitHub
2. Vá em: Settings > Pages
3. Selecione: Source > Deploy from branch
4. Branch: main / root
5. Save

## 🛠️ **Comandos Úteis**

### **Testar Localmente:**
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### **Verificar Status:**
```bash
# Ping Firebase
ping banco-de-horas-596ca.web.app

# Ping GitHub Pages  
ping michelameida1990.github.io
```

## 📱 **QR Codes para Acesso Móvel**

### **Firebase Hosting:**
```
https://banco-de-horas-596ca.web.app
```

### **GitHub Pages:**
```
https://michelameida1990.github.io/Banco-de-horas
```

## 🎉 **Resumo**

- **✅ 3 URLs online funcionando**
- **✅ Login Google configurado em todas**
- **✅ Acesso móvel habilitado**
- **✅ Modo offline disponível**
- **✅ Deploy automático configurado**

**💡 Dica:** Salve todas as URLs nos favoritos para ter sempre uma alternativa disponível! 