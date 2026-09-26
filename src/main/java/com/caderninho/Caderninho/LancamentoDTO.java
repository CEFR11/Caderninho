package com.caderninho.Caderninho;


import java.math.BigDecimal;
import java.time.LocalDate;

public record LancamentoDTO(Long id, TipoLancamento tipo, String item, BigDecimal valorTotal, LocalDate data) {

}