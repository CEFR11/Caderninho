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
    public ClienteDTO cadastrarCliente(@RequestBody Cliente novoCliente) {
        Cliente cliente = clienteRepository.save(novoCliente);
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
    public void deleteCliente(@PathVariable Long id) {
        clienteRepository.deleteById(id);
    }


    @PostMapping("/{id}/lancamentos")
    public ClienteDTO lancamentos(@PathVariable Long id, @RequestBody Lancamento novoLancamento) {

        Cliente clienteRegistro = clienteService.registrarLancamento(id, novoLancamento);

        if (clienteRegistro == null) {
            return null;
        }
        return clienteService.converterClienteDTO(clienteRegistro);

    }
}










