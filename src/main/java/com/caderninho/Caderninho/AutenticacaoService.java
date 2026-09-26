package com.caderninho.Caderninho;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

// Senha única da loja. Quem acerta recebe um token assinado que vale 30 dias.
// O token é "usuario:expira.assinatura" — hoje o usuário é sempre "loja", mas o campo já existe
// para, no futuro, cada funcionário ter o seu login sem mudar o formato.
// A chave da assinatura mistura o segredo com a senha: trocar a senha derruba todos os logins.
@Service
public class AutenticacaoService {

    static final String USUARIO_LOJA = "loja";
    static final Duration VALIDADE = Duration.ofDays(30);
    static final int ERROS_ANTES_DE_BLOQUEAR = 5;
    static final Duration BLOQUEIO = Duration.ofMinutes(5);

    private static final Logger log = LoggerFactory.getLogger(AutenticacaoService.class);
    private static final Base64.Encoder BASE64 = Base64.getUrlEncoder().withoutPadding();

    private final byte[] resumoDaSenha;
    private final byte[] chave;
    private final Clock relogio;
    private final Map<String, Tentativas> tentativasPorIp = new ConcurrentHashMap<>();

    private record Tentativas(int erros, Instant bloqueadoAte) {
    }

    public record Login(String token, Instant expiraEm) {
    }

    @Autowired
    public AutenticacaoService(@Value("${caderninho.senha:}") String senha, @Value("${caderninho.segredo:}") String segredo) {
        this(senha, segredo, Clock.systemDefaultZone());
    }

    AutenticacaoService(String senha, String segredo, Clock relogio) {
        if (senha == null || senha.isBlank()) {
            throw new IllegalStateException("Defina a senha da loja na variável de ambiente CADERNINHO_SENHA.");
        }
        if (segredo == null || segredo.isBlank()) {
            log.warn("CADERNINHO_SEGREDO não definido: usando um segredo aleatório, e os logins caem toda vez que o servidor reinicia.");
            byte[] aleatorio = new byte[32];
            new SecureRandom().nextBytes(aleatorio);
            segredo = Base64.getEncoder().encodeToString(aleatorio);
        }
        this.resumoDaSenha = sha256(senha);
        this.chave = sha256(segredo + "\n" + senha);
        this.relogio = relogio;
    }

    public boolean bloqueado(String ip) {
        Tentativas t = tentativasPorIp.get(ip);
        return t != null && t.bloqueadoAte() != null && relogio.instant().isBefore(t.bloqueadoAte());
    }

    // Senha certa: devolve o token. Errada: conta o erro do IP e, no quinto seguido, bloqueia por 5 minutos.
    public Optional<Login> entrar(String senhaDigitada, String ip) {
        // Compara os resumos, que têm sempre o mesmo tamanho, para o tempo da comparação não entregar nada da senha.
        if (senhaDigitada == null || !MessageDigest.isEqual(sha256(senhaDigitada), resumoDaSenha)) {
            tentativasPorIp.merge(ip, new Tentativas(1, null), (antes, novo) -> {
                int erros = (antes.bloqueadoAte() != null ? 0 : antes.erros()) + 1;
                return erros >= ERROS_ANTES_DE_BLOQUEAR
                        ? new Tentativas(erros, relogio.instant().plus(BLOQUEIO))
                        : new Tentativas(erros, null);
            });
            return Optional.empty();
        }
        tentativasPorIp.remove(ip);
        Instant expiraEm = relogio.instant().plus(VALIDADE);
        String conteudo = USUARIO_LOJA + ":" + expiraEm.getEpochSecond();
        String token = BASE64.encodeToString(conteudo.getBytes(StandardCharsets.UTF_8)) + "." + BASE64.encodeToString(assinar(conteudo));
        return Optional.of(new Login(token, expiraEm));
    }

    // Token válido e dentro do prazo: devolve o usuário dele.
    public Optional<String> usuarioDoToken(String token) {
        if (token == null) return Optional.empty();
        String[] partes = token.split("\\.");
        if (partes.length != 2) return Optional.empty();
        try {
            String conteudo = new String(Base64.getUrlDecoder().decode(partes[0]), StandardCharsets.UTF_8);
            byte[] assinatura = Base64.getUrlDecoder().decode(partes[1]);
            if (!MessageDigest.isEqual(assinar(conteudo), assinatura)) return Optional.empty();

            int separador = conteudo.lastIndexOf(':');
            if (separador <= 0) return Optional.empty();
            Instant expiraEm = Instant.ofEpochSecond(Long.parseLong(conteudo.substring(separador + 1)));
            if (!relogio.instant().isBefore(expiraEm)) return Optional.empty();
            return Optional.of(conteudo.substring(0, separador));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private byte[] assinar(String conteudo) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(chave, "HmacSHA256"));
            return mac.doFinal(conteudo.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static byte[] sha256(String texto) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(texto.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}
