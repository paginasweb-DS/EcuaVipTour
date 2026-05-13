import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard para la ruta raíz '/'.
 * Si el usuario ya está autenticado, lo redirige a su dashboard según su rol.
 * Si no está autenticado, lo deja pasar a la página pública (cotizador de clientes).
 */
export const homeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true; // Usuario no autenticado, mostrar página pública
  }

  const rol = authService.getRol();

  if (rol === 'admin') {
    router.navigate(['/admin']);
    return false;
  } else if (rol === 'chofer') {
    router.navigate(['/chofer/disponible']);
    return false;
  } else {
    router.navigate(['/cliente']);
    return false;
  }
};
