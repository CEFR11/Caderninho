package com.caderninho.Caderninho;

import jakarta.validation.constraints.NotBlank;

public record NovoClienteDTO(
        @NotBlank String nome, @NotBlank String telefone) {

}
