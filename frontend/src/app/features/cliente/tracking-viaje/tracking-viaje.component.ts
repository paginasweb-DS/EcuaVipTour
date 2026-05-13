import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { ClienteService } from '../../../core/services/cliente.service';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';
import { ChatService } from '../../../core/services/chat.service';
import { ChatPanelComponent } from '../../../shared/components/chat-panel/chat-panel.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tracking-viaje',
  standalone: true,
  imports: [CommonModule, RouterModule, QRCodeModule, ChatPanelComponent],
  templateUrl: './tracking-viaje.component.html'
})
export class TrackingViajeComponent implements OnInit, OnDestroy {
  viajeActual: any = null;
  historial: any[] = [];
  loading = true;
  usuario: any = null;
  adminId: number = 0; // Se carga dinámicamente desde el backend
  
  // Chat State
  isChatOpen = false;
  isChatOnly = false; // Nueva bandera para modo Inbox
  unreadMessages = 0;

  // Ticket Modal State
  isTicketModalOpen = false;

  // Map state
  map: any;
  directionsService: any;
  directionsRenderer: any;
  driverMarker: any;

  private socketSub: Subscription | null = null;
  private chatSub: Subscription | null = null;
  private locationSub: Subscription | null = null;
  private assignmentSub: Subscription | null = null;

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router,
    private socketService: SocketService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.cargarViajes();
    
    // Obtener el ID real del admin desde el backend
    this.chatService.getAdminInfo().subscribe({
      next: (info) => {
        this.adminId = info.admin_id;
        console.log('[Chat] Admin ID cargado:', this.adminId);
      },
      error: () => {
        console.warn('[Chat] No se pudo cargar admin ID, usando fallback=1');
        this.adminId = 1;
      }
    });
    
    // Conectarse a la sala del usuario (cliente)
    this.socketService.connectAndJoin();
    
    // Escuchar actualizaciones de estado (por ejemplo, admin aprueba/rechaza)
    this.socketSub = this.socketService.listen('pago_actualizado').subscribe((data) => {
      console.log('Pago actualizado en tiempo real!', data);
      if (this.viajeActual && data.viaje_id === this.viajeActual.viaje_id) {
        this.cargarViajes();
      }
    });

    // Escuchar mensajes entrantes
    this.chatSub = this.socketService.listen('nuevo_mensaje').subscribe((data) => {
      // El mensaje es para nosotros (de admin a cliente o de chofer a cliente)
      if (data.destinatario_id === this.usuario.id && !this.isChatOpen) {
        this.unreadMessages++;
      }
    });

    // Escuchar ubicación del chofer
    this.locationSub = this.socketService.listen('ubicacion_chofer_actualizada').subscribe((data) => {
      console.log('Ubicación chofer recibida:', data);
      this.updateDriverMarker(data.lat, data.lng);
    });

    // Escuchar si se asigna un chofer en tiempo real
    this.assignmentSub = this.socketService.listen('chofer_asignado').subscribe((data) => {
      console.log('Chofer asignado en tiempo real!', data);
      if (this.viajeActual && data.viaje_id === this.viajeActual.viaje_id) {
        this.viajeActual.chofer_id = data.chofer_id;
        this.viajeActual.nombre_chofer = data.nombre_chofer;
        this.viajeActual.estado_logistico = data.estado;
      }
    });

    // Auto-abrir chat y activar modo Inbox si la ruta es /mensajes
    if (this.router.url.includes('/mensajes')) {
      this.isChatOpen = true;
      this.isChatOnly = true;
    }
  }

  initMap() {
    if (!this.viajeActual || !window.hasOwnProperty('google')) return;

    const mapElement = document.getElementById('trackingMap');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: { lat: -0.1807, lng: -78.4678 }, // Quito default
      zoom: 13,
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

    this.calculateRoute();
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

  updateDriverMarker(lat: number, lng: number) {
    const pos = { lat, lng };
    if (!this.driverMarker) {
      this.driverMarker = new google.maps.Marker({
        position: pos,
        map: this.map,
        icon: {
          url: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Icono de carrito azul
          scaledSize: new google.maps.Size(40, 40)
        },
        title: 'Tu Chofer'
      });
    } else {
      this.driverMarker.setPosition(pos);
    }
    
    // Centrar suavemente el mapa si el chofer se mueve mucho
    // this.map.panTo(pos); 
  }

  ngOnDestroy() {
    if (this.socketSub) this.socketSub.unsubscribe();
    if (this.chatSub) this.chatSub.unsubscribe();
    if (this.locationSub) this.locationSub.unsubscribe();
    if (this.assignmentSub) this.assignmentSub.unsubscribe();
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.unreadMessages = 0;
      // Marcamos como leído ante la administración (ID 1)
      this.clienteService.markAsRead(1).subscribe();
    }
  }

  cargarViajes() {
    this.loading = true;
    this.clienteService.getMisViajes().subscribe({
      next: (viajes) => {
        if (viajes && viajes.length > 0) {
          // Asumimos que el primer viaje es el actual si no está finalizado
          const ultimoViaje = viajes[0];
          if (ultimoViaje.estado_logistico !== 'finalizado' && ultimoViaje.estado_pago !== 'rechazado') {
            this.viajeActual = ultimoViaje;
            this.historial = viajes.slice(1);
            // Inicializar mapa después de cargar los datos
            setTimeout(() => this.initMap(), 500);
          } else {
            this.historial = viajes;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando viajes', err);
        this.loading = false;
      }
    });
  }
  
  getProgreso(): number {
    if (!this.viajeActual) return 0;
    const est = this.viajeActual.estado_logistico;
    if (est === 'pendiente') return 20;
    if (est === 'buscando_chofer') return 40;
    if (est === 'asignado') return 60;
    if (est === 'en_viaje') return 85;
    if (est === 'finalizado') return 100;
    return 0;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleTicketModal() {
    this.isTicketModalOpen = !this.isTicketModalOpen;
    console.log('[Tracking] Ticket Modal toggled:', this.isTicketModalOpen);
    // Alert temporal para debug
    if (this.isTicketModalOpen) alert('Abriendo Ticket...');
  }

  getPIN(): string {
    if (!this.viajeActual || !this.viajeActual.qr_hash) return '0000';
    return this.viajeActual.qr_hash.slice(-4).toUpperCase();
  }
}
