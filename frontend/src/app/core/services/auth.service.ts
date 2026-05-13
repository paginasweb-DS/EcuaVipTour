import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5001/api/auth';
  private isBrowser: boolean;
  
  // Subject para abrir el modal desde cualquier lugar
  private authModalSubject = new Subject<void>();
  authModal$ = this.authModalSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          this.setToken(res.token);
          if (this.isBrowser) {
            localStorage.setItem('ecuavip_user', JSON.stringify(res.usuario));
          }
          // Redirigir según el rol del usuario
          this.redirectByRole(res.usuario?.rol);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((res: any) => {
        if (res.token) {
          this.setToken(res.token);
          if (this.isBrowser) {
            localStorage.setItem('ecuavip_user', JSON.stringify(res.usuario));
          }
          // Redirigir según el rol del usuario
          this.redirectByRole(res.usuario?.rol);
        }
      })
    );
  }

  redirectByRole(rol: string): void {
    if (rol === 'admin') {
      this.router.navigate(['/admin']);
    } else if (rol === 'chofer') {
      this.router.navigate(['/chofer/dashboard']);
    } else {
      this.router.navigate(['/cliente']);
    }
  }

  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('jwt_token', token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }
  
  getUsuario(): any {
    if (this.isBrowser) {
      const user = localStorage.getItem('ecuavip_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getRol(): string | null {
    return this.getUsuario()?.rol ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('ecuavip_user');
    }
  }

  openAuthModal(): void {
    this.authModalSubject.next();
  }
}
