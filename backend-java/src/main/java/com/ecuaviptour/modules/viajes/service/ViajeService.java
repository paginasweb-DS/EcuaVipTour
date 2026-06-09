package com.ecuaviptour.modules.viajes.service;

import com.ecuaviptour.shared.service.BaseService;

import com.ecuaviptour.modules.viajes.domain.Viaje;

import com.ecuaviptour.modules.viajes.domain.Viaje;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ViajeService extends BaseService<Viaje, Long> {
    
    Map<String, Object> cotizar(BigDecimal distanciaKm, String tipoServicio, Integer numPasajeros);
    
    Viaje reservar(Viaje viaje, List<Integer> asientosReq, Long clienteId, Long choferId, Integer numPasajeros, BigDecimal tarifa);
    
    List<Viaje> getViajesCliente(Long clienteId);
    
    List<Viaje> getViajesChofer(Long choferId);
    
    List<Viaje> getViajesPendientesChofer();
    
    List<Viaje> getAllViajes();
    
    Optional<Viaje> getViajeById(Long id);
    
    List<Integer> getAsientosOcupados(Long viajeId);
    
    Optional<Viaje> getViajeActivo(Long userId);
}
