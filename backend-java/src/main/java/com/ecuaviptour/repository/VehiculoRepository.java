package com.ecuaviptour.repository;

import com.ecuaviptour.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio de persistencia para gestionar los vehículos registrados en la flota de {@link Vehiculo}.
 * Permite buscar vehículos por su matrícula única (placa), chofer asignado o por el estado actual de operación.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    
    /**
     * Busca un vehículo específico a través de su placa o matrícula.
     * Utilizado para verificar que no existan placas duplicadas en la plataforma.
     *
     * @param placa Número de placa identificadora del vehículo.
     * @return Un {@link Optional} que contiene el vehículo si está registrado, o vacío en caso contrario.
     */
    Optional<Vehiculo> findByPlaca(String placa);
    
    /**
     * Recupera el vehículo asignado a un chofer en particular.
     *
     * @param choferId Identificador único del chofer (usuario).
     * @return Un {@link Optional} que contiene el vehículo asignado al chofer, o vacío si no tiene vehículo.
     */
    Optional<Vehiculo> findByChoferId(Long choferId);
    
    /**
     * Obtiene una lista de vehículos filtrada por su estado logístico u operativo
     * (por ejemplo: activo, inactivo, mantenimiento).
     *
     * @param estado Estado de operación del vehículo.
     * @return Lista de {@link Vehiculo} que coinciden con el estado proporcionado.
     */
    List<Vehiculo> findByEstado(String estado);
}

