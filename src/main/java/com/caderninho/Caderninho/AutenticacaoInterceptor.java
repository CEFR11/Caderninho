package com.caderninho.Caderninho;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

// Barra toda chamada da API sem um token válido no cabeçalho "Authorization: Bearer <token>".
// O usuário do token fica no atributo "usuario" da requisição, para quando cada funcionário tiver o seu.
@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {

    private static final String PREFIXO = "Bearer ";

    private final AutenticacaoService autenticacaoService;

    public AutenticacaoInterceptor(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // O navegador pergunta antes (CORS) sem mandar o token.
        if ("OPTIONS".equals(request.getMethod())) return true;

        String cabecalho = request.getHeader("Authorization");
        String token = cabecalho != null && cabecalho.startsWith(PREFIXO) ? cabecalho.substring(PREFIXO.length()) : null;
        Optional<String> usuario = autenticacaoService.usuarioDoToken(token);
        if (usuario.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("Entre com a senha para continuar.");
            return false;
        }
        request.setAttribute("usuario", usuario.get());
        return true;
    }
}
