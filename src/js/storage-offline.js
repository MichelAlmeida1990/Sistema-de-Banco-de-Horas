// src/js/storage-offline.js - Sistema de Armazenamento Offline v1.0.0

class StorageOffline {
    constructor(uid) {
        this.uid = uid || 'offline-user';
        this.chaveRegistros = `banco-horas-registros-${this.uid}`;
        console.log('📱 Storage offline inicializado para usuário:', this.uid);
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

            // Carregar registros existentes
            const registros = this.listarRegistrosSync();
            
            // Adicionar metadados
            const dadosParaSalvar = {
                ...registro,
                uid: this.uid,
                atualizadoEm: new Date().toISOString()
            };

            // Verificar se é atualização ou novo registro
            const index = registros.findIndex(r => r.id === registro.id);
            if (index !== -1) {
                registros[index] = dadosParaSalvar;
            } else {
                registros.push(dadosParaSalvar);
            }

            // Salvar no localStorage
            localStorage.setItem(this.chaveRegistros, JSON.stringify(registros));

            console.log('✅ Registro salvo offline:', registro.id);
            return registro;
        } catch (error) {
            console.error('❌ Erro ao salvar registro offline:', error);
            throw new Error(`Erro ao salvar registro: ${error.message}`);
        }
    }

    async atualizarRegistro(id, dados) {
        try {
            const registros = this.listarRegistrosSync();
            const index = registros.findIndex(r => r.id === id);
            
            if (index === -1) {
                throw new Error('Registro não encontrado');
            }

            registros[index] = {
                ...registros[index],
                ...dados,
                atualizadoEm: new Date().toISOString()
            };

            localStorage.setItem(this.chaveRegistros, JSON.stringify(registros));
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar registro offline:', error);
            throw error;
        }
    }

    async listarRegistros() {
        try {
            const registros = this.listarRegistrosSync();
            console.log(`📋 ${registros.length} registros carregados (offline)`);
            return registros;
        } catch (error) {
            console.error('❌ Erro ao listar registros offline:', error);
            throw new Error(`Erro ao listar registros: ${error.message}`);
        }
    }

    listarRegistrosSync() {
        try {
            const dados = localStorage.getItem(this.chaveRegistros);
            if (!dados) return [];

            const registros = JSON.parse(dados);
            if (!Array.isArray(registros)) return [];

            // Garantir que campos críticos existam
            return registros.map(registro => ({
                ...registro,
                valorHora: registro.valorHora || 0,
                pausa: registro.pausa || 60,
                fimDeSemana: registro.fimDeSemana || false,
                feriado: registro.feriado || false
            })).sort((a, b) => new Date(b.data) - new Date(a.data));
        } catch (error) {
            console.error('❌ Erro ao parsear registros offline:', error);
            return [];
        }
    }

    async buscarRegistro(id) {
        try {
            const registros = this.listarRegistrosSync();
            const registro = registros.find(r => r.id === id);
            
            if (!registro) {
                throw new Error('Registro não encontrado');
            }

            return registro;
        } catch (error) {
            console.error('❌ Erro ao buscar registro offline:', error);
            throw error;
        }
    }

    async removerRegistro(id) {
        try {
            if (!id) {
                throw new Error('ID é obrigatório para remover registro');
            }

            const registros = this.listarRegistrosSync();
            const index = registros.findIndex(r => r.id === id);
            
            if (index === -1) {
                throw new Error('Registro não encontrado');
            }

            // Remover o registro
            registros.splice(index, 1);
            
            // Salvar de volta
            localStorage.setItem(this.chaveRegistros, JSON.stringify(registros));
            
            console.log('🗑️ Registro removido (offline):', id);
        } catch (error) {
            console.error('❌ Erro ao remover registro offline:', error);
            throw new Error(`Erro ao remover registro: ${error.message}`);
        }
    }

    async limparRegistros() {
        try {
            localStorage.removeItem(this.chaveRegistros);
            console.log('🧹 Todos os registros foram limpos (offline)');
        } catch (error) {
            console.error('❌ Erro ao limpar registros offline:', error);
            throw new Error(`Erro ao limpar registros: ${error.message}`);
        }
    }

    // Método para migrar dados para Firebase quando voltar online
    async sincronizarComFirebase(storageOnline) {
        try {
            const registrosOffline = this.listarRegistrosSync();
            
            if (registrosOffline.length === 0) {
                console.log('📱 Nenhum registro offline para sincronizar');
                return;
            }

            console.log(`🔄 Sincronizando ${registrosOffline.length} registros offline...`);
            
            for (const registro of registrosOffline) {
                try {
                    await storageOnline.salvarRegistro(registro);
                    console.log(`✅ Registro ${registro.id} sincronizado`);
                } catch (error) {
                    console.error(`❌ Erro ao sincronizar registro ${registro.id}:`, error);
                }
            }

            console.log('✅ Sincronização concluída');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
        }
    }
}

// Exportar a classe
window.StorageOffline = StorageOffline; 