// src/js/storage.js - Sistema de Armazenamento v2.0.0

class Storage {
    constructor(uid) {
        if (!uid) {
            throw new Error('UID é obrigatório para inicializar o storage');
        }
        
        this.uid = uid;
        this.db = firebase.firestore();
        this.registrosRef = this.db.collection(`usuarios/${this.uid}/registros`);
        
        console.log('💾 Storage inicializado para usuário:', uid);
    }

    async salvarRegistro(registro) {
        try {
            if (!registro) {
                throw new Error('Registro é obrigatório');
            }

            if (!registro.id) {
                registro.id = Date.now().toString();
            }

            // Validar dados obrigatórios
            const camposObrigatorios = ['data', 'entrada', 'saida', 'valorHora'];
            for (const campo of camposObrigatorios) {
                if (!registro[campo]) {
                    throw new Error(`Campo obrigatório não preenchido: ${campo}`);
                }
            }

            // Salvar no Firestore
            await this.registrosRef.doc(registro.id).set({
                ...registro,
                atualizadoEm: new Date().toISOString()
            });

            console.log('✅ Registro salvo com sucesso:', registro.id);
            return registro;
        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            throw new Error(`Erro ao salvar registro: ${error.message}`);
        }
    }

    async atualizarRegistro(id, dados) {
        try {
            await this.registrosRef.doc(id).update({
                ...dados,
                atualizadoEm: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar registro:', error);
            throw error;
        }
    }

    async removerRegistro(id) {
        try {
            if (!id) {
                throw new Error('ID é obrigatório para remover registro');
            }

            await this.registrosRef.doc(id).delete();
            console.log('🗑️ Registro removido:', id);
        } catch (error) {
            console.error('❌ Erro ao remover registro:', error);
            throw new Error(`Erro ao remover registro: ${error.message}`);
        }
    }

    async listarRegistros() {
        try {
            const snapshot = await this.registrosRef
                .orderBy('data', 'desc')
                .get();

            const registros = [];
            snapshot.forEach(doc => {
                registros.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📋 ${registros.length} registros carregados`);
            return registros;
        } catch (error) {
            console.error('❌ Erro ao listar registros:', error);
            throw new Error(`Erro ao listar registros: ${error.message}`);
        }
    }

    async buscarRegistro(id) {
        try {
            const doc = await this.registrosRef.doc(id).get();
            if (!doc.exists) {
                throw new Error('Registro não encontrado');
            }
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('❌ Erro ao buscar registro:', error);
            throw error;
        }
    }

    async limparRegistros() {
        try {
            const batch = this.db.batch();
            const snapshot = await this.registrosRef.get();

            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log('🧹 Todos os registros foram limpos');
        } catch (error) {
            console.error('❌ Erro ao limpar registros:', error);
            throw new Error(`Erro ao limpar registros: ${error.message}`);
        }
    }
}

// Exportar a classe
window.Storage = Storage;
