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

    @Test
    void dataMarcadaNoFiadoVaiNaFrenteDoDiaCombinado() {
        Cliente cliente = clienteComFiado(10, LocalDate.of(2026, 8, 19));
        Lancamento fiado = cliente.getLancamentos().get(0);
        fiado.setVencimento(LocalDate.of(2026, 8, 25));
        assertEquals(Optional.of(LocalDate.of(2026, 8, 25)), cliente.getVencimento());
    }

    @Test
    void contaVenceQuandoVenceOPrimeiroFiadoEmAberto() {
        Cliente cliente = clienteComFiado(null, LocalDate.of(2026, 8, 1));
        Lancamento maisNovo = new Lancamento(TipoLancamento.FIADO, "roupa", new BigDecimal("100"), LocalDate.of(2026, 8, 20));
        maisNovo.setVencimento(LocalDate.of(2026, 8, 22));
        cliente.adicionarLancamentos(maisNovo);

        // O fiado de 01/08 venceria em 31/08, mas o de 20/08 foi combinado para 22/08.
        assertEquals(Optional.of(LocalDate.of(2026, 8, 22)), cliente.getVencimento());
    }

    @Test
    void fiadoJaPagoNaoContaParaOVencimento() {
        Cliente cliente = clienteComFiado(null, LocalDate.of(2026, 8, 1));
        cliente.getLancamentos().get(0).setVencimento(LocalDate.of(2026, 8, 5));
        cliente.adicionarLancamentos(new Lancamento(TipoLancamento.PAGAMENTO, "pix", new BigDecimal("50"), LocalDate.of(2026, 8, 4)));
        cliente.adicionarLancamentos(new Lancamento(TipoLancamento.FIADO, "pao", new BigDecimal("20"), LocalDate.of(2026, 8, 10)));

        assertEquals(Optional.of(LocalDate.of(2026, 9, 9)), cliente.getVencimento());
    }
}
