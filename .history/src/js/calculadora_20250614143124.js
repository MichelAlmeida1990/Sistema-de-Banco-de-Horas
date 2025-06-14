// src/js/calculadora.js - Calculadora Unificada do Banco de Horas v2.0.0

class Calculadora {
    constructor() {
        // Constantes do sistema
        this.JORNADA_PADRAO = 10; // Horas
        this.MINUTOS_HORA = 60;
        this.HORARIO_ENTRADA_PADRAO = '07:00';
        this.HORARIO_SAIDA_PADRAO = '19:00';
        this.BONUS_FIM_SEMANA = 0.90; // 90% adicional
        this.BONUS_FERIADO = 1.00; // 100% adicional
        
        console.log('✅ Calculadora inicializada');
    }

    calcularHorasTrabalhadas(entrada, saida, pausa = 60) {
        try {
            if (!entrada || !saida) {
                throw new Error('Entrada e saída são obrigatórios');
            }

            const [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
            const [horaSaida, minutoSaida] = saida.split(':').map(Number);

            const totalMinutosEntrada = horaEntrada * this.MINUTOS_HORA + minutoEntrada;
            const totalMinutosSaida = horaSaida * this.MINUTOS_HORA + minutoSaida;
            
            let diferencaMinutos = totalMinutosSaida - totalMinutosEntrada - pausa;
            
            // Se passou da meia-noite
            if (diferencaMinutos < 0) {
                diferencaMinutos += 24 * this.MINUTOS_HORA;
            }

            return Math.round((diferencaMinutos / this.MINUTOS_HORA) * 100) / 100;
        } catch (error) {
            console.error('❌ Erro ao calcular horas trabalhadas:', error);
            throw error;
        }
    }

    calcularValorHora(valorBase, temBonus, ehFeriado = false) {
        try {
            if (!valorBase || valorBase <= 0) return 0;
            
            if (ehFeriado) {
                return valorBase * (1 + this.BONUS_FERIADO); // 100% adicional
            }
            
            return temBonus ? valorBase * (1 + this.BONUS_FIM_SEMANA) : valorBase;
        } catch (error) {
            console.error('❌ Erro ao calcular valor hora:', error);
            throw error;
        }
    }

    calcularValorRegistro(registro, valorHora) {
        try {
            if (!registro) {
                throw new Error('Registro é obrigatório');
            }

            // Validar e corrigir valor da hora
            let valorHoraValido = parseFloat(valorHora);
            if (!valorHoraValido || valorHoraValido <= 0 || isNaN(valorHoraValido)) {
                console.warn('⚠️ Valor da hora inválido, usando padrão R$ 25,00');
                valorHoraValido = 25.00; // Valor padrão
            }

            // Validar campos obrigatórios do registro
            if (!registro.entrada || !registro.saida) {
                throw new Error('Horários de entrada e saída são obrigatórios');
            }

            const horasTrabalhadas = this.calcularHorasTrabalhadas(
                registro.entrada,
                registro.saida,
                registro.pausa || 60
            );

            const ehFimDeSemana = registro.fimDeSemana || this.ehFimDeSemana(registro.data);
            const ehFeriado = registro.feriado || false;
            const temBonus = ehFimDeSemana || ehFeriado;

            const valorHoraCalculado = this.calcularValorHora(valorHoraValido, temBonus, ehFeriado);
            const valorTotal = horasTrabalhadas * valorHoraCalculado;

            // Calcular saldo de horas
            const saldoHoras = horasTrabalhadas - this.JORNADA_PADRAO;
            const { horasExtrasRemuneradas, bancoHoras } = this.distribuirHorasExtras(
                saldoHoras,
                registro.usarBancoHoras
            );

            return {
                horasTrabalhadas,
                valorHora: valorHoraCalculado,
                valorTotal,
                saldoHoras,
                horasExtrasRemuneradas,
                bancoHoras,
                ehFimDeSemana,
                ehFeriado,
                temBonus,
                tipoPlantao: ehFeriado ? 'Feriado' : (ehFimDeSemana ? 'Fim de Semana' : 'Normal'),
                valorBase: valorHoraValido,
                bonusAplicado: temBonus ? (valorHoraCalculado - valorHoraValido) : 0,
                multiplicadorBonus: ehFeriado ? 2 : (temBonus ? 1.9 : 1.0)
            };
        } catch (error) {
            console.error('❌ Erro ao calcular valor do registro:', error);
            throw error;
        }
    }

    distribuirHorasExtras(saldoHoras, usarBancoHoras) {
        if (saldoHoras <= 0) {
            return { horasExtrasRemuneradas: 0, bancoHoras: saldoHoras };
        }
        
        if (usarBancoHoras) {
            return { horasExtrasRemuneradas: 0, bancoHoras: saldoHoras };
        }
        
        return { horasExtrasRemuneradas: saldoHoras, bancoHoras: 0 };
    }

    calcularTotais(registros, valorHora) {
        try {
            if (!registros || !registros.length) {
                return this.getTotaisZerados();
            }

            return registros.reduce((acc, registro) => {
                const calculo = this.calcularValorRegistro(registro, valorHora);
                
                if (calculo.ehFeriado) {
                    acc.totalHorasFeriado += calculo.horasTrabalhadas;
                    acc.totalValorFeriado += calculo.valorTotal;
                } else if (calculo.ehFimDeSemana) {
                    acc.totalHorasBonus += calculo.horasTrabalhadas;
                    acc.totalValorBonus += calculo.valorTotal;
                } else {
                    acc.totalHorasNormais += calculo.horasTrabalhadas;
                    acc.totalValorNormal += calculo.valorTotal;
                }

                acc.totalHorasGeral += calculo.horasTrabalhadas;
                acc.totalValorGeral += calculo.valorTotal;
                acc.totalHorasExtras += calculo.horasExtrasRemuneradas;
                acc.totalBancoHoras += calculo.bancoHoras;
                acc.totalRegistros++;

                return acc;
            }, this.getTotaisZerados());
        } catch (error) {
            console.error('❌ Erro ao calcular totais:', error);
            return this.getTotaisZerados();
        }
    }

    getTotaisZerados() {
        return {
            totalHorasNormais: 0,
            totalHorasBonus: 0,
            totalHorasFeriado: 0,
            totalHorasGeral: 0,
            totalHorasExtras: 0,
            totalBancoHoras: 0,
            totalValorNormal: 0,
            totalValorBonus: 0,
            totalValorFeriado: 0,
            totalValorGeral: 0,
            totalRegistros: 0
        };
    }

    ehFimDeSemana(data) {
        try {
            if (!data) return false;
            const dia = new Date(data).getDay();
            return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
        } catch (error) {
            console.error('❌ Erro ao verificar fim de semana:', error);
            return false;
        }
    }

    obterEstatisticas(registros) {
        try {
            if (!registros || !registros.length) {
                return this.getEstatisticasZeradas();
            }

            const stats = registros.reduce((acc, registro) => {
                const calculo = this.calcularValorRegistro(registro, registro.valorHora);
                
                if (registro.feriado) {
                    acc.plantoesFeriado++;
                } else if (registro.fimDeSemana || this.ehFimDeSemana(registro.data)) {
                    acc.plantoesFimSemana++;
                } else {
                    acc.plantoesNormais++;
                }

                acc.totalHoras += calculo.horasTrabalhadas;
                acc.totalExtras += calculo.horasExtrasRemuneradas;
                acc.totalBanco += calculo.bancoHoras;
                acc.horasPlantoes.push(calculo.horasTrabalhadas);

                return acc;
            }, {
                plantoesNormais: 0,
                plantoesFimSemana: 0,
                plantoesFeriado: 0,
                totalHoras: 0,
                totalExtras: 0,
                totalBanco: 0,
                horasPlantoes: []
            });

            return {
                totalRegistros: registros.length,
                plantoesNormais: stats.plantoesNormais,
                plantoesFimSemana: stats.plantoesFimSemana,
                plantoesFeriado: stats.plantoesFeriado,
                mediaHorasPorPlantao: Math.round((stats.totalHoras / registros.length) * 100) / 100,
                maiorPlantao: Math.max(...stats.horasPlantoes),
                menorPlantao: Math.min(...stats.horasPlantoes),
                totalHorasTrabalhadas: Math.round(stats.totalHoras * 100) / 100,
                totalHorasExtras: Math.round(stats.totalExtras * 100) / 100,
                totalBancoHoras: Math.round(stats.totalBanco * 100) / 100
            };
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return this.getEstatisticasZeradas();
        }
    }

    getEstatisticasZeradas() {
        return {
            totalRegistros: 0,
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

    demonstrarCalculoBonus(valorBase) {
        try {
            const valorComBonus = this.calcularValorHora(valorBase, true);
            const valorComBonusFeriado = this.calcularValorHora(valorBase, false, true);
            
            return {
                valorBase,
                multiplicadorFimSemana: '1.90',
                multiplicadorFeriado: '2.00',
                valorFinalFimSemana: valorComBonus,
                valorFinalFeriado: valorComBonusFeriado,
                exemploFimSemana: 11 * valorComBonus,
                exemploFeriado: 11 * valorComBonusFeriado
            };
        } catch (error) {
            console.error('❌ Erro ao demonstrar cálculo:', error);
            return {
                valorBase: 0,
                multiplicadorFimSemana: '1.90',
                multiplicadorFeriado: '2.00',
                valorFinalFimSemana: 0,
                valorFinalFeriado: 0,
                exemploFimSemana: 0,
                exemploFeriado: 0
            };
        }
    }

    obterInfoSistema() {
        return {
            versao: '2.0.0',
            jornadaPadrao: this.JORNADA_PADRAO,
            horarioPadrao: `${this.HORARIO_ENTRADA_PADRAO} às ${this.HORARIO_SAIDA_PADRAO}`,
            bonusFimSemana: `${(this.BONUS_FIM_SEMANA * 100).toFixed(0)}%`,
            bonusFeriado: `${(this.BONUS_FERIADO * 100).toFixed(0)}%`
        };
    }

    formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
}

// Exportar a classe
window.Calculadora = Calculadora; 