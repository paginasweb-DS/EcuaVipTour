package com.ecuaviptour.modules.pagos.service;

import com.ecuaviptour.modules.viajes.domain.Viaje;

import com.ecuaviptour.shared.service.BaseService;

import com.ecuaviptour.modules.pagos.domain.Pago;
import com.ecuaviptour.modules.viajes.domain.Viaje;
import java.math.BigDecimal;
import java.util.Optional;

public interface PagoService extends BaseService<Pago, Long> {
    
    Pago registrarPago(Long viajeId, String comprobanteUrl, BigDecimal monto);
    
    Viaje confirmarPago(Long viajeId);
    
    Viaje rechazarPago(Long viajeId);
    
    Optional<Pago> getPagoByViajeId(Long viajeId);
}
