export interface MensajeChat {
  id?: number;
  viaje_id: number;
  remitente_id: number;
  destinatario_id?: number;
  contenido: string;
  leido?: boolean;
  timestamp?: string;
}
