// src/js/storage.js - Gerenciador de Storage v4.0.0
class GerenciadorStorage {
    constructor() {
        console.log('💾 Gerenciador de Storage inicializado - v4.0.0');
        this.CHAVE_REGISTROS = 'bancoHoras_registros';
        this.CHAVE_CONFIGURACOES = 'bancoHoras_config';
        this.CHAVE_FINANCEIRO = 'configuracaoFinanceira'; // ✅ Compatibilidade com app.js
        this.CHAVE_BACKUP = 'bancoHoras_backup';
        this.versao = '4.0.0';
        
        // Cache para melhor performance
        this.cache = {
            registros: null,
            configuracoes: null,
            ultimaAtualizacao: null
        };
        
        // Verificar se localStorage está disponível
        this.storageDisponivel = this.verificarStorage();
        
        if (!this.storageDisponivel) {
            console.warn('⚠️ localStorage não disponível, usando storage temporário');
            this.storageTemporario = {
                registros: [],
                configuracoes: this.obterConfiguracoesPadrao(),
                financeiro: { valorHora: 25.00 }
            };
        }
        
        // Migrar dados se necessário
        this.migrarDadosSeNecessario();
        
        // Configurar limpeza automática de cache
        this.configurarLimpezaCache();
    }

    /**
     * ✅ MELHORADO - Verifica se localStorage está disponível
     * @returns {boolean} True se disponível
     */
    verificarStorage() {
        try {
            const teste = 'teste_storage_' + Date.now();
            localStorage.setItem(teste, 'teste');
            const valor = localStorage.getItem(teste);
            localStorage.removeItem(teste);
            return valor === 'teste';
        } catch (error) {
            console.error('❌ localStorage não disponível:', error);
            return false;
        }
    }

    /**
     * ✅ MELHORADO - Salva registros no storage com validação
     * @param {Array} registros - Array de registros
     * @returns {boolean} True se salvou com sucesso
     */
    salvarRegistros(registros) {
        try {
            // Validação rigorosa
            if (!Array.isArray(registros)) {
                throw new Error('Registros deve ser um array');
            }

            // Validar cada registro
            const registrosValidados = registros.map(registro => this.validarRegistro(registro));

            const dados = {
                registros: registrosValidados,
                versao: this.versao,
                timestamp: new Date().toISOString(),
                total: registrosValidados.length,
                checksum: this.calcularChecksum(registrosValidados)
            };

            if (this.storageDisponivel) {
                const dadosString = JSON.stringify(dados);
                
                // Verificar limite de storage
                if (dadosString.length > 5000000) { // 5MB
                    console.warn('⚠️ Dados muito grandes, considerando compressão');
                }
                
                localStorage.setItem(this.CHAVE_REGISTROS, dadosString);
            } else {
                this.storageTemporario.registros = registrosValidados;
            }

            // Atualizar cache
            this.cache.registros = registrosValidados;
            this.cache.ultimaAtualizacao = new Date();

            console.log(`💾 ${registrosValidados.length} registros salvos com sucesso`);
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar registros:', error);
            return false;
        }
    }

    /**
     * ✅ MELHORADO - Carrega registros do storage com cache
     * @returns {Array} Array de registros
     */
    carregarRegistros() {
        try {
            // Verificar cache primeiro
            if (this.cache.registros && this.cacheValido()) {
                console.log('📋 Registros carregados do cache');
                return this.cache.registros;
            }

            let dadosString;
            
            if (this.storageDisponivel) {
                dadosString = localStorage.getItem(this.CHAVE_REGISTROS);
            } else {
                const registros = this.storageTemporario.registros || [];
                this.cache.registros = registros;
                return registros;
            }

            if (!dadosString) {
                console.log('📝 Nenhum registro encontrado, iniciando com array vazio');
                this.cache.registros = [];
                return [];
            }

            const dados = JSON.parse(dadosString);
            
            // Verificar integridade dos dados
            if (!this.verificarIntegridade(dados)) {
                console.warn('⚠️ Integridade dos dados comprometida, tentando recuperar...');
                return this.tentarRecuperarDados();
            }

            // Verificar estrutura dos dados
            if (!dados.registros || !Array.isArray(dados.registros)) {
                console.warn('⚠️ Estrutura de dados inválida, iniciando com array vazio');
                this.cache.registros = [];
                return [];
            }

            // Atualizar cache
            this.cache.registros = dados.registros;
            this.cache.ultimaAtualizacao = new Date();

            console.log(`📂 ${dados.registros.length} registros carregados do storage`);
            return dados.registros;

        } catch (error) {
            console.error('❌ Erro ao carregar registros:', error);
            return this.tentarRecuperarDados();
        }
    }

    /**
     * ✅ NOVO - Validar registro individual
     * @param {Object} registro - Registro para validar
     * @returns {Object} Registro validado
     */
    validarRegistro(registro) {
        const registroValidado = {
            id: registro.id || this.gerarId(),
            data: registro.data || '',
            entrada: registro.entrada || '',
            saida: registro.saida || '',
            pausa: parseInt(registro.pausa) || 0,
            horasExtras: parseFloat(registro.horasExtras) || 0,
            feriado: Boolean(registro.feriado),
            fimDeSemana: Boolean(registro.fimDeSemana),
            usarBancoHoras: Boolean(registro.usarBancoHoras),
            descricao: registro.descricao || '',
            criadoEm: registro.criadoEm || new Date().toISOString(),
            atualizadoEm: registro.atualizadoEm || registro.criadoEm || new Date().toISOString()
        };

        return registroValidado;
    }

    /**
     * ✅ NOVO - Calcular checksum para integridade
     * @param {Array} dados - Dados para calcular checksum
     * @returns {string} Checksum
     */
    calcularChecksum(dados) {
        try {
            const dadosString = JSON.stringify(dados);
            let hash = 0;
            for (let i = 0; i < dadosString.length; i++) {
                const char = dadosString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Converter para 32bit
            }
            return Math.abs(hash).toString(16);
        } catch (error) {
            return 'erro';
        }
    }

    /**
     * ✅ NOVO - Verificar integridade dos dados
     * @param {Object} dados - Dados para verificar
     * @returns {boolean} True se íntegro
     */
    verificarIntegridade(dados) {
        try {
            if (!dados.checksum || !dados.registros) {
                return true; // Dados antigos sem checksum
            }
            
            const checksumCalculado = this.calcularChecksum(dados.registros);
            return checksumCalculado === dados.checksum;
        } catch (error) {
            return false;
        }
    }

    /**
     * ✅ NOVO - Tentar recuperar dados corrompidos
     * @returns {Array} Registros recuperados ou array vazio
     */
    tentarRecuperarDados() {
        try {
            console.log('🔧 Tentando recuperar dados do backup...');
            
            if (this.storageDisponivel) {
                const backup = localStorage.getItem(this.CHAVE_BACKUP);
                if (backup) {
                    const dadosBackup = JSON.parse(backup);
                    if (dadosBackup.registros && Array.isArray(dadosBackup.registros)) {
                        console.log('✅ Dados recuperados do backup');
                        return dadosBackup.registros;
                    }
                }
            }
            
            console.warn('⚠️ Não foi possível recuperar dados, iniciando limpo');
            return [];
            
        } catch (error) {
            console.error('❌ Erro na recuperação:', error);
            return [];
        }
    }

    /**
     * ✅ NOVO - Verificar se cache é válido
     * @returns {boolean} True se cache é válido
     */
    cacheValido() {
        if (!this.cache.ultimaAtualizacao) return false;
        
        const agora = new Date();
        const diferenca = agora - this.cache.ultimaAtualizacao;
        const CACHE_VALIDO_MS = 30000; // 30 segundos
        
        return diferenca < CACHE_VALIDO_MS;
    }

    /**
     * ✅ NOVO - Configurar limpeza automática de cache
     */
    configurarLimpezaCache() {
        // Limpar cache a cada 5 minutos
        setInterval(() => {
            if (!this.cacheValido()) {
                this.limparCache();
            }
        }, 300000); // 5 minutos
    }

    /**
     * ✅ NOVO - Limpar cache
     */
    limparCache() {
        this.cache = {
            registros: null,
            configuracoes: null,
            ultimaAtualizacao: null
        };
        console.log('🧹 Cache limpo');
    }

    /**
     * ✅ MELHORADO - Adiciona um novo registro com validação
     * @param {Object} novoRegistro - Dados do novo registro
     * @returns {boolean} True se adicionou com sucesso
     */
    adicionarRegistro(novoRegistro) {
        try {
            const registros = this.carregarRegistros();
            
            // Validar e preparar registro
            const registro = this.validarRegistro({
                ...novoRegistro,
                id: this.gerarId(),
                criadoEm: new Date().toISOString()
            });
            
            registros.push(registro);
            
            const sucesso = this.salvarRegistros(registros);
            
            if (sucesso) {
                console.log('✅ Registro adicionado:', registro);
                this.criarBackupAutomatico();
            }
            
            return sucesso;

        } catch (error) {
            console.error('❌ Erro ao adicionar registro:', error);
            return false;
        }
    }

    /**
     * ✅ MELHORADO - Atualiza um registro existente
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

            // Preparar dados atualizados
            const registroAtualizado = this.validarRegistro({
                ...registros[indice],
                ...dadosAtualizados,
                id: id,
                atualizadoEm: new Date().toISOString()
            });
            
            registros[indice] = registroAtualizado;
            
            const sucesso = this.salvarRegistros(registros);
            
            if (sucesso) {
                console.log('✅ Registro atualizado:', registroAtualizado);
                this.criarBackupAutomatico();
            }
            
            return sucesso;

        } catch (error) {
            console.error('❌ Erro ao atualizar registro:', error);
            return false;
        }
    }

    /**
     * ✅ MELHORADO - Remove um registro
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
                this.criarBackupAutomatico();
            }
            
            return sucesso;

        } catch (error) {
            console.error('❌ Erro ao remover registro:', error);
            return false;
        }
    }

    /**
     * ✅ MELHORADO - Busca registros por critérios
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
                    
                    // Busca por data
                    if (chave === 'data' && typeof valorCriterio === 'object') {
                        if (valorCriterio.inicio && valorCriterio.fim) {
                            return valorRegistro >= valorCriterio.inicio && valorRegistro <= valorCriterio.fim;
                        }
                    }
                    
                    // Busca por texto
                    if (typeof valorCriterio === 'string') {
                        return valorRegistro && valorRegistro.toLowerCase().includes(valorCriterio.toLowerCase());
                    }
                    
                    // Busca exata
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
     * ✅ MELHORADO - Salva configurações financeiras (compatibilidade)
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
                
                // ✅ COMPATIBILIDADE: Salvar também na chave que o app.js usa
                if (configuracoes.valorHora) {
                    const configFinanceira = {
                        valorHora: configuracoes.valorHora,
                        dataAtualizacao: new Date().toISOString()
                    };
                    localStorage.setItem(this.CHAVE_FINANCEIRO, JSON.stringify(configFinanceira));
                }
            } else {
                this.storageTemporario.configuracoes = dadosConfig;
                if (configuracoes.valorHora) {
                    this.storageTemporario.financeiro = { valorHora: configuracoes.valorHora };
                }
            }

            // Atualizar cache
            this.cache.configuracoes = dadosConfig;

            console.log('⚙️ Configurações salvas:', configuracoes);
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            return false;
        }
    }

    /**
     * ✅ MELHORADO - Carrega configurações
     * @returns {Object} Configurações
     */
    carregarConfiguracoes() {
        try {
            // Verificar cache primeiro
            if (this.cache.configuracoes && this.cacheValido()) {
                return this.cache.configuracoes;
            }

            let dadosString;
            
            if (this.storageDisponivel) {
                dadosString = localStorage.getItem(this.CHAVE_CONFIGURACOES);
                
                // ✅ COMPATIBILIDADE: Verificar também a chave financeira
                if (!dadosString) {
                    const configFinanceira = localStorage.getItem(this.CHAVE_FINANCEIRO);
                    if (configFinanceira) {
                        const dadosFinanceiros = JSON.parse(configFinanceira);
                        const configPadrao = this.obterConfiguracoesPadrao();
                        configPadrao.valorHoraPadrao = dadosFinanceiros.valorHora || 25.00;
                        this.cache.configuracoes = configPadrao;
                        return configPadrao;
                    }
                }
            } else {
                const config = this.storageTemporario.configuracoes || this.obterConfiguracoesPadrao();
                this.cache.configuracoes = config;
                return config;
            }

            if (!dadosString) {
                console.log('⚙️ Configurações não encontradas, usando padrões');
                const configPadrao = this.obterConfiguracoesPadrao();
                this.cache.configuracoes = configPadrao;
                return configPadrao;
            }

            const configuracoes = JSON.parse(dadosString);
            this.cache.configuracoes = configuracoes;
            
            console.log('⚙️ Configurações carregadas');
            return configuracoes;

        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            const configPadrao = this.obterConfiguracoesPadrao();
            this.cache.configuracoes = configPadrao;
            return configPadrao;
        }
    }

    /**
     * ✅ MELHORADO - Obtém configurações padrão
     * @returns {Object} Configurações padrão
     */
    obterConfiguracoesPadrao() {
        return {
            valorHoraPadrao: 25.00,
            bonusPercentual: 90,
            multiplicadorBonus: 1.9, // ✅ NOVO: Para cálculo correto
            horasPadraoDia: 8,
            tema: 'claro',
            notificacoes: true,
            autoSalvar: true,
            formatoData: 'dd/mm/yyyy',
            formatoHora: '24h',
            moeda: 'BRL',
            simboloMoeda: 'R$',
            versao: this.versao,
            criadoEm: new Date().toISOString()
        };
    }

    /**
     * ✅ MELHORADO - Cria backup dos dados
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
                totalRegistros: registros.length,
                checksum: this.calcularChecksum(registros)
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
     * ✅ NOVO - Criar backup automático
     */
    criarBackupAutomatico() {
        try {
            // Criar backup a cada 10 registros ou a cada hora
            const registros = this.carregarRegistros();
            const ultimoBackup = this.obterUltimoBackup();
            
            const deveBackup = !ultimoBackup || 
                             registros.length % 10 === 0 || 
                             (new Date() - new Date(ultimoBackup.criadoEm)) > 3600000; // 1 hora
            
            if (deveBackup) {
                this.criarBackup();
                console.log('💾 Backup automático criado');
            }
            
        } catch (error) {
            console.error('❌ Erro no backup automático:', error);
        }
    }

    /**
     * ✅ NOVO - Obter último backup
     * @returns {Object|null} Último backup
     */
    obterUltimoBackup() {
        try {
            if (!this.storageDisponivel) return null;
            
            const backup = localStorage.getItem(this.CHAVE_BACKUP);
            return backup ? JSON.parse(backup) : null;
            
        } catch (error) {
            return null;
        }
    }

    /**
     * ✅ MELHORADO - Restaura dados do backup
     * @param {Object} dadosBackup - Dados do backup
     * @returns {boolean} True se restaurou com sucesso
     */
    restaurarBackup(dadosBackup) {
        try {
            if (!dadosBackup || !dadosBackup.registros || !dadosBackup.configuracoes) {
                throw new Error('Dados de backup inválidos');
            }

            // Verificar integridade do backup
            if (dadosBackup.checksum && !this.verificarIntegridade(dadosBackup)) {
                console.warn('⚠️ Integridade do backup comprometida, continuando mesmo assim...');
            }

            const sucessoRegistros = this.salvarRegistros(dadosBackup.registros);
            const sucessoConfig = this.salvarConfiguracoes(dadosBackup.configuracoes);

            if (sucessoRegistros && sucessoConfig) {
                // Limpar cache para forçar recarga
                this.limparCache();
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
     * ✅ MELHORADO - Exporta dados para JSON
     * @returns {string} Dados em formato JSON
     */
    exportarDados() {
        try {
            const backup = this.criarBackup();
            if (!backup) {
                throw new Error('Falha ao criar backup para exportação');
            }
            
            // Adicionar metadados de exportação
            backup.exportadoEm = new Date().toISOString();
            backup.aplicacao = 'Banco de Horas';
            backup.versaoApp = this.versao;
            
            return JSON.stringify(backup, null, 2);

        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            return null;
        }
    }

    /**
     * ✅ MELHORADO - Importa dados de JSON
     * @param {string} dadosJson - Dados em formato JSON
     * @returns {boolean} True se importou com sucesso
     */
    importarDados(dadosJson) {
        try {
            if (!dadosJson || typeof dadosJson !== 'string') {
                throw new Error('Dados JSON inválidos');
            }
            
            const dados = JSON.parse(dadosJson);
            
            // Validar estrutura básica
            if (!dados.registros || !Array.isArray(dados.registros)) {
                throw new Error('Estrutura de dados inválida');
            }
            
            return this.restaurarBackup(dados);

        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }

    /**
     * ✅ MELHORADO - Limpa todos os dados
     * @returns {boolean} True se limpou com sucesso
     */
    limparTodosDados() {
        try {
            if (this.storageDisponivel) {
                localStorage.removeItem(this.CHAVE_REGISTROS);
                localStorage.removeItem(this.CHAVE_CONFIGURACOES);
                localStorage.removeItem(this.CHAVE_FINANCEIRO);
                localStorage.removeItem(this.CHAVE_BACKUP);
            } else {
                this.storageTemporario = {
                    registros: [],
                    configuracoes: this.obterConfiguracoesPadrao(),
                    financeiro: { valorHora: 25.00 }
                };
            }

            // Limpar cache
            this.limparCache();

            console.log('🧹 Todos os dados foram limpos');
            return true;

        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
            return false;
        }
    }

    /**
     * ✅ MELHORADO - Gera ID único mais robusto
     * @returns {string} ID único
     */
    gerarId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const contador = this.carregarRegistros().length;
        return `reg_${timestamp}_${contador}_${random}`;
    }

    /**
     * ✅ MELHORADO - Migra dados de versões anteriores
     */
    migrarDadosSeNecessario() {
        try {
            if (!this.storageDisponivel) return;

            console.log('🔄 Verificando necessidade de migração...');

            // Lista de chaves antigas para migrar
            const chavesAntigas = [
                'registrosBancoHoras',
                'bancoHoras_dados',
                'plantoes_registros'
            ];

            let dadosMigrados = false;

            chavesAntigas.forEach(chaveAntiga => {
                const dadosAntigos = localStorage.getItem(chaveAntiga);
                
                if (dadosAntigos && !localStorage.getItem(this.CHAVE_REGISTROS)) {
                    console.log(`🔄 Migrando dados de: ${chaveAntiga}`);
                    
                    try {
                        const registrosAntigos = JSON.parse(dadosAntigos);
                        
                        // Normalizar dados antigos
                        const registrosMigrados = Array.isArray(registrosAntigos) 
                            ? registrosAntigos 
                            : registrosAntigos.registros || [];
                        
                        // Validar e adicionar IDs se necessário
                        const registrosValidados = registrosMigrados.map(registro => 
                            this.validarRegistro(registro)
                        );
                        
                        this.salvarRegistros(registrosValidados);
                        
                        // Remover dados antigos
                        localStorage.removeItem(chaveAntiga);
                        
                        dadosMigrados = true;
                        console.log(`✅ Migração de ${chaveAntiga} concluída`);
                        
                    } catch (error) {
                        console.error(`❌ Erro ao migrar ${chaveAntiga}:`, error);
                    }
                }
            });

            if (dadosMigrados) {
                console.log('✅ Migração de dados concluída');
                this.criarBackup(); // Criar backup após migração
            } else {
                console.log('ℹ️ Nenhuma migração necessária');
            }

        } catch (error) {
            console.error('❌ Erro na migração:', error);
        }
    }

    /**
     * ✅ MELHORADO - Obtém estatísticas do storage
     * @returns {Object} Estatísticas detalhadas
     */
    obterEstatisticasStorage() {
        try {
            const registros = this.carregarRegistros();
            const configuracoes = this.carregarConfiguracoes();
            
            let tamanhoStorage =
