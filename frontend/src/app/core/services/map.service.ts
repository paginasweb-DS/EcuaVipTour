import { Injectable } from '@angular/core';

export interface CotizacionRequest {
  distanciaKm: number;
  tipo: 'compartido' | 'express';
}

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }

  calcularTarifa(request: CotizacionRequest): number {
    const km = request.distanciaKm;
    
    if (request.tipo === 'compartido') {
      if (km <= 145) return 15;
      if (km <= 160) return 18;
      return 22;
    } else {
      // express
      const base = 60;
      if (km <= 165) return base;
      const extraKm = Math.ceil(km - 165);
      return base + (extraKm * 0.50);
    }
  }

  geocodeLatLng(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!google || !google.maps || !google.maps.Geocoder) {
        reject('Google Maps no cargado');
        return;
      }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(status);
        }
      });
    });
  }
}
