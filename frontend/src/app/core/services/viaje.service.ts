import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { SoapService } from './soap.service';

export interface CotizacionRequest {
  distancia_km: number;
  tipo_servicio: 'pasajero' | 'encomienda' | 'express';
  num_pasajeros: number;
}

export interface CotizacionResponse {
  precio_total: number;
  precio_unitario: number;
  zona: string;
  mensaje?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViajeService {
  private namespace = 'http://ecuaviptour.com/soap/viajes';

  constructor(private soapService: SoapService, private authService: AuthService) { }

  validarAbordaje(viajeId: number, codigo: string): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'validarAbordajeRequest',
      { viaje_id: viajeId, codigo },
      this.authService.getToken() || undefined
    );
  }

  cotizarViaje(request: CotizacionRequest): Observable<CotizacionResponse> {
    return this.soapService.post(
      this.namespace,
      'cotizarRequest',
      {
        distancia_km: request.distancia_km,
        tipo_servicio: request.tipo_servicio,
        num_pasajeros: request.num_pasajeros
      },
      this.authService.getToken() || undefined
    );
  }

  getViajeActivo(): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'getViajeActivoRequest',
      {},
      this.authService.getToken() || undefined
    ).pipe(
      map(res => res && res.viaje)
    );
  }

  cancelarViaje(viajeId: number): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'cancelarViajeRequest',
      { viaje_id: viajeId },
      this.authService.getToken() || undefined
    );
  }

  calificarViaje(datos: any): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'calificarRequest',
      {
        viaje_id: datos.viaje_id,
        estrellas: datos.estrellas,
        comentario: datos.comentario
      },
      this.authService.getToken() || undefined
    );
  }
}
