package com.caderninho.Caderninho;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PagamentoDTO(String nomeCliente, String item, BigDecimal valorTotal, LocalDate data) {

}
