package com.caderninho.Caderninho;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;
    private final ClienteService clienteService;

    public ClienteController(ClienteRepository clienteRepository, ClienteService clienteService) {
        this.clienteRepository = clienteRepository;
        this.clienteService = clienteService;

    }


    @PostMapping
    public ClienteDTO cadastrarCliente(@Valid @RequestBody NovoClienteDTO novoCliente) {
        Cliente cliente = new Cliente(novoCliente.nome(), novoCliente.telefone());
        cliente = clienteRepository.save(cliente);
        return clienteService.converterClienteDTO(cliente);

    }


    @GetMapping
    public List<ClienteDTO> listarCliente() {
        return clienteRepository.findAll().stream().map(clienteService::converterClienteDTO).toList();
    }

    @GetMapping("/{id}")
    public ClienteDTO getID(@PathVariable Long id) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);

        if (cliente == null) {
            return null;
        }
        return clienteService.converterClienteDTO(cliente);


    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCliente(@PathVariable Long id) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);

        if (cliente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario não existe");
        }
        if (!cliente.getLancamentos().isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Usuario possue lancamentos pendentes");
        }
        clienteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/{id}/lancamentos")
    public ClienteDTO lancamentos(@PathVariable Long id, @Valid @RequestBody NovoLancamentoDTO novoLancamento) {

        Cliente clienteRegistro = clienteService.registrarLancamento(id, novoLancamento);

        if (clienteRegistro == null) {
            return null;
        }
        return clienteService.converterClienteDTO(clienteRegistro);

    }
}










