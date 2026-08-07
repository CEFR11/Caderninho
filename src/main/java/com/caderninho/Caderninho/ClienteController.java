package com.caderninho.Caderninho;

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
    public Cliente cadastrarCliente(@RequestBody Cliente novoCliente) {
        return clienteRepository.save(novoCliente);

    }


    @GetMapping
    public List<Cliente> listarCliente() {
        return clienteRepository.findAll();
    }

    @GetMapping("/{id}")
    public Cliente getID(@PathVariable Long id) {
        return clienteRepository.findById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteCliente(@PathVariable Long id) {
        clienteRepository.deleteById(id);
    }


    @PostMapping("/{id}/lancamentos")
    public Cliente lancamentos(@PathVariable Long id, @RequestBody Lancamento novoLancamento) {
        return clienteService.registrarLancamento(id, novoLancamento);

    }
}










