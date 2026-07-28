package com.caderninho.Caderninho;

import java.time.LocalDate;

public class Lancamento {

    private TipoLancamento tipo;
    private String item;
    private double valorTotal;
    private LocalDate data;


    public Lancamento(TipoLancamento tipo, String item, double valorTotal, LocalDate data) {
        this.tipo = tipo;
        this.item = item;
        this.valorTotal = valorTotal;
        this.data = data;
    }

    public TipoLancamento getTipo() {

        return tipo;
    }

    public double getValorTotal() {

        return valorTotal;
    }

    public LocalDate getData() {

        return data;
    }

    public String getItem() {

        return item;
    }



}


