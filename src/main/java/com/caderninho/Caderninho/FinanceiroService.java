package com.caderninho.Caderninho;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;

@Service
public class FinanceiroService {

    private final ClienteRepository clienteRepository;
    private final LancamentoRepository lancamentoRepository;

    public FinanceiroService(ClienteRepository clienteRepository, LancamentoRepository lancamentoRepository) {
        this.clienteRepository = clienteRepository;
        this.lancamentoRepository = lancamentoRepository;

    }

    public BigDecimal calcularTotalAReceber() {
        BigDecimal total = clienteRepository.findAll().stream().map(Cliente::getSaldoDevedor).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total;

    }


    public BigDecimal calcularRecebidoNoMes() {
        LocalDate inicio = LocalDate.now().withDayOfMonth(1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        List<Lancamento> lancamentos = lancamentoRepository.findByTipoAndDataBetween(TipoLancamento.PAGAMENTO, inicio, fim);
        BigDecimal total = lancamentos.stream().map(l -> l.getValorTotal()).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total;

    }

    public BigDecimal calcularFiadoNoMes() {
        LocalDate inicio = LocalDate.now().withDayOfMonth(1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        List<Lancamento> lancamentos = lancamentoRepository.findByTipoAndDataBetween(TipoLancamento.FIADO, inicio, fim);
        BigDecimal total = lancamentos.stream().map(l -> l.getValorTotal()).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total;

    }

    public BigDecimal calcularRecebidoNaSemana() {
        LocalDate segunda = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate fim = LocalDate.now();

        List<Lancamento> lancamentos = lancamentoRepository.findByTipoAndDataBetween(TipoLancamento.PAGAMENTO, segunda, fim);
        BigDecimal total = lancamentos.stream().map(l -> l.getValorTotal()).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total;

    }

    public BigDecimal calcularFiadoNaSemana() {
        LocalDate segunda = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate fim = LocalDate.now();
        List<Lancamento> lancamentos = lancamentoRepository.findByTipoAndDataBetween(TipoLancamento.FIADO, segunda, fim);
        BigDecimal total = lancamentos.stream().map(l -> l.getValorTotal()).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total;
    }

    public BigDecimal calcularFiadoHoje() {
        LocalDate hoje = LocalDate.now();
        List<Lancamento> lancamentos = lancamentoRepository.findByTipoAndDataBetween(TipoLancamento.FIADO, hoje, hoje);
        BigDecimal total = lancamentos.stream().map(l -> l.getValorTotal()).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total;
    }

    public BigDecimal calcularRecebidoHoje() {
        LocalDate hoje = LocalDate.now();
        List<Lancamento> lancamentos = lancamentoRepository.findByTipoAndDataBetween(TipoLancamento.PAGAMENTO, hoje, hoje);
        BigDecimal total = lancamentos.stream().map(l -> l.getValorTotal()).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total;
    }

    public FinanceiroResumoDTO gerarResumo() {
        return new FinanceiroResumoDTO(calcularTotalAReceber(), calcularRecebidoNoMes(), calcularFiadoNoMes(), calcularRecebidoNaSemana(), calcularFiadoNaSemana(), calcularRecebidoHoje(), calcularFiadoHoje());

    }

    public List<FilaClienteDTO> gerarFila(String filtro) {
        List<Cliente> clientes = clienteRepository.findAll().stream().filter(c -> c.getSaldoDevedor().compareTo(BigDecimal.ZERO) > 0).toList();
        List<FilaClienteDTO> filaClienteDTO = clientes.stream().map(c -> new FilaClienteDTO(c.getId(), c.getNome(), c.getSaldoDevedor(), c.getDiasSemPagar())).toList();

        switch (filtro) {
            case "atrasados":
                return filaClienteDTO.stream().filter(c -> c.dias() >= 30).sorted(Comparator.comparing(FilaClienteDTO::dias).reversed()).toList();

            case "valor":
                return filaClienteDTO.stream().sorted(Comparator.comparing(FilaClienteDTO::saldo).reversed()).toList();

            case "recentes":

                return filaClienteDTO.stream().sorted(Comparator.comparing(FilaClienteDTO::dias)).toList();

            default:

                return filaClienteDTO.stream().sorted(Comparator.comparing((FilaClienteDTO c) -> c.saldo().multiply(BigDecimal.valueOf(c.dias()))).reversed()).toList();

        }
    }

    public List<PagamentoDTO> gerarPagamentos() {
        List<Lancamento> pagamentos = lancamentoRepository.findByTipo(TipoLancamento.PAGAMENTO);
        return pagamentos.stream().map(l -> new PagamentoDTO(l.getCliente().getNome(), l.getItem(), l.getValorTotal(), l.getData())).toList();
    }


}
