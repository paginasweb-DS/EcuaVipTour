package com.ecuaviptour.modules.viajes.repository;

import com.ecuaviptour.modules.viajes.domain.ReservaAsiento;

import com.ecuaviptour.modules.viajes.domain.ReservaAsiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio de persistencia para gestionar el estado de las reservas de asientos
 * representadas por la entidad {@link ReservaAsiento}.
 * Proporciona métodos para listar reservas por viaje y filtrar según su estado actual.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Repository
public interface ReservaAsientoRepository extends JpaRepository<ReservaAsiento, Long> {
    
    /**
     * Recupera todas las reservas de asientos realizadas para un viaje en específico.
     *
     * @param viajeId Identificador único del viaje.
     * @return Lista de {@link ReservaAsiento} asociadas a dicho viaje.
     */
    List<ReservaAsiento> findByViajeId(Long viajeId);
    
    /**
     * Recupera todas las reservas de asientos asociadas a un viaje y filtradas por su estado actual
     * (por ejemplo: ocupado, pre-reservado, cancelado).
     *
     * @param viajeId Identificador único del viaje.
     * @param estado  Estado de la reserva a filtrar.
     * @return Lista de {@link ReservaAsiento} que coinciden con el viaje y el estado especificados.
     */
    List<ReservaAsiento> findByViajeIdAndEstado(Long viajeId, String estado);
}

