package com.ecuaviptour.soap.endpoint;

import com.ecuaviptour.modules.pagos.domain.Pago;
import com.ecuaviptour.modules.pagos.service.PagoService;
import com.ecuaviptour.shared.service.SocketIOService;
import com.ecuaviptour.soap.pagos.SubirComprobanteRequest;
import com.ecuaviptour.soap.pagos.SubirComprobanteResponse;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

/**
 * Endpoint del servicio web SOAP destinado a la gestión y procesamiento de pagos de la plataforma EcuavipTour.
 * Permite a los clientes subir comprobantes de pago (transferencias/depósitos bancarios) decodificados
 * de Base64, almacenarlos en disco y registrar el estado de la transacción en la base de datos,
 * notificando a los administradores en tiempo real.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Endpoint
@Transactional
public class PagosSoapEndpoint {

    private static final String NAMESPACE_URI = "http://ecuaviptour.com/soap/pagos";

    private final PagoService pagoService;
    private final SocketIOService socketIOService;
    private final com.ecuaviptour.service.ArchivoService archivoService;

    /**
     * Constructor para la inyección de dependencias de los servicios de pago y notificaciones en tiempo real.
     *
     * @param pagoService     Servicio para el registro y validación de pagos.
     * @param socketIOService Servicio para la emisión de eventos en tiempo real mediante Socket.IO.
     * @param archivoService   Servicio para manejo de archivos en la nube (R2).
     */
    public PagosSoapEndpoint(PagoService pagoService, SocketIOService socketIOService, com.ecuaviptour.service.ArchivoService archivoService) {
        this.pagoService = pagoService;
        this.socketIOService = socketIOService;
        this.archivoService = archivoService;
    }

    /**
     * Registra un nuevo comprobante de pago subido para un viaje específico.
     * Recibe la imagen del comprobante codificada en Base64, la decodifica, la almacena físicamente
     * en el servidor y crea el registro de pago correspondiente en estado pendiente. Posteriormente,
     * notifica en tiempo real a los administradores y al cliente a través de Socket.IO.
     * Mapeado al request XML {@link SubirComprobanteRequest}.
     *
     * @param request Payload XML con el ID del viaje, nombre del archivo y contenido en Base64.
     * @return {@link SubirComprobanteResponse} con el resultado del registro del pago y la URL del comprobante guardado.
     * @throws IOException Si ocurre un error al guardar el archivo del comprobante en el disco del servidor.
     */
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "subirComprobanteRequest")
    @ResponsePayload
    public SubirComprobanteResponse subirComprobante(@RequestPayload SubirComprobanteRequest request) throws IOException {
        String base64Data = request.getFileBase64();
        if (base64Data == null || base64Data.isEmpty()) {
            throw new IllegalArgumentException("No se envio ningun archivo");
        }

        if (base64Data.contains(",")) {
            base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
        }
        byte[] decoded = Base64.getDecoder().decode(base64Data);

        String contentType = "image/png";
        if (request.getFilename() != null) {
            String lower = request.getFilename().toLowerCase();
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (lower.endsWith(".webp")) contentType = "image/webp";
        }

        String dbUrl = archivoService.subirArchivoBytes(decoded, contentType, request.getFilename(), "comprobantes");
        Pago saved = pagoService.registrarPago(request.getViajeId(), dbUrl, null);

        // Notify admins and client of new receipt upload in real-time
        Long clienteId = (saved.getViaje() != null && saved.getViaje().getCliente() != null) ? saved.getViaje().getCliente().getId() : null;
        socketIOService.broadcastNuevoComprobante(request.getViajeId(), clienteId);

        SubirComprobanteResponse response = new SubirComprobanteResponse();
        response.setMessage("Comprobante subido exitosamente");
        response.setPagoId(saved.getId());
        response.setComprobanteUrl(saved.getComprobanteUrl());
        return response;
    }
}
