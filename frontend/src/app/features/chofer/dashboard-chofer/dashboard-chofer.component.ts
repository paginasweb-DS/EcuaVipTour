import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../../core/services/socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { ViajeService } from '../../../core/services/viaje.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-chofer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative h-screen w-full overflow-hidden bg-gray-900">
      
      <!-- MAPA DE FONDO (OCUPA TODO) -->
      <div id="choferMap" class="absolute inset-0 z-0"></div>

      <!-- HEADER MINIMALISTA (GLASS) -->
      <header class="absolute top-0 left-0 right-0 z-40 p-6 pointer-events-none">
        <div class="flex items-center justify-between pointer-events-auto">
          <div class="bg-white/90 backdrop-blur-xl p-4 rounded-[2rem] shadow-xl border border-white/50 flex items-center gap-4">
            <div class="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
              {{ usuario?.nombre?.charAt(0) }}
            </div>
            <div>
              <p class="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">En Línea</p>
              <h1 class="text-sm font-black text-gray-900">{{ usuario?.nombre }}</h1>
            </div>
          </div>
          
          <div class="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-full shadow-xl border border-white/50">
            <p class="text-[10px] font-black" [class.text-green-500]="!viajeActual" [class.text-blue-500]="viajeActual">
              {{ viajeActual ? 'EN SERVICIO' : 'BUSCANDO VIAJES' }}
            </p>
          </div>
        </div>
      </header>

      <!-- MODO: BUSCANDO (OVERLAY RADAR) -->
      <div *ngIf="!viajeActual && !nuevoViaje" class="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
         <div class="relative">
           <!-- Radar Waves -->
           <div class="absolute inset-0 -m-20 border border-blue-500/20 rounded-full animate-ping"></div>
           <div class="absolute inset-0 -m-40 border border-blue-500/10 rounded-full animate-ping" style="animation-delay: 1s"></div>
           
           <div class="bg-blue-600/10 backdrop-blur-sm px-8 py-4 rounded-full border border-blue-500/20 animate-pulse">
             <p class="text-blue-600 font-black text-xs uppercase tracking-[0.3em]">Escaneando zona...</p>
           </div>
         </div>
      </div>

      <!-- ALERTA DE VIAJE (CENTRAL UBER-STYLE) -->
      <div *ngIf="nuevoViaje" class="absolute inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
        <div class="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/50 relative overflow-hidden">
           <!-- Timer Bar -->
           <div class="absolute bottom-0 left-0 right-0 h-2 bg-gray-100 overflow-hidden">
             <div class="h-full bg-blue-600 animate-notification-timeout" [style.animationDuration.ms]="10000"></div>
           </div>

           <div class="text-center mb-10">
             <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.6C2.1 10.3 2 10.6 2 11v5c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
             </div>
             <h2 class="text-3xl font-black text-gray-900 mb-2">¡Nuevo Viaje!</h2>
             <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">A {{ nuevoViaje.distancia || '2.4' }} km de ti</p>
           </div>

           <div class="space-y-4 mb-10">
             <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
               <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
               <p class="text-sm font-bold text-gray-700 truncate">{{ nuevoViaje.origen }}</p>
             </div>
             <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
               <div class="w-2 h-2 bg-gray-900 rounded-sm"></div>
               <p class="text-sm font-bold text-gray-700 truncate">{{ nuevoViaje.destino }}</p>
             </div>
           </div>

           <div class="flex items-center justify-between mb-10">
             <div>
               <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ganancia Est.</p>
               <p class="text-3xl font-black text-green-600">$ {{ nuevoViaje.tarifa }}</p>
             </div>
             <div class="text-right">
               <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Servicio</p>
               <p class="text-sm font-black text-gray-900 uppercase">{{ nuevoViaje.tipo_servicio }}</p>
             </div>
           </div>

           <div class="grid grid-cols-1 gap-4">
             <button (click)="aceptarViaje()" class="w-full h-20 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95">Aceptar Viaje</button>
             <button (click)="rechazarViaje()" class="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-colors">Rechazar</button>
           </div>
        </div>
      </div>

      <!-- MODO EN VIAJE: CONSOLA INFERIOR (BOTTOM SHEET) -->
      <div *ngIf="viajeActual" class="absolute bottom-0 left-0 right-0 z-40 p-6 animate-slide-up">
        <div class="bg-white rounded-[3.5rem] shadow-[0_-20px_80px_rgba(0,0,0,0.15)] p-10 max-w-4xl mx-auto border border-gray-100">
           
           <div class="flex flex-col md:flex-row gap-10">
             <!-- Left: Info -->
             <div class="flex-grow space-y-8">
               <div class="flex items-center justify-between">
                 <div>
                    <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Cliente</p>
                    <h3 class="text-2xl font-black text-gray-900">{{ viajeActual.cliente_nombre || 'Pasajero VIP' }}</h3>
                 </div>
                 <div class="text-right">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p class="text-2xl font-black text-gray-900">$ {{ viajeActual.tarifa }}</p>
                 </div>
               </div>

               <div class="space-y-4">
                 <div class="flex items-start gap-4">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                    <p class="text-sm font-bold text-gray-600 leading-tight">{{ viajeActual.origen }}</p>
                 </div>
                 <div class="flex items-start gap-4">
                    <div class="w-2 h-2 bg-gray-900 rounded-sm mt-2 shrink-0"></div>
                    <p class="text-sm font-bold text-gray-900 leading-tight">{{ viajeActual.destino }}</p>
                 </div>
               </div>
             </div>

             <!-- Right: Actions Grid -->
             <div class="grid grid-cols-2 md:grid-cols-2 gap-4 shrink-0">
                <button (click)="openExternalMap()" class="h-20 w-20 md:w-24 md:h-24 bg-gray-100 text-gray-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-all group">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                   <span class="text-[8px] font-black uppercase tracking-tighter">Navegar</span>
                </button>

                <button (click)="isScannerOpen = true" class="h-20 w-20 md:w-24 md:h-24 bg-gray-100 text-gray-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-all group">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
                   <span class="text-[8px] font-black uppercase tracking-tighter">Validar QR</span>
                </button>

                <button (click)="openChat()" class="h-20 w-20 md:w-24 md:h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition-all group">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7c1.1 0 2.2.3 3.2.8l4.4-1.1-1.1 4.4z"/></svg>
                   <span class="text-[8px] font-black uppercase tracking-tighter">Chat</span>
                </button>

                <button (click)="finalizarViaje()" class="h-20 w-20 md:w-24 md:h-24 bg-green-500 text-white rounded-[2rem] flex flex-col items-center justify-center gap-2 shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
                   <span class="text-[8px] font-black uppercase tracking-tighter">Finalizar</span>
                </button>
             </div>
           </div>

        </div>
      </div>

      <!-- MODAL ESCÁNER QR -->
      <div *ngIf="isScannerOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
        <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-md" (click)="isScannerOpen = false"></div>
        <div class="bg-white w-full max-w-sm rounded-[3rem] p-10 relative z-10 shadow-2xl">
          <h3 class="text-2xl font-black text-gray-900 mb-8 text-center">Validar Pasajero</h3>
          <div class="bg-gray-50 aspect-square rounded-[2rem] mb-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 relative overflow-hidden">
             <div class="w-48 h-48 border-4 border-blue-500/30 rounded-3xl relative">
                <div class="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-scanner-line shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
             </div>
          </div>
          <div class="space-y-4">
            <input type="text" [(ngModel)]="pinIngresado" maxlength="4" placeholder="Ingresa PIN de 4 dígitos" class="w-full py-4 bg-gray-50 rounded-2xl text-center font-black text-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <button (click)="confirmarAbordaje()" class="w-full h-16 bg-ecuavip-blue text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Confirmar Abordaje</button>
          </div>
        </div>
      </div>

      <!-- TOAST MESSAGES -->
      <div *ngIf="toast" class="fixed top-8 right-8 z-[200] bg-white border border-gray-100 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 animate-fade-in-right">
        <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span class="text-sm font-black text-gray-800">{{ toast }}</span>
      </div>
    </div>
  `,
  styles: [`
    @keyframes radar-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-radar-spin {
      animation: radar-spin 4s linear infinite;
    }
    @keyframes scanner-line {
      0% { top: 10%; }
      50% { top: 90%; }
      100% { top: 10%; }
    }
    .animate-scanner-line {
      animation: scanner-line 3s ease-in-out infinite;
    }
    @keyframes notification-timeout {
      from { width: 100%; }
      to { width: 0%; }
    }
    .animate-notification-timeout {
      animation: notification-timeout linear forwards;
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    .animate-slide-up {
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(100px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(50px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in-right {
      animation: fadeInRight 0.4s ease-out forwards;
    }
  `]
})
export class DashboardChoferComponent implements OnInit, OnDestroy {
  usuario: any = null;
  viajeActual: any = null;
  nuevoViaje: any = null;
  isScannerOpen = false;
  pinIngresado = '';
  toast: string | null = null;
  
  // Map State
  map: any;
  directionsService: any;
  directionsRenderer: any;
  myMarker: any;
  
  private socketSub?: Subscription;
  private gpsInterval: any;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private viajeService: ViajeService
  ) {
    this.usuario = this.authService.getUsuario();
  }

  ngOnInit() {
    this.socketService.connectAndJoin();
    this.setupListeners();
    this.checkActiveTrip();
    setTimeout(() => this.initMap(), 500);
  }

  ngOnDestroy() {
    if (this.socketSub) this.socketSub.unsubscribe();
    this.stopGPS();
  }

  initMap() {
    if (!window.hasOwnProperty('google')) return;
    
    const mapElement = document.getElementById('choferMap');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: { lat: -0.1807, lng: -78.4678 }, // Quito default
      zoom: 15,
      disableDefaultUI: true,
      styles: [
        { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
        { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "on" }] },
        { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#f2f2f2" }] },
        { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
        { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
        { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
        { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#e9eff2" }, { "visibility": "on" }] }
      ]
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#2563eb',
        strokeWeight: 6,
        strokeOpacity: 0.8
      }
    });

    if (this.viajeActual) {
      this.calculateRoute();
    } else {
      this.startWaitingMap();
    }
  }

  startWaitingMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.map.setCenter(myPos);
        
        if (!this.myMarker) {
          this.myMarker = new google.maps.Marker({
            position: myPos,
            map: this.map,
            icon: {
              url: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
              scaledSize: new google.maps.Size(40, 40)
            }
          });
        }
      });
    }
  }

  calculateRoute() {
    if (!this.viajeActual) return;
    const request = {
      origin: this.viajeActual.origen,
      destination: this.viajeActual.destino,
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
      }
    });
  }

  setupListeners() {
    // Escuchar nuevos viajes disponibles
    this.socketService.listen('nuevo_viaje_disponible').subscribe((data) => {
      this.nuevoViaje = data;
      // Auto-ocultar después de 10 segundos
      setTimeout(() => this.nuevoViaje = null, 10000);
    });

    // Escuchar confirmación de aceptación
    this.socketService.listen('viaje_confirmado_chofer').subscribe((data) => {
      this.viajeActual = this.nuevoViaje;
      this.nuevoViaje = null;
      this.showToast(data.mensaje);
      // Inicializar mapa y ruta después de aceptar
      setTimeout(() => {
        this.initMap();
        this.startGPS();
      }, 500);
    });

    // Escuchar si alguien más lo tomó
    this.socketService.listen('viaje_ya_tomado').subscribe((data) => {
      this.nuevoViaje = null;
      this.showToast(data.mensaje);
    });
  }

  checkActiveTrip() {
    // Simulación: En un caso real, haríamos una petición al backend
    // para ver si el chofer tiene un viaje 'en_curso'
  }

  aceptarViaje() {
    if (!this.nuevoViaje || !this.usuario) return;
    this.socketService.emit('aceptar_viaje', {
      viaje_id: this.nuevoViaje.viaje_id,
      chofer_id: this.usuario.id
    });
  }

  rechazarViaje() {
    this.nuevoViaje = null;
  }

  startGPS() {
    if (navigator.geolocation) {
      this.gpsInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
          this.socketService.emit('actualizar_ubicacion_chofer', {
            viaje_id: this.viajeActual.viaje_id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        });
      }, 5000); // Cada 5 segundos
    }
  }

  stopGPS() {
    if (this.gpsInterval) clearInterval(this.gpsInterval);
  }

  finalizarViaje() {
    if (!this.viajeActual) return;
    this.socketService.emit('finalizar_viaje', {
      viaje_id: this.viajeActual.viaje_id
    });
    this.showToast('¡Viaje finalizado con éxito!');
    this.viajeActual = null;
    this.stopGPS();
    this.directionsRenderer.setDirections({routes: []}); // Limpiar ruta
    this.initMap(); // Volver al radar
  }

  confirmarAbordaje() {
    if (!this.viajeActual || (!this.pinIngresado && !this.isScannerOpen)) return;
    
    // Si no hay PIN, podríamos estar simulando un escaneo exitoso
    const codigo = this.pinIngresado || 'QR_SIMULADO'; 

    this.viajeService.validarAbordaje(this.viajeActual.viaje_id, codigo).subscribe({
      next: (res) => {
        this.showToast(res.mensaje);
        this.isScannerOpen = false;
        this.pinIngresado = '';
        this.viajeActual.estado_logistico = 'en_viaje';
      },
      error: (err) => {
        this.showToast(err.error?.error || 'Error al validar');
      }
    });
  }

  openExternalMap() {
    if (!this.viajeActual) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(this.viajeActual.destino)}`;
    window.open(url, '_blank');
  }

  openChat() {
    // Redirigir al inbox
    window.location.href = '/mensajeria';
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 4000);
  }
}
