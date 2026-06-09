package com.ecuaviptour.modules.users.service;

import com.ecuaviptour.modules.vehiculos.domain.Vehiculo;
import java.util.Optional;

public interface DriverService {
    
    Optional<Vehiculo> getVehiculoByChoferId(Long choferId);
    
    Vehiculo updateVehiculo(Long choferId, Vehiculo data);
}
