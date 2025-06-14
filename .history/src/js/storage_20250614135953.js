// src/js/storage.js - Gerenciador de Armazenamento v1.0.0

class Storage {
    constructor(uid) {
        this.uid = uid;
        this.db = firebase.firestore();
        this.registrosRef = this.db.collection(`usuarios/${this.uid}/registros`);
    }

    async salvarRegistro(registro) {
        try {
            if (!registro.id) {
                registro.id = Date.now().toString();
            }

            await this.registrosRef.doc(registro.id).set({
                ...registro,
                atualizadoEm: new Date().toISOString()
            });

            return registro;
        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            throw error;
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
            await this.registrosRef.doc(id).delete();
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover registro:', error);
            throw error;
        }
    }

    async listarRegistros() {
        try {
            const snapshot = await this.registrosRef
                .orderBy('data', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ Erro ao listar registros:', error);
            throw error;
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
            
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar registros:', error);
            throw error;
        }
    }
}

// Exportar a classe
window.Storage = Storage;
