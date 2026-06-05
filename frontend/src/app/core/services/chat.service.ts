import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { SoapService } from './soap.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private namespace = 'http://ecuaviptour.com/soap/chat';

  constructor(private soapService: SoapService, private authService: AuthService) { }

  getHistorial(otroId: number, tipoReceptor: string = 'admin', viajeId?: number): Observable<any[]> {
    return this.soapService.post(
      this.namespace,
      'getHistoryRequest',
      {
        target_id: otroId,
        viaje_id: viajeId,
        tipo_receptor: tipoReceptor
      },
      this.authService.getToken() || undefined
    ).pipe(
      map(res => {
        return (res && res.messages) || [];
      })
    );
  }

  markAsRead(otroId: number): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'markReadRequest',
      { otro_id: otroId },
      this.authService.getToken() || undefined
    );
  }

  getAdminInfo(): Observable<{ admin_id: number; admin_nombre: string }> {
    return this.soapService.post(
      this.namespace,
      'getAdminInfoRequest',
      {},
      this.authService.getToken() || undefined
    ).pipe(
      map(res => {
        return {
          admin_id: res ? res.admin_id : 0,
          admin_nombre: res ? res.admin_nombre : ''
        };
      })
    );
  }

  assignSupport(clienteId: number, categoria: string): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'assignSupportRequest',
      {
        cliente_id: clienteId,
        categoria: categoria
      },
      this.authService.getToken() || undefined
    );
  }

  resolveCase(clienteId: number): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'resolveCaseRequest',
      { cliente_id: clienteId },
      this.authService.getToken() || undefined
    );
  }
}
