package com.caderninho.Caderninho;

import java.math.BigDecimal;

public record FilaClienteDTO(Long id, String nome, BigDecimal saldo, long dias) {
}
