import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';
import { AdminService } from '../../../core/services/admin.service';
import { Output, EventEmitter } from '@angular/core';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  route?: string;
  icon: string;
  badge?: string;
  adminOnly?: boolean;
  requiresAuth?: boolean;
  comingSoon?: boolean;
}

@Component({
  selector: 'app-client-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- ===== MOBILE BOTTOM NAV ===== -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100/80 px-2 py-2 flex justify-around items-center z-[100] md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.08)] rounded-t-[1.75rem]">
      
      <a routerLink="/" routerLinkActive="active-mobile" [routerLinkActiveOptions]="{exact:true}"
         class="nav-mobile-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Inicio</span>
      </a>

      <a routerLink="/cliente/cotizar" routerLinkActive="active-mobile"
         class="nav-mobile-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"/><path d="M18 2h4v4"/><path d="m10 14 9.9-9.9"/></svg>
        <span>Cotizar</span>
      </a>

      <!-- Central FAB Button -->
      <a routerLink="/rastreo" routerLinkActive="active-fab"
         class="flex flex-col items-center gap-1 relative -mt-8">
        <div class="w-14 h-14 bg-ecuavip-blue text-white rounded-full flex items-center justify-center shadow-2xl shadow-ecuavip-blue/40 border-4 border-white transition-transform hover:scale-105">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">Rastreo</span>
      </a>

      <a *ngIf="isLoggedIn" routerLink="/cliente/mis-viajes" routerLinkActive="active-mobile"
         class="nav-mobile-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
        <span>Mis Viajes</span>
      </a>

      <a *ngIf="!isLoggedIn" (click)="requestLogin()"
         class="nav-mobile-item cursor-pointer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        <span>Entrar</span>
      </a>

      <a *ngIf="isLoggedIn && isAdmin" routerLink="/admin" routerLinkActive="active-mobile"
         class="nav-mobile-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Admin</span>
      </a>

      <a *ngIf="isLoggedIn && isChofer" routerLink="/chofer/dashboard" routerLinkActive="active-mobile"
         class="nav-mobile-item text-blue-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>
        <span>Chofer</span>
      </a>

      <a *ngIf="isLoggedIn && !isAdmin && !isChofer" routerLink="/cliente/perfil" routerLinkActive="active-mobile"
         class="nav-mobile-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Perfil</span>
      </a>
    </nav>

    <!-- ===== DESKTOP TOP NAV ===== -->
    <header class="hidden md:block fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
            [class.scrolled]="isScrolled">
      <div class="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        
        <!-- Logo -->
        <a routerLink="/" class="flex items-center group flex-shrink-0 no-underline">
          <img src="assets/logo.png" alt="EcuavipTour Logo" class="h-[96px] w-auto object-contain transition-transform group-hover:scale-110">
        </a>

        <!-- Nav Links (center) -->
        <nav class="flex items-center gap-1">

          <a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="nav-active"
             class="nav-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Inicio
          </a>

          <a routerLink="/servicios" routerLinkActive="nav-active"
             class="nav-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            Servicios
          </a>

          <a routerLink="/cliente/cotizar" routerLinkActive="nav-active"
             class="nav-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"/><path d="M18 2h4v4"/><path d="m10 14 9.9-9.9"/></svg>
            Cotizar
          </a>

          <a *ngIf="isLoggedIn" routerLink="/cliente/mis-viajes" routerLinkActive="nav-active"
             class="nav-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
            Mis Viajes
          </a>

          <a routerLink="/rastreo" routerLinkActive="nav-active"
             class="nav-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Rastreo
          </a>

          <a routerLink="/contacto" routerLinkActive="nav-active"
             class="nav-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.92 9.22a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.82 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17l.92-.08Z"/></svg>
            Contacto
          </a>

          <!-- Admin (Solo si es admin) -->
          <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="nav-active"
             class="nav-link text-purple-600 hover:text-purple-700 hover:bg-purple-50">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Admin
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </a>

          <!-- Chofer (Solo si es chofer) -->
          <a *ngIf="isChofer" routerLink="/chofer/dashboard" routerLinkActive="nav-active"
             class="nav-link text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>
            Dashboard Chofer
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </a>
        </nav>

        <!-- Right Side: Auth -->
        <div class="flex items-center gap-3 flex-shrink-0">
          
          <ng-container *ngIf="isLoggedIn; else loginBtnTpl">
            <!-- Mensajes badge -->
            <a routerLink="/cliente/mensajes" 
               class="relative p-2 rounded-xl text-gray-500 hover:text-ecuavip-blue hover:bg-ecuavip-blue/8 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span *ngIf="unreadCount > 0" 
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </a>

            <!-- User dropdown -->
            <div class="group relative">
              <button class="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                <div class="w-8 h-8 rounded-xl bg-ecuavip-blue/10 flex items-center justify-center text-ecuavip-blue font-black text-sm group-hover:bg-ecuavip-blue group-hover:text-white transition-all">
                  {{ usuario?.nombre?.charAt(0)?.toUpperCase() || 'U' }}
                </div>
                <div class="text-left hidden lg:block">
                  <p class="text-sm font-bold text-gray-900 leading-none">{{ usuario?.nombre?.split(' ')[0] || 'Mi cuenta' }}</p>
                  <p class="text-[10px] text-gray-400 font-semibold capitalize mt-0.5">{{ usuario?.rol || 'usuario' }}</p>
                </div>
                <svg class="text-gray-400 ml-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </button>

              <!-- Dropdown -->
              <div class="absolute right-0 top-full mt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[110]">
                <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden">
                  <div class="px-4 py-3 border-b border-gray-50 mb-1">
                    <p class="text-sm font-extrabold text-gray-900 truncate">{{ usuario?.nombre }}</p>
                    <p class="text-xs text-gray-400 truncate mt-0.5">{{ usuario?.correo }}</p>
                  </div>
                  <a routerLink="/cliente/perfil" class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Mi Perfil
                  </a>
                  <a *ngIf="isAdmin" routerLink="/admin" class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Panel Admin
                  </a>
                  <a *ngIf="isChofer" routerLink="/chofer/dashboard" class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>
                    Dashboard Chofer
                  </a>
                  <div class="border-t border-gray-50 mt-1 pt-1">
                    <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <ng-template #loginBtnTpl>
            <button (click)="requestLogin()" 
                    class="bg-ecuavip-blue text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-ecuavip-blue/25 hover:scale-105 hover:shadow-xl hover:shadow-ecuavip-blue/30 active:scale-95 transition-all">
              Iniciar Sesión
            </button>
          </ng-template>
        </div>

      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }

    /* Desktop nav pill glassmorphism */
    header {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 4px 24px rgba(0,0,0,0.04);
    }
    header.scrolled {
      background: rgba(255,255,255,0.97);
      box-shadow: 0 4px 32px rgba(0,0,0,0.08);
    }

    /* Nav link style */
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      font-weight: 700;
      color: #6b7280;
      text-decoration: none;
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .nav-link:hover {
      color: #0056b3;
      background: rgba(0, 86, 179, 0.07);
    }
    .nav-link.nav-active {
      color: #0056b3;
      background: rgba(0, 86, 179, 0.1);
    }

    /* Mobile nav item */
    .nav-mobile-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 10px;
      border-radius: 14px;
      color: #9ca3af;
      text-decoration: none;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      transition: all 0.18s;
    }
    .nav-mobile-item:hover, .nav-mobile-item.active-mobile {
      color: #0056b3;
      background: rgba(0, 86, 179, 0.08);
    }
    .active-fab .div {
      transform: scale(1.05);
    }
  `]
})
export class ClientNavbarComponent implements OnInit {
  @Output() onLoginRequest = new EventEmitter<void>();

  usuario: any = null;
  unreadCount = 0;
  isLoggedIn = false;
  isAdmin = false;
  isChofer = false;
  isScrolled = false;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private adminService: AdminService,
    private router: Router
  ) {}

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  ngOnInit() {
    this.checkAuth();

    if (this.isLoggedIn) {
      this.socketService.connectAndJoin();

      if (this.isAdmin) {
        this.adminService.getInbox().subscribe(inbox => {
          this.unreadCount = inbox.filter((c: any) => (c.unread || 0) > 0).length;
        });
        this.socketService.listen('nuevo_mensaje').subscribe(() => {
          this.adminService.getInbox().subscribe(inbox => {
            this.unreadCount = inbox.filter((c: any) => (c.unread || 0) > 0).length;
          });
        });
      }
    }

    // Actualizar estado en cada navegación (por si hace login/logout)
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.checkAuth();
    });
  }

  checkAuth() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.usuario = this.authService.getUsuario();
    this.isAdmin = this.usuario?.rol === 'admin';
    this.isChofer = this.usuario?.rol === 'chofer';
  }

  requestLogin() {
    this.onLoginRequest.emit();
  }

  logout() {
    this.authService.logout();
    this.socketService.disconnect();
    this.router.navigate(['/']);
  }
}
