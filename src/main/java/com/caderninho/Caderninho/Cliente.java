package com.caderninho.Caderninho;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class Cliente {

        private String id;
        private String nome;
        private String telefone;


    private List<Lancamento> lancamentos = new ArrayList<>();

    public Cliente(String id,String nome, String telefone) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
    }

    public void adicionarLancamentos(Lancamento lancamento){
        lancamentos.add(lancamento);
    }

    public double getSaldoDevedor(){
        double saldo = 0.0;

        for (Lancamento l : lancamentos){
            if (l.getTipo() == TipoLancamento.FIADO){
                saldo += l.getValorTotal();
            }
            else if (l.getTipo() == TipoLancamento.PAGAMENTO){
                saldo -= l.getValorTotal();
            }
        }
        return saldo;
    }

    public Cliente(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }


    public List<Lancamento> getLancamentos() {
        return lancamentos;
    }

    public String getTelefone() {
        return telefone;
    }
}
