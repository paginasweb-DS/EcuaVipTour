import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://127.0.0.1:5001/api/admin';
  private pendingCountSource = new BehaviorSubject<number>(0);
  pendingCount$ = this.pendingCountSource.asObservable();

  private unreadCountSource = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSource.asObservable();

  constructor(private http: HttpClient, private authService: AuthService, private chatService: ChatService) { }

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPagos(estado: string = 'pendientes'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pagos?estado=${estado}`, { headers: this.getHeaders() })
      .pipe(tap(pagos => {
        if (estado === 'pendientes') {
          this.pendingCountSource.next(pagos.length);
        }
      }));
  }

  getInbox(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inbox`, { headers: this.getHeaders() })
      .pipe(tap(inbox => {
        const chatsConUnread = inbox.filter((c: any) => (c.unread || 0) > 0).length;
        this.unreadCountSource.next(chatsConUnread);
      }));
  }

  updatePendingCount(count: number) {
    this.pendingCountSource.next(count);
  }

  updateUnreadCount(count: number) {
    this.unreadCountSource.next(count);
  }

  markAsRead(viajeId: number): Observable<any> {
    return this.chatService.markAsRead(viajeId);
  }

  aprobarPago(pagoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/aprobar_pago`, { pago_id: pagoId }, { headers: this.getHeaders() });
  }

  rechazarPago(pagoId: number, motivo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rechazar_pago`, { pago_id: pagoId, motivo }, { headers: this.getHeaders() });
  }
}
