package com.caderninho.Caderninho;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;
    // Cabeçalho com o IP de quem acessa, posto pela hospedagem (caderninho.cabecalho-ip). Vazio: usa o IP da conexão.
    private final String cabecalhoIp;

    public AutenticacaoController(AutenticacaoService autenticacaoService, @Value("${caderninho.cabecalho-ip:}") String cabecalhoIp) {
        this.autenticacaoService = autenticacaoService;
        this.cabecalhoIp = cabecalhoIp;
    }

    // No Render a conexão chega pelos servidores da Cloudflare: sem o cabeçalho, todo mundo parece ter o IP
    // de um desses servidores, e 5 senhas erradas de um curioso bloqueariam a loja inteira.
    private String ipDeQuemAcessa(HttpServletRequest request) {
        String ip = cabecalhoIp.isBlank() ? null : request.getHeader(cabecalhoIp);
        return ip != null && !ip.isBlank() ? ip.trim() : request.getRemoteAddr();
    }

    public record LoginDTO(@NotBlank String senha) {
    }

    @PostMapping("/login")
    public ResponseEntity<?> entrar(@Valid @RequestBody LoginDTO dados, HttpServletRequest request) {
        String ip = ipDeQuemAcessa(request);
        if (autenticacaoService.bloqueado(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Muitas tentativas erradas. Espere alguns minutos.");
        }
        return autenticacaoService.entrar(dados.senha(), ip)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha incorreta."));
    }
}
