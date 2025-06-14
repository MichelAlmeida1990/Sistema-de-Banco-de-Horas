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

            // Validar autenticação
            if (!window.auth.currentUser) {
                throw new Error('Usuário não está autenticado');
            }

            // Validar UID
            if (registro.uid !== this.uid) {
                throw new Error('UID do registro não corresponde ao usuário atual');
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

            // Adicionar metadados
            const dadosParaSalvar = {
                ...registro,
                uid: this.uid,
                atualizadoEm: new Date().toISOString(),
                atualizadoPor: window.auth.currentUser.email
            };

            // Salvar no Firestore
            await this.registrosRef.doc(registro.id).set(dadosParaSalvar);

            console.log('✅ Registro salvo com sucesso:', registro.id);
            return registro;
        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            
            // Tratar erros específicos
            if (error.code === 'permission-denied') {
                throw new Error('Sem permissão para salvar registro. Por favor, faça login novamente.');
            }
            
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
            // Verificar autenticação
            if (!window.auth.currentUser) {
                throw new Error('Usuário não está autenticado');
            }

            if (!id) {
                throw new Error('ID é obrigatório para remover registro');
            }

            // Verificar se o registro existe e pertence ao usuário
            const doc = await this.registrosRef.doc(id).get();
            if (!doc.exists) {
                throw new Error('Registro não encontrado');
            }

            if (doc.data().uid !== this.uid) {
                throw new Error('Sem permissão para remover este registro');
            }

            await this.registrosRef.doc(id).delete();
            console.log('🗑️ Registro removido:', id);
        } catch (error) {
            console.error('❌ Erro ao remover registro:', error);
            
            // Tratar erros específicos
            if (error.code === 'permission-denied') {
                throw new Error('Sem permissão para remover registro. Por favor, faça login novamente.');
            }
            
            throw new Error(`Erro ao remover registro: ${error.message}`);
        }
    }

    async listarRegistros() {
        try {
            // Verificar autenticação
            if (!window.auth.currentUser) {
                throw new Error('Usuário não está autenticado');
            }

            // Buscar registros ordenados por data
            const snapshot = await this.registrosRef
                .where('uid', '==', this.uid)
                .orderBy('data', 'desc')
                .get();

            const registros = [];
            snapshot.forEach(doc => {
                registros.push({ 
                    id: doc.id, 
                    ...doc.data(),
                    // Garantir que campos críticos existam
                    valorHora: doc.data().valorHora || 0,
                    pausa: doc.data().pausa || 60,
                    fimDeSemana: doc.data().fimDeSemana || false,
                    feriado: doc.data().feriado || false
                });
            });

            console.log(`📋 ${registros.length} registros carregados`);
            return registros;
        } catch (error) {
            console.error('❌ Erro ao listar registros:', error);
            
            // Tratar erros específicos
            if (error.code === 'permission-denied') {
                throw new Error('Sem permissão para acessar registros. Por favor, faça login novamente.');
            }
            
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
            // Verificar autenticação
            if (!window.auth.currentUser) {
                throw new Error('Usuário não está autenticado');
            }

            const batch = this.db.batch();
            const snapshot = await this.registrosRef
                .where('uid', '==', this.uid)
                .get();

            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log('🧹 Todos os registros foram limpos');
        } catch (error) {
            console.error('❌ Erro ao limpar registros:', error);
            
            // Tratar erros específicos
            if (error.code === 'permission-denied') {
                throw new Error('Sem permissão para limpar registros. Por favor, faça login novamente.');
            }
            
            throw new Error(`Erro ao limpar registros: ${error.message}`);
        }
    }
}

// Exportar a classe
window.Storage = Storage;
