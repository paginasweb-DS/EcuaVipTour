import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';
import { AdminService } from '../../../core/services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  notificacionesNuevas = 0;
  private socketSub: Subscription | null = null;
  private countSub: Subscription | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private socketService: SocketService,
    private adminService: AdminService
  ) {}

  get isAdmin(): boolean {
    return this.authService.getRol() === 'admin';
  }

  ngOnInit() {
    // Doble verificación en el componente: si no es admin, redirigir
    if (!this.isAdmin) {
      this.router.navigate(['/cliente']);
      return;
    }

    this.socketService.connectAndJoin();
    
    // Cargar el conteo inicial (total de pendientes de pago)
    this.adminService.getPagos('pendientes').subscribe();
    
    // Cargar el conteo inicial de MENSAJERÍA (para que no salga 0 al recargar)
    this.adminService.getInbox().subscribe(inbox => {
      const chatsConUnread = inbox.filter((c: any) => (c.unread || 0) > 0).length;
      this.adminService.updateUnreadCount(chatsConUnread);
    });

    // Mantener el contador de pagos sincronizado
    this.countSub = this.adminService.pendingCount$.subscribe(count => {
      // (Si tienes un contador específico para pagos en el layout, úsalo aquí)
    });

    // Mantener el contador de MENSAJERÍA sincronizado
    this.adminService.unreadCount$.subscribe(count => {
      this.notificacionesNuevas = count;
    });
    
    // Escuchar nuevos comprobantes (recargar los pagos automáticamente)
    this.socketSub = this.socketService.listen('nuevo_comprobante').subscribe(() => {
      this.adminService.getPagos('pendientes').subscribe();
    });

    // Escuchar nuevos mensajes para actualizar el contador global si no estamos en mensajeria
    this.socketService.listen('nuevo_mensaje').subscribe(() => {
      if (!this.router.url.includes('/admin/mensajeria')) {
        this.adminService.getInbox().subscribe(); // Esto actualizará el unreadCount$
      }
    });
  }

  ngOnDestroy() {
    if (this.socketSub) this.socketSub.unsubscribe();
    if (this.countSub) this.countSub.unsubscribe();
    // No desconectar el socket al navegar entre rutas admin
    // El socket es un singleton y debe permanecer activo durante toda la sesión
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.socketService.disconnect();
    this.router.navigate(['/']);
  }
}
