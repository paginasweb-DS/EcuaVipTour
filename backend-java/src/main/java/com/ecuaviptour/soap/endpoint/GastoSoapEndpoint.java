package com.ecuaviptour.soap.endpoint;

import com.ecuaviptour.modules.gastos.domain.Gasto;
import com.ecuaviptour.modules.users.domain.Usuario;
import com.ecuaviptour.modules.users.repository.UsuarioRepository;
import com.ecuaviptour.modules.gastos.service.GastoService;
import com.ecuaviptour.soap.gastos.*;
import com.ecuaviptour.exception.UnauthorizedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

/**
 * Endpoint del servicio web SOAP para gestionar el flujo de caja corporativo y ERP de gastos.
 * Proporciona métodos para registrar nuevos gastos, obtener el listado histórico y consultar estadísticas analíticas.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Endpoint
@Transactional
public class GastoSoapEndpoint {

    private static final String NAMESPACE_URI = "http://ecuaviptour.com/soap/gastos";

    private final GastoService gastoService;
    private final UsuarioRepository usuarioRepository;

    public GastoSoapEndpoint(GastoService gastoService, UsuarioRepository usuarioRepository) {
        this.gastoService = gastoService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Procesa la solicitud SOAP para registrar un nuevo gasto.
     * Mapeado al request XML {@link RegistrarGastoRequest}.
     */
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "registrarGastoRequest")
    @ResponsePayload
    public RegistrarGastoResponse registrarGasto(@RequestPayload RegistrarGastoRequest request) {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        if (userIdStr == null || userIdStr.isBlank() || "anonymousUser".equalsIgnoreCase(userIdStr)) {
            throw new UnauthorizedException("Usuario no autenticado para registrar gastos.");
        }
        Long adminId = Long.parseLong(userIdStr);

        Gasto registrado = gastoService.registrarGasto(
                BigDecimal.valueOf(request.getMonto()),
                request.getDescripcion(),
                request.getCategoria(),
                adminId
        );

        RegistrarGastoResponse response = new RegistrarGastoResponse();
        response.setSuccess(true);
        response.setMensaje("Gasto registrado correctamente");
        response.setGasto(mapGastoToSoap(registrado));
        return response;
    }

    /**
     * Procesa la solicitud SOAP para obtener el historial de gastos.
     * Mapeado al request XML {@link GetGastosRequest}.
     */
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getGastosRequest")
    @ResponsePayload
    public GetGastosResponse getGastos(@RequestPayload GetGastosRequest request) {
        List<Gasto> list = gastoService.getGastos(request.getCategoria());

        GetGastosResponse response = new GetGastosResponse();
        for (Gasto g : list) {
            response.getGastos().add(mapGastoToSoap(g));
        }
        return response;
    }

    /**
     * Procesa la solicitud SOAP para consultar analíticas estructuradas del flujo de gastos.
     * Mapeado al request XML {@link GetGastoStatsRequest}.
     */
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getGastoStatsRequest")
    @ResponsePayload
    public GetGastoStatsResponse getGastoStats(@RequestPayload GetGastoStatsRequest request) {
        String statsJson = gastoService.getGastoStatsJson(
                request.getPeriod(),
                request.getStartDate(),
                request.getEndDate()
        );

        GetGastoStatsResponse response = new GetGastoStatsResponse();
        response.setStatsJson(statsJson);
        return response;
    }

    /**
     * Mapea una entidad {@link Gasto} de JPA a su tipo SOAP JAXB {@link GastoSoapType}.
     */
    private GastoSoapType mapGastoToSoap(Gasto g) {
        GastoSoapType soap = new GastoSoapType();
        soap.setId(g.getId());
        soap.setMonto(g.getMonto() != null ? g.getMonto().doubleValue() : 0.0);
        if (g.getFecha() != null) {
            soap.setFecha(g.getFecha().toString());
        }
        soap.setDescripcion(g.getDescripcion());
        soap.setCategoria(g.getCategoria());
        if (g.getAdministrador() != null) {
            soap.setAdminId(g.getAdministrador().getId());
            soap.setAdminNombre(g.getAdministrador().getNombre());
        }
        return soap;
    }
}
