package com.caderninho.Caderninho;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

    public Cliente(
            @JsonProperty("id") Long id,
            @JsonProperty("nome") String nome,
            @JsonProperty("telefone") String telefone) {
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
