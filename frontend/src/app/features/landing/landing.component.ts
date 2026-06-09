import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface RutaPopular {
  origen: string;
  destino: string;
  precio: number;
  disponibilidad: string;
  imagen: string;
  badge: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#0a1628] font-sans relative overflow-x-hidden pt-[72px]">
      
      <!-- ================= HERO SECTION ================= -->
      <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0a1628] py-16 px-6">
        <!-- Background and Patterns -->
        <div class="absolute inset-0 z-0">
          <div class="absolute inset-0 bg-gradient-to-b from-[#0a1628]/95 via-[#0d2240]/90 to-[#0a1628] z-10"></div>
          <div class="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center mix-blend-overlay"></div>
          <!-- Moving road illusion / subtle grid -->
          <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]"></div>
          <div class="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>

        <div class="container mx-auto max-w-5xl relative z-20 flex flex-col items-center text-center">
          <div class="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-8 animate-fade-in">
            <span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            EcuavipTour · Tu Transporte Ejecutivo de Confianza
          </div>

          <h1 class="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8 max-w-4xl text-balance">
            Tu viaje puerta a puerta,<br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] via-blue-400 to-[#10b981]">seguro y sin complicaciones</span>
          </h1>

          <p class="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mb-12 leading-relaxed text-balance">
            Disfruta del servicio premium de traslados interprovinciales en Ecuador. Conectamos las principales ciudades del país con salidas diarias, cómodas vans, conductores profesionales certificados y monitoreo satelital en tiempo real.
          </p>

          <!-- Main CTA -->
          <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
            <a routerLink="/cliente/cotizar" 
               class="w-full sm:w-auto px-8 py-4.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-center text-base uppercase tracking-wider">
              Cotizar Viaje Ahora
            </a>
            <a routerLink="/servicios" 
               class="w-full sm:w-auto px-8 py-4.5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-center text-base">
              Nuestros Servicios
            </a>
          </div>
        </div>
      </section>

      <!-- ================= POPULAR ROUTES CAROUSEL ================= -->
      <section class="py-24 bg-white relative overflow-hidden">
        <!-- Subtle decorative backgrounds -->
        <div class="absolute top-0 left-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-emerald-50/30 rounded-full blur-3xl pointer-events-none"></div>

        <div class="container mx-auto px-6 max-w-5xl">
          <div class="text-center mb-16">
            <span class="text-blue-600 font-black text-xs uppercase tracking-widest mb-3 block">Operaciones Reales en Ecuador</span>
            <h2 class="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Rutas Populares Ecuavip</h2>
            <p class="text-gray-500 max-w-xl mx-auto text-base sm:text-lg">
              Conectamos las rutas de mayor demanda con tarifas estimadas fijas y disponibilidad continua para tu comodidad.
            </p>
          </div>

          <!-- Carousel Card Frame -->
          <div class="relative w-full overflow-hidden rounded-[2.5rem] border border-gray-100 bg-gray-50/40 p-4 sm:p-8 md:p-12 shadow-sm">
            
            <!-- Horizontal Sliding Viewport -->
            <div class="relative overflow-hidden w-full">
              <div class="flex transition-transform duration-700 ease-out" 
                   [style.transform]="'translateX(-' + (activeRouteIndex * 100) + '%)'">
                
                <div *ngFor="let ruta of rutas; let i = index" class="w-full flex-shrink-0 px-2 sm:px-4">
                  <div class="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/50">
                    
                    <!-- Image Showcase -->
                    <div class="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-inner group">
                      <img [src]="ruta.imagen" [alt]="ruta.origen + ' - ' + ruta.destino" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <span class="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                        {{ ruta.badge }}
                      </span>
                      
                      <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                        <div>
                          <p class="text-[9px] uppercase font-black tracking-widest text-blue-200">Operador Logístico</p>
                          <p class="text-lg font-black">EcuavipTour Express</p>
                        </div>
                        <span class="text-[10px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 font-bold tracking-wider uppercase">GPS Activo</span>
                      </div>
                    </div>

                    <!-- Details Section -->
                    <div class="flex flex-col justify-center text-left">
                      <div class="flex items-center gap-2 mb-4">
                        <span class="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100/30">Servicio Directo</span>
                        <span class="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100/30">Confirmado</span>
                      </div>

                      <h3 class="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4 flex items-center gap-3">
                        <span>{{ ruta.origen }}</span>
                        <svg class="text-blue-600 shrink-0 w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                        <span>{{ ruta.destino }}</span>
                      </h3>

                      <p class="text-gray-500 mb-6 leading-relaxed">
                        Viajes directos sin escalas incómodas. Nuestras unidades cuentan con A/C individual, asientos reclinables premium, cargadores USB y suficiente espacio para tu equipaje.
                      </p>

                      <!-- Price and Availability -->
                      <div class="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 grid grid-cols-2 gap-4">
                        <div>
                          <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tarifa Estimada</span>
                          <span class="text-2xl font-black text-blue-600 tracking-tight">Desde \${{ ruta.precio | number:'1.2-2' }}</span>
                        </div>
                        <div>
                          <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Disponibilidad</span>
                          <span class="text-sm font-black text-gray-800 leading-tight block mt-1 uppercase tracking-tight text-emerald-600">{{ ruta.disponibilidad }}</span>
                        </div>
                      </div>

                      <!-- Action CTA -->
                      <a routerLink="/cliente/cotizar" 
                         class="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-4 bg-gray-900 hover:bg-blue-600 text-white font-extrabold rounded-2xl shadow-md transition-all uppercase tracking-wider text-xs">
                        <span>Cotizar esta ruta</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </a>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            <!-- Carousel Controls -->
            <button (click)="prevRoute()" 
                    class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-700 shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all z-30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button (click)="nextRoute()" 
                    class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-700 shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all z-30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <!-- Indicators -->
            <div class="flex justify-center gap-2 mt-8">
              <button *ngFor="let r of rutas; let idx = index" 
                      (click)="selectRoute(idx)" 
                      class="h-2.5 rounded-full transition-all duration-300"
                      [class.bg-blue-600]="activeRouteIndex === idx"
                      [class.w-8]="activeRouteIndex === idx"
                      [class.bg-gray-300]="activeRouteIndex !== idx"
                      [class.w-2.5]="activeRouteIndex !== idx">
              </button>
            </div>

          </div>
        </div>
      </section>

      <!-- ================= DRIVER RECRUITMENT SECTION ================= -->
      <section class="py-24 bg-gradient-to-br from-[#0a1628] via-[#0d2240] to-[#0a1628] relative overflow-hidden">
        <!-- Decorative shapes -->
        <div class="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="container mx-auto px-6 max-w-5xl relative z-10">
          <div class="bg-white/5 border border-white/10 rounded-[3rem] p-8 sm:p-12 md:p-16 backdrop-blur-xl shadow-2xl">
            <div class="grid md:grid-cols-2 gap-12 items-center">
              
              <!-- Content -->
              <div class="text-left">
                <span class="text-[#10b981] font-black text-xs uppercase tracking-widest mb-4 block">Crece con Ecuavip</span>
                
                <h2 class="text-3xl sm:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                  ¿Tienes una van o furgoneta?<br>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Trabaja con nosotros</span>
                </h2>
                
                <p class="text-gray-300 text-sm sm:text-base mb-8 leading-relaxed">
                  Únete a nuestro equipo de choferes VIP. EcuavipTour te ofrece la oportunidad de maximizar tus ingresos operando viajes ejecutivos y traslados privados a nivel nacional con tu propio vehículo.
                </p>

                <!-- Benefits -->
                <div class="space-y-5 mb-8">
                  <div class="flex items-start gap-4">
                    <div class="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-extrabold text-white text-sm">Ingresos estables</h4>
                      <p class="text-gray-400 text-xs mt-0.5">Genera ganancias garantizadas con nuestro alto volumen diario de rutas y fletes interprovinciales.</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-extrabold text-white text-sm">Horarios flexibles</h4>
                      <p class="text-gray-400 text-xs mt-0.5">Define tu disponibilidad y planifica tus viajes con la flexibilidad que tú y tu familia necesitan.</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-extrabold text-white text-sm">Soporte técnico continuo</h4>
                      <p class="text-gray-400 text-xs mt-0.5">Monitoreo activo de rutas, asistencia en carretera 24/7 y comunicación directa con la central operativa.</p>
                    </div>
                  </div>
                </div>

                <!-- Secondary Button -->
                <button (click)="registrarChofer()" 
                        class="w-full sm:w-auto px-8 py-4 bg-[#0056b3] hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all text-center text-base uppercase tracking-wider">
                  Regístrate como Conductor
                </button>
              </div>

              <!-- Graphic Side -->
              <div class="relative flex justify-center items-center">
                <div class="w-full max-w-sm aspect-[4/3] bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 border border-white/5 rounded-3xl overflow-hidden p-6 flex flex-col justify-between shadow-inner">
                  <div class="flex justify-between items-start">
                    <span class="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Registro Abierto</span>
                    <span class="text-[10px] text-gray-500 font-bold">Flota Ecuavip</span>
                  </div>
                  
                  <div class="my-6 flex justify-center">
                    <svg class="text-emerald-400/80 animate-pulse" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="3" width="22" height="13" rx="2" ry="2"></rect>
                      <line x1="12" y1="21" x2="12" y2="16"></line>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                    </svg>
                  </div>
                  
                  <div class="text-left">
                    <p class="text-white font-black text-base">+200 Choferes Asociados</p>
                    <p class="text-xs text-gray-400 mt-1">Nuestra flota conecta de manera segura a miles de ecuatorianos todos los días.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <!-- ================= FOOTER ================= -->
      <footer class="bg-[#08101e] py-12 border-t border-white/5">
        <div class="container mx-auto px-6 text-center">
          <div class="flex justify-center mb-6">
            <img src="assets/logo.png" alt="EcuavipTour Logo" class="h-20 w-auto object-contain">
          </div>
          <p class="text-gray-500 text-sm font-semibold mb-2">EcuavipTour · Servicio de transporte interprovincial y fletes premium</p>
          <p class="text-gray-400 text-xs font-bold mb-4">Quito · Guayaquil · Cuenca · Loja · Santo Domingo · Riobamba · Ambato</p>
          <p class="text-gray-600 text-[11px] font-medium">
            © {{ currentYear }} EcuavipTour. Todos los derechos reservados. Diseñado para ofrecer confort y seguridad en las vías ecuatorianas.
          </p>
        </div>
      </footer>

    </div>
  `
})
export class LandingComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  activeRouteIndex = 0;
  private timerId: any;

  rutas: RutaPopular[] = [
    {
      origen: 'Quito',
      destino: 'Loja',
      precio: 25.00,
      disponibilidad: 'DIARIA',
      imagen: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600',
      badge: 'La Favorita'
    },
    {
      origen: 'Santo Domingo',
      destino: 'Guayaquil',
      precio: 18.00,
      disponibilidad: 'DIARIA',
      imagen: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
      badge: 'Más Rápida'
    },
    {
      origen: 'Cuenca',
      destino: 'Quito',
      precio: 35.00,
      disponibilidad: 'LUNES A SÁBADO',
      imagen: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600',
      badge: 'VIP Confort'
    },
    {
      origen: 'Riobamba',
      destino: 'Guayaquil',
      precio: 20.00,
      disponibilidad: 'DIARIA',
      imagen: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=600',
      badge: 'Más Económica'
    }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.startCarouselTimer();
  }

  ngOnDestroy() {
    this.stopCarouselTimer();
  }

  startCarouselTimer() {
    this.timerId = setInterval(() => {
      this.nextRoute();
    }, 4500);
  }

  stopCarouselTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  nextRoute() {
    this.activeRouteIndex = (this.activeRouteIndex + 1) % this.rutas.length;
  }

  prevRoute() {
    this.activeRouteIndex = (this.activeRouteIndex - 1 + this.rutas.length) % this.rutas.length;
  }

  selectRoute(index: number) {
    this.activeRouteIndex = index;
    this.resetCarouselTimer();
  }

  resetCarouselTimer() {
    this.stopCarouselTimer();
    this.startCarouselTimer();
  }

  registrarChofer() {
    this.authService.openAuthModal({ isLogin: false, rol: 'chofer' });
  }
}
