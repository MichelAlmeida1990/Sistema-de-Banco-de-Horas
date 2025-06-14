// src/js/calculos.js - Sistema de Cálculos com Banco de Horas v5.0.0
class CalculadoraBancoHoras {
    constructor() {
        console.log('🧮 Calculadora de Banco de Horas inicializada - v5.0.0');
        this.JORNADA_PADRAO = 10; // 10 horas padrão (09:00-19:00)
        this.HORARIO_ENTRADA_PADRAO = '09:00';
        this.HORARIO_SAIDA_PADRAO = '19:00';
        this.BONUS_FIM_SEMANA = 1.90; // 190% do valor (100% + 90% bônus)
    }

    // ✅ CORRIGIDO - Calcular valor com bônus de 90% para fim de semana
    calcularValorHora(valorBase, ehFimDeSemana, ehFeriado) {
        try {
            if (ehFimDeSemana || ehFeriado) {
                // Valor final = Valor base × 1.90 (100% + 90% bônus)
                const valorFinal = valorBase * this.BONUS_FIM_SEMANA;
                
                console.log(`💰 Fim de semana/Feriado detectado:
                    - Valor base: R$ ${valorBase.toFixed(2)}
                    - Multiplicador: ${this.BONUS_FIM_SEMANA} (100% + 90% bônus)
                    - Valor final: R$ ${valorFinal.toFixed(2)}`);
                
                return valorFinal;
            }
            
            return valorBase;

        } catch (error) {
            console.error('❌ Erro no cálculo de valor/hora:', error);
            return valorBase;
        }
    }

    // ✅ CORRIGIDO - Calcular valor individual do registro com banco de horas
    calcularValorRegistro(registro, valorHoraAtual) {
        try {
            // Usar o valor da hora armazenado no registro, se disponível
            const valorHora = registro.valorHora || valorHoraAtual;
            
            if (!valorHora || valorHora <= 0) {
                throw new Error('Valor da hora não configurado ou inválido');
            }

            // 1. Calcular horas trabalhadas (agora incluindo pausa)
            const horasTrabalhadas = this.calcularHorasTrabalhadas(
                registro.entrada, 
                registro.saida
            );

            // 2. Determinar se tem bônus
            const ehFimDeSemana = registro.fimDeSemana || this.ehFimDeSemana(registro.data);
            const ehFeriado = registro.feriado || false;
            const temBonus = ehFimDeSemana || ehFeriado;

            // 3. Calcular valor da hora com ou sem bônus
            const valorHoraCalculado = temBonus ? valorHora * this.BONUS_FIM_SEMANA : valorHora;

            // 4. Calcular valor total (todas as horas são pagas com o mesmo valor)
            const valorTotal = horasTrabalhadas * valorHoraCalculado;

            // 5. Calcular saldo para banco de horas (considerando jornada padrão)
            const saldoHoras = horasTrabalhadas - this.JORNADA_PADRAO;
            let horasExtrasRemuneradas = 0;
            let bancoHoras = 0;

            if (saldoHoras > 0) {
                if (registro.usarBancoHoras) {
                    bancoHoras = saldoHoras;
                } else {
                    horasExtrasRemuneradas = saldoHoras;
                }
            }

            const resultado = {
                horasTrabalhadas: Math.round(horasTrabalhadas * 100) / 100,
                saldoHoras: Math.round(saldoHoras * 100) / 100,
                horasExtrasRemuneradas: Math.round(horasExtrasRemuneradas * 100) / 100,
                bancoHoras: Math.round(bancoHoras * 100) / 100,
                valorHora: Math.round(valorHoraCalculado * 100) / 100,
                valorTotal: Math.round(valorTotal * 100) / 100,
                ehFimDeSemana,
                ehFeriado,
                temBonus,
                tipoPlantao: ehFeriado ? 'Feriado' : (ehFimDeSemana ? 'Fim de Semana' : 'Normal'),
                valorBase: valorHora,
                bonusAplicado: temBonus ? (valorHoraCalculado - valorHora) : 0,
                multiplicadorBonus: temBonus ? this.BONUS_FIM_SEMANA : 1.0,
                pausaIncluida: true // Indicador de que a pausa está incluída no cálculo
            };

            console.log(`📊 Cálculo registro ${registro.data}:`, resultado);
            return resultado;

        } catch (error) {
            console.error('❌ Erro ao calcular valor do registro:', error);
            throw error; // Propagar erro para tratamento adequado
        }
    }

    // ✅ NOVO - Verificar se está no horário padrão
    estaNoHorarioPadrao(entrada, saida) {
        try {
            // Se não informado, assume horário padrão
            if (!entrada || !saida) {
                return {
                    entrada: this.HORARIO_ENTRADA_PADRAO,
                    saida: this.HORARIO_SAIDA_PADRAO,
                    ehPadrao: true
                };
            }

            const ehPadrao = (entrada === this.HORARIO_ENTRADA_PADRAO && 
                             saida === this.HORARIO_SAIDA_PADRAO);

            return {
                entrada: entrada,
                saida: saida,
                ehPadrao: ehPadrao
            };

        } catch (error) {
            console.error('❌ Erro ao verificar horário padrão:', error);
            return {
                entrada: this.HORARIO_ENTRADA_PADRAO,
                saida: this.HORARIO_SAIDA_PADRAO,
                ehPadrao: true
            };
        }
    }

    // ✅ CORRIGIDO - Calcular horas trabalhadas incluindo pausa
    calcularHorasTrabalhadas(entrada, saida, pausaMinutos = 0) {
        try {
            if (!entrada || !saida) {
                throw new Error('Horários de entrada e saída são obrigatórios');
            }

            const [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
            const [horaSaida, minutoSaida] = saida.split(':').map(Number);

            if (isNaN(horaEntrada) || isNaN(minutoEntrada) || isNaN(horaSaida) || isNaN(minutoSaida)) {
                throw new Error('Formato de horário inválido');
            }

            let minutosEntrada = horaEntrada * 60 + minutoEntrada;
            let minutosSaida = horaSaida * 60 + minutoSaida;

            // Se saída for menor que entrada, assumir que passou para o próximo dia
            if (minutosSaida < minutosEntrada) {
                minutosSaida += 24 * 60; // Adicionar 24 horas
            }

            // ✅ CORRIGIDO: Não descontar pausa do almoço
            const minutosTrabalhados = minutosSaida - minutosEntrada;
            const horasTrabalhadas = minutosTrabalhados / 60;

            if (horasTrabalhadas < 0) {
                throw new Error('Horas trabalhadas não podem ser negativas');
            }

            return Math.round(horasTrabalhadas * 100) / 100;

        } catch (error) {
            console.error('❌ Erro ao calcular horas trabalhadas:', error);
            throw error;
        }
    }

    // ✅ Verificar se é fim de semana (mantido original)
    ehFimDeSemana(data) {
        try {
            const dataObj = new Date(data + 'T00:00:00');
            const diaSemana = dataObj.getDay();
            return diaSemana === 0 || diaSemana === 6; // 0 = Domingo, 6 = Sábado
        } catch (error) {
            console.error('❌ Erro ao verificar fim de semana:', error);
            return false;
        }
    }

    // ✅ CORRIGIDO - Calcular totais usando valor da hora de cada registro
    calcularTotais(registros, valorHoraAtual) {
        try {
            if (!valorHoraAtual || valorHoraAtual <= 0) {
                throw new Error('Valor da hora atual não configurado ou inválido');
            }

            let totalHorasNormais = 0;
            let totalHorasFimSemana = 0;
            let totalHorasExtras = 0;
            let totalBancoHoras = 0;
            let totalValorNormal = 0;
            let totalValorFimSemana = 0;
            let totalValorExtras = 0;

            registros.forEach(registro => {
                // Usar o valor da hora armazenado no registro
                const calculo = this.calcularValorRegistro(registro, registro.valorHora || valorHoraAtual);
                
                // Somar horas trabalhadas
                if (calculo.temBonus) {
                    totalHorasFimSemana += calculo.horasTrabalhadas;
                    totalValorFimSemana += calculo.valorTotal;
                } else {
                    totalHorasNormais += calculo.horasTrabalhadas;
                    totalValorNormal += calculo.valorTotal;
                }

                // Somar extras e banco
                totalHorasExtras += calculo.horasExtrasRemuneradas || 0;
                totalBancoHoras += calculo.bancoHoras || 0;
                totalValorExtras += calculo.valorHorasExtras || 0;
            });

            const resultado = {
                totalHorasNormais: Math.round(totalHorasNormais * 100) / 100,
                totalHorasFimSemana: Math.round(totalHorasFimSemana * 100) / 100,
                totalHorasExtras: Math.round(totalHorasExtras * 100) / 100,
                totalBancoHoras: Math.round(totalBancoHoras * 100) / 100,
                totalHorasGeral: Math.round((totalHorasNormais + totalHorasFimSemana) * 100) / 100,
                totalValorNormal: Math.round(totalValorNormal * 100) / 100,
                totalValorFimSemana: Math.round(totalValorFimSemana * 100) / 100,
                totalValorExtras: Math.round(totalValorExtras * 100) / 100,
                totalValorGeral: Math.round((totalValorNormal + totalValorFimSemana) * 100) / 100,
                valorHoraAtual: valorHoraAtual,
                valorHoraComBonus: this.calcularValorHora(valorHoraAtual, true, false)
            };

            console.log('📈 Totais calculados:', resultado);
            return resultado;

        } catch (error) {
            console.error('❌ Erro ao calcular totais:', error);
            throw error; // Propagar erro para tratamento adequado
        }
    }

    // ✅ CORRIGIDO - Calcular saldo do banco de horas
    calcularSaldoBanco(registros, horasPadraoPorDia = 10) {
        try {
            let saldoTotal = 0;
            let saldoRemunerado = 0;
            let saldoBanco = 0;

            registros.forEach(registro => {
                const calculo = this.calcularValorRegistro(registro);
                
                // Saldo total (independente de remuneração)
                saldoTotal += calculo.saldoHoras;
                
                // Separar entre remunerado e banco
                saldoRemunerado += calculo.horasExtrasRemuneradas;
                saldoBanco += calculo.bancoHoras;
            });

            return {
                saldoTotal: Math.round(saldoTotal * 100) / 100,
                saldoRemunerado: Math.round(saldoRemunerado * 100) / 100,
                saldoBanco: Math.round(saldoBanco * 100) / 100
            };

        } catch (error) {
            console.error('❌ Erro ao calcular saldo do banco:', error);
            return {
                saldoTotal: 0,
                saldoRemunerado: 0,
                saldoBanco: 0
            };
        }
    }

    // ✅ CORRIGIDO - Obter estatísticas detalhadas
    obterEstatisticas(registros) {
        try {
            if (!registros || registros.length === 0) {
                return {
                    totalRegistros: 0,
                    totalPlantoes: 0,
                    plantoesNormais: 0,
                    plantoesFimSemana: 0,
                    plantoesFeriado: 0,
                    mediaHorasPorPlantao: 0,
                    maiorPlantao: 0,
                    menorPlantao: 0,
                    totalHorasExtras: 0,
                    totalBancoHoras: 0
                };
            }

            let plantoesNormais = 0;
            let plantoesFimSemana = 0;
            let plantoesFeriado = 0;
            let totalHoras = 0;
            let totalExtras = 0;
            let totalBanco = 0;
            let horasPlantoes = [];

            registros.forEach(registro => {
                const calculo = this.calcularValorRegistro(registro);

                totalHoras += calculo.horasTrabalhadas;
                totalExtras += calculo.horasExtrasRemuneradas;
                totalBanco += calculo.bancoHoras;
                horasPlantoes.push(calculo.horasTrabalhadas);

                if (registro.feriado) {
                    plantoesFeriado++;
                } else if (this.ehFimDeSemana(registro.data)) {
                    plantoesFimSemana++;
                } else {
                    plantoesNormais++;
                }
            });

            return {
                totalRegistros: registros.length,
                totalPlantoes: registros.length,
                plantoesNormais: plantoesNormais,
                plantoesFimSemana: plantoesFimSemana,
                plantoesFeriado: plantoesFeriado,
                mediaHorasPorPlantao: Math.round((totalHoras / registros.length) * 100) / 100,
                maiorPlantao: Math.max(...horasPlantoes),
                menorPlantao: Math.min(...horasPlantoes),
                totalHorasTrabalhadas: Math.round(totalHoras * 100) / 100,
                totalHorasExtras: Math.round(totalExtras * 100) / 100,
                totalBancoHoras: Math.round(totalBanco * 100) / 100
            };

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                totalRegistros: 0,
                totalPlantoes: 0,
                plantoesNormais: 0,
                plantoesFimSemana: 0,
                plantoesFeriado: 0,
                mediaHorasPorPlantao: 0,
                maiorPlantao: 0,
                menorPlantao: 0,
                totalHorasTrabalhadas: 0,
                totalHorasExtras: 0,
                totalBancoHoras: 0
            };
        }
    }

    // ✅ CORRIGIDO - Validar dados de entrada com banco de horas
    validarRegistro(registro) {
        const erros = [];
        
        try {
            // Validações básicas
            if (!registro.data) erros.push('Data é obrigatória');
            if (!registro.entrada) erros.push('Hora de entrada é obrigatória');
            if (!registro.saida) erros.push('Hora de saída é obrigatória');
            
            // Validar formato das horas
            const regexHora = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (registro.entrada && !regexHora.test(registro.entrada)) {
                erros.push('Formato de hora de entrada inválido (use HH:MM)');
            }
            if (registro.saida && !regexHora.test(registro.saida)) {
                erros.push('Formato de hora de saída inválido (use HH:MM)');
            }

            // Validar se entrada é anterior à saída (considerando virada de dia)
            if (registro.entrada && registro.saida && erros.length === 0) {
                try {
                    const horasTrabalhadas = this.calcularHorasTrabalhadas(
                        registro.entrada, 
                        registro.saida
                    );
                    
                    if (horasTrabalhadas > 24) {
                        erros.push('Plantão não pode exceder 24 horas');
                    }
                    
                    if (horasTrabalhadas <= 0) {
                        erros.push('Horário de saída deve ser posterior ao de entrada');
                    }
                } catch (error) {
                    erros.push('Erro no cálculo de horas: ' + error.message);
                }
            }

        } catch (error) {
            erros.push('Erro na validação: ' + error.message);
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    }

    // ✅ CORRIGIDO - Demonstrar cálculo de bônus
    demonstrarCalculoBonus(valorBase) {
        const valorComBonus = valorBase * this.BONUS_FIM_SEMANA;
        const bonusEmReais = valorComBonus - valorBase;
        
        console.log(`📊 DEMONSTRAÇÃO DE CÁLCULO DE BÔNUS FIM DE SEMANA:
            💰 Valor base: R$ ${valorBase.toFixed(2)}
            📈 Multiplicador: ${this.BONUS_FIM_SEMANA} (100% + 90% bônus)
            💵 Valor final por hora: R$ ${valorComBonus.toFixed(2)}
            🎯 Bônus em R$: R$ ${bonusEmReais.toFixed(2)}
            
            📝 Exemplo com 11 horas fim de semana:
            🔢 11h × R$ ${valorComBonus.toFixed(2)} = R$ ${(11 * valorComBonus).toFixed(2)}`);
        
        return {
            valorBase: valorBase,
            multiplicador: this.BONUS_FIM_SEMANA,
            bonusEmReais: bonusEmReais,
            valorFinal: valorComBonus,
            exemplo11h: 11 * valorComBonus
        };
    }

    // ✅ NOVO - Utilitários de formatação
    formatarHoras(horas) {
        if (horas === 0) return '0h';
        if (horas < 0) return `-${Math.abs(horas).toFixed(1)}h`;
        return `${horas.toFixed(1)}h`;
    }

    formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    // ✅ NOVO - Informações do sistema
    obterInfoSistema() {
        return {
            versao: 'v5.0.0',
            jornadaPadrao: this.JORNADA_PADRAO,
            horarioPadrao: `${this.HORARIO_ENTRADA_PADRAO} às ${this.HORARIO_SAIDA_PADRAO}`,
            bonusFimSemana: `${((this.BONUS_FIM_SEMANA - 1) * 100).toFixed(0)}%`,
            valorHoraBase: 28.00, // Valor base por hora
            valorHoraComBonus: this.calcularValorHora(28.00, true, false)
        };
    }
}

// ✅ Exportar classe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculadoraBancoHoras;
}

console.log('🧮 Calculadora com banco de horas CORRIGIDA - v5.0.0');
console.log('✅ Bônus fim de semana: R$ 25,00 × 1.90 = R$ 47,50');
console.log('✅ Horário padrão: Segunda a Sexta, 09:00 às 19:00 (10h)');
console.log('✅ Sistema de banco de horas implementado');
