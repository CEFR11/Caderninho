package com.caderninho.Caderninho;


import java.math.BigDecimal;
import java.time.LocalDate;

// restante: quanto falta pagar (só em fiado). fiadoPagoId: a peça que um pagamento abateu (só em pagamento).
public record LancamentoDTO(Long id, TipoLancamento tipo, String item, BigDecimal valorTotal, LocalDate data,
                            LocalDate vencimento, BigDecimal restante, Long fiadoPagoId) {

}