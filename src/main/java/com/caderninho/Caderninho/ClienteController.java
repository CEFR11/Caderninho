package com.caderninho.Caderninho;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;
    private final LancamentoRepository lancamentoRepository;

    public ClienteController(ClienteRepository clienteRepository, LancamentoRepository lancamentoRepository) {
        this.clienteRepository = clienteRepository;
        this.lancamentoRepository = lancamentoRepository;

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

        Cliente cliente = clienteRepository.findById(id).orElse(null);

        if (cliente == null) {
            return null;
        }

        novoLancamento.setCliente(cliente);
        lancamentoRepository.save(novoLancamento);
        cliente.adicionarLancamentos(novoLancamento);
        return cliente;

    }
}










