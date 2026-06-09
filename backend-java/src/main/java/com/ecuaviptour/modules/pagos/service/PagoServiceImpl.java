package com.ecuaviptour.modules.pagos.service;

import com.ecuaviptour.modules.viajes.repository.ViajeRepository;

import com.ecuaviptour.modules.viajes.domain.Viaje;

import com.ecuaviptour.modules.pagos.domain.Pago;
import com.ecuaviptour.modules.viajes.domain.Viaje;
import com.ecuaviptour.modules.pagos.repository.PagoRepository;
import com.ecuaviptour.modules.viajes.repository.ViajeRepository;

import com.ecuaviptour.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementación de la capa de servicios para la administración financiera de pagos.
 * Centraliza la lógica de negocio para la subida de comprobantes de pago por transferencia bancaria,
 * flujos de aprobación y rechazo por parte de tesorería/administración, y las respectivas transiciones
 * de estados logísticos de los viajes involucrados.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Service
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final ViajeRepository viajeRepository;

    /**
     * Constructor para inyectar repositorios de pagos y viajes.
     *
     * @param pagoRepository  Repositorio de pagos.
     * @param viajeRepository Repositorio de viajes.
     */
    public PagoServiceImpl(PagoRepository pagoRepository, ViajeRepository viajeRepository) {
        this.pagoRepository = pagoRepository;
        this.viajeRepository = viajeRepository;
    }

    /**
     * Obtiene todos los pagos registrados.
     *
     * @return Lista de todos los {@link Pago} del sistema.
     */
    @Override
    public List<Pago> listar() {
        return pagoRepository.findAll();
    }

    /**
     * Obtiene un registro de pago específico mediante su identificador único.
     *
     * @param id Identificador único del pago.
     * @return El {@link Pago} correspondiente, o null si no se encuentra registrado.
     */
    @Override
    public Pago obtener(Long id) {
        return pagoRepository.findById(id).orElse(null);
    }

    /**
     * Guarda o actualiza un registro de pago en el sistema.
     *
     * @param entity Pago a persistir.
     * @return El {@link Pago} persistido.
     */
    @Override
    public Pago guardar(Pago entity) {
        return pagoRepository.save(entity);
    }

    /**
     * Elimina un registro de pago según su identificador único.
     *
     * @param id Identificador del pago a eliminar.
     */
    @Override
    public void eliminar(Long id) {
        pagoRepository.deleteById(id);
    }

    /**
     * Registra transaccionalmente la carga del comprobante de transferencia bancaria para un viaje.
     * Si ya se había registrado un pago previamente para dicho viaje, actualiza el monto y la URL del comprobante.
     * Cambia de manera automatizada el estado de pago del viaje a "comprobante_subido".
     *
     * @param viajeId        Identificador único del viaje.
     * @param comprobanteUrl Dirección URL del comprobante de depósito/transferencia subido a la nube.
     * @param monto          Monto pagado. Si es nulo, se asume por defecto la tarifa total del viaje.
     * @return El registro de {@link Pago} creado o modificado.
     * @throws ResourceNotFoundException Si el viaje especificado no existe.
     */
    @Override
    @Transactional
    public Pago registrarPago(Long viajeId, String comprobanteUrl, BigDecimal monto) {
        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje no encontrado con el ID: " + viajeId));

        Optional<Pago> existingPagoOpt = pagoRepository.findByViajeId(viajeId);
        Pago pago;
        if (existingPagoOpt.isPresent()) {
            pago = existingPagoOpt.get();
            pago.setComprobanteUrl(comprobanteUrl);
            pago.setMontoPagado(monto != null ? monto : viaje.getMontoTotal());
            pago.setFechaPago(LocalDateTime.now());
        } else {
            pago = Pago.builder()
                    .viaje(viaje)
                    .comprobanteUrl(comprobanteUrl)
                    .montoPagado(monto != null ? monto : viaje.getMontoTotal())
                    .fechaPago(LocalDateTime.now())
                    .build();
        }

        viaje.setEstadoPago("comprobante_subido");
        viaje.setComentarioRechazo(null);
        viajeRepository.save(viaje);

        return pagoRepository.save(pago);
    }

    /**
     * Confirma transaccionalmente que un pago ha sido validado y aprobado financieramente.
     * Establece el estado de pago del viaje como "pagado" y, en caso de estar previamente en espera,
     * promueve automáticamente su estado logístico a "confirmado" para iniciar asignación de chofer o logística de abordaje.
     *
     * @param viajeId Identificador único del viaje.
     * @return El {@link Viaje} actualizado con sus nuevos estados.
     * @throws ResourceNotFoundException Si el viaje especificado no existe.
     */
    @Override
    @Transactional
    public Viaje confirmarPago(Long viajeId) {
        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje no encontrado con el ID: " + viajeId));

        viaje.setEstadoPago("pagado");
        if ("pendiente".equalsIgnoreCase(viaje.getEstadoLogistico()) || "buscando_chofer".equalsIgnoreCase(viaje.getEstadoLogistico())) {
            viaje.setEstadoLogistico("confirmado");
        }
        return viajeRepository.save(viaje);
    }

    /**
     * Rechaza transaccionalmente el comprobante de pago subido por inconsistencia de datos o fondos.
     * Establece el estado de pago del viaje como "rechazado".
     *
     * @param viajeId Identificador único del viaje.
     * @return El {@link Viaje} con el estado de pago actualizado.
     * @throws ResourceNotFoundException Si el viaje especificado no existe.
     */
    @Override
    @Transactional
    public Viaje rechazarPago(Long viajeId) {
        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje no encontrado con el ID: " + viajeId));

        viaje.setEstadoPago("rechazado");
        return viajeRepository.save(viaje);
    }

    /**
     * Recupera el registro de pago asociado a un viaje específico.
     *
     * @param viajeId Identificador único del viaje.
     * @return Un {@link Optional} con el pago correspondiente.
     */
    @Override
    public Optional<Pago> getPagoByViajeId(Long viajeId) {
        return pagoRepository.findByViajeId(viajeId);
    }
}

