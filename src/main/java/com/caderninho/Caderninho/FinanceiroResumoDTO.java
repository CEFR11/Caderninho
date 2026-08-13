package com.caderninho.Caderninho;

import java.math.BigDecimal;

public record FinanceiroResumoDTO(
        BigDecimal totalAReceber,
        BigDecimal recebidoNoMes,
        BigDecimal fiadoNoMes,
        BigDecimal recebidoNaSemana,
        BigDecimal fiadoNaSemana,
        BigDecimal recebidoHoje,
        BigDecimal fiadoHoje) {
}
