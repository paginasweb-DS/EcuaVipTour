package com.ecuaviptour.modules.chat.service;

import com.ecuaviptour.modules.chat.domain.MensajeChat;

import com.ecuaviptour.modules.chat.domain.MensajeChat;
import java.util.List;

public interface ChatService {
    
    MensajeChat enviarMensaje(Long viajeId, Long remitenteId, Long destinatarioId, String contenido, String tipoReceptor);
    
    void asignarSoporte(Long clienteId, Long soporteId, String categoria);
    
    MensajeChat resolverCaso(Long clienteId, Long adminId);
    
    List<MensajeChat> getHistorialPorViaje(Long viajeId);
    
    List<MensajeChat> getHistorialEntreUsuarios(Long userId1, Long userId2);
    
    List<MensajeChat> getHistorialSoporteCliente(Long clienteId);
    
    void marcarComoLeidos(List<Long> mensajeIds);
}
