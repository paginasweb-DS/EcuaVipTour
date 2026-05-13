import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:5001/api/cliente';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getMisViajes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis_viajes`, { headers: this.getHeaders() });
  }

  cancelarViaje(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl.replace('/api/cliente', '/api/viajes')}/cancelar/${id}`, {}, { headers: this.getHeaders() });
  }

  markAsRead(otroId: number): Observable<any> {
    return this.http.post(`http://localhost:5001/api/chat/mark_read/${otroId}`, {}, { headers: this.getHeaders() });
  }
}
