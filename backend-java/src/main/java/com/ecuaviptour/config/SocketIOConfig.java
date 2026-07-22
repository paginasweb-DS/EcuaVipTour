package com.ecuaviptour.config;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {

    @Value("${app.socket.host:0.0.0.0}")
    private String socketHost;

    @Value("${app.socket.port:5002}")
    private int socketPort;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config =
                new com.corundumstudio.socketio.Configuration();

        config.setHostname(socketHost);
        config.setPort(socketPort);
        config.setOrigin(frontendUrl);

        return new SocketIOServer(config);
    }
}
