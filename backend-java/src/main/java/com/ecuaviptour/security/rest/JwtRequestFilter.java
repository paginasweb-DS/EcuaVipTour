package com.ecuaviptour.security.rest;

import com.ecuaviptour.modules.users.repository.UsuarioRepository;
import com.ecuaviptour.modules.users.domain.Usuario;
import com.ecuaviptour.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

/**
 * Filtro de seguridad para interceptar peticiones REST y validar tokens JWT Bearer.
 */
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public JwtRequestFilter(JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String jwt = authorizationHeader.substring(7).trim();

        if (jwt.isBlank() || "null".equalsIgnoreCase(jwt) || "undefined".equalsIgnoreCase(jwt) || jwt.split("\\.").length != 3) {
            chain.doFilter(request, response);
            return;
        }

        String username = null;
        try {
            username = jwtUtil.extractUsername(jwt);
        } catch (Exception e) {
            logger.debug("JWT token parsing skipped/failed: " + e.getMessage());
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Usuario u = null;
            try {
                Long userId = Long.parseLong(username);
                u = usuarioRepository.findById(userId).orElse(null);
            } catch (NumberFormatException e) {
                u = usuarioRepository.findByCorreo(username).orElse(null);
            }

            if (u != null) {
                String role = u.getRol() != null ? u.getRol() : "cliente";
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        String.valueOf(u.getId()), null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                );
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        
        chain.doFilter(request, response);
    }
}
