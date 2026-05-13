import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReservaService } from '../../../core/services/reserva.service';

@Component({
  selector: 'app-reserva-pago',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reserva-pago.component.html'
})
export class ReservaPagoComponent implements OnInit {
  reservaParams: any = {};
  selectedFile: File | null = null;
  filePreview: string | null = null;
  loading = false;
  success = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.reservaParams = params;
      if (!this.reservaParams.origen || !this.reservaParams.destino) {
        this.router.navigate(['/cliente/cotizar']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type.match(/image\/*/) == null) {
        this.error = 'Solo se permiten imágenes (JPG, PNG).';
        return;
      }
      this.selectedFile = file;
      this.error = '';

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  confirmarPago() {
    if (!this.selectedFile) {
      this.error = 'Por favor, sube el comprobante de transferencia.';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.reservaParams.reintentar === 'true' || this.reservaParams.viajeId) {
      // Caso 1: Solo subir nuevo comprobante a viaje existente
      const viajeId = this.reservaParams.viajeId;
      this.reservaService.subirComprobante(viajeId, this.selectedFile!).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al reintentar pago: ' + (err.error?.error || 'Desconocido');
        }
      });
    } else {
      // Caso 2: Crear reserva nueva y luego subir comprobante
      this.reservaService.crearReserva(this.reservaParams).subscribe({
        next: (res: any) => {
          const viajeId = res.viaje_id;
          this.reservaService.subirComprobante(viajeId, this.selectedFile!).subscribe({
            next: () => {
              this.loading = false;
              this.success = true;
            },
            error: (err) => {
              this.loading = false;
              this.error = 'Error al subir comprobante: ' + (err.error?.error || 'Desconocido');
            }
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al crear la reserva: ' + (err.error?.error || 'Desconocido');
        }
      });
    }
  }
}
