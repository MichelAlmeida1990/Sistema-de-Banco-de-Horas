class GerenciadorFirestore {
    constructor(uid) {
        if (!uid) {
            throw new Error('UID é obrigatório para o GerenciadorFirestore');
        }
        this.uid = uid;
        
        // Usar referência global do Firestore
        if (!window.db) {
            throw new Error('Firestore não está inicializado');
        }
        
        // Criar referência à coleção do usuário
        this.collection = window.db
            .collection('usuarios')
            .doc(uid)
            .collection('plantoes');
            
        console.log('✅ GerenciadorFirestore inicializado para uid:', uid);
    }

    async salvarRegistro(registro) {
        try {
            console.log('🔄 Salvando registro no Firestore:', registro);
            
            if (!registro) {
                throw new Error('Registro é obrigatório');
            }

            // Adicionar campos de controle
            const dadosParaSalvar = {
                ...registro,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                uid: this.uid
            };

            // Salvar no Firestore
            const docRef = await this.collection.add(dadosParaSalvar);
            console.log('✅ Registro salvo com ID:', docRef.id);
            
            return docRef.id;
        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            throw error;
        }
    }

    async listarRegistros() {
        try {
            console.log('🔄 Buscando registros do Firestore...');
            
            const snapshot = await this.collection
                .orderBy('data', 'desc')
                .get();
                
            const registros = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`✅ ${registros.length} registros carregados`);
            return registros;
        } catch (error) {
            console.error('❌ Erro ao listar registros:', error);
            return [];
        }
    }

    async removerRegistro(id) {
        try {
            console.log('🔄 Removendo registro:', id);
            await this.collection.doc(id).delete();
            console.log('✅ Registro removido');
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover registro:', error);
            throw error;
        }
    }

    async atualizarRegistro(id, dados) {
        try {
            console.log('🔄 Atualizando registro:', id);
            
            // Adicionar campos de controle
            const dadosParaAtualizar = {
                ...dados,
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                uid: this.uid
            };

            await this.collection.doc(id).update(dadosParaAtualizar);
            console.log('✅ Registro atualizado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar registro:', error);
            throw error;
        }
    }
}

class GerenciadorStorage {
    constructor(uid) {
        this.key = `banco_horas_${uid}`;
    }
    salvarRegistro(registro) {
        const lista = this.listarRegistros();
        lista.push(registro);
        localStorage.setItem(this.key, JSON.stringify(lista));
    }
    listarRegistros() {
        return JSON.parse(localStorage.getItem(this.key) || '[]');
    }
    removerRegistro(id) {
        let lista = this.listarRegistros();
        lista = lista.filter(r => r.id !== id);
        localStorage.setItem(this.key, JSON.stringify(lista));
    }
    atualizarRegistro(id, dados) {
        let lista = this.listarRegistros();
        lista = lista.map(r => r.id === id ? { ...r, ...dados } : r);
        localStorage.setItem(this.key, JSON.stringify(lista));
    }
}

window.GerenciadorFirestore = GerenciadorFirestore;
window.GerenciadorStorage = GerenciadorStorage;
