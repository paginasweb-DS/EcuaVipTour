export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  telefono?: string;
  rol?: 'admin' | 'chofer' | 'cliente';
  activo?: boolean;
  fecha_registro?: string;
}
