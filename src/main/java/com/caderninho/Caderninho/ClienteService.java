package com.caderninho.Caderninho;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {


    private final ClienteRepository clienteRepository;
    private final LancamentoRepository lancamentoRepository;

    public ClienteService(ClienteRepository clienteRepository, LancamentoRepository lancamentoRepository) {
        this.clienteRepository = clienteRepository;
        this.lancamentoRepository = lancamentoRepository;
    }

    public LancamentoDTO converterLancamento(Lancamento l) {

        return new LancamentoDTO(l.getTipo(), l.getItem(), l.getValorTotal(), l.getData());
    }

    public ClienteDTO converterClienteDTO(Cliente cliente) {
        List<LancamentoDTO> lancamentoDTO = cliente.getLancamentos().stream().map(this::converterLancamento).toList();

        return new ClienteDTO(
                cliente.getId(),
                cliente.getNome(),
                cliente.getTelefone(),
                cliente.getSaldoDevedor(),
                lancamentoDTO
        );

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

