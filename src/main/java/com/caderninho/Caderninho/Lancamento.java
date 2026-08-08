package com.caderninho.Caderninho;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;


@Entity
public class Lancamento {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private TipoLancamento tipo;
    private String item;
    private BigDecimal valorTotal;
    private LocalDate data;



    @ManyToOne
    private Cliente cliente;

    protected Lancamento() {

    }

    public Lancamento(TipoLancamento tipo, String item, BigDecimal valorTotal, LocalDate data) {
        this.tipo = tipo;
        this.item = item;
        this.valorTotal = valorTotal;
        this.data = data;
    }

    public TipoLancamento getTipo() {

        return tipo;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public LocalDate getData() {
        return data;
    }

    public String getItem() {
        return item;
    }


    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
}


