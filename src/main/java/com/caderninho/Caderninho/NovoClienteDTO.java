package com.caderninho.Caderninho;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record NovoClienteDTO(
        @NotBlank String nome, @NotBlank String telefone, @Min(1) @Max(31) Integer diaPagamento) {

}
