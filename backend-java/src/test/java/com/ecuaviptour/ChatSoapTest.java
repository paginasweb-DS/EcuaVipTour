package com.ecuaviptour;

import com.ecuaviptour.soap.endpoint.ChatSoapEndpoint;
import com.ecuaviptour.soap.chat.GetHistoryRequest;
import com.ecuaviptour.soap.chat.GetHistoryResponse;
import com.ecuaviptour.soap.chat.MensajeChatSoapType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;

@SpringBootTest
@ActiveProfiles("local")
public class ChatSoapTest {

    @Autowired
    private ChatSoapEndpoint chatSoapEndpoint;

    @Autowired
    private com.ecuaviptour.util.JwtUtil jwtUtil;

    @Test
    public void testGetHistory() {
        String token = jwtUtil.generateToken("alesso@gmail.com", 3L, "cliente");
        System.out.println("=== JWT_TOKEN ===");
        System.out.println("Bearer " + token);
        System.out.println("=== END ===");

        // Mock user session as Alesso Morales (Client id = 3)
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "3", null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_cliente"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        GetHistoryRequest request = new GetHistoryRequest();
        request.setTargetId(7L); // Conductor Justin Guaman
        request.setTipoReceptor("chofer");
        request.setViajeId(50L); // Viaje #50

        System.out.println("=== EXECUTING Direct SOAP Endpoint Call ===");
        GetHistoryResponse response = chatSoapEndpoint.getHistory(request);
        System.out.println("Total messages returned: " + response.getMessages().size());
        System.out.println("=== END OF CALL ===");
    }
}
