package com.caderninho.Caderninho;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ClienteDTO(Long id, String nome, String telefone, BigDecimal saldoDevedor,
                         LocalDate devendoDesde, List<LancamentoDTO> lancamentos) {

}
