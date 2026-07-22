package com.ecuaviptour.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

@Configuration
public class R2Config {

    @Bean
    public S3Client r2Client(
            @Value("${r2.endpoint:https://r2.cloudflarestorage.com}") String endpoint,
            @Value("${r2.access-key-id:dummy-key}") String accessKeyId,
            @Value("${r2.secret-access-key:dummy-secret}") String secretAccessKey) {

        String key = (accessKeyId != null && !accessKeyId.isBlank()) ? accessKeyId : "dummy-key";
        String secret = (secretAccessKey != null && !secretAccessKey.isBlank()) ? secretAccessKey : "dummy-secret";
        String url = (endpoint != null && !endpoint.isBlank()) ? endpoint : "https://r2.cloudflarestorage.com";

        AwsBasicCredentials credentials = AwsBasicCredentials.create(key, secret);

        return S3Client.builder()
                .endpointOverride(URI.create(url))
                .credentialsProvider(
                        StaticCredentialsProvider.create(credentials)
                )
                .region(Region.US_EAST_1)
                .serviceConfiguration(
                        S3Configuration.builder()
                                .pathStyleAccessEnabled(true)
                                .build()
                )
                .build();
    }
}
