package com.ecuaviptour.service;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class ArchivoService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final S3Client r2Client;
    private final String bucket;
    private final String publicUrl;

    public ArchivoService(
            S3Client r2Client,
            @Value("${r2.bucket:}") String bucket,
            @Value("${r2.public-url:}") String publicUrl) {

        this.r2Client = r2Client;
        this.bucket = bucket;
        this.publicUrl = publicUrl;
    }

    public String subirImagen(MultipartFile archivo) throws IOException {

        if (bucket == null || bucket.isBlank()) {
            throw new IllegalStateException("Cloudflare R2 no está configurado en las variables de entorno (falta R2_BUCKET)");
        }

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }

        String contentType = archivo.getContentType();

        if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Solo se permiten imágenes JPG, PNG o WEBP"
            );
        }

        String extension = obtenerExtension(archivo.getOriginalFilename());

        String objectKey =
                "imagenes/" + UUID.randomUUID() + extension;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(contentType)
                .build();

        r2Client.putObject(
                request,
                RequestBody.fromInputStream(
                        archivo.getInputStream(),
                        archivo.getSize()
                )
        );

        if (publicUrl == null || publicUrl.isBlank()) {
            return objectKey;
        }

        return quitarBarraFinal(publicUrl) + "/" + objectKey;
    }

    private String obtenerExtension(String nombre) {
        if (nombre == null || !nombre.contains(".")) {
            return "";
        }

        String extension =
                nombre.substring(nombre.lastIndexOf(".")).toLowerCase();

        return switch (extension) {
            case ".jpg", ".jpeg", ".png", ".webp" -> extension;
            default -> "";
        };
    }

    private String quitarBarraFinal(String url) {
        return url.endsWith("/")
                ? url.substring(0, url.length() - 1)
                : url;
    }
}
