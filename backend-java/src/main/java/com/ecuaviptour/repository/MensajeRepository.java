package com.ecuaviptour.repository;

import com.ecuaviptour.model.MensajeChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio de persistencia para gestionar los mensajes de comunicación en tiempo real
 * y soporte técnico representados por la entidad {@link MensajeChat}.
 * Proporciona consultas personalizadas optimizadas con carga ansiosa (FETCH JOIN)
 * de relaciones clave (remitente, destinatario, viaje, soporte).
 *
 * @author Santiago T.
 * @version 1.0
 */
@Repository
public interface MensajeRepository extends JpaRepository<MensajeChat, Long> {
    
    /**
     * Recupera el historial de chat grupal asociado a un viaje específico,
     * ordenado cronológicamente y cargando ansiosamente los usuarios y el viaje.
     *
     * @param viajeId Identificador único del viaje asociado a la conversación.
     * @return Lista de {@link MensajeChat} ordenados por marca de tiempo de forma ascendente.
     */
    @Query("SELECT m FROM MensajeChat m " +
           "LEFT JOIN FETCH m.remitente r " +
           "LEFT JOIN FETCH m.destinatario d " +
           "LEFT JOIN FETCH m.viaje v " +
           "WHERE v.id = :viajeId " +
           "ORDER BY m.timestamp ASC")
    List<MensajeChat> findByViajeIdOrderByTimestampAsc(@Param("viajeId") Long viajeId);
    
    /**
     * Obtiene el historial de mensajes bidireccional entre dos usuarios específicos.
     * Carga de manera eficiente los detalles del remitente, destinatario y viaje asociado.
     *
     * @param userId1 Identificador único del primer usuario participante.
     * @param userId2 Identificador único del segundo usuario participante.
     * @return Lista de {@link MensajeChat} intercambiados entre ambos usuarios, ordenados cronológicamente.
     */
    @Query("SELECT m FROM MensajeChat m " +
           "LEFT JOIN FETCH m.remitente r " +
           "LEFT JOIN FETCH m.destinatario d " +
           "LEFT JOIN FETCH m.viaje v " +
           "WHERE (r.id = :userId1 AND d.id = :userId2) OR " +
           "(r.id = :userId2 AND d.id = :userId1) " +
           "ORDER BY m.timestamp ASC")
    List<MensajeChat> getChatHistoryBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    /**
     * Recupera el historial de conversaciones de soporte técnico entabladas entre un cliente
     * y el personal de administración/soporte.
     * Carga ansiosamente todas las relaciones de auditoría e información de asignación.
     *
     * @param clienteId Identificador único del cliente solicitante de soporte.
     * @return Lista de {@link MensajeChat} vinculados al soporte de dicho cliente, ordenados por fecha.
     */
    @Query("SELECT m FROM MensajeChat m " +
           "LEFT JOIN FETCH m.remitente r " +
           "LEFT JOIN FETCH m.destinatario d " +
           "LEFT JOIN FETCH m.viaje v " +
           "LEFT JOIN FETCH m.soporteAsignado s " +
           "WHERE m.tipoReceptor = 'admin' AND (r.id = :clienteId OR d.id = :clienteId) " +
           "ORDER BY m.timestamp ASC")
    List<MensajeChat> getHistorialSoporteCliente(@Param("clienteId") Long clienteId);

    /**
     * Obtiene la totalidad de los mensajes dirigidos al rol administrador en el canal de soporte,
     * incluyendo detalles completos de remitentes, destinatarios y agentes de soporte asociados.
     *
     * @return Lista completa de {@link MensajeChat} de soporte general de la plataforma.
     */
    @Query("SELECT m FROM MensajeChat m " +
           "LEFT JOIN FETCH m.remitente r " +
           "LEFT JOIN FETCH m.destinatario d " +
           "LEFT JOIN FETCH m.viaje v " +
           "LEFT JOIN FETCH m.soporteAsignado s " +
           "WHERE m.tipoReceptor = 'admin'")
    List<MensajeChat> findAllAdminMessagesWithUsers();
}
