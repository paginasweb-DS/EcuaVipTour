package com.ecuaviptour.service.implementation;

import com.ecuaviptour.model.Usuario;
import com.ecuaviptour.model.Vehiculo;
import com.ecuaviptour.repository.UsuarioRepository;
import com.ecuaviptour.repository.VehiculoRepository;
import com.ecuaviptour.service.interfaces.DriverService;
import com.ecuaviptour.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

/**
 * Implementación de los servicios destinados a los choferes y su flota vehicular.
 * Resuelve la lógica de negocio para la auto-inscripción de transportes, actualización de fichas
 * técnicas, y el bloqueo estricto de documentos confidenciales (licencia, matrícula) tras la aprobación.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Service
public class DriverServiceImpl implements DriverService {

    private final VehiculoRepository vehiculoRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Constructor para la inyección de repositorios del dominio vehicular y de cuentas de usuario.
     *
     * @param vehiculoRepository Repositorio de vehículos.
     * @param usuarioRepository  Repositorio de usuarios.
     */
    public DriverServiceImpl(VehiculoRepository vehiculoRepository, UsuarioRepository usuarioRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Recupera el vehículo que está asociado o registrado a nombre de un chofer.
     *
     * @param choferId Identificador único del chofer.
     * @return Un {@link Optional} que contiene el vehículo del chofer, si posee uno registrado.
     */
    @Override
    public Optional<Vehiculo> getVehiculoByChoferId(Long choferId) {
        return vehiculoRepository.findByChoferId(choferId);
    }

    /**
     * Crea o actualiza transaccionalmente la ficha técnica y de control del vehículo de un chofer.
     * Aplica la regla de negocio estricta: si el vehículo ya está "activo" (aprobado), se bloquean
     * las modificaciones sobre campos críticos y fotos legales (placa, matrícula, licencia) para evitar fraude,
     * permitiendo solo cambios estéticos menores. Si estaba "rechazado", revierte el estado a "pendiente" para nueva auditoría.
     *
     * @param choferId Identificador único del chofer que solicita la actualización.
     * @param data     Datos del vehículo recibidos del formulario.
     * @return El {@link Vehiculo} actualizado e inscrito.
     * @throws ResourceNotFoundException Si el chofer asociado al identificador no se encuentra registrado.
     */
    @Override
    @Transactional
    public Vehiculo updateVehiculo(Long choferId, Vehiculo data) {
        Usuario chofer = usuarioRepository.findById(choferId)
                .orElseThrow(() -> new ResourceNotFoundException("Chofer no encontrado con el ID: " + choferId));

        Vehiculo v = vehiculoRepository.findByChoferId(choferId)
                .orElseGet(() -> Vehiculo.builder()
                        .chofer(chofer)
                        .estado("pendiente")
                        .capacidadMax(15)
                        .placa("")
                        .build());

        if ("activo".equalsIgnoreCase(v.getEstado())) {
            // Strict business rule: lock sensitive documents and identity fields once approved!
            if (data.getMarca() != null) v.setMarca(data.getMarca());
            if (data.getModelo() != null) v.setModelo(data.getModelo());
            if (data.getAnio() != null) v.setAnio(data.getAnio());
            if (data.getCapacidadMax() != null) v.setCapacidadMax(data.getCapacidadMax());
            if (data.getColor() != null) v.setColor(data.getColor());
        } else {
            // Allow all edits during pending or rejected states
            if (data.getPlaca() != null) v.setPlaca(data.getPlaca());
            if (data.getMarca() != null) v.setMarca(data.getMarca());
            if (data.getModelo() != null) v.setModelo(data.getModelo());
            if (data.getAnio() != null) v.setAnio(data.getAnio());
            if (data.getTipoVehiculo() != null) v.setTipoVehiculo(data.getTipoVehiculo());
            if (data.getCapacidadMax() != null) v.setCapacidadMax(data.getCapacidadMax());
            if (data.getColor() != null) v.setColor(data.getColor());

            if (data.getLicenciaTipo() != null) v.setLicenciaTipo(data.getLicenciaTipo());
            if (data.getLicenciaVigencia() != null) v.setLicenciaVigencia(data.getLicenciaVigencia());
            if (data.getFotoAutoUrl() != null) v.setFotoAutoUrl(data.getFotoAutoUrl());
            if (data.getFotoMatriculaUrl() != null) v.setFotoMatriculaUrl(data.getFotoMatriculaUrl());
            if (data.getFotoLicenciaUrl() != null) v.setFotoLicenciaUrl(data.getFotoLicenciaUrl());
        }

        // Revert to pending for re-validation if it was rejected previously
        if ("rechazado".equalsIgnoreCase(v.getEstado())) {
            v.setEstado("pendiente");
        }

        return vehiculoRepository.save(v);
    }
}

