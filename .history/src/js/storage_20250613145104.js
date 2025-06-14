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
            
            if (!registro || typeof registro !== 'object') {
                throw new Error('Registro inválido');
            }

            // Validar campos obrigatórios
            const camposObrigatorios = ['data', 'entrada', 'saida', 'uid'];
            for (const campo of camposObrigatorios) {
                if (!registro[campo]) {
                    throw new Error(`Campo ${campo} é obrigatório`);
                }
            }

            // Garantir que temos um ID string
            const id = (registro.id || Date.now()).toString();

            // Preparar dados básicos (garantir tipos corretos)
            const dadosBasicos = {
                id: id,
                data: String(registro.data || ''),
                entrada: String(registro.entrada || ''),
                saida: String(registro.saida || ''),
                pausa: Number(registro.pausa || 0),
                feriado: Boolean(registro.feriado),
                fimDeSemana: Boolean(registro.fimDeSemana),
                usarBancoHoras: Boolean(registro.usarBancoHoras),
                descricao: String(registro.descricao || ''),
                uid: String(registro.uid),
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Salvar usando set com merge
            await this.collection.doc(id).set(dadosBasicos, { merge: true });
            
            console.log('✅ Registro salvo com sucesso:', dadosBasicos);
            return id;
        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            throw new Error(`Erro ao salvar: ${error.message}`);
        }
    }

    async listarRegistros() {
        try {
            console.log('🔄 Buscando registros');
            
            const snapshot = await this.collection
                .where('uid', '==', this.uid)
                .orderBy('criadoEm', 'desc')
                .get();
                
            const registros = snapshot.docs.map(doc => {
                const dados = doc.data();
                return {
                    ...dados,
                    id: doc.id,
                    data: String(dados.data || ''),
                    entrada: String(dados.entrada || ''),
                    saida: String(dados.saida || ''),
                    pausa: Number(dados.pausa || 0),
                    feriado: Boolean(dados.feriado),
                    fimDeSemana: Boolean(dados.fimDeSemana),
                    usarBancoHoras: Boolean(dados.usarBancoHoras),
                    descricao: String(dados.descricao || '')
                };
            });
            
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

            // Garantir tipos corretos
            const dadosAtualizacao = {
                data: String(dados.data || ''),
                entrada: String(dados.entrada || ''),
                saida: String(dados.saida || ''),
                pausa: Number(dados.pausa || 0),
                feriado: Boolean(dados.feriado),
                fimDeSemana: Boolean(dados.fimDeSemana),
                usarBancoHoras: Boolean(dados.usarBancoHoras),
                descricao: String(dados.descricao || ''),
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.collection.doc(id.toString()).update(dadosAtualizacao);
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

            await this.collection.doc(id.toString()).delete();
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
