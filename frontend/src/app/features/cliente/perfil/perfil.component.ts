import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 pt-12 pb-24">
      <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-ecuavip-blue/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div class="flex flex-col items-center mb-10">
          <div class="w-24 h-24 rounded-[2rem] bg-ecuavip-blue/10 flex items-center justify-center text-ecuavip-blue text-4xl font-black mb-4 border-4 border-white shadow-sm">
            {{ usuario?.nombre?.charAt(0) || 'U' }}
          </div>
          <h2 class="text-2xl font-black text-ecuavip-dark">{{ usuario?.nombre }}</h2>
          <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cliente VIP</p>
        </div>

        <div class="space-y-6">
          <div class="bg-gray-50 p-6 rounded-3xl">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Correo Electrónico</p>
            <p class="font-bold text-gray-900">{{ usuario?.correo }}</p>
          </div>

          <div class="bg-gray-50 p-6 rounded-3xl">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Teléfono de Contacto</p>
            <p class="font-bold text-gray-900">{{ usuario?.telefono || 'No registrado' }}</p>
          </div>

          <div class="bg-gray-50 p-6 rounded-3xl">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rol de Acceso</p>
            <p class="font-bold text-gray-900 capitalize">{{ usuario?.rol }}</p>
          </div>
        </div>

        <div class="mt-12 space-y-3">
          <button (click)="logout()" class="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-black hover:bg-red-100 transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-gray-400 text-xs font-medium">Ecuavip Tour v2.4.0 • Logística de Confianza</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PerfilComponent implements OnInit {
  usuario: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    if (!this.usuario) {
      this.router.navigate(['/cliente/cotizar']);
    }
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
