package com.caderninho.Caderninho;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    private static final Comparator<Lancamento> POR_DATA = Comparator.comparing(Lancamento::getData)
            .thenComparing(Lancamento::getId, Comparator.nullsLast(Comparator.naturalOrder()));

    // Quanto falta pagar de cada fiado (na ordem do mais antigo para o mais novo).
    // Pagamento ligado a uma peça abate dela primeiro; o que sobra, e os pagamentos sem peça escolhida,
    // abatem dos fiados mais antigos, como num caderno.
    public Map<Lancamento, BigDecimal> getRestantePorFiado() {
        List<Lancamento> fiados = lancamentos.stream()
                .filter(l -> l.getTipo() == TipoLancamento.FIADO)
                .sorted(POR_DATA)
                .toList();
        List<Lancamento> pagamentos = lancamentos.stream()
                .filter(l -> l.getTipo() == TipoLancamento.PAGAMENTO)
                .sorted(POR_DATA)
                .toList();

        Map<Lancamento, BigDecimal> restante = new LinkedHashMap<>();
        fiados.forEach(f -> restante.put(f, f.getValorTotal()));

        BigDecimal livre = BigDecimal.ZERO;
        for (Lancamento pagamento : pagamentos) {
            BigDecimal valor = pagamento.getValorTotal();
            Lancamento alvo = pagamento.getFiadoPago();
            if (alvo != null && restante.containsKey(alvo)) {
                BigDecimal abatido = valor.min(restante.get(alvo));
                restante.put(alvo, restante.get(alvo).subtract(abatido));
                valor = valor.subtract(abatido);
            }
            livre = livre.add(valor);
        }

        for (Lancamento fiado : fiados) {
            BigDecimal abatido = livre.min(restante.get(fiado));
            restante.put(fiado, restante.get(fiado).subtract(abatido));
            livre = livre.subtract(abatido);
        }
        return restante;
    }

    // Fiados ainda não totalmente pagos, do mais antigo para o mais novo.
    private List<Lancamento> getFiadosEmAberto() {
        return getRestantePorFiado().entrySet().stream()
                .filter(e -> e.getValue().signum() > 0)
                .map(Map.Entry::getKey)
                .toList();
    }

    // O cliente "deve desde" a data do fiado mais antigo que ainda não foi totalmente pago.
    public Optional<LocalDate> getDevendoDesde() {
        return getFiadosEmAberto().stream().findFirst().map(Lancamento::getData);
    }

    public long getDiasDevendo() {
        return getDevendoDesde().map(desde -> ChronoUnit.DAYS.between(desde, LocalDate.now())).orElse(0L);
    }

    // Vencimento de um fiado: a data combinada nele ou, se não tiver, o primeiro dia combinado
    // do cliente depois da compra (ou a compra + prazo padrão, se não houver dia combinado).
    public LocalDate vencimentoDoFiado(Lancamento fiado) {
        if (fiado.getVencimento() != null) {
            return fiado.getVencimento();
        }
        LocalDate compra = fiado.getData();
        if (diaPagamento == null) {
            return compra.plusDays(PRAZO_PADRAO_DIAS);
        }
        LocalDate candidato = diaNoMes(compra, diaPagamento);
        if (!candidato.isAfter(compra)) {
            candidato = diaNoMes(compra.plusMonths(1), diaPagamento);
        }
        return candidato;
    }

    // A conta vence quando vence o primeiro fiado ainda em aberto.
    public Optional<LocalDate> getVencimento() {
        return getFiadosEmAberto().stream().map(this::vencimentoDoFiado).min(Comparator.naturalOrder());
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
