import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule, MapDirectionsService } from '@angular/google-maps';
import { Observable, map, Subscription } from 'rxjs';
import { ClienteService } from '../../../core/services/cliente.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-mis-viajes',
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleMapsModule],
  template: `
    <div class="min-h-screen bg-[#f8fafc]">
      
      <!-- HERO -->
      <section class="relative pt-32 pb-20 bg-white border-b border-gray-100 overflow-hidden">
        <div class="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 skew-x-12 translate-x-20"></div>
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-7xl mx-auto">
            <div class="flex items-center gap-3 mb-6">
              <span class="w-12 h-[2px] bg-blue-600"></span>
              <span class="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Centro de Control</span>
            </div>
            <h1 class="text-4xl md:text-7xl font-black text-gray-900 mb-6 leading-[0.9]">
              Mis <span class="text-blue-600">Viajes</span>
            </h1>
            <p class="text-gray-500 font-medium max-w-xl text-lg">Gestiona tus rutas activas y revisa tu historial con Ecuavip Tour.</p>
          </div>
        </div>
      </section>

      <!-- MAIN -->
      <section class="py-12 container mx-auto px-6 relative z-20">
        <div class="max-w-7xl mx-auto">
          
          <!-- FILTROS -->
          <div class="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div class="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
               <button (click)="filtro = 'activos'" [class.bg-gray-900]="filtro === 'activos'" [class.text-white]="filtro === 'activos'" class="px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">Viajes Activos</button>
               <button (click)="filtro = 'todos'" [class.bg-gray-900]="filtro === 'todos'" [class.text-white]="filtro === 'todos'" class="px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ml-2">Todo el Historial</button>
            </div>
            <button routerLink="/cliente/cotizar" class="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20">Solicitar Nuevo Viaje</button>
          </div>

          <!-- GRID -->
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            <div *ngIf="loading" class="col-span-full py-20 text-center">
              <div class="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
              <p class="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Cargando flota...</p>
            </div>

            <div *ngIf="!loading && getViajesFiltrados().length === 0" class="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <h3 class="text-2xl font-black text-gray-900 mb-2">No hay viajes</h3>
              <button routerLink="/cliente/cotizar" class="mt-4 px-10 py-4 bg-gray-900 text-white rounded-2xl">Empezar</button>
            </div>

            <!-- CARDS -->
            <div *ngFor="let v of getViajesFiltrados()" class="group bg-white rounded-[2.5rem] p-8 border border-gray-100 flex flex-col h-full" [class.border-blue-500]="isViajeActivo(v)">
              
              <div class="flex items-center justify-between mb-8">
                <span [class]="getStatusColor(v.estado_logistico) + ' px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest'">{{ v.estado_logistico }}</span>
                <p class="text-xs font-black text-gray-900">#{{ v.id }}</p>
              </div>

              <div class="space-y-6 mb-8 relative">
                <div class="absolute left-[7px] top-3 bottom-3 w-[2px] bg-gray-100"></div>
                <div class="flex items-start gap-5 relative">
                  <div class="w-4 h-4 rounded-full border-4 border-blue-500 bg-white mt-1 shrink-0 z-10"></div>
                  <p class="text-sm font-bold text-gray-800 line-clamp-2 leading-relaxed">{{ v.origen }}</p>
                </div>
                <div class="flex items-start gap-5 relative">
                  <div class="w-4 h-4 rounded-full border-4 border-gray-900 bg-white mt-1 shrink-0 z-10"></div>
                  <p class="text-sm font-bold text-gray-800 line-clamp-2 leading-relaxed">{{ v.destino }}</p>
                </div>
              </div>

              <div class="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between mb-8">
                <p class="text-xs font-black text-gray-900">{{ v.fecha | date:'dd MMM, yyyy' }}</p>
                <p class="text-xl font-black text-blue-600">$ {{ v.monto || 0 }}</p>
              </div>

              <button *ngIf="isViajeActivo(v)" [routerLink]="['/cliente/en-curso']" class="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3">
                Ver Rastreo
              </button>
              <button *ngIf="!isViajeActivo(v)" class="w-full py-5 bg-gray-50 text-gray-400 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest">
                Ver Resumen
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MisViajesComponent implements OnInit, OnDestroy {
  viajes: any[] = [];
  loading = true;
  filtro = 'activos';
  private socketSub?: Subscription;

  constructor(
    private clienteService: ClienteService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.cargarViajes();
    this.setupSocket();
  }

  ngOnDestroy() {
    if (this.socketSub) this.socketSub.unsubscribe();
  }

  setupSocket() {
    this.socketService.connectAndJoin();
    this.socketService.listen('viaje_actualizado').subscribe(() => this.cargarViajes());
  }

  cargarViajes() {
    this.loading = true;
    this.clienteService.getMisViajes().subscribe({
      next: (res) => {
        this.viajes = (res || []).filter(v => (v.tipo_servicio || '').toLowerCase() !== 'encomienda');
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getViajesFiltrados() {
    let filtrados = this.viajes;
    if (this.filtro === 'activos') {
      filtrados = this.viajes.filter(v => v.estado_logistico !== 'finalizado' && v.estado_logistico !== 'cancelado');
    }
    return filtrados.sort((a, b) => {
      const aActivo = this.isViajeActivo(a) ? 1 : 0;
      const bActivo = this.isViajeActivo(b) ? 1 : 0;
      if (aActivo !== bActivo) return bActivo - aActivo;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  }

  isViajeActivo(v: any): boolean {
    return ['aceptado', 'en_unidad', 'en_curso', 'abordaje'].includes(v.estado_logistico);
  }

  getStatusColor(estado: string): string {
    switch(estado) {
      case 'pendiente': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'aceptado': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'en_unidad': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'en_curso': return 'bg-green-50 text-green-600 border border-green-100';
      case 'abordaje': return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'finalizado': return 'bg-gray-50 text-gray-500 border border-gray-100';
      case 'cancelado': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-blue-50 text-blue-600 border border-blue-100';
    }
  }
}
