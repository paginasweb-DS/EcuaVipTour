package com.ecuaviptour.modules.pagos.repository;

import com.ecuaviptour.modules.pagos.domain.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio de persistencia para gestionar las operaciones de base de datos
 * asociadas a la entidad {@link Pago}.
 * Proporciona métodos para consultar información transaccional de pagos realizados.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    
    /**
     * Busca la información del pago asociada a un viaje en particular.
     *
     * @param viajeId Identificador único del viaje.
     * @return Un {@link Optional} que contiene el pago si se encuentra registrado, o vacío en caso contrario.
     */
    Optional<Pago> findByViajeId(Long viajeId);
}

