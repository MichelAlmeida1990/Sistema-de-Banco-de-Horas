class GerenciadorFirestore {
    constructor(uid) {
        if (!uid) {
            throw new Error('UID é obrigatório para o GerenciadorFirestore');
        }
        this.uid = uid;
        
        // Verificar se o Firestore está disponível globalmente
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
            console.log('🔄 Iniciando salvamento do registro:', registro);
            
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

            // Garantir que temos um ID válido
            if (!registro.id) {
                registro.id = Date.now().toString();
            }

            // Limpar dados antes de salvar
            const dadosLimpos = {
                id: registro.id,
                data: registro.data,
                entrada: registro.entrada,
                saida: registro.saida,
                pausa: registro.pausa || 0,
                feriado: registro.feriado || false,
                fimDeSemana: registro.fimDeSemana || false,
                usarBancoHoras: registro.usarBancoHoras || false,
                descricao: registro.descricao || '',
                uid: this.uid,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Salvar no Firestore usando o ID como documento
            await this.collection.doc(registro.id.toString()).set(dadosLimpos);
            
            console.log('✅ Registro salvo com sucesso:', dadosLimpos);
            return registro.id;
        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            throw new Error(`Erro ao salvar registro: ${error.message}`);
        }
    }

    async listarRegistros() {
        try {
            console.log('🔄 Buscando registros do usuário:', this.uid);
            
            const snapshot = await this.collection
                .where('uid', '==', this.uid)
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

    async atualizarRegistro(id, dados) {
        try {
            console.log('🔄 Atualizando registro:', id);
            
            if (!id || !dados) {
                throw new Error('ID e dados são obrigatórios para atualização');
            }

            // Limpar dados antes de atualizar
            const dadosLimpos = {
                ...dados,
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                uid: this.uid
            };

            // Remover campos undefined ou null
            Object.keys(dadosLimpos).forEach(key => {
                if (dadosLimpos[key] === undefined || dadosLimpos[key] === null) {
                    delete dadosLimpos[key];
                }
            });

            await this.collection.doc(id.toString()).update(dadosLimpos);
            console.log('✅ Registro atualizado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar registro:', error);
            throw new Error(`Erro ao atualizar registro: ${error.message}`);
        }
    }

    async removerRegistro(id) {
        try {
            console.log('🔄 Removendo registro:', id);
            
            if (!id) {
                throw new Error('ID é obrigatório para remoção');
            }

            await this.collection.doc(id.toString()).delete();
            console.log('✅ Registro removido com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover registro:', error);
            throw new Error(`Erro ao remover registro: ${error.message}`);
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
