// src/js/storage.js - Gerenciador de Storage v3.1.0
class GerenciadorStorage {
    constructor() {
        console.log('💾 Gerenciador de Storage inicializado - v3.1.0');
        this.CHAVE_REGISTROS = 'bancoHoras_registros';
        this.CHAVE_CONFIGURACOES = 'bancoHoras_config';
        this.CHAVE_BACKUP = 'bancoHoras_backup';
        this.versao = '3.1.0';
        
        // Verificar se localStorage está disponível
        this.storageDisponivel = this.verificarStorage();
        
        if (!this.storageDisponivel) {
            console.warn('⚠️ localStorage não disponível, usando storage temporário');
            this.storageTemporario = {
                registros: [],
                configuracoes: this.obterConfiguracoesPadrao()
            };
        }
        
        // Migrar dados se necessário
        this.migrarDadosSeNecessario();
    }

    /**
     * Verifica se localStorage está disponível
     * @returns {boolean} True se disponível
     */
    verificarStorage() {
        try {
            const teste = 'teste_storage';
            localStorage.setItem(teste, 'teste');
            localStorage.removeItem(teste);
            return true;
        } catch (error) {
            console.error('❌ localStorage não disponível:', error);
            return false;
        }
    }

    /**
     * Salva registros no storage
     * @param {Array} registros - Array de registros
     * @returns {boolean} True se salvou com sucesso
     */
    salvarRegistros(registros) {
        try {
            if (!Array.isArray(registros)) {
                throw new Error('Registros deve ser um array');
            }

            const dados = {
                registros: registros,
                versao: this.versao,
                timestamp: new Date().toISOString(),
                total: registros.length
            };

            if (this.storageDisponivel) {
                localStorage.setItem(this.CHAVE_REGISTROS, JSON.stringify(dados));
            } else {
                this.storageTemporario.registros = registros;
            }

            console.log(`💾 ${registros.length} registros salvos com sucesso`);
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar registros:', error);
            return false;
        }
    }

    /**
     * Carrega registros do storage
     * @returns {Array} Array de registros
     */
    carregarRegistros() {
        try {
            let dadosString;
            
            if (this.storageDisponivel) {
                dadosString = localStorage.getItem(this.CHAVE_REGISTROS);
            } else {
                return this.storageTemporario.registros || [];
            }

            if (!dadosString) {
                console.log('📝 Nenhum registro encontrado, iniciando com array vazio');
                return [];
            }

            const dados = JSON.parse(dadosString);
            
            // Verificar estrutura dos dados
            if (!dados.registros || !Array.isArray(dados.registros)) {
                console.warn('⚠️ Estrutura de dados inválida, iniciando com array vazio');
                return [];
            }

            console.log(`📂 ${dados.registros.length} registros carregados do storage`);
            return dados.registros;

        } catch (error) {
            console.error('❌ Erro ao carregar registros:', error);
            return [];
        }
    }

    /**
     * Adiciona um novo registro
     * @param {Object} novoRegistro - Dados do novo registro
     * @returns {boolean} True se adicionou com sucesso
     */
    adicionarRegistro(novoRegistro) {
        try {
            const registros = this.carregarRegistros();
            
            // Gerar ID único
            novoRegistro.id = this.gerarId();
            novoRegistro.criadoEm = new Date().toISOString();
            
            registros.push(novoRegistro);
            
            const sucesso = this.salvarRegistros(registros);
            
            if (sucesso) {
                console.log('✅ Registro adicionado:', novoRegistro);
            }
            
            return sucesso;

        } catch (error) {
            console.error('❌ Erro ao adicionar registro:', error);
            return false;
        }
    }

    /**
     * Atualiza um registro existente
     * @param {string} id - ID do registro
     * @param {Object} dadosAtualizados - Novos dados
     * @returns {boolean} True se atualizou com sucesso
     */
    atualizarRegistro(id, dadosAtualizados) {
        try {
            const registros = this.carregarRegistros();
            const indice = registros.findIndex(r => r.id === id);
            
            if (indice === -1) {
                console.warn('⚠️ Registro não encontrado para atualização:', id);
                return false;
            }

            // Manter dados originais importantes
            dadosAtualizados.id = id;
            dadosAtualizados.criadoEm = registros[indice].criadoEm;
            dadosAtualizados.atualizadoEm = new Date().toISOString();
            
            registros[indice] = { ...registros[indice], ...dadosAtualizados };
            
            const sucesso = this.salvarRegistros(registros);
            
            if (sucesso) {
                console.log('✅ Registro atualizado:', registros[indice]);
            }
            
            return sucesso;

        } catch (error) {
            console.error('❌ Erro ao atualizar registro:', error);
            return false;
        }
    }

    /**
     * Remove um registro
     * @param {string} id - ID do registro
     * @returns {boolean} True se removeu com sucesso
     */
    removerRegistro(id) {
        try {
            const registros = this.carregarRegistros();
            const indiceOriginal = registros.length;
            const registrosFiltrados = registros.filter(r => r.id !== id);
            
            if (registrosFiltrados.length === indiceOriginal) {
                console.warn('⚠️ Registro não encontrado para remoção:', id);
                return false;
            }

            const sucesso = this.salvarRegistros(registrosFiltrados);
            
            if (sucesso) {
                console.log('🗑️ Registro removido:', id);
            }
            
            return sucesso;

        } catch (error) {
            console.error('❌ Erro ao remover registro:', error);
            return false;
        }
    }

    /**
     * Busca registros por critérios
     * @param {Object} criterios - Critérios de busca
     * @returns {Array} Registros encontrados
     */
    buscarRegistros(criterios = {}) {
        try {
            const registros = this.carregarRegistros();
            
            if (Object.keys(criterios).length === 0) {
                return registros;
            }

            const resultados = registros.filter(registro => {
                return Object.keys(criterios).every(chave => {
                    const valorCriterio = criterios[chave];
                    const valorRegistro = registro[chave];
                    
                    if (typeof valorCriterio === 'string') {
                        return valorRegistro && valorRegistro.toLowerCase().includes(valorCriterio.toLowerCase());
                    }
                    
                    return valorRegistro === valorCriterio;
                });
            });

            console.log(`🔍 Busca realizada: ${resultados.length} registros encontrados`);
            return resultados;

        } catch (error) {
            console.error('❌ Erro na busca:', error);
            return [];
        }
    }

    /**
     * Salva configurações
     * @param {Object} configuracoes - Configurações para salvar
     * @returns {boolean} True se salvou com sucesso
     */
    salvarConfiguracoes(configuracoes) {
        try {
            const dadosConfig = {
                ...configuracoes,
                versao: this.versao,
                atualizadoEm: new Date().toISOString()
            };

            if (this.storageDisponivel) {
                localStorage.setItem(this.CHAVE_CONFIGURACOES, JSON.stringify(dadosConfig));
            } else {
                this.storageTemporario.configuracoes = dadosConfig;
            }

            console.log('⚙️ Configurações salvas:', configuracoes);
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            return false;
        }
    }

    /**
     * Carrega configurações
     * @returns {Object} Configurações
     */
    carregarConfiguracoes() {
        try {
            let dadosString;
            
            if (this.storageDisponivel) {
                dadosString = localStorage.getItem(this.CHAVE_CONFIGURACOES);
            } else {
                return this.storageTemporario.configuracoes || this.obterConfiguracoesPadrao();
            }

            if (!dadosString) {
                console.log('⚙️ Configurações não encontradas, usando padrões');
                return this.obterConfiguracoesPadrao();
            }

            const configuracoes = JSON.parse(dadosString);
            console.log('⚙️ Configurações carregadas');
            return configuracoes;

        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            return this.obterConfiguracoesPadrao();
        }
    }

    /**
     * Obtém configurações padrão
     * @returns {Object} Configurações padrão
     */
    obterConfiguracoesPadrao() {
        return {
            valorHoraPadrao: 25.00,
            bonusPercentual: 90,
            horasPadraoDia: 8,
            tema: 'claro',
            notificacoes: true,
            autoSalvar: true,
            formatoData: 'dd/mm/yyyy',
            formatoHora: '24h',
            moeda: 'BRL',
            versao: this.versao,
            criadoEm: new Date().toISOString()
        };
    }

    /**
     * Cria backup dos dados
     * @returns {Object|null} Dados do backup ou null se erro
     */
    criarBackup() {
        try {
            const registros = this.carregarRegistros();
            const configuracoes = this.carregarConfiguracoes();
            
            const backup = {
                registros: registros,
                configuracoes: configuracoes,
                versao: this.versao,
                criadoEm: new Date().toISOString(),
                totalRegistros: registros.length
            };

            if (this.storageDisponivel) {
                localStorage.setItem(this.CHAVE_BACKUP, JSON.stringify(backup));
            }

            console.log('💾 Backup criado com sucesso');
            return backup;

        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            return null;
        }
    }

    /**
     * Restaura dados do backup
     * @param {Object} dadosBackup - Dados do backup
     * @returns {boolean} True se restaurou com sucesso
     */
    restaurarBackup(dadosBackup) {
        try {
            if (!dadosBackup || !dadosBackup.registros || !dadosBackup.configuracoes) {
                throw new Error('Dados de backup inválidos');
            }

            const sucessoRegistros = this.salvarRegistros(dadosBackup.registros);
            const sucessoConfig = this.salvarConfiguracoes(dadosBackup.configuracoes);

            if (sucessoRegistros && sucessoConfig) {
                console.log('✅ Backup restaurado com sucesso');
                return true;
            } else {
                throw new Error('Falha ao salvar dados do backup');
            }

        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            return false;
        }
    }

    /**
     * Exporta dados para JSON
     * @returns {string} Dados em formato JSON
     */
    exportarDados() {
        try {
            const backup = this.criarBackup();
            return JSON.stringify(backup, null, 2);

        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            return null;
        }
    }

    /**
     * Importa dados de JSON
     * @param {string} dadosJson - Dados em formato JSON
     * @returns {boolean} True se importou com sucesso
     */
    importarDados(dadosJson) {
        try {
            const dados = JSON.parse(dadosJson);
            return this.restaurarBackup(dados);

        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }

    /**
     * Limpa todos os dados
     * @returns {boolean} True se limpou com sucesso
     */
    limparTodosDados() {
        try {
            if (this.storageDisponivel) {
                localStorage.removeItem(this.CHAVE_REGISTROS);
                localStorage.removeItem(this.CHAVE_CONFIGURACOES);
                localStorage.removeItem(this.CHAVE_BACKUP);
            } else {
                this.storageTemporario = {
                    registros: [],
                    configuracoes: this.obterConfiguracoesPadrao()
                };
            }

            console.log('🧹 Todos os dados foram limpos');
            return true;

        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
            return false;
        }
    }

    /**
     * Gera ID único
     * @returns {string} ID único
     */
    gerarId() {
        return 'reg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Migra dados de versões anteriores se necessário
     */
    migrarDadosSeNecessario() {
        try {
            if (!this.storageDisponivel) return;

            // Verificar se existem dados antigos
            const dadosAntigos = localStorage.getItem('registrosBancoHoras'); // Chave antiga
            
            if (dadosAntigos && !localStorage.getItem(this.CHAVE_REGISTROS)) {
                console.log('🔄 Migrando dados da versão anterior...');
                
                const registrosAntigos = JSON.parse(dadosAntigos);
                
                // Adicionar IDs se não existirem
                const registrosMigrados = registrosAntigos.map(registro => ({
                    ...registro,
                    id: registro.id || this.gerarId(),
                    criadoEm: registro.criadoEm || new Date().toISOString()
                }));
                
                this.salvarRegistros(registrosMigrados);
                
                // Remover dados antigos
                localStorage.removeItem('registrosBancoHoras');
                
                console.log('✅ Migração concluída');
            }

        } catch (error) {
            console.error('❌ Erro na migração:', error);
        }
    }

    /**
     * Obtém estatísticas do storage
     * @returns {Object} Estatísticas
     */
    obterEstatisticasStorage() {
        try {
            const registros = this.carregarRegistros();
            const configuracoes = this.carregarConfiguracoes();
            
            let tamanhoStorage = 0;
            
            if (this.storageDisponivel) {
                const dadosRegistros = localStorage.getItem(this.CHAVE_REGISTROS);
                const dadosConfig = localStorage.getItem(this.CHAVE_CONFIGURACOES);
                
                tamanhoStorage = (dadosRegistros?.length || 0) + (dadosConfig?.length || 0);
            }

            return {
                totalRegistros: registros.length,
                tamanhoStorage: tamanhoStorage,
                storageDisponivel: this.storageDisponivel,
                versao: this.versao,
                ultimaAtualizacao: configuracoes.atualizadoEm || 'N/A'
            };

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                totalRegistros: 0,
                tamanhoStorage: 0,
                storageDisponivel: false,
                versao: this.versao,
                ultimaAtualizacao: 'N/A'
            };
        }
    }
}

console.log('💾 Gerenciador de Storage carregado - v3.1.0');
