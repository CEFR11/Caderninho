package com.caderninho.Caderninho;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

// Várias anotações de uma vez para o mesmo cliente (ex.: camisa e bermuda no mesmo fiado).
public record NovosLancamentosDTO(@NotEmpty List<@Valid NovoLancamentoDTO> lancamentos) {

}
