package com.ecuaviptour.modules.gastos.service;

import com.ecuaviptour.modules.gastos.domain.Gasto;
import java.math.BigDecimal;
import java.util.List;

/**
 * Interfaz de servicio para la gestión de Gastos Financieros (ERP).
 * Define métodos para el registro, la consulta y el análisis estadístico de gastos.
 *
 * @author Santiago T.
 * @version 1.0
 */
public interface GastoService {

    /**
     * Registra un nuevo gasto financiero en el sistema.
     *
     * @param monto       Monto del gasto.
     * @param descripcion Descripción del gasto.
     * @param categoria   Categoría del gasto (Nomina, Talleres, Mantenimiento, etc.).
     * @param adminId     Identificador único del administrador que lo registra.
     * @return El objeto {@link Gasto} registrado y guardado.
     */
    Gasto registrarGasto(BigDecimal monto, String descripcion, String categoria, Long adminId);

    /**
     * Obtiene la lista completa de gastos, opcionalmente filtrada por categoría.
     *
     * @param categoria Categoría del gasto para filtrar, o null para obtener todos.
     * @return Lista de {@link Gasto}.
     */
    List<Gasto> getGastos(String categoria);

    /**
     * Calcula y genera un string serializado en formato JSON con la analítica de gastos,
     * agrupando por periodos y acumulando por categoría.
     *
     * @param period    Periodo de consulta (today, week, month, year, custom).
     * @param startDate Fecha de inicio (opcional para periodos custom).
     * @param endDate   Fecha de fin (opcional para periodos custom).
     * @return String en formato JSON con la estructura de estadísticas financieras.
     */
    String getGastoStatsJson(String period, String startDate, String endDate);
}
