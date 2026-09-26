package com.caderninho.Caderninho;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClienteDevendoDesdeTest {

    private final LocalDate hoje = LocalDate.now();

    private Cliente clienteCom(Lancamento... lancamentos) {
        Cliente cliente = new Cliente("Teste", "85999990000");
        for (Lancamento l : lancamentos) {
            cliente.adicionarLancamentos(l);
        }
        return cliente;
    }

    private Lancamento fiado(String valor, LocalDate data) {
        return new Lancamento(TipoLancamento.FIADO, "fiado", new BigDecimal(valor), data);
    }

    private Lancamento pagamento(String valor, LocalDate data) {
        return new Lancamento(TipoLancamento.PAGAMENTO, "pagamento", new BigDecimal(valor), data);
    }

    @Test
    void quemQuitouTudoEComprouHojeDeveDesdeHoje() {
        Cliente cliente = clienteCom(
                fiado("100", hoje.minusDays(120)),
                pagamento("100", hoje.minusDays(90)),
                fiado("30", hoje));

        assertEquals(Optional.of(hoje), cliente.getDevendoDesde());
        assertEquals(0, cliente.getDiasDevendo());
    }

    @Test
    void pagamentoPequenoNaoZeraAIdadeDaDivida() {
        Cliente cliente = clienteCom(
                fiado("500", hoje.minusDays(90)),
                pagamento("5", hoje));

        assertEquals(Optional.of(hoje.minusDays(90)), cliente.getDevendoDesde());
        assertEquals(90, cliente.getDiasDevendo());
    }

    @Test
    void pagamentoAbatePrimeiroOFiadoMaisAntigo() {
        Cliente cliente = clienteCom(
                fiado("50", hoje.minusDays(10)),
                fiado("100", hoje.minusDays(40)),
                pagamento("100", hoje.minusDays(5)));

        assertEquals(Optional.of(hoje.minusDays(10)), cliente.getDevendoDesde());
    }

    @Test
    void quemNaoDeveNadaNaoTemData() {
        assertEquals(Optional.empty(), clienteCom().getDevendoDesde());
        assertEquals(Optional.empty(), clienteCom(fiado("20", hoje.minusDays(3)), pagamento("30", hoje)).getDevendoDesde());
        assertEquals(0, clienteCom().getDiasDevendo());
    }
}
