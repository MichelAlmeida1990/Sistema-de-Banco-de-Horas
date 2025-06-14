# 🚨 RESOLVER: Domínio não autorizado (127.0.0.1:8080)

## ⚡ **SOLUÇÃO RÁPIDA (2 minutos)**

### **Opção 1: 🔧 Configurar Firebase (Recomendado)**

1. **Acesse:** https://console.firebase.google.com/project/banco-de-horas-596ca/authentication/settings

2. **Vá em:** Authentication > Settings > Authorized domains

3. **Clique:** "Add domain"

4. **Adicione estes domínios (um por vez):**
   ```
   localhost
   127.0.0.1
   ```

5. **Salve** e aguarde 2 minutos

6. **Teste** o login novamente

### **Opção 2: 🚀 Usar Sistema Online (Imediato)**

**Acesse:** https://banco-de-horas-596ca.web.app
- ✅ Funciona imediatamente
- ✅ Login Google habilitado
- ✅ Acesso de qualquer dispositivo

### **Opção 3: 📱 Modo Offline (Imediato)**

1. **Clique** em "Usar Modo Offline"
2. ✅ Funciona imediatamente
3. ✅ Todos os recursos disponíveis
4. ✅ Dados salvos localmente

## 🔍 **Por que acontece?**

O Firebase só permite login Google em domínios autorizados. `127.0.0.1:8080` não está na lista padrão.

## 🎯 **Qual escolher?**

| Opção | Tempo | Vantagem |
|-------|-------|----------|
| **Sistema Online** | 0 min | Funciona em qualquer lugar |
| **Modo Offline** | 0 min | Funciona sem internet |
| **Configurar Firebase** | 2 min | Login Google local |

## 🛠️ **Configuração Detalhada do Firebase**

### **Passo a Passo com Imagens:**

1. **Firebase Console**
   ```
   https://console.firebase.google.com
   ```

2. **Selecionar Projeto**
   ```
   banco-de-horas-596ca
   ```

3. **Navegar**
   ```
   Authentication > Settings > Authorized domains
   ```

4. **Adicionar Domínios**
   ```
   [+ Add domain]
   
   Digite: localhost
   [Save]
   
   [+ Add domain]
   
   Digite: 127.0.0.1
   [Save]
   ```

5. **Resultado Final**
   ```
   ✅ localhost
   ✅ 127.0.0.1
   ✅ banco-de-horas-596ca.firebaseapp.com
   ✅ banco-de-horas-596ca.web.app
   ```

## 🚨 **Se não funcionar:**

### **1. Limpar Cache**
- Pressione `Ctrl + Shift + Delete`
- Ou use aba anônima

### **2. Aguardar**
- Firebase pode levar até 5 minutos para atualizar

### **3. Verificar Projeto**
- Certifique-se de estar no projeto `banco-de-horas-596ca`

### **4. Usar Alternativas**
- **Sistema Online**: Sempre funciona
- **Modo Offline**: Sempre funciona

## 📱 **Para Celular/Tablet**

### **Opção 1: Sistema Online**
```
https://banco-de-horas-596ca.web.app
```

### **Opção 2: Rede Local**
1. Descubra o IP do computador: `ipconfig`
2. Acesse: `http://IP_DO_COMPUTADOR:8080`
3. Use "Modo Offline"

## 🎉 **Resumo**

- **🚀 Mais Rápido**: Sistema online
- **📱 Mais Flexível**: Modo offline  
- **🔧 Mais Completo**: Configurar Firebase

**💡 Dica**: O modo offline tem TODOS os recursos do sistema online!

---

## ✅ **Checklist de Resolução**

- [ ] Tentei o sistema online
- [ ] Tentei o modo offline
- [ ] Configurei domínios no Firebase
- [ ] Aguardei 2-5 minutos
- [ ] Limpei cache do navegador
- [ ] Testei em aba anônima
- [ ] Verifiquei o projeto correto

**🎯 Se seguir qualquer uma das opções acima, o problema será resolvido!** 