package com.ecuaviptour.modules.gastos.service;

import com.ecuaviptour.exception.ResourceNotFoundException;
import com.ecuaviptour.modules.gastos.domain.Gasto;
import com.ecuaviptour.modules.users.domain.Usuario;
import com.ecuaviptour.modules.gastos.repository.GastoRepository;
import com.ecuaviptour.modules.users.repository.UsuarioRepository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de lógica de negocios para Gastos Financieros (ERP).
 * Administra el almacenamiento de gastos y procesa el motor de analítica para generar payloads JSON.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Service
@Transactional
public class GastoServiceImpl implements GastoService {

    private final GastoRepository gastoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    public GastoServiceImpl(GastoRepository gastoRepository,
                            UsuarioRepository usuarioRepository,
                            ObjectMapper objectMapper) {
        this.gastoRepository = gastoRepository;
        this.usuarioRepository = usuarioRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public Gasto registrarGasto(BigDecimal monto, String descripcion, String categoria, Long adminId) {
        Usuario admin = usuarioRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrador no encontrado con ID: " + adminId));

        Gasto gasto = Gasto.builder()
                .monto(monto)
                .descripcion(descripcion)
                .categoria(categoria)
                .administrador(admin)
                .fecha(LocalDateTime.now())
                .build();

        return gastoRepository.save(gasto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Gasto> getGastos(String categoria) {
        List<Gasto> all = gastoRepository.findAll();
        if (categoria != null && !categoria.isBlank()) {
            return all.stream()
                    .filter(g -> g.getCategoria().equalsIgnoreCase(categoria))
                    .collect(Collectors.toList());
        }
        return all;
    }

    @Override
    @Transactional(readOnly = true)
    public String getGastoStatsJson(String period, String startDateStr, String endDateStr) {
        List<Gasto> allGastos = gastoRepository.findAll();
        LocalDateTime startLimit = null;
        LocalDateTime endLimit = null;

        // Lógica de agrupamiento temporal coincidente con el dashboard principal
        if ("today".equalsIgnoreCase(period)) {
            startLimit = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
            endLimit = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        } else if ("week".equalsIgnoreCase(period)) {
            startLimit = LocalDateTime.now().minus(6, ChronoUnit.DAYS).withHour(0).withMinute(0).withSecond(0).withNano(0);
            endLimit = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        } else if ("month".equalsIgnoreCase(period)) {
            startLimit = LocalDateTime.now().minus(29, ChronoUnit.DAYS).withHour(0).withMinute(0).withSecond(0).withNano(0);
            endLimit = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        } else if ("year".equalsIgnoreCase(period)) {
            startLimit = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            endLimit = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        } else if ("custom".equalsIgnoreCase(period)) {
            if (startDateStr != null && !startDateStr.isBlank()) {
                try {
                    startLimit = java.time.LocalDate.parse(startDateStr).atStartOfDay();
                } catch (Exception e) {
                    try {
                        startLimit = LocalDateTime.parse(startDateStr.replace(" ", "T"));
                    } catch (Exception ex) {
                        startLimit = null;
                    }
                }
            }
            if (endDateStr != null && !endDateStr.isBlank()) {
                try {
                    endLimit = java.time.LocalDate.parse(endDateStr).atTime(23, 59, 59, 999999999);
                } catch (Exception e) {
                    try {
                        endLimit = LocalDateTime.parse(endDateStr.replace(" ", "T"));
                    } catch (Exception ex) {
                        endLimit = null;
                    }
                }
            }
        }

        final LocalDateTime finalStart = startLimit;
        final LocalDateTime finalEnd = endLimit;

        List<Gasto> filteredGastos = allGastos;
        if (finalStart != null || finalEnd != null) {
            filteredGastos = allGastos.stream()
                    .filter(g -> g.getFecha() != null)
                    .filter(g -> finalStart == null || g.getFecha().isAfter(finalStart) || g.getFecha().isEqual(finalStart))
                    .filter(g -> finalEnd == null || g.getFecha().isBefore(finalEnd) || g.getFecha().isEqual(finalEnd))
                    .collect(Collectors.toList());
        }

        // 1. Calcular KPIs
        double totalGastos = filteredGastos.stream()
                .mapToDouble(g -> g.getMonto() != null ? g.getMonto().doubleValue() : 0.0)
                .sum();

        long cantidadGastos = filteredGastos.size();
        double promedioGasto = cantidadGastos > 0 ? (totalGastos / cantidadGastos) : 0.0;

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("gasto_total", totalGastos);
        kpis.put("gasto_promedio", promedioGasto);
        kpis.put("cantidad_gastos", cantidadGastos);

        // 2. Gráfico 1: Evolución del gasto en el tiempo
        long daysBetween = 30;
        LocalDateTime startForChart = LocalDateTime.now().minus(29, ChronoUnit.DAYS);

        if ("today".equalsIgnoreCase(period)) {
            daysBetween = 1;
            startForChart = LocalDateTime.now();
        } else if ("week".equalsIgnoreCase(period)) {
            daysBetween = 7;
            startForChart = LocalDateTime.now().minus(6, ChronoUnit.DAYS);
        } else if ("month".equalsIgnoreCase(period)) {
            daysBetween = 30;
            startForChart = LocalDateTime.now().minus(29, ChronoUnit.DAYS);
        } else if ("year".equalsIgnoreCase(period)) {
            startForChart = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startForChart.toLocalDate(), java.time.LocalDate.now()) + 1;
            if (daysBetween <= 0) daysBetween = 1;
        } else if ("custom".equalsIgnoreCase(period) && startLimit != null && endLimit != null) {
            daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startLimit.toLocalDate(), endLimit.toLocalDate()) + 1;
            if (daysBetween <= 0) daysBetween = 1;
            if (daysBetween > 90) daysBetween = 90;
            startForChart = startLimit;
        }

        Map<String, Double> expensesByDate = new TreeMap<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 0; i < daysBetween; i++) {
            expensesByDate.put(startForChart.plus(i, ChronoUnit.DAYS).format(dateFormatter), 0.0);
        }

        filteredGastos.forEach(g -> {
            String dateStr = g.getFecha().format(dateFormatter);
            if (expensesByDate.containsKey(dateStr)) {
                expensesByDate.put(dateStr, expensesByDate.get(dateStr) +
                        (g.getMonto() != null ? g.getMonto().doubleValue() : 0.0));
            }
        });

        Map<String, Object> evolutionChart = new HashMap<>();
        evolutionChart.put("labels", new ArrayList<>(expensesByDate.keySet()));
        evolutionChart.put("data", new ArrayList<>(expensesByDate.values()));

        // 3. Gráfico 2: Distribución de sumatorias por categoría
        Map<String, Double> distributionMap = filteredGastos.stream()
                .filter(g -> g.getCategoria() != null)
                .collect(Collectors.groupingBy(
                        Gasto::getCategoria,
                        Collectors.summingDouble(g -> g.getMonto() != null ? g.getMonto().doubleValue() : 0.0)
                ));

        Map<String, Object> distributionChart = new HashMap<>();
        distributionChart.put("labels", new ArrayList<>(distributionMap.keySet()));
        distributionChart.put("data", new ArrayList<>(distributionMap.values()));

        // 4. Lista de movimientos recientes (últimos 15)
        List<Gasto> recentGastos = filteredGastos.stream()
                .sorted((a, b) -> b.getFecha().compareTo(a.getFecha()))
                .limit(15)
                .collect(Collectors.toList());

        List<Map<String, Object>> movements = recentGastos.stream().map(g -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", g.getId());
            m.put("monto", g.getMonto() != null ? g.getMonto().doubleValue() : 0.0);
            m.put("fecha", g.getFecha() != null ? g.getFecha().toString() : "");
            m.put("descripcion", g.getDescripcion());
            m.put("categoria", g.getCategoria());
            m.put("admin_nombre", g.getAdministrador() != null ? g.getAdministrador().getNombre() : "Admin");
            return m;
        }).collect(Collectors.toList());

        // Compilar payload
        Map<String, Object> statsData = new HashMap<>();
        statsData.put("kpis", kpis);

        Map<String, Object> charts = new HashMap<>();
        charts.put("evolution", evolutionChart);
        charts.put("distribution", distributionChart);
        statsData.put("charts", charts);
        statsData.put("movements", movements);

        try {
            return objectMapper.writeValueAsString(statsData);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al serializar estadísticas de gastos a JSON", e);
        }
    }
}
