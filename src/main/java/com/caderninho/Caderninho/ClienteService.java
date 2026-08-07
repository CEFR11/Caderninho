package com.caderninho.Caderninho;

import org.springframework.stereotype.Service;

@Service
public class ClienteService {


    private final ClienteRepository clienteRepository;
    private final LancamentoRepository lancamentoRepository;

    public ClienteService(ClienteRepository clienteRepository, LancamentoRepository lancamentoRepository) {
        this.clienteRepository = clienteRepository;
        this.lancamentoRepository = lancamentoRepository;
    }

    public Cliente registrarLancamento(Long id, Lancamento novoLancamento) {


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

