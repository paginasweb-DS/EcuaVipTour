import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SoapService } from './soap.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private namespace = 'http://ecuaviptour.com/soap/gastos';

  constructor(
    private soapService: SoapService,
    private authService: AuthService
  ) {}

  registrarGasto(monto: number, descripcion: string, categoria: string): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'registrarGastoRequest',
      {
        monto,
        descripcion,
        categoria
      },
      this.authService.getToken() || undefined
    );
  }

  getGastos(categoria?: string): Observable<any[]> {
    return this.soapService.post(
      this.namespace,
      'getGastosRequest',
      {
        categoria: categoria || undefined
      },
      this.authService.getToken() || undefined
    ).pipe(
      map(res => {
        const list = (res && res.gastos) || [];
        return list.map((g: any) => ({
          id: g.id,
          monto: g.monto,
          fecha: g.fecha,
          descripcion: g.descripcion,
          categoria: g.categoria,
          adminId: g.admin_id,
          adminNombre: g.admin_nombre
        }));
      })
    );
  }

  getGastoStats(period: string = 'month', startDate?: string, endDate?: string): Observable<any> {
    return this.soapService.post(
      this.namespace,
      'getGastoStatsRequest',
      {
        period,
        start_date: startDate,
        end_date: endDate
      },
      this.authService.getToken() || undefined
    ).pipe(
      map(res => {
        const jsonStr = res ? (res.stats_json || res.statsJson) : null;
        return JSON.parse(jsonStr || '{}');
      })
    );
  }
}
