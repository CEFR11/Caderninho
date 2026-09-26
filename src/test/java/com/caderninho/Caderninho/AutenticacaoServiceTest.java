package com.caderninho.Caderninho;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AutenticacaoServiceTest {

    private static final Instant AGORA = Instant.parse("2026-09-26T12:00:00Z");
    private static final String IP = "192.168.0.10";

    private AutenticacaoService servico(String senha, Instant agora) {
        return new AutenticacaoService(senha, "segredo", Clock.fixed(agora, ZoneId.of("UTC")));
    }

    private String tokenValido() {
        return servico("1234", AGORA).entrar("1234", IP).orElseThrow().token();
    }

    @Test
    void senhaCertaDaTokenQueIdentificaALoja() {
        AutenticacaoService servico = servico("1234", AGORA);
        AutenticacaoService.Login login = servico.entrar("1234", IP).orElseThrow();

        assertEquals(AGORA.plus(Duration.ofDays(30)), login.expiraEm());
        assertEquals(Optional.of("loja"), servico.usuarioDoToken(login.token()));
    }

    @Test
    void senhaErradaNaoDaToken() {
        assertTrue(servico("1234", AGORA).entrar("4321", IP).isEmpty());
        assertTrue(servico("1234", AGORA).entrar(null, IP).isEmpty());
    }

    @Test
    void tokenVenceDepoisDeTrintaDias() {
        String token = tokenValido();
        assertTrue(servico("1234", AGORA.plus(Duration.ofDays(29))).usuarioDoToken(token).isPresent());
        assertTrue(servico("1234", AGORA.plus(Duration.ofDays(30))).usuarioDoToken(token).isEmpty());
    }

    @Test
    void trocarASenhaDerrubaOsLogins() {
        assertTrue(servico("nova", AGORA).usuarioDoToken(tokenValido()).isEmpty());
    }

    @Test
    void tokenAlteradoOuQuebradoNaoVale() {
        String token = tokenValido();
        String assinatura = token.substring(token.indexOf('.'));
        String outroConteudo = java.util.Base64.getUrlEncoder().withoutPadding()
                .encodeToString("loja:9999999999".getBytes());
        AutenticacaoService servico = servico("1234", AGORA);

        assertTrue(servico.usuarioDoToken(outroConteudo + assinatura).isEmpty());
        assertTrue(servico.usuarioDoToken("lixo").isEmpty());
        assertTrue(servico.usuarioDoToken("a.b.c").isEmpty());
        assertTrue(servico.usuarioDoToken("%%%.%%%").isEmpty());
        assertTrue(servico.usuarioDoToken(null).isEmpty());
    }

    @Test
    void cincoErrosSeguidosBloqueiamOIpPorCincoMinutos() {
        AutenticacaoService servico = servico("1234", AGORA);
        for (int i = 0; i < 4; i++) servico.entrar("errada", IP);
        assertFalse(servico.bloqueado(IP));

        servico.entrar("errada", IP);
        assertTrue(servico.bloqueado(IP));
        assertFalse(servico.bloqueado("192.168.0.11"));
    }

    @Test
    void acertarASenhaZeraOsErros() {
        AutenticacaoService servico = servico("1234", AGORA);
        for (int i = 0; i < 4; i++) servico.entrar("errada", IP);
        servico.entrar("1234", IP);
        servico.entrar("errada", IP);
        assertFalse(servico.bloqueado(IP));
    }

    @Test
    void semSenhaConfiguradaNaoSobe() {
        assertThrows(IllegalStateException.class, () -> servico("", AGORA));
        assertThrows(IllegalStateException.class, () -> servico(null, AGORA));
    }
}
