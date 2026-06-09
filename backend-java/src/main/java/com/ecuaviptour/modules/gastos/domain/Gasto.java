package com.ecuaviptour.modules.gastos.domain;

import com.ecuaviptour.modules.users.domain.Usuario;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entidad de persistencia que representa un registro de gasto financiero (ERP) dentro del sistema.
 * Almacena el monto del gasto, la fecha, una descripción descriptiva, la categoría asociada
 * y el administrador responsable del registro.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Entity
@Table(name = "gasto")
public class Gasto {

    /**
     * Identificador único autoincremental del gasto.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Monto económico de la salida de dinero.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    /**
     * Fecha y hora en la que se efectuó o registró el gasto.
     */
    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    /**
     * Descripción detallada del gasto.
     */
    @Column(nullable = false, length = 255)
    private String descripcion;

    /**
     * Categoría temática del gasto (e.g. Nomina, Talleres, Mantenimiento, Combustible, Otros).
     */
    @Column(nullable = false, length = 50)
    private String categoria;

    /**
     * Administrador responsable del registro de este gasto.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administrador_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario administrador;

    public Gasto() {
    }

    public Gasto(Long id, BigDecimal monto, LocalDateTime fecha, String descripcion, String categoria, Usuario administrador) {
        this.id = id;
        this.monto = monto;
        this.fecha = fecha != null ? fecha : LocalDateTime.now();
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.administrador = administrador;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Usuario getAdministrador() {
        return administrador;
    }

    public void setAdministrador(Usuario administrador) {
        this.administrador = administrador;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Gasto gasto = (Gasto) o;
        return Objects.equals(id, gasto.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    public static GastoBuilder builder() {
        return new GastoBuilder();
    }

    public static class GastoBuilder {
        private Long id;
        private BigDecimal monto;
        private LocalDateTime fecha = LocalDateTime.now();
        private String descripcion;
        private String categoria;
        private Usuario administrador;

        public GastoBuilder id(Long id) { this.id = id; return this; }
        public GastoBuilder monto(BigDecimal monto) { this.monto = monto; return this; }
        public GastoBuilder fecha(LocalDateTime fecha) { this.fecha = fecha; return this; }
        public GastoBuilder descripcion(String descripcion) { this.descripcion = descripcion; return this; }
        public GastoBuilder categoria(String categoria) { this.categoria = categoria; return this; }
        public GastoBuilder administrador(Usuario administrador) { this.administrador = administrador; return this; }

        public Gasto build() {
            return new Gasto(id, monto, fecha, descripcion, categoria, administrador);
        }
    }
}
