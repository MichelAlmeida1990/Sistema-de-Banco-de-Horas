// src/js/calculos.js - Sistema de Cálculos com Banco de Horas v5.0.0
class CalculadoraBancoHoras {
    constructor() {
        console.log('🧮 Calculadora de Banco de Horas inicializada - v5.0.0');
        this.JORNADA_PADRAO = 10; // 10 horas padrão (09:00-19:00)
        this.HORARIO_ENTRADA_PADRAO = '09:00';
        this.HORARIO_SAIDA_PADRAO = '19:00';
        this.BONUS_FIM_SEMANA = 1.90; // 190% do valor (100% + 90% bônus)
        this.VALOR_HORA_BASE = 28.00; // Valor base por hora
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
    calcularValorRegistro(registro, valorHoraPadrao = 28.00) {
        try {
            // 1. Calcular horas trabalhadas
            const horasTrabalhadas = this.calcularHorasTrabalhadas(
                registro.entrada, 
                registro.saida, 
                registro.pausa || 0
            );

            // 2. Determinar se tem bônus
            const ehFimDeSemana = registro.fimDeSemana === true || this.ehFimDeSemana(registro.data);
            const ehFeriado = registro.feriado || false;
            const temBonus = ehFimDeSemana || ehFeriado;

            // 3. Calcular valor da hora com ou sem bônus
            const valorHora = temBonus ? valorHoraPadrao * this.BONUS_FIM_SEMANA : valorHoraPadrao;

            // 4. Calcular valor total (todas as horas são pagas com o mesmo valor)
            const valorTotal = horasTrabalhadas * valorHora;

            // 5. Calcular saldo para banco de horas
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
                valorHora: Math.round(valorHora * 100) / 100,
                valorTotal: Math.round(valorTotal * 100) / 100,
                ehFimDeSemana,
                ehFeriado,
                temBonus,
                tipoBonus: ehFeriado ? 'Feriado' : (ehFimDeSemana ? 'Fim de Semana' : 'Normal'),
                valorBase: valorHoraPadrao,
                bonusAplicado: temBonus ? (valorHora - valorHoraPadrao) : 0,
                multiplicadorBonus: temBonus ? this.BONUS_FIM_SEMANA : 1.0
            };

            console.log(`📊 Cálculo registro ${registro.data}:`, resultado);
            return resultado;

        } catch (error) {
            console.error('❌ Erro ao calcular valor do registro:', error);
            return {
                horasTrabalhadas: 0,
                saldoHoras: 0,
                horasExtrasRemuneradas: 0,
                bancoHoras: 0,
                valorHora: valorHoraPadrao,
                valorTotal: 0,
                ehFimDeSemana: false,
                ehFeriado: false,
                temBonus: false,
                tipoBonus: 'Normal',
                valorBase: valorHoraPadrao,
                bonusAplicado: 0,
                multiplicadorBonus: 1.0
            };
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

    // ✅ Calcular horas trabalhadas (mantido original)
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

            const minutosTrabalhados = minutosSaida - minutosEntrada - (pausaMinutos || 0);
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

    // ✅ CORRIGIDO - Calcular totais com lógica de banco de horas
    calcularTotais(registros, valorHoraPadrao = 25.00) {
        try {
            let totalHorasNormais = 0;
            let totalHorasFimSemana = 0;
            let totalHorasExtras = 0;
            let totalBancoHoras = 0;
            let totalValorNormal = 0;
            let totalValorFimSemana = 0;
            let totalValorExtras = 0;

            registros.forEach(registro => {
                const calculo = this.calcularValorRegistro(registro, valorHoraPadrao);
                
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
                valorHoraPadrao: valorHoraPadrao,
                valorHoraComBonus: this.calcularValorHora(valorHoraPadrao, true, false)
            };

            console.log('📈 Totais calculados:', resultado);
            return resultado;

        } catch (error) {
            console.error('❌ Erro ao calcular totais:', error);
            return {
                totalHorasNormais: 0,
                totalHorasFimSemana: 0,
                totalHorasExtras: 0,
                totalBancoHoras: 0,
                totalHorasGeral: 0,
                totalValorNormal: 0,
                totalValorFimSemana: 0,
                totalValorExtras: 0,
                totalValorGeral: 0,
                valorHoraPadrao: valorHoraPadrao,
                valorHoraComBonus: this.calcularValorHora(valorHoraPadrao, true, false)
            };
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
            // Validar data
            if (!registro.data) {
                erros.push('Data é obrigatória');
            } else {
                const data = new Date(registro.data);
                if (isNaN(data.getTime())) {
                    erros.push('Data inválida');
                }
            }

            // Validar entrada
            if (!registro.entrada) {
                erros.push('Horário de entrada é obrigatório');
            } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(registro.entrada)) {
                erros.push('Formato de entrada inválido (use HH:MM)');
            }

            // Validar saída
            if (!registro.saida) {
                erros.push('Horário de saída é obrigatório');
            } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(registro.saida)) {
                erros.push('Formato de saída inválido (use HH:MM)');
            }

            // Validar pausa
            if (registro.pausa && (isNaN(registro.pausa) || registro.pausa < 0 || registro.pausa > 480)) {
                erros.push('Pausa deve estar entre 0 e 480 minutos (8h)');
            }

            // Validar se entrada é anterior à saída (considerando virada de dia)
            if (registro.entrada && registro.saida && erros.length === 0) {
                try {
                    const horasTrabalhadas = this.calcularHorasTrabalhadas(
                        registro.entrada, 
                        registro.saida, 
                        registro.pausa || 0
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
            valorHoraBase: this.VALOR_HORA_BASE,
            valorHoraComBonus: this.calcularValorHora(this.VALOR_HORA_BASE, true, false)
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
