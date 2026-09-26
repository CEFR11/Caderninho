package com.caderninho.Caderninho;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;


@Entity
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // Prazo usado quando o cliente não tem dia combinado para pagar.
    public static final int PRAZO_PADRAO_DIAS = 30;

    private String nome;
    private String telefone;

    // Dia do mês combinado para pagar (1 a 31). Nulo = sem dia combinado, vale o prazo padrão.
    private Integer diaPagamento;


    @OneToMany(mappedBy = "cliente")
    private List<Lancamento> lancamentos = new ArrayList<>();

    protected Cliente() {

    }

    public Cliente(String nome, String telefone) {
        this(null, nome, telefone);
    }

    public Cliente(Long id, String nome, String telefone) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
    }

    public void atualizarDados(String nome, String telefone, Integer diaPagamento) {
        this.nome = nome;
        this.telefone = telefone;
        this.diaPagamento = diaPagamento;
    }

    public void adicionarLancamentos(Lancamento lancamento) {
        lancamentos.add(lancamento);
    }

    public void removerLancamento(Lancamento lancamento) {
        lancamentos.remove(lancamento);
    }

    public BigDecimal getSaldoDevedor() {
        BigDecimal saldo = BigDecimal.ZERO;

        for (Lancamento l : lancamentos) {
            if (l.getTipo() == TipoLancamento.FIADO) {
                saldo = saldo.add(l.getValorTotal());
            } else if (l.getTipo() == TipoLancamento.PAGAMENTO) {
                saldo = saldo.subtract(l.getValorTotal());
            }
        }
        return saldo;
    }

    // Idade da dívida, como num caderno: os pagamentos abatem primeiro os fiados mais antigos.
    // O cliente "deve desde" a data do fiado mais antigo que ainda não foi totalmente pago.
    public Optional<LocalDate> getDevendoDesde() {
        BigDecimal pago = lancamentos.stream()
                .filter(l -> l.getTipo() == TipoLancamento.PAGAMENTO)
                .map(Lancamento::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Lancamento> fiados = lancamentos.stream()
                .filter(l -> l.getTipo() == TipoLancamento.FIADO)
                .sorted(Comparator.comparing(Lancamento::getData)
                        .thenComparing(Lancamento::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        for (Lancamento fiado : fiados) {
            if (pago.compareTo(fiado.getValorTotal()) >= 0) {
                pago = pago.subtract(fiado.getValorTotal());
            } else {
                return Optional.of(fiado.getData());
            }
        }
        return Optional.empty();
    }

    public long getDiasDevendo() {
        return getDevendoDesde().map(desde -> ChronoUnit.DAYS.between(desde, LocalDate.now())).orElse(0L);
    }

    // Quando a dívida atual vence: o primeiro dia combinado depois de "deve desde"
    // (ou "deve desde" + prazo padrão, se não houver dia combinado).
    public Optional<LocalDate> getVencimento() {
        return getDevendoDesde().map(desde -> {
            if (diaPagamento == null) {
                return desde.plusDays(PRAZO_PADRAO_DIAS);
            }
            LocalDate candidato = diaNoMes(desde, diaPagamento);
            if (!candidato.isAfter(desde)) {
                candidato = diaNoMes(desde.plusMonths(1), diaPagamento);
            }
            return candidato;
        });
    }

    // Dia 31 em mês de 30 dias (ou fevereiro) vira o último dia do mês.
    private static LocalDate diaNoMes(LocalDate referencia, int dia) {
        return referencia.withDayOfMonth(Math.min(dia, referencia.lengthOfMonth()));
    }

    public long getDiasAtraso() {
        return getVencimento()
                .map(vencimento -> Math.max(0, ChronoUnit.DAYS.between(vencimento, LocalDate.now())))
                .orElse(0L);
    }

    public Integer getDiaPagamento() {
        return diaPagamento;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public List<Lancamento> getLancamentos() {
        return List.copyOf(lancamentos);
    }

    public String getTelefone() {
        return telefone;
    }
}
