package com.ecuaviptour.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Paths;
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

    public String subirArchivoBytes(byte[] bytes, String contentType, String filename, String localSubDir) {
        if (bucket != null && !bucket.isBlank()) {
            try {
                String extension = obtenerExtension(filename);
                String objectKey = localSubDir + "/" + UUID.randomUUID() + extension;

                PutObjectRequest request = PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(objectKey)
                        .contentType(contentType != null ? contentType : "application/octet-stream")
                        .build();

                r2Client.putObject(request, RequestBody.fromBytes(bytes));

                if (publicUrl != null && !publicUrl.isBlank()) {
                    return quitarBarraFinal(publicUrl) + "/" + objectKey;
                }
                return objectKey;
            } catch (Exception e) {
                System.err.println("Error uploading to R2, falling back to local storage: " + e.getMessage());
            }
        }

        try {
            String userDir = System.getProperty("user.dir");
            String uploadDir = Paths.get(userDir, "uploads", localSubDir).toString();
            File folder = new File(uploadDir);
            if (!folder.exists()) {
                folder.mkdirs();
            }
            String finalFilename = UUID.randomUUID().toString() + "_" + filename;
            File file = new File(folder, finalFilename);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(bytes);
            }
            return "uploads/" + localSubDir + "/" + finalFilename;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo localmente como fallback.", e);
        }
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
