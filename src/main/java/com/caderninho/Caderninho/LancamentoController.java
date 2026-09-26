package com.caderninho.Caderninho;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lancamentos")
public class LancamentoController {

    private final ClienteService clienteService;

    public LancamentoController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // Devolvem o cliente atualizado, para a tela já mostrar o saldo e o extrato novos.

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTO> editar(@PathVariable Long id, @Valid @RequestBody NovoLancamentoDTO dados) {
        Cliente cliente = clienteService.editarLancamento(id, dados);

        if (cliente == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(clienteService.converterClienteDTO(cliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ClienteDTO> apagar(@PathVariable Long id) {
        Cliente cliente = clienteService.apagarLancamento(id);

        if (cliente == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(clienteService.converterClienteDTO(cliente));
    }
}
