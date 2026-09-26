package com.caderninho.Caderninho;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ClienteDTO(Long id, String nome, String telefone, Integer diaPagamento, BigDecimal saldoDevedor,
                         LocalDate devendoDesde, LocalDate vencimento, long diasAtraso,
                         List<LancamentoDTO> lancamentos) {

}
