package com.caderninho.Caderninho;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClienteVencimentoTest {

    private Cliente clienteComFiado(Integer diaPagamento, LocalDate dataDoFiado) {
        Cliente cliente = new Cliente("Teste", "85999990000");
        cliente.atualizarDados("Teste", "85999990000", diaPagamento);
        cliente.adicionarLancamentos(new Lancamento(TipoLancamento.FIADO, "fiado", new BigDecimal("50"), dataDoFiado));
        return cliente;
    }

    @Test
    void semDiaCombinadoVenceEmTrintaDias() {
        Cliente cliente = clienteComFiado(null, LocalDate.of(2026, 8, 19));
        assertEquals(Optional.of(LocalDate.of(2026, 9, 18)), cliente.getVencimento());
    }

    @Test
    void venceNoProximoDiaCombinadoDepoisDaCompra() {
        assertEquals(Optional.of(LocalDate.of(2026, 9, 10)), clienteComFiado(10, LocalDate.of(2026, 8, 19)).getVencimento());
        assertEquals(Optional.of(LocalDate.of(2026, 8, 10)), clienteComFiado(10, LocalDate.of(2026, 8, 5)).getVencimento());
    }

    @Test
    void compraNoProprioDiaCombinadoVenceNoMesSeguinte() {
        assertEquals(Optional.of(LocalDate.of(2026, 9, 10)), clienteComFiado(10, LocalDate.of(2026, 8, 10)).getVencimento());
    }

    @Test
    void dia31EmMesCurtoViraUltimoDiaDoMes() {
        assertEquals(Optional.of(LocalDate.of(2026, 2, 28)), clienteComFiado(31, LocalDate.of(2026, 1, 31)).getVencimento());
    }

    @Test
    void diasDeAtrasoContamAPartirDoVencimento() {
        LocalDate hoje = LocalDate.now();
        Cliente atrasado = clienteComFiado(null, hoje.minusDays(40));
        assertEquals(10, atrasado.getDiasAtraso());

        Cliente emDia = clienteComFiado(null, hoje.minusDays(5));
        assertEquals(0, emDia.getDiasAtraso());
    }

    @Test
    void quemNaoDeveNaoTemVencimento() {
        Cliente cliente = new Cliente("Teste", "85999990000");
        assertEquals(Optional.empty(), cliente.getVencimento());
        assertEquals(0, cliente.getDiasAtraso());
    }
}
