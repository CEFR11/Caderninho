package com.caderninho.Caderninho;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NovoLancamentoDTO(@NotNull TipoLancamento tipo, @NotBlank String item, @Positive BigDecimal valorTotal,
                                @NotNull LocalDate data) {

}

