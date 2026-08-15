package com.caderninho.Caderninho;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.lang.IllegalStateException;


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

    public void adicionarLancamentos(Lancamento lancamento) {
        lancamentos.add(lancamento);
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

    public long getDiasSemPagar() {

        Optional<LocalDate> ultimoPagamento = lancamentos.stream().filter(lancamento -> lancamento.getTipo() == TipoLancamento.PAGAMENTO).map(Lancamento::getData).max(Comparator.naturalOrder());
        if (ultimoPagamento.isPresent()) {
            LocalDate dataAntiga = ultimoPagamento.get();
            long dias = ChronoUnit.DAYS.between(dataAntiga, LocalDate.now());
            return dias;
        }


        Optional<LocalDate> ultimoFiado = lancamentos.stream().filter(lancamento -> lancamento.getTipo() == TipoLancamento.FIADO).map(Lancamento::getData).min(Comparator.naturalOrder());
        if (ultimoFiado.isPresent()) {
            LocalDate dataAntiga = ultimoFiado.get();
            long dias = ChronoUnit.DAYS.between(dataAntiga, LocalDate.now());
            return dias;
        }

        throw new IllegalStateException("Cliente sem historico de lançamentos");
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
