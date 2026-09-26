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

    // Data combinada para pagar este fiado (opcional). Nula = segue o dia combinado do cliente ou o prazo padrão.
    private LocalDate vencimento;



    @ManyToOne
    private Cliente cliente;

    // Em um pagamento: o fiado (peça) que ele está pagando. Nulo = abate dos fiados mais antigos.
    @ManyToOne
    private Lancamento fiadoPago;

    protected Lancamento() {

    }

    public Lancamento(TipoLancamento tipo, String item, BigDecimal valorTotal, LocalDate data) {
        this.tipo = tipo;
        this.item = item;
        this.valorTotal = valorTotal;
        this.data = data;
    }

    public void atualizar(TipoLancamento tipo, String item, BigDecimal valorTotal, LocalDate data) {
        this.tipo = tipo;
        this.item = item;
        this.valorTotal = valorTotal;
        this.data = data;
    }

    public LocalDate getVencimento() {
        return vencimento;
    }

    public void setVencimento(LocalDate vencimento) {
        this.vencimento = vencimento;
    }

    public Lancamento getFiadoPago() {
        return fiadoPago;
    }

    public void setFiadoPago(Lancamento fiadoPago) {
        this.fiadoPago = fiadoPago;
    }

    public Long getId() {
        return id;
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


