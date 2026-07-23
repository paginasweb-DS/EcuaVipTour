import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface RespuestaArchivo {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  subirImagen(archivo: File): Observable<RespuestaArchivo> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token && token !== 'null' && token !== 'undefined' && token.split('.').length === 3) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<RespuestaArchivo>(
      `${environment.apiUrl}/archivos/imagen`,
      formData,
      { headers }
    );
  }

  /**
   * Resuelve cualquier URL de imagen, sea una URL absoluta de R2/CDN
   * o una ruta relativa legacy del backend.
   * Uso: <img [src]="ArchivoService.resolverUrl(foto_url)">
   */
  static resolverUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${environment.apiUrl}/${url}`;
  }
}
