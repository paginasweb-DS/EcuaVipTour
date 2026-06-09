package com.ecuaviptour.modules.gastos.repository;

import com.ecuaviptour.modules.gastos.domain.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de persistencia para gestionar las operaciones de base de datos
 * asociadas a la entidad {@link Gasto}.
 * Proporciona métodos para almacenar y consultar información transaccional de gastos.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {
}
