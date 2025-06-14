// src/js/storage.js - Versão otimizada para plano gratuito
class GerenciadorFirestore {
    constructor(uid) {
        if (!uid) {
            throw new Error('UID é obrigatório para o GerenciadorFirestore');
        }
        this.uid = uid;
        
        // Verificar se o Firestore está disponível
        if (!window.db) {
            throw new Error('Firestore não está inicializado');
        }
        
        // Usar coleção simples para economia de leitura/escrita
        this.collection = window.db.collection('plantoes');
            
        console.log('✅ GerenciadorFirestore inicializado para uid:', uid);
    }

    async salvarRegistro(registro) {
        try {
            console.log('🔄 Iniciando salvamento do registro');
            
            if (!registro) {
                throw new Error('Registro é obrigatório');
            }

            // Validar campos obrigatórios
            const camposObrigatorios = ['data', 'entrada', 'saida'];
            for (const campo of camposObrigatorios) {
                if (!registro[campo]) {
                    throw new Error(`Campo ${campo} é obrigatório`);
                }
            }

            // Criar ID único
            const id = registro.id || Date.now().toString();

            // Preparar dados básicos (economia de armazenamento)
            const dadosBasicos = {
                id: id,
                data: registro.data,
                entrada: registro.entrada,
                saida: registro.saida,
                pausa: registro.pausa || 0,
                feriado: registro.feriado || false,
                fimDeSemana: registro.fimDeSemana || false,
                usarBancoHoras: registro.usarBancoHoras || false,
                descricao: registro.descricao || '',
                uid: this.uid,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Salvar usando set com merge (economia de escritas)
            await this.collection.doc(id).set(dadosBasicos, { merge: true });
            
            console.log('✅ Registro salvo com sucesso');
            return id;
        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            throw new Error(`Erro ao salvar: ${error.message}`);
        }
    }

    async listarRegistros() {
        try {
            console.log('🔄 Buscando registros');
            
            // Consulta otimizada
            const snapshot = await this.collection
                .where('uid', '==', this.uid)
                .orderBy('data', 'desc')
                .get();
                
            const registros = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
            
            console.log(`✅ ${registros.length} registros encontrados`);
            return registros;
        } catch (error) {
            console.error('❌ Erro ao listar registros:', error);
            return [];
        }
    }

    async atualizarRegistro(id, dados) {
        try {
            if (!id || !dados) {
                throw new Error('ID e dados são obrigatórios');
            }

            // Atualizar apenas campos necessários
            const dadosAtualizacao = {
                ...dados,
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.collection.doc(id).update(dadosAtualizacao);
            console.log('✅ Registro atualizado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar:', error);
            throw new Error(`Erro ao atualizar: ${error.message}`);
        }
    }

    async removerRegistro(id) {
        try {
            if (!id) {
                throw new Error('ID é obrigatório');
            }

            await this.collection.doc(id).delete();
            console.log('✅ Registro removido');
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover:', error);
            throw new Error(`Erro ao remover: ${error.message}`);
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

// Exportar para uso global
window.GerenciadorFirestore = GerenciadorFirestore;
window.GerenciadorStorage = GerenciadorStorage;
