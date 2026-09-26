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

        return new LancamentoDTO(l.getId(), l.getTipo(), l.getItem(), l.getValorTotal(), l.getData());
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


    public Cliente registrarLancamento(Long id, NovoLancamentoDTO novoLancamento) {


        Cliente cliente = clienteRepository.findById(id).orElse(null);

        if (cliente == null) {
            return null;
        }

        Lancamento lancamento = new Lancamento(novoLancamento.tipo(), novoLancamento.item(), novoLancamento.valorTotal(), novoLancamento.data());
        lancamento.setCliente(cliente);
        lancamentoRepository.save(lancamento);
        cliente.adicionarLancamentos(lancamento);
        return cliente;

    }

    public Cliente editarLancamento(Long lancamentoId, NovoLancamentoDTO dados) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId).orElse(null);

        if (lancamento == null) {
            return null;
        }

        lancamento.atualizar(dados.tipo(), dados.item(), dados.valorTotal(), dados.data());
        lancamentoRepository.save(lancamento);
        return lancamento.getCliente();
    }

    public Cliente apagarLancamento(Long lancamentoId) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId).orElse(null);

        if (lancamento == null) {
            return null;
        }

        Cliente cliente = lancamento.getCliente();
        cliente.removerLancamento(lancamento);
        lancamentoRepository.delete(lancamento);
        return cliente;
    }
}

