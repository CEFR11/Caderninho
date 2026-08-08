package com.caderninho.Caderninho;

import java.math.BigDecimal;
import java.util.List;

public record ClienteDTO(Long id, String nome, String telefone, BigDecimal saldoDevedor,
                         List<LancamentoDTO> lancamentos) {

}
