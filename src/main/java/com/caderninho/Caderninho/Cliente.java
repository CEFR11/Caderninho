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


    private String nome;
    private String telefone;


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

    public void atualizarDados(String nome, String telefone) {
        this.nome = nome;
        this.telefone = telefone;
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
