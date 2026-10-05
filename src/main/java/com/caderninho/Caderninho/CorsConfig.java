package com.caderninho.Caderninho;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Lista em caderninho.origens (separada por vírgula); aceita * no endereço, ex: http://192.168.*.*:5173.
    private final String[] origens;

    public CorsConfig(@Value("${caderninho.origens:}") String[] origens) {
        this.origens = origens;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Lista vazia no Spring vira "qualquer site" (*). Sem origem configurada, nenhum site entra.
        if (Arrays.stream(origens).allMatch(String::isBlank)) return;
        registry.addMapping("/**")
                .allowedOriginPatterns(origens)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }

}
