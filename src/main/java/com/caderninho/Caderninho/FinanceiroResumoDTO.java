package com.caderninho.Caderninho;

import java.math.BigDecimal;

public record FinanceiroResumoDTO(
        BigDecimal totalAReceber,
        BigDecimal recebidoNoMes,
        BigDecimal fiadoNoMes,
        BigDecimal recebidoNaSemana,
        BigDecimal fiadoNaSemana,
        BigDecimal recebidoHoje,
        BigDecimal fiadoHoje,
        // Peças que vencem de hoje até o fim do mês (sem contar o que já está atrasado).
        BigDecimal venceNoMes,
        long clientesVenceNoMes,
        // Peças que já venceram e não foram pagas.
        BigDecimal atrasado) {
}
