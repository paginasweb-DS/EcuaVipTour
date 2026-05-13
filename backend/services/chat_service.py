from repositories import MensajeRepository, ViajeRepository, UsuarioRepository
from database import db, Viaje, MensajeChat

class ChatService:
    def __init__(self):
        self.mensaje_repo = MensajeRepository()
        self.viaje_repo = ViajeRepository()
        self.usuario_repo = UsuarioRepository()

    def get_inbox_admin(self):
        from sqlalchemy import func
        
        # We need a custom query here, similar to the one in app.py
        # This belongs in the service for now as it orchestrates multiple entities
        subquery = db.session.query(
            func.max(MensajeChat.timestamp).label('max_fecha'),
            Viaje.cliente_id.label('cliente_id_sub')
        ).join(Viaje, MensajeChat.viaje_id == Viaje.id)\
         .group_by(Viaje.cliente_id).subquery()

        mensajes = db.session.query(MensajeChat).join(Viaje, MensajeChat.viaje_id == Viaje.id).join(
            subquery,
            db.and_(
                Viaje.cliente_id == subquery.c.cliente_id_sub,
                MensajeChat.timestamp == subquery.c.max_fecha
            )
        ).order_by(MensajeChat.timestamp.desc()).all()

        resultado = []
        vistos = set()
        for msj in mensajes:
            viaje_context = self.viaje_repo.get_by_id(msj.viaje_id)
            if not viaje_context: continue
            
            otro_id = viaje_context.cliente_id
            if otro_id in vistos: continue
            vistos.add(otro_id)
            
            cliente = self.usuario_repo.get_by_id(otro_id)
            if not cliente: continue

            unread = MensajeChat.query.join(Viaje, MensajeChat.viaje_id == Viaje.id).filter(
                Viaje.cliente_id == otro_id,
                MensajeChat.remitente_id == otro_id,
                MensajeChat.leido == False
            ).count()
            
            ultimo_viaje = Viaje.query.filter_by(cliente_id=otro_id).order_by(Viaje.fecha_creacion.desc()).first()
            
            resultado.append({
                "cliente_id": cliente.id,
                "cliente_nombre": cliente.nombre,
                "ultimo_mensaje": msj.contenido,
                "fecha_ultimo_mensaje": msj.timestamp.strftime("%Y-%m-%d %H:%M"),
                "unread": unread,
                "viaje_id": msj.viaje_id,
                "estado_pago": ultimo_viaje.estado_pago if ultimo_viaje else 'n/a'
            })
            
        return resultado, 200

    def get_chat_history(self, admin_id, cliente_id):
        # We find the trips of this client to get the messages
        # Current logic links messages to viajes. 
        viajes = self.viaje_repo.get_by_cliente_id(cliente_id)
        if not viajes:
            return {"error": "Cliente no tiene viajes"}, 404
            
        # Simplified: Get all messages where this client is involved
        mensajes = MensajeChat.query.join(Viaje, MensajeChat.viaje_id == Viaje.id).filter(
            Viaje.cliente_id == cliente_id
        ).order_by(MensajeChat.timestamp.asc()).all()
        
        # Marcar como leídos los que no son míos
        for m in mensajes:
            if m.remitente_id != admin_id and not m.leido:
                m.leido = True
        db.session.commit()
        
        resultado = []
        for m in mensajes:
            resultado.append({
                "id": m.id,
                "remitente_id": m.remitente_id,
                "destinatario_id": m.destinatario_id,
                "contenido": m.contenido,
                "timestamp": m.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            })
            
        return resultado, 200
