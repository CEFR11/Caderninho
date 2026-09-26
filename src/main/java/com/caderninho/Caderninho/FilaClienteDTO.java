package com.caderninho.Caderninho;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FilaClienteDTO(Long id, String nome, BigDecimal saldo, long dias, LocalDate devendoDesde) {
}
