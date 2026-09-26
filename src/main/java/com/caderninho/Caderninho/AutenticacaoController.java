package com.caderninho.Caderninho;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;

    public AutenticacaoController(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }

    public record LoginDTO(@NotBlank String senha) {
    }

    @PostMapping("/login")
    public ResponseEntity<?> entrar(@Valid @RequestBody LoginDTO dados, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        if (autenticacaoService.bloqueado(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Muitas tentativas erradas. Espere alguns minutos.");
        }
        return autenticacaoService.entrar(dados.senha(), ip)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha incorreta."));
    }
}
