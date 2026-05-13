import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getUsuario();
  const requiredRole: string = route.data['role'];

  if (!usuario) {
    router.navigate(['/']);
    return false;
  }

  if (usuario.rol === requiredRole) {
    return true;
  }

  // Redirigir al dashboard correcto según el rol del usuario
  switch (usuario.rol) {
    case 'admin':
      router.navigate(['/admin']);
      break;
    case 'chofer':
      router.navigate(['/chofer/dashboard']);
      break;
    default:
      router.navigate(['/cliente/cotizar']);
  }
  return false;
};
