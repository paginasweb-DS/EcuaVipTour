package com.ecuaviptour.service.implementation;

import com.ecuaviptour.model.Usuario;
import com.ecuaviptour.repository.UsuarioRepository;
import com.ecuaviptour.service.interfaces.AuthService;
import com.ecuaviptour.util.JwtUtil;
import com.ecuaviptour.exception.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

/**
 * Implementación de los servicios de autenticación y autorización del sistema.
 * Proporciona servicios para registrar usuarios, iniciar sesión (login) verificando hash de contraseñas de BCrypt
 * y Scrypt heredados de Python Flask, generar tokens JWT y actualizar perfiles de usuarios.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Constructor para la inicialización y el cableado de dependencias de autenticación.
     * Inicializa internamente un codificador {@link BCryptPasswordEncoder}.
     *
     * @param usuarioRepository Repositorio para la persistencia del usuario.
     * @param jwtUtil           Utilidad para la firma y emisión de tokens JSON Web Tokens (JWT).
     */
    public AuthServiceImpl(UsuarioRepository usuarioRepository, JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Registra un nuevo usuario en la base de datos realizando validaciones de unicidad
     * en los campos de correo y cédula, y encriptando su clave mediante BCrypt.
     *
     * @param usuario Datos del usuario a registrar.
     * @return El {@link Usuario} registrado y persistido.
     * @throws ConflictException Si el correo o la cédula provistos ya se encuentran registrados en el sistema.
     */
    @Override
    @Transactional
    public Usuario register(Usuario usuario) {
        if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new ConflictException("El correo ya está registrado en el sistema.");
        }
        if (usuario.getCedula() != null && usuarioRepository.findByCedula(usuario.getCedula()).isPresent()) {
            throw new ConflictException("La cédula ya está registrada en el sistema.");
        }

        // Hashing password using BCrypt
        usuario.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash()));
        return usuarioRepository.save(usuario);
    }

    /**
     * Autentica a un usuario mediante sus credenciales e inicia sesión.
     * Valida de manera compatible hashes tradicionales de BCrypt, contraseñas en texto claro,
     * e implementaciones Werkzeug Scrypt provenientes de migraciones de la API de Python.
     *
     * @param correo   Dirección de correo electrónico de la cuenta.
     * @param password Contraseña proporcionada para la autenticación.
     * @return Token de acceso JWT generado para el usuario autenticado.
     * @throws UnauthorizedException Si el correo no existe o la contraseña resulta incorrecta.
     */
    @Override
    public String login(String correo, String password) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new UnauthorizedException("Credenciales incorrectas: correo no registrado."));

        boolean isCorrect = false;
        if (usuario.getPasswordHash() != null && usuario.getPasswordHash().startsWith("scrypt:")) {
            isCorrect = verifyWerkzeugScrypt(password, usuario.getPasswordHash());
        } else {
            isCorrect = passwordEncoder.matches(password, usuario.getPasswordHash());
            if (!isCorrect) {
                isCorrect = password.equals(usuario.getPasswordHash());
            }
        }

        if (!isCorrect) {
            throw new UnauthorizedException("Credenciales incorrectas: contraseña inválida.");
        }

        // Return JWT Token with same claims as Python Flask API
        return jwtUtil.generateToken(usuario.getCorreo(), usuario.getId(), usuario.getRol());
    }

    /**
     * Método auxiliar privado para desencriptar y verificar compatibilidad con hashes
     * de contraseñas generados originalmente con la librería Werkzeug de Python (Scrypt).
     *
     * @param password Contraseña ingresada en texto claro.
     * @param hashed   Hash en formato 'scrypt:N:r:p$salt$hash'.
     * @return true si la contraseña ingresada coincide con el hash, false en caso contrario o por error de parseo.
     */
    private boolean verifyWerkzeugScrypt(String password, String hashed) {
        try {
            if (hashed == null || !hashed.startsWith("scrypt:")) {
                return false;
            }

            String[] parts = hashed.split("\\$");
            if (parts.length < 3) {
                return false;
            }

            // Format: scrypt:32768:8:1
            String[] params = parts[0].split(":");
            if (params.length < 4) {
                return false;
            }

            int N = Integer.parseInt(params[1]);
            int r = Integer.parseInt(params[2]);
            int p = Integer.parseInt(params[3]);

            String salt = parts[1];
            String hexHash = parts[2];
            int dkLen = hexHash.length() / 2;

            byte[] derivedKey = org.bouncycastle.crypto.generators.SCrypt.generate(
                    password.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    salt.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    N, r, p, dkLen
            );

            StringBuilder sb = new StringBuilder();
            for (byte b : derivedKey) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    sb.append('0');
                }
                sb.append(hex);
            }

            return sb.toString().equals(hexHash);
        } catch (Exception e) {
            System.err.println("Error verifying Werkzeug scrypt hash: " + e.getMessage());
            return false;
        }
    }

    /**
     * Recupera un usuario por su identificador único.
     *
     * @param id Identificador único del usuario.
     * @return Un {@link Optional} con el usuario correspondiente.
     */
    @Override
    public Optional<Usuario> getUsuarioById(Long id) {
        return usuarioRepository.findById(id);
    }

    /**
     * Actualiza el perfil de un usuario con información básica.
     *
     * @param userId         Identificador único del usuario.
     * @param nombre         Nuevo nombre completo del usuario.
     * @param telefono       Nuevo número de teléfono.
     * @param fotoPerfilUrl  Nueva dirección URL de la fotografía de perfil.
     * @return El {@link Usuario} con los campos básicos actualizados.
     */
    @Override
    @Transactional
    public Usuario updateProfile(Long userId, String nombre, String telefono, String fotoPerfilUrl) {
        return updateProfile(userId, nombre, telefono, fotoPerfilUrl, null, null, null);
    }

    /**
     * Actualiza el perfil de un usuario incluyendo datos extendidos como cédula e inicio de contraseña.
     *
     * @param userId         Identificador único del usuario.
     * @param nombre         Nuevo nombre completo.
     * @param telefono       Nuevo número de teléfono.
     * @param fotoPerfilUrl  Nueva dirección URL de la fotografía de perfil.
     * @param cedula         Número de cédula de identidad.
     * @param password       Nueva contraseña (en texto claro, se encriptará automáticamente).
     * @return El {@link Usuario} actualizado en base de datos.
     */
    @Override
    @Transactional
    public Usuario updateProfile(Long userId, String nombre, String telefono, String fotoPerfilUrl, String cedula, String password) {
        return updateProfile(userId, nombre, telefono, fotoPerfilUrl, cedula, password, null);
    }

    /**
     * Actualiza de manera integral los datos de perfil del usuario, incluyendo el cambio de correo electrónico.
     *
     * @param userId         Identificador único del usuario.
     * @param nombre         Nuevo nombre completo.
     * @param telefono       Nuevo número de teléfono.
     * @param fotoPerfilUrl  Nueva dirección URL de la fotografía de perfil.
     * @param cedula         Número de cédula de identidad.
     * @param password       Nueva contraseña (se codifica de forma segura).
     * @param correo         Nueva dirección de correo electrónico.
     * @return El {@link Usuario} con todas sus modificaciones aplicadas y guardadas.
     * @throws ResourceNotFoundException Si el identificador de usuario no existe.
     */
    @Override
    @Transactional
    public Usuario updateProfile(Long userId, String nombre, String telefono, String fotoPerfilUrl, String cedula, String password, String correo) {
        Usuario u = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        if (nombre != null) u.setNombre(nombre);
        if (telefono != null) u.setTelefono(telefono);
        if (fotoPerfilUrl != null) u.setFotoPerfilUrl(fotoPerfilUrl);

        if (cedula != null) {
            String trimmed = cedula.trim();
            u.setCedula(trimmed.isBlank() || "No Registrada".equalsIgnoreCase(trimmed) ? null : trimmed);
        }
        if (correo != null && !correo.trim().isBlank()) {
            u.setCorreo(correo.trim());
        }
        if (password != null && !password.isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(password));
        }
        return usuarioRepository.save(u);
    }
}

