package com.ecuaviptour.modules.viajes.domain;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Objects;

/**
 * Entidad de persistencia que representa un boleto virtual o ticket QR generado para un viaje.
 * Sirve para validar la autenticidad y el abordaje seguro del pasajero al vehículo mediante escaneo de código hash.
 * 
 * @author Santiago T.
 * @version 1.0
 */
@Entity
@Table(name = "ticketqr")
public class TicketQR {

    /**
     * Identificador único autoincremental del ticket QR.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relación ManyToOne con el viaje asociado al ticket. Carga diferida (LAZY).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viaje_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Viaje viaje;

    /**
     * Código de validación hash único e inequívoco del ticket.
     */
    @Column(name = "codigo_hash", nullable = false, unique = true)
    private String codigoHash;

    /**
     * Estado del ticket QR (ej. 'generado', 'usado', 'expirado').
     */
    @Column(length = 20, nullable = false)
    private String estado = "generado";

    public TicketQR() {
    }

    public TicketQR(Long id, Viaje viaje, String codigoHash, String estado) {
        this.id = id;
        this.viaje = viaje;
        this.codigoHash = codigoHash;
        this.estado = estado != null ? estado : "generado";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Viaje getViaje() {
        return viaje;
    }

    public void setViaje(Viaje viaje) {
        this.viaje = viaje;
    }

    public String getCodigoHash() {
        return codigoHash;
    }

    public void setCodigoHash(String codigoHash) {
        this.codigoHash = codigoHash;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TicketQR ticketQR = (TicketQR) o;
        return Objects.equals(id, ticketQR.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    public static TicketQRBuilder builder() {
        return new TicketQRBuilder();
    }

    public static class TicketQRBuilder {
        private Long id;
        private Viaje viaje;
        private String codigoHash;
        private String estado = "generado";

        public TicketQRBuilder id(Long id) { this.id = id; return this; }
        public TicketQRBuilder viaje(Viaje viaje) { this.viaje = viaje; return this; }
        public TicketQRBuilder codigoHash(String codigoHash) { this.codigoHash = codigoHash; return this; }
        public TicketQRBuilder estado(String estado) { this.estado = estado; return this; }

        public TicketQR build() {
            return new TicketQR(id, viaje, codigoHash, estado);
        }
    }
}
