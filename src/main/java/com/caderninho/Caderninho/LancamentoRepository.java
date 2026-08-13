package com.caderninho.Caderninho;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    List<Lancamento> findByTipoAndDataBetween(TipoLancamento tipo, LocalDate inicio, LocalDate fim);

}
