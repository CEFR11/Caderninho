package com.caderninho.Caderninho;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentoDTO(String nomeCliente, TipoLancamento tipo, String item, BigDecimal valorTotal, LocalDate data) {

}
