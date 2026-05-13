import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://127.0.0.1:5001/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  crearReserva(datosViaje: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/viajes/reservar`, datosViaje, { headers: this.getHeaders() });
  }

  subirComprobante(viajeId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('viaje_id', viajeId.toString());
    formData.append('comprobante', file);
    return this.http.post(`${this.apiUrl}/pagos/subir_comprobante`, formData, { headers: this.getHeaders() });
  }
}
