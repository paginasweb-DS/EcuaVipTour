package com.ecuaviptour.modules.viajes.repository;

import com.ecuaviptour.modules.viajes.domain.TicketQR;

import com.ecuaviptour.modules.viajes.domain.TicketQR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio de persistencia para gestionar el almacenamiento y la validación
 * de códigos de control de seguridad representados por la entidad {@link TicketQR}.
 * Permite buscar boletos virtuales mediante el viaje asociado o a través de su identificador único de seguridad hash.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Repository
public interface TicketQRRepository extends JpaRepository<TicketQR, Long> {
    
    /**
     * Recupera el ticket QR generado para un viaje específico.
     *
     * @param viajeId Identificador único del viaje.
     * @return Un {@link Optional} que contiene el ticket QR si ya ha sido emitido, o vacío en caso contrario.
     */
    Optional<TicketQR> findByViajeId(Long viajeId);
    
    /**
     * Busca un ticket QR mediante su código hash único, utilizado principalmente en los procesos
     * de escaneo y verificación de abordaje.
     *
     * @param codigoHash Cadena de caracteres hash única del boleto QR.
     * @return Un {@link Optional} con el ticket QR correspondiente si el código es válido y está registrado.
     */
    Optional<TicketQR> findByCodigoHash(String codigoHash);
}

