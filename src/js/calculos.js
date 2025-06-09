// src/js/calculos.js - Sistema de Cálculos com Bônus Fim de Semana v3.1.0
class CalculadoraBancoHoras {
    constructor() {
        console.log('🧮 Calculadora de Banco de Horas inicializada - v3.1.0');
    }

    // ✅ CORRETO - Calcular valor com bônus de 90% para fim de semana
    calcularValorHora(valorBase, ehFimDeSemana, ehFeriado) {
        try {
            if (ehFimDeSemana || ehFeriado) {
                // Bônus de 90% sobre o valor base
                const bonus = valorBase * 0.90;
                const valorFinal = valorBase + bonus;
                
                console.log(`💰 Fim de semana/Feriado detectado:
                    - Valor base: R$ ${valorBase.toFixed(2)}
                    - Bônus 90%: R$ ${bonus.toFixed(2)}
                    - Valor final: R$ ${valorFinal.toFixed(2)}`);
                
                return valorFinal;
            }
            
            return valorBase;

        } catch (error) {
            console.error('❌ Erro no cálculo de valor/hora:', error);
            return valorBase;
        }
    }

    // ✅ CORRETO - Calcular totais com bônus aplicado
    calcularTotais(registros, valorHoraPadrao = 25.00) {
        try {
            let totalHorasNormais = 0;
            let totalHorasFimSemana = 0;
            let totalValorNormal = 0;
            let totalValorFimSemana = 0;

            registros.forEach(registro => {
                const horasTrabalhadas = this.calcularHorasTrabalhadas(
                    registro.entrada, 
                    registro.saida, 
                    registro.pausa || 0
                );

                const ehFimDeSemana = this.ehFimDeSemana(registro.data);
                const ehFeriado = registro.feriado || false;

                if (ehFimDeSemana || ehFeriado) {
                    // Aplicar bônus de 90%
                    const valorHoraComBonus = this.calcularValorHora(valorHoraPadrao, true, ehFeriado);
                    const valorTotal = horasTrabalhadas * valorHoraComBonus;
                    
                    totalHorasFimSemana += horasTrabalhadas;
                    totalValorFimSemana += valorTotal;
                    
                    console.log(`📊 Plantão fim de semana:
                        - Data: ${registro.data}
                        - Horas: ${horasTrabalhadas}h
                        - Valor/hora: R$ ${valorHoraComBonus.toFixed(2)}
                        - Total: R$ ${valorTotal.toFixed(2)}`);
                } else {
                    // Plantão normal
                    const valorTotal = horasTrabalhadas * valorHoraPadrao;
                    totalHorasNormais += horasTrabalhadas;
                    totalValorNormal += valorTotal;
                    
                    console.log(`📊 Plantão normal:
                        - Data: ${registro.data}
                        - Horas: ${horasTrabalhadas}h
                        - Valor/hora: R$ ${valorHoraPadrao.toFixed(2)}
                        - Total: R$ ${valorTotal.toFixed(2)}`);
                }
            });

            const resultado = {
                totalHorasNormais: Math.round(totalHorasNormais * 100) / 100,
                totalHorasFimSemana: Math.round(totalHorasFimSemana * 100) / 100,
                totalHorasGeral: Math.round((totalHorasNormais + totalHorasFimSemana) * 100) / 100,
                totalValorNormal: Math.round(totalValorNormal * 100) / 100,
                totalValorFimSemana: Math.round(totalValorFimSemana * 100) / 100,
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
                totalHorasGeral: 0,
                totalValorNormal: 0,
                totalValorFimSemana: 0,
                totalValorGeral: 0,
                valorHoraPadrao: valorHoraPadrao,
                valorHoraComBonus: this.calcularValorHora(valorHoraPadrao, true, false)
            };
        }
    }

    // ✅ CORRETO - Calcular valor individual do registro
    calcularValorRegistro(registro, valorHoraPadrao = 25.00) {
        try {
            const horasTrabalhadas = this.calcularHorasTrabalhadas(
                registro.entrada, 
                registro.saida, 
                registro.pausa || 0
            );

            const ehFimDeSemana = this.ehFimDeSemana(registro.data);
            const ehFeriado = registro.feriado || false;

            const valorHora = this.calcularValorHora(valorHoraPadrao, ehFimDeSemana, ehFeriado);
            const valorTotal = horasTrabalhadas * valorHora;

            return {
                horasTrabalhadas: Math.round(horasTrabalhadas * 100) / 100,
                valorHora: Math.round(valorHora * 100) / 100,
                valorTotal: Math.round(valorTotal * 100) / 100,
                ehFimDeSemana: ehFimDeSemana,
                ehFeriado: ehFeriado,
                temBonus: ehFimDeSemana || ehFeriado,
                tipoBonus: ehFeriado ? 'Feriado' : (ehFimDeSemana ? 'Fim de Semana' : 'Normal'),
                valorBase: valorHoraPadrao,
                bonusAplicado: ehFimDeSemana || ehFeriado ? valorHoraPadrao * 0.90 : 0
            };

        } catch (error) {
            console.error('❌ Erro ao calcular valor do registro:', error);
            return {
                horasTrabalhadas: 0,
                valorHora: valorHoraPadrao,
                valorTotal: 0,
                ehFimDeSemana: false,
                ehFeriado: false,
                temBonus: false,
                tipoBonus: 'Normal',
                valorBase: valorHoraPadrao,
                bonusAplicado: 0
            };
        }
    }

    // ✅ Calcular horas trabalhadas
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

    // ✅ Verificar se é fim de semana
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

    // ✅ Calcular saldo do banco de horas
    calcularSaldoBanco(registros, horasPadraoPorDia = 8) {
        try {
            let saldoTotal = 0;

            registros.forEach(registro => {
                const horasTrabalhadas = this.calcularHorasTrabalhadas(
                    registro.entrada, 
                    registro.saida, 
                    registro.pausa || 0
                );

                const saldoDia = horasTrabalhadas - horasPadraoPorDia;
                saldoTotal += saldoDia;
            });

            return Math.round(saldoTotal * 100) / 100;

        } catch (error) {
            console.error('❌ Erro ao calcular saldo do banco:', error);
            return 0;
        }
    }

    // ✅ Obter estatísticas detalhadas
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
                    menorPlantao: 0
                };
            }

            let plantoesNormais = 0;
            let plantoesFimSemana = 0;
            let plantoesFeriado = 0;
            let totalHoras = 0;
            let horasPlantoes = [];

            registros.forEach(registro => {
                const horasTrabalhadas = this.calcularHorasTrabalhadas(
                    registro.entrada, 
                    registro.saida, 
                    registro.pausa || 0
                );

                totalHoras += horasTrabalhadas;
                horasPlantoes.push(horasTrabalhadas);

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
                totalHorasTrabalhadas: Math.round(totalHoras * 100) / 100
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
                totalHorasTrabalhadas: 0
            };
        }
    }

    // ✅ Validar dados de entrada
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
            if (registro.pausa && (isNaN(registro.pausa) || registro.pausa < 0)) {
                erros.push('Pausa deve ser um número positivo');
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

    // ✅ NOVO - Demonstrar cálculo de bônus
    demonstrarCalculoBonus(valorBase) {
        const bonus = valorBase * 0.90;
        const valorFinal = valorBase + bonus;
        
        console.log(`📊 DEMONSTRAÇÃO DE CÁLCULO DE BÔNUS FIM DE SEMANA:
            💰 Valor base: R$ ${valorBase.toFixed(2)}
            📈 Bônus (90% do valor base): R$ ${bonus.toFixed(2)}
            💵 Valor final por hora: R$ ${valorFinal.toFixed(2)}
            
            📝 Exemplo com 11 horas fim de semana:
            🔢 11h × R$ ${valorFinal.toFixed(2)} = R$ ${(11 * valorFinal).toFixed(2)}`);
        
        return {
            valorBase: valorBase,
            bonus: bonus,
            valorFinal: valorFinal,
            exemplo11h: 11 * valorFinal
        };
    }
}

// ✅ Exportar classe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculadoraBancoHoras;
}

console.log('🧮 Calculadora com bônus fim de semana carregada - v3.1.0');
