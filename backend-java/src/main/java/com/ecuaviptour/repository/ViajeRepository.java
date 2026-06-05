package com.ecuaviptour.repository;

import com.ecuaviptour.model.Viaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio de persistencia para realizar operaciones y búsquedas personalizadas
 * sobre la entidad {@link Viaje}.
 * Suministra consultas ordenadas cronológicamente para paneles de control de clientes, choferes y administración.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Repository
public interface ViajeRepository extends JpaRepository<Viaje, Long> {
    
    /**
     * Obtiene el listado de viajes solicitados por un cliente específico,
     * ordenado del más reciente al más antiguo.
     *
     * @param clienteId Identificador único del cliente (usuario).
     * @return Lista de {@link Viaje} ordenados de forma descendente por ID.
     */
    List<Viaje> findByClienteIdOrderByIdDesc(Long clienteId);
    
    /**
     * Obtiene el historial de viajes asignados a un chofer en particular,
     * ordenado del más reciente al más antiguo.
     *
     * @param choferId Identificador único del chofer (usuario).
     * @return Lista de {@link Viaje} ordenados de forma descendente por ID.
     */
    List<Viaje> findByChoferIdOrderByIdDesc(Long choferId);
    
    /**
     * Obtiene todos los viajes que coinciden con un estado logístico específico
     * (por ejemplo: SOLICITADO, ASIGNADO, EN_CURSO, COMPLETADO, CANCELADO),
     * ordenado de más reciente a más antiguo.
     *
     * @param estadoLogistico Estado logístico del viaje.
     * @return Lista de {@link Viaje} en dicho estado.
     */
    List<Viaje> findByEstadoLogisticoOrderByIdDesc(String estadoLogistico);
    
    /**
     * Recupera todos los viajes registrados en el sistema, ordenados de forma descendente por ID
     * (del viaje más reciente al más antiguo).
     *
     * @return Lista completa de {@link Viaje} ordenados.
     */
    List<Viaje> findAllByOrderByIdDesc();
}

