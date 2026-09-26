package com.caderninho.Caderninho;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class ClienteService {


    private final ClienteRepository clienteRepository;
    private final LancamentoRepository lancamentoRepository;

    public ClienteService(ClienteRepository clienteRepository, LancamentoRepository lancamentoRepository) {
        this.clienteRepository = clienteRepository;
        this.lancamentoRepository = lancamentoRepository;
    }

    public LancamentoDTO converterLancamento(Lancamento l, Map<Lancamento, BigDecimal> restantePorFiado) {
        Long fiadoPagoId = l.getFiadoPago() == null ? null : l.getFiadoPago().getId();
        return new LancamentoDTO(l.getId(), l.getTipo(), l.getItem(), l.getValorTotal(), l.getData(), l.getVencimento(),
                restantePorFiado.get(l), fiadoPagoId);
    }

    public ClienteDTO converterClienteDTO(Cliente cliente) {
        Map<Lancamento, BigDecimal> restantePorFiado = cliente.getRestantePorFiado();
        List<LancamentoDTO> lancamentoDTO = cliente.getLancamentos().stream()
                .map(l -> converterLancamento(l, restantePorFiado))
                .toList();

        return new ClienteDTO(
                cliente.getId(),
                cliente.getNome(),
                cliente.getTelefone(),
                cliente.getDiaPagamento(),
                cliente.getSaldoDevedor(),
                cliente.getDevendoDesde().orElse(null),
                cliente.getVencimento().orElse(null),
                cliente.getDiasAtraso(),
                lancamentoDTO
        );

    }


    public Cliente registrarLancamento(Long id, NovoLancamentoDTO novoLancamento) {


        Cliente cliente = clienteRepository.findById(id).orElse(null);

        if (cliente == null) {
            return null;
        }

        anotar(cliente, novoLancamento);
        return cliente;

    }

    // Várias peças de uma vez: ou salva todas, ou nenhuma.
    @Transactional
    public Cliente registrarVarios(Long id, NovosLancamentosDTO novos) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);

        if (cliente == null) {
            return null;
        }

        novos.lancamentos().forEach(novo -> anotar(cliente, novo));
        return cliente;
    }

    private void anotar(Cliente cliente, NovoLancamentoDTO novoLancamento) {
        Lancamento lancamento = new Lancamento(novoLancamento.tipo(), novoLancamento.item(), novoLancamento.valorTotal(), novoLancamento.data());
        lancamento.setCliente(cliente);
        lancamento.setVencimento(vencimentoSeFiado(novoLancamento));
        lancamento.setFiadoPago(fiadoDoCliente(cliente, novoLancamento));
        lancamentoRepository.save(lancamento);
        cliente.adicionarLancamentos(lancamento);
    }

    // O fiado que o pagamento está pagando — só vale se for um fiado deste mesmo cliente.
    private static Lancamento fiadoDoCliente(Cliente cliente, NovoLancamentoDTO dados) {
        if (dados.tipo() != TipoLancamento.PAGAMENTO || dados.fiadoPagoId() == null) {
            return null;
        }
        return cliente.getLancamentos().stream()
                .filter(l -> l.getTipo() == TipoLancamento.FIADO && dados.fiadoPagoId().equals(l.getId()))
                .findFirst()
                .orElse(null);
    }

    // Só fiado tem data para pagar; em pagamento o campo é ignorado.
    private static java.time.LocalDate vencimentoSeFiado(NovoLancamentoDTO dados) {
        return dados.tipo() == TipoLancamento.FIADO ? dados.vencimento() : null;
    }

    public Cliente editarLancamento(Long lancamentoId, NovoLancamentoDTO dados) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId).orElse(null);

        if (lancamento == null) {
            return null;
        }

        lancamento.atualizar(dados.tipo(), dados.item(), dados.valorTotal(), dados.data());
        lancamento.setVencimento(vencimentoSeFiado(dados));
        // A correção não mexe na peça que o pagamento abateu, a não ser que ele tenha virado fiado.
        if (dados.tipo() == TipoLancamento.FIADO) {
            lancamento.setFiadoPago(null);
        }
        lancamentoRepository.save(lancamento);
        return lancamento.getCliente();
    }

    public Cliente apagarLancamento(Long lancamentoId) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId).orElse(null);

        if (lancamento == null) {
            return null;
        }

        Cliente cliente = lancamento.getCliente();
        // Pagamentos que apontavam para este fiado passam a abater dos mais antigos.
        cliente.getLancamentos().stream()
                .filter(l -> l.getFiadoPago() == lancamento)
                .forEach(l -> {
                    l.setFiadoPago(null);
                    lancamentoRepository.save(l);
                });
        cliente.removerLancamento(lancamento);
        lancamentoRepository.delete(lancamento);
        return cliente;
    }
}

