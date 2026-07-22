import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchivoService } from '../../../core/services/archivo.service';

@Component({
  selector: 'app-subir-imagen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border border-gray-200 rounded-2xl bg-white max-w-md">
      <label for="imagen" class="block text-sm font-bold text-gray-700 mb-2">Seleccionar imagen</label>
      <input
        id="imagen"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        [disabled]="cargando"
        (change)="subir($event)"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <p *ngIf="cargando" class="mt-2 text-sm text-blue-600 font-semibold animate-pulse">
        Subiendo imagen...
      </p>

      <p *ngIf="mensajeError" class="mt-2 text-sm text-red-600 font-semibold">
        {{ mensajeError }}
      </p>

      <div *ngIf="imagenUrl" class="mt-4">
        <img
          [src]="imagenUrl"
          alt="Imagen subida"
          class="w-full max-h-64 object-cover rounded-xl border border-gray-100 shadow-sm"
        />
      </div>
    </div>
  `
})
export class SubirImagenComponent {
  cargando = false;
  mensajeError = '';
  imagenUrl = '';

  constructor(
    private readonly archivoService: ArchivoService
  ) {}

  subir(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      this.mensajeError = 'Solo se permiten imágenes JPG, PNG o WEBP.';
      input.value = '';
      return;
    }

    const limite = 10 * 1024 * 1024;

    if (archivo.size > limite) {
      this.mensajeError = 'La imagen no puede superar los 10 MB.';
      input.value = '';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.archivoService.subirImagen(archivo).subscribe({
      next: respuesta => {
        this.imagenUrl = respuesta.url;
        this.cargando = false;
        input.value = '';
      },
      error: error => {
        console.error('No se pudo subir la imagen:', error);

        this.mensajeError =
          error.error?.message ??
          'No se pudo subir la imagen. Inténtalo nuevamente.';

        this.cargando = false;
        input.value = '';
      }
    });
  }
}
