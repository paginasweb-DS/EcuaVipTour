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
}
