import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule, MapDirectionsService } from '@angular/google-maps';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';

@Component({
  selector: 'app-rastreo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GoogleMapsModule],
  template: `
    <div class="min-h-screen bg-white">
      
      <!-- HERO RASTREO (DARK PREMIUM) -->
      <section class="relative py-32 bg-[#0a1628] overflow-hidden">
        <div class="absolute inset-0 z-0">
          <div class="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
          <div class="absolute top-0 left-0 w-1/2 h-full bg-blue-500/5 blur-[120px] rounded-full"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10 text-center">
          <div class="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
            <span class="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
            GPS en Vivo
          </div>
          <h1 class="text-4xl md:text-7xl font-black text-white mb-6 leading-tight">
            Rastrea tu envío <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-blue-500 text-3xl md:text-5xl">en tiempo real</span>
          </h1>
          <p class="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Ingresa el código de tu guía o selecciona una de tus encomiendas para ver su ubicación exacta.
          </p>
        </div>
      </section>

      <!-- TRACKING INTERFACE -->
      <section class="py-12 container mx-auto px-6 -mt-16 relative z-20">
        <div class="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          
          <!-- LEFT SIDE: SEARCH & MAP (Approx 65%) -->
          <div class="w-full lg:w-[65%]">
            <!-- SEARCH CARD -->
            <div class="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 mb-8">
              <div class="flex flex-col md:flex-row gap-4">
                <button 
                  (click)="toggleScanner()"
                  class="flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all group shrink-0"
                >
                  <svg class="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
                  <span class="text-sm uppercase tracking-widest text-white">Escanear QR</span>
                </button>

                <div class="relative flex-grow">
                  <input 
                    type="text" 
                    [(ngModel)]="trackingCode"
                    placeholder="Ej: ECU-123456"
                    class="w-full h-full min-h-[60px] bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-ecuavip-blue transition-colors"
                  >
                </div>

                <button 
                  (click)="onTrack()"
                  [disabled]="!trackingCode"
                  class="px-10 py-5 bg-ecuavip-blue text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all uppercase tracking-widest text-sm"
                >
                  Rastrear
                </button>
              </div>

              <!-- QR SCANNER VIEWPORT -->
              <div *ngIf="isScannerOpen" class="mt-8 border-4 border-dashed border-gray-200 rounded-3xl overflow-hidden bg-gray-50 aspect-video relative flex flex-col items-center justify-center">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                  <div class="w-48 h-48 border-4 border-blue-400 rounded-3xl relative">
                    <div class="absolute top-0 left-0 w-full h-1 bg-blue-400/50 animate-scanner-line shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
                  </div>
                </div>
                <p class="text-white relative z-20 font-black uppercase tracking-widest text-sm mt-56">Accediendo a la cámara...</p>
                <button (click)="isScannerOpen = false" class="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-md transition-colors z-30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>

            <!-- MAP AREA (GOOGLE MAPS) -->
            <div *ngIf="isTracking" class="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-fade-in">
              <div class="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-blue-50 text-ecuavip-blue rounded-2xl flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guía: {{ selectedPackage?.codigo_seguimiento }}</p>
                    <p class="text-gray-900 font-black text-xl">
                      {{ selectedPackage?.estado_logistico === 'finalizado' ? 'Entregado' : 'En Tránsito' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-8">
                  <div class="text-right">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destino</p>
                    <p class="text-gray-900 font-bold truncate max-w-[150px]">{{ selectedPackage?.destino }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {{ selectedPackage?.estado_logistico === 'finalizado' ? 'Estado' : 'Llegada Estimada' }}
                    </p>
                    <p [class]="selectedPackage?.estado_logistico === 'finalizado' ? 'text-gray-400' : 'text-ecuavip-blue'" class="font-black">
                      {{ selectedPackage?.eta }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="relative h-[500px] bg-gray-100">
                <google-map 
                  height="100%" 
                  width="100%" 
                  [center]="mapCenter" 
                  [zoom]="mapZoom"
                  [options]="mapOptions"
                >
                  <map-directions-renderer *ngIf="directionsResults$ | async as directions" [directions]="directions"></map-directions-renderer>
                  
                  <!-- Vehículo Marker (Solo si está en curso) -->
                  <map-marker 
                    *ngIf="selectedPackage?.estado_logistico === 'en_curso' && vehiclePosition"
                    [position]="vehiclePosition"
                    [options]="vehicleMarkerOptions"
                  ></map-marker>
                </google-map>
                
                <!-- Uber-style Overlay (Only for active shipments) -->
                <div *ngIf="selectedPackage?.estado_logistico !== 'finalizado'" class="absolute bottom-8 left-8 right-8 z-10">
                  <div class="bg-gray-900 text-white rounded-3xl p-6 flex items-center justify-between shadow-2xl">
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden p-1">
                        <img src="assets/LogoEcuaVipTour.png" class="w-full h-full object-contain" alt="Transport">
                      </div>
                      <div>
                        <p class="text-xs font-bold text-gray-400">Unidad {{ selectedPackage?.unidad }} - Van Premium</p>
                        <p class="text-lg font-black">{{ selectedPackage?.chofer }}</p>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.92 9.22a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.82 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17l.92-.08Z"/></svg>
                      </button>
                      <button class="px-6 h-12 bg-ecuavip-blue hover:bg-blue-700 rounded-xl flex items-center justify-center font-black text-xs uppercase tracking-widest transition-all text-white">Chat</button>
                    </div>
                  </div>
                </div>

                <!-- Delivery Confirmed Overlay -->
                <div *ngIf="selectedPackage?.estado_logistico === 'finalizado'" class="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center p-8 z-10">
                  <div class="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 text-center max-w-xs animate-fade-in">
                    <div class="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <h5 class="text-xl font-black text-gray-900 mb-1">Entrega Exitosa</h5>
                    <p class="text-gray-500 text-xs font-medium mb-6">El paquete fue recibido el {{ selectedPackage?.fecha | date:'shortTime' }}</p>
                    <button class="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Ver Comprobante</button>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!isTracking && !isScannerOpen" class="text-center py-20 opacity-30">
              <svg class="mx-auto mb-6 text-gray-300" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
              <p class="text-xl font-bold text-gray-500">Esperando código de rastreo...</p>
            </div>
          </div>

          <!-- RIGHT SIDE: ENCOMIENDAS LIST (Approx 35%) -->
          <div class="w-full lg:w-[35%]">
            <div class="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 h-full min-h-[600px] flex flex-col shadow-sm">
              <div class="mb-8">
                <h3 class="text-2xl font-black text-gray-900 mb-1">Tus Encomiendas</h3>
                <p class="text-gray-500 font-medium text-sm">Gestiona y rastrea tus envíos.</p>
              </div>

              <div class="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <div *ngIf="loadingEncomiendas" class="py-12 text-center">
                  <div class="animate-spin h-8 w-8 border-4 border-ecuavip-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p class="text-gray-400 font-bold text-xs uppercase tracking-widest">Cargando envíos...</p>
                </div>

                <div *ngIf="!loadingEncomiendas && encomiendas.length === 0" class="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 p-6">
                  <p class="text-gray-400 font-medium text-sm mb-4">No tienes encomiendas registradas.</p>
                  <button routerLink="/cliente/cotizar" class="text-ecuavip-blue font-black text-xs uppercase tracking-widest hover:underline">Nueva Encomienda</button>
                </div>

                <!-- Encomienda Card -->
                <button 
                  *ngFor="let e of encomiendas"
                  (click)="trackSpecific(e)"
                  class="w-full text-left bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-ecuavip-blue transition-all group relative"
                >
                  <div class="flex justify-between items-start mb-3">
                    <span [class]="getStatusColor(e.estado_logistico) + ' px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider'">
                      {{ e.estado_logistico }}
                    </span>
                    <span class="text-[10px] font-bold text-gray-400">{{ e.fecha | date:'dd/MM' }}</span>
                  </div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Guía: {{ e.codigo_seguimiento || 'S/N' }}</p>
                  <h4 class="text-gray-900 font-black text-base line-clamp-1 mb-1">{{ e.destino }}</h4>
                  <p class="text-gray-500 text-xs font-medium truncate">{{ e.origen }}</p>
                  
                  <!-- Go to track indicator -->
                  <div class="absolute right-5 bottom-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="text-ecuavip-blue" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </button>
              </div>

              <!-- Footer CTA -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <button routerLink="/cliente/cotizar" class="w-full py-4 bg-white text-gray-900 font-black rounded-2xl border-2 border-gray-100 hover:border-ecuavip-blue transition-colors uppercase tracking-widest text-xs">
                  Nuevo Envío
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- INFO SECTION -->
      <section class="py-24 bg-gray-50/50 border-t border-gray-100">
        <div class="container mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div class="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-ecuavip-blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h4 class="font-black text-gray-900 mb-2">100% Seguro</h4>
            <p class="text-gray-500 text-sm">Monitoreo constante por satélite y custodia.</p>
          </div>
          <div>
            <div class="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-ecuavip-blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h4 class="font-black text-gray-900 mb-2">En Tiempo Real</h4>
            <p class="text-gray-500 text-sm">Actualizaciones cada 30 segundos sin retraso.</p>
          </div>
          <div>
            <div class="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-ecuavip-blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h4 class="font-black text-gray-900 mb-2">Entrega Garantizada</h4>
            <p class="text-gray-500 text-sm">Notificación automática al llegar al destino.</p>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    @keyframes scanner-line {
      0% { top: 0; }
      50% { top: 100%; }
      100% { top: 0; }
    }
    .animate-scanner-line {
      animation: scanner-line 2s ease-in-out infinite;
    }
    .animate-fade-in {
      animation: fadeIn 0.8s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 10px;
    }
  `]
})
export class RastreoComponent implements OnInit {
  trackingCode = '';
  isTracking = false;
  isScannerOpen = false;
  
  encomiendas: any[] = [];
  loadingEncomiendas = false;
  selectedPackage: any = null;

  // Google Maps Properties
  mapCenter: google.maps.LatLngLiteral = { lat: -1.2416, lng: -78.6195 };
  mapZoom = 13;
  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    styles: [
      { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
      { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
    ]
  };

  directionsResults$!: Observable<google.maps.DirectionsResult | undefined>;
  vehiclePosition?: google.maps.LatLngLiteral;
  vehicleMarkerOptions: google.maps.MarkerOptions = {
    icon: {
      url: 'assets/LogoEcuaVipTour.png',
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    },
    title: 'Vehículo en ruta'
  };

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private directionsService: MapDirectionsService
  ) {}

  ngOnInit() {
    this.cargarEncomiendas();
  }

  cargarEncomiendas() {
    this.loadingEncomiendas = true;
    this.clienteService.getMisViajes().subscribe({
      next: (res) => {
        console.log('Encomiendas raw data:', res);
        this.encomiendas = (res || [])
          .filter(v => {
            const tipo = v.tipo_servicio || '';
            return tipo.toLowerCase().includes('encomienda');
          })
          .map(v => ({
            ...v,
            codigo_seguimiento: `ECU-${v.viaje_id || v.id}`,
            origen: v.dir_origen || v.origen,
            destino: v.dir_destino || v.destino,
            unidad: v.unidad || '104',
            chofer: v.chofer || 'Santiago Pérez',
            eta: v.estado_logistico === 'finalizado' ? 'Entregado' : '25 min',
            progreso: v.estado_logistico === 'finalizado' ? 100 : 55
          }));
        this.loadingEncomiendas = false;
      },
      error: (err) => {
        console.error('Error cargando encomiendas:', err);
        this.loadingEncomiendas = false;
      }
    });
  }

  onTrack() {
    if (this.trackingCode) {
      this.isScannerOpen = false;
      this.isTracking = true;
      
      this.selectedPackage = this.encomiendas.find(e => e.codigo_seguimiento === this.trackingCode);
      
      if (this.selectedPackage) {
        this.calculateRoute();
      } else {
        this.selectedPackage = {
          codigo_seguimiento: this.trackingCode,
          destino: 'Destino Externo',
          estado_logistico: 'en_curso',
          unidad: '000',
          chofer: 'Buscando conductor...',
          eta: 'Pendiente',
          progreso: 0
        };
      }
      
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }

  calculateRoute() {
    if (!this.selectedPackage) return;

    // Usar coordenadas si existen, sino usar strings de dirección
    const origin = (this.selectedPackage.lat_origen && this.selectedPackage.lng_origen) ?
      { lat: Number(this.selectedPackage.lat_origen), lng: Number(this.selectedPackage.lng_origen) } :
      this.selectedPackage.origen;

    const destination = (this.selectedPackage.lat_destino && this.selectedPackage.lng_destino) ?
      { lat: Number(this.selectedPackage.lat_destino), lng: Number(this.selectedPackage.lng_destino) } :
      this.selectedPackage.destino;

    if (!origin || !destination) return;

    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsResults$ = this.directionsService.route(request).pipe(
      map(response => {
        const res = response.result;
        if (res && res.routes[0]) {
          const path = res.routes[0].overview_path;
          // Simular posición según progreso
          const index = Math.floor(path.length * (this.selectedPackage.progreso / 100));
          this.vehiclePosition = path[index]?.toJSON();
          
          // Ajustar centro
          this.mapCenter = this.vehiclePosition || path[0].toJSON();
        }
        return res;
      })
    );
  }

  trackSpecific(encomienda: any) {
    this.selectedPackage = encomienda;
    this.trackingCode = encomienda.codigo_seguimiento;
    this.onTrack();
  }

  toggleScanner() {
    this.isScannerOpen = !this.isScannerOpen;
    this.isTracking = false;
  }

  getStatusColor(estado: string): string {
    switch(estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'en_curso': return 'bg-blue-100 text-blue-700';
      case 'finalizado': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-50 text-gray-500';
    }
  }
}
