package com.ecuaviptour.repository;

import com.ecuaviptour.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio de persistencia para realizar operaciones CRUD y consultas avanzadas
 * sobre la entidad {@link Usuario}.
 * Proporciona métodos para la autenticación, comprobación de credenciales únicas y obtención de listados por rol.
 *
 * @author Santiago T.
 * @version 1.0
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    /**
     * Busca un usuario registrado en el sistema por su dirección de correo electrónico.
     * Utilizado principalmente durante el proceso de inicio de sesión (Login).
     *
     * @param correo Dirección de correo electrónico del usuario.
     * @return Un {@link Optional} que contiene el usuario si se encuentra registrado, o vacío en caso contrario.
     */
    Optional<Usuario> findByCorreo(String correo);
    
    /**
     * Busca un usuario por su número de cédula de identidad nacional.
     * Utilizado para validar unicidad durante el registro de nuevos usuarios en la plataforma.
     *
     * @param cedula Número de cédula de identidad del usuario.
     * @return Un {@link Optional} que contiene el usuario si existe, o vacío en caso contrario.
     */
    Optional<Usuario> findByCedula(String cedula);
    
    /**
     * Obtiene una lista de usuarios que poseen un rol determinado en el sistema (por ejemplo: cliente, chofer, admin).
     *
     * @param rol Nombre del rol asignado.
     * @return Lista de {@link Usuario} que poseen el rol especificado.
     */
    List<Usuario> findByRol(String rol);
    
    /**
     * Obtiene un listado de todos los usuarios cuya cuenta se encuentra actualmente activa.
     *
     * @return Lista de {@link Usuario} que tienen el estado activo habilitado.
     */
    List<Usuario> findByActivoTrue();
}

