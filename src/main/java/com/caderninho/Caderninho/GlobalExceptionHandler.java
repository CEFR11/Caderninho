package com.caderninho.Caderninho;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> tratarErroValidacao(MethodArgumentNotValidException erro) {

        List<FieldError> erros = erro.getBindingResult().getFieldErrors();
        List<String> mensagens = erros.stream().map(e -> e.getField() + ":" + e.getDefaultMessage()).toList();
        String corpo = String.join(" | ", mensagens);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(corpo);


    }

}
