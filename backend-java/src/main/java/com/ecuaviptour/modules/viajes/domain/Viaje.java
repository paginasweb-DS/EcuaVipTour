package com.ecuaviptour.modules.viajes.domain;

import com.ecuaviptour.modules.users.domain.Usuario;

import com.ecuaviptour.modules.vehiculos.domain.Vehiculo;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entidad de persistencia principal que representa un viaje dentro de la plataforma EcuavipTour.
 * Almacena los puntos geográficos de origen y destino, montos financieros,
 * estados de pago y logística, vinculando al cliente solicitante, el chofer asignado y el vehículo.
 * 
 * @author Santiago T.
 * @version 1.0
 */
@Entity
@Table(name = "viaje")
public class Viaje {

    /**
     * Identificador único autoincremental del viaje.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relación ManyToOne con el usuario cliente que solicita el viaje. Carga diferida (LAZY).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private Usuario cliente;

    /**
     * Relación ManyToOne con el usuario chofer que realiza el traslado. Carga opcional diferida (LAZY).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chofer_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private Usuario chofer;

    /**
     * Relación ManyToOne con el vehículo asignado al viaje. Carga opcional diferida (LAZY).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "chofer"})
    private Vehiculo vehiculo;

    /**
     * Dirección textual descriptiva del punto de origen.
     */
    @Column(name = "dir_origen", nullable = false, columnDefinition = "TEXT")
    private String dirOrigen;

    /**
     * Latitud geográfica del punto de origen.
     */
    @Column(name = "lat_origen", precision = 10, scale = 8)
    private BigDecimal latOrigen;

    /**
     * Longitud geográfica del punto de origen.
     */
    @Column(name = "lng_origen", precision = 11, scale = 8)
    private BigDecimal lngOrigen;

    /**
     * Dirección textual descriptiva del punto de destino.
     */
    @Column(name = "dir_destino", nullable = false, columnDefinition = "TEXT")
    private String dirDestino;

    /**
     * Latitud geográfica del punto de destino.
     */
    @Column(name = "lat_destino", precision = 10, scale = 8)
    private BigDecimal latDestino;

    /**
     * Longitud geográfica del punto de destino.
     */
    @Column(name = "lng_destino", precision = 11, scale = 8)
    private BigDecimal lngDestino;

    /**
     * Referencias o indicaciones adicionales proporcionadas por el cliente.
     */
    @Column(name = "referencia_adicional", columnDefinition = "TEXT")
    private String referenciaAdicional;

    /**
     * Distancia calculada del trayecto en kilómetros.
     */
    @Column(name = "distancia_km", precision = 10, scale = 2)
    private BigDecimal distanciaKm;

    /**
     * Precio o tarifa económica total asignada al viaje.
     */
    @Column(name = "monto_total", precision = 10, scale = 2)
    private BigDecimal montoTotal;

    /**
     * Tipo de servicio (ej. 'pasajero', 'encomienda', 'express').
     */
    @Column(name = "tipo_servicio", length = 20)
    private String tipoServicio; // pasajero, encomienda, express

    /**
     * Modalidad de traslado contratada (ej. 'compartido', 'privado_express').
     */
    @Column(name = "tipo_modalidad", length = 20)
    private String tipoModalidad; // compartido, privado_express

    /**
     * Estado financiero de la transacción (ej. 'pendiente', 'comprobante_subido', 'aprobado', 'rechazado').
     */
    @Column(name = "estado_pago", length = 20, nullable = false)
    private String estadoPago = "pendiente";

    /**
     * Estado logístico y de ejecución del servicio (ej. 'pendiente', 'buscando_chofer', 'aceptado', 'recogiendo', 'en_curso', 'finalizado', 'cancelado').
     */
    @Column(name = "estado_logistico", length = 20, nullable = false)
    private String estadoLogistico = "pendiente";

    /**
     * Límite de tiempo disponible para subir el comprobante de pago antes de cancelar el viaje de forma automática (15 minutos).
     */
    @Column(name = "fecha_limite_pago")
    private LocalDateTime fechaLimitePago;

    /**
     * Justificación registrada por el administrador en caso de rechazo del comprobante de pago.
     */
    @Column(name = "comentario_rechazo", columnDefinition = "TEXT")
    private String comentarioRechazo;

    /**
     * Fecha y marca temporal de creación de la solicitud del viaje.
     */
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    /**
     * Fecha y hora programada para el inicio del viaje.
     */
    @Column(name = "fecha_viaje")
    private LocalDateTime fechaViaje;

    /**
     * Duración aproximada estimada del trayecto expresada en minutos.
     */
    @Column(name = "duracion_minutos", nullable = false)
    private Integer duracionMinutos = 30;

    public Viaje() {
    }

    public Viaje(Long id, Usuario cliente, Usuario chofer, Vehiculo vehiculo, String dirOrigen, BigDecimal latOrigen, BigDecimal lngOrigen, String dirDestino, BigDecimal latDestino, BigDecimal lngDestino, String referenciaAdicional, BigDecimal distanciaKm, BigDecimal montoTotal, String tipoServicio, String tipoModalidad, String estadoPago, String estadoLogistico, LocalDateTime fechaLimitePago, LocalDateTime fechaCreacion, LocalDateTime fechaViaje, Integer duracionMinutos) {
        this.id = id;
        this.cliente = cliente;
        this.chofer = chofer;
        this.vehiculo = vehiculo;
        this.dirOrigen = dirOrigen;
        this.latOrigen = latOrigen;
        this.lngOrigen = lngOrigen;
        this.dirDestino = dirDestino;
        this.latDestino = latDestino;
        this.lngDestino = lngDestino;
        this.referenciaAdicional = referenciaAdicional;
        this.distanciaKm = distanciaKm;
        this.montoTotal = montoTotal;
        this.tipoServicio = tipoServicio;
        this.tipoModalidad = tipoModalidad;
        this.estadoPago = estadoPago != null ? estadoPago : "pendiente";
        this.estadoLogistico = estadoLogistico != null ? estadoLogistico : "pendiente";
        this.fechaLimitePago = fechaLimitePago;
        this.fechaCreacion = fechaCreacion != null ? fechaCreacion : LocalDateTime.now();
        this.fechaViaje = fechaViaje;
        this.duracionMinutos = duracionMinutos != null ? duracionMinutos : 30;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public Usuario getChofer() {
        return chofer;
    }

    public void setChofer(Usuario chofer) {
        this.chofer = chofer;
    }

    public Vehiculo getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(Vehiculo vehiculo) {
        this.vehiculo = vehiculo;
    }

    public String getDirOrigen() {
        return dirOrigen;
    }

    public void setDirOrigen(String dirOrigen) {
        this.dirOrigen = dirOrigen;
    }

    public BigDecimal getLatOrigen() {
        return latOrigen;
    }

    public void setLatOrigen(BigDecimal latOrigen) {
        this.latOrigen = latOrigen;
    }

    public BigDecimal getLngOrigen() {
        return lngOrigen;
    }

    public void setLngOrigen(BigDecimal lngOrigen) {
        this.lngOrigen = lngOrigen;
    }

    public String getDirDestino() {
        return dirDestino;
    }

    public void setDirDestino(String dirDestino) {
        this.dirDestino = dirDestino;
    }

    public BigDecimal getLatDestino() {
        return latDestino;
    }

    public void setLatDestino(BigDecimal latDestino) {
        this.latDestino = latDestino;
    }

    public BigDecimal getLngDestino() {
        return lngDestino;
    }

    public void setLngDestino(BigDecimal lngDestino) {
        this.lngDestino = lngDestino;
    }

    public String getReferenciaAdicional() {
        return referenciaAdicional;
    }

    public void setReferenciaAdicional(String referenciaAdicional) {
        this.referenciaAdicional = referenciaAdicional;
    }

    public BigDecimal getDistanciaKm() {
        return distanciaKm;
    }

    public void setDistanciaKm(BigDecimal distanciaKm) {
        this.distanciaKm = distanciaKm;
    }

    public BigDecimal getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(BigDecimal montoTotal) {
        this.montoTotal = montoTotal;
    }

    public String getTipoServicio() {
        return tipoServicio;
    }

    public void setTipoServicio(String tipoServicio) {
        this.tipoServicio = tipoServicio;
    }

    public String getTipoModalidad() {
        return tipoModalidad;
    }

    public void setTipoModalidad(String tipoModalidad) {
        this.tipoModalidad = tipoModalidad;
    }

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getEstadoLogistico() {
        return estadoLogistico;
    }

    public void setEstadoLogistico(String estadoLogistico) {
        this.estadoLogistico = estadoLogistico;
    }

    public LocalDateTime getFechaLimitePago() {
        return fechaLimitePago;
    }

    public void setFechaLimitePago(LocalDateTime fechaLimitePago) {
        this.fechaLimitePago = fechaLimitePago;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaViaje() {
        return fechaViaje;
    }

    public void setFechaViaje(LocalDateTime fechaViaje) {
        this.fechaViaje = fechaViaje;
    }

    public Integer getDuracionMinutos() {
        return duracionMinutos;
    }

    public void setDuracionMinutos(Integer duracionMinutos) {
        this.duracionMinutos = duracionMinutos;
    }

    public String getComentarioRechazo() {
        return comentarioRechazo;
    }

    public void setComentarioRechazo(String comentarioRechazo) {
        this.comentarioRechazo = comentarioRechazo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Viaje viaje = (Viaje) o;
        return Objects.equals(id, viaje.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    public static ViajeBuilder builder() {
        return new ViajeBuilder();
    }

    public static class ViajeBuilder {
        private Long id;
        private Usuario cliente;
        private Usuario chofer;
        private Vehiculo vehiculo;
        private String dirOrigen;
        private BigDecimal latOrigen;
        private BigDecimal lngOrigen;
        private String dirDestino;
        private BigDecimal latDestino;
        private BigDecimal lngDestino;
        private String referenciaAdicional;
        private BigDecimal distanciaKm;
        private BigDecimal montoTotal;
        private String tipoServicio;
        private String tipoModalidad;
        private String estadoPago = "pendiente";
        private String estadoLogistico = "pendiente";
        private LocalDateTime fechaLimitePago;
        private LocalDateTime fechaCreacion = LocalDateTime.now();
        private LocalDateTime fechaViaje;
        private Integer duracionMinutos = 30;

        public ViajeBuilder id(Long id) { this.id = id; return this; }
        public ViajeBuilder cliente(Usuario cliente) { this.cliente = cliente; return this; }
        public ViajeBuilder chofer(Usuario chofer) { this.chofer = chofer; return this; }
        public ViajeBuilder vehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; return this; }
        public ViajeBuilder dirOrigen(String dirOrigen) { this.dirOrigen = dirOrigen; return this; }
        public ViajeBuilder latOrigen(BigDecimal latOrigen) { this.latOrigen = latOrigen; return this; }
        public ViajeBuilder lngOrigen(BigDecimal lngOrigen) { this.lngOrigen = lngOrigen; return this; }
        public ViajeBuilder dirDestino(String dirDestino) { this.dirDestino = dirDestino; return this; }
        public ViajeBuilder latDestino(BigDecimal latDestino) { this.latDestino = latDestino; return this; }
        public ViajeBuilder lngDestino(BigDecimal lngDestino) { this.lngDestino = lngDestino; return this; }
        public ViajeBuilder referenciaAdicional(String referenciaAdicional) { this.referenciaAdicional = referenciaAdicional; return this; }
        public ViajeBuilder distanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; return this; }
        public ViajeBuilder montoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; return this; }
        public ViajeBuilder tipoServicio(String tipoServicio) { this.tipoServicio = tipoServicio; return this; }
        public ViajeBuilder tipoModalidad(String tipoModalidad) { this.tipoModalidad = tipoModalidad; return this; }
        public ViajeBuilder estadoPago(String estadoPago) { this.estadoPago = estadoPago; return this; }
        public ViajeBuilder estadoLogistico(String estadoLogistico) { this.estadoLogistico = estadoLogistico; return this; }
        public ViajeBuilder fechaLimitePago(LocalDateTime fechaLimitePago) { this.fechaLimitePago = fechaLimitePago; return this; }
        public ViajeBuilder fechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; return this; }
        public ViajeBuilder fechaViaje(LocalDateTime fechaViaje) { this.fechaViaje = fechaViaje; return this; }
        public ViajeBuilder duracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; return this; }

        public Viaje build() {
            return new Viaje(id, cliente, chofer, vehiculo, dirOrigen, latOrigen, lngOrigen, dirDestino, latDestino, lngDestino, referenciaAdicional, distanciaKm, montoTotal, tipoServicio, tipoModalidad, estadoPago, estadoLogistico, fechaLimitePago, fechaCreacion, fechaViaje, duracionMinutos);
        }
    }
}
