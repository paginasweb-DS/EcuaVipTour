import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientNavbarComponent } from '../../components/client-navbar/client-navbar.component';
import { AuthModalComponent } from '../../../features/auth/auth-modal/auth-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

/**
 * PublicLayoutComponent — Layout para páginas públicas (Landing, Rastreo, etc.)
 * Solo provee el navbar global y el auth modal.
 * NO agrega background ni espaciador para no romper diseños full-screen.
 */
@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ClientNavbarComponent, AuthModalComponent],
  template: `
    <!-- Navbar global fijo (se superpone sobre el contenido) -->
    <app-client-navbar (onLoginRequest)="showAuthModal = true"></app-client-navbar>

    <!-- Outlet: cada página maneja su propio layout/background -->
    <router-outlet></router-outlet>

    <!-- Modal de Autenticación Global -->
    <app-auth-modal
      *ngIf="showAuthModal"
      (onClose)="showAuthModal = false"
      (onSuccess)="handleAuthSuccess()">
    </app-auth-modal>
  `
})
export class PublicLayoutComponent {
  showAuthModal = false;
  private authSub: Subscription;

  constructor(private authService: AuthService) {
    this.authSub = this.authService.authModal$.subscribe(() => {
      this.showAuthModal = true;
    });
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }

  handleAuthSuccess() {
    this.showAuthModal = false;
    window.location.reload();
  }
}
