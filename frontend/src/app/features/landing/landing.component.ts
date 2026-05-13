import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2240] to-[#0a1628] flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden pt-0 md:pt-[72px]">
      
      <!-- Background decoration -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <!-- Logo -->
      <div class="flex items-center gap-3 mb-12 animate-fade-in">
        <img src="assets/logo.png" alt="EcuavipTour Logo" class="h-40 w-auto object-contain">
      </div>

      <!-- Contenido Principal (Placeholder) -->
      <div class="text-center max-w-2xl relative z-10">
        <div class="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-sm font-bold uppercase tracking-widest mb-8">
          <span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          Próximamente
        </div>

        <h1 class="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
          Tu viaje,<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#0056b3]">sin límites.</span>
        </h1>

        <p class="text-gray-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
          Estamos preparando algo increíble.<br>
          La landing page estará disponible muy pronto.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            routerLink="/cliente/cotizar"
            class="px-8 py-4 bg-[#0056b3] text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all text-base"
          >
            Cotizar Viaje →
          </a>
          <a
            routerLink="/cliente"
            class="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-base"
          >
            Acceder al Portal
          </a>
        </div>
      </div>

      <!-- Footer mínimo -->
      <p class="absolute bottom-8 text-gray-600 text-xs font-medium">
        © {{ currentYear }} EcuavipTour · Transporte Premium en Ecuador
      </p>
    </div>
  `
})
export class LandingComponent {
  currentYear = new Date().getFullYear();
}
