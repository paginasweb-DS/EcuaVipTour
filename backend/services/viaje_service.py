from datetime import datetime, timedelta
from repositories import ViajeRepository

class ViajeService:
    def __init__(self):
        self.viaje_repo = ViajeRepository()

    def cotizar(self, datos):
        if not datos:
            return {"error": "No hay datos"}, 400
        
        distancia = float(datos.get('distancia_km', 0))
        tipo_servicio = datos.get('tipo_servicio', 'pasajero')
        num_pasajeros = int(datos.get('num_pasajeros', 1))

        precio_zona = 0
        zona = ""
        
        if distancia <= 145:
            precio_zona = 15
            zona = "Norte (Hasta La Marín/Condado)"
        elif distancia <= 155:
            precio_zona = 18
            zona = "Valles y Sur"
        elif distancia <= 165:
            precio_zona = 20
            zona = "Carapungo/Calderón"
        else:
            precio_zona = 22
            zona = "Mitad del Mundo / Extremos"

        if tipo_servicio == 'express':
            base = 60
            if distancia <= 165:
                precio_total = base
            else:
                km_extra = distancia - 165
                precio_total = base + (km_extra * 0.50)
            return {
                "precio_total": round(precio_total, 2),
                "precio_unitario": round(precio_total, 2),
                "zona": "Express 24H (Tababela)"
            }, 200

        elif tipo_servicio == 'encomienda':
            precio_unitario = precio_zona * 0.70
            precio_total = precio_unitario
            return {
                "precio_total": round(precio_total, 2),
                "precio_unitario": round(precio_unitario, 2),
                "zona": zona,
                "mensaje": "Peso máximo permitido de maleta: 25Kg"
            }, 200
            
        elif tipo_servicio == 'pasajero':
            precio_total = precio_zona * num_pasajeros
            return {
                "precio_total": round(precio_total, 2),
                "precio_unitario": round(precio_zona, 2),
                "zona": zona
            }, 200

        return {"error": "Tipo de servicio inválido"}, 400

    def reservar(self, datos, cliente_id):
        nuevo_viaje = self.viaje_repo.create(
            cliente_id=cliente_id,
            dir_origen=datos.get('origen'),
            lat_origen=0.0, 
            lng_origen=0.0,
            dir_destino=datos.get('destino'),
            lat_destino=0.0,
            lng_destino=0.0,
            distancia_km=datos.get('distancia_km', 0),
            monto_total=datos.get('tarifa'),
            tipo_servicio=datos.get('tipo_servicio'),
            tipo_modalidad='compartido' if datos.get('tipo_servicio') == 'pasajero' else 'privado_express',
            estado_pago='pendiente',
            estado_logistico='pendiente',
            fecha_limite_pago=datetime.utcnow() + timedelta(minutes=15)
        )
        
        return {"mensaje": "Reserva creada exitosamente", "viaje_id": nuevo_viaje.id}, 201

    def get_viajes_cliente(self, cliente_id):
        from database import TicketQR, Usuario
        viajes = self.viaje_repo.get_by_cliente_id(cliente_id)
        resultado = []
        for v in viajes:
            qr = TicketQR.query.filter_by(viaje_id=v.id).first()
            resultado.append({
                "id": v.id,
                "viaje_id": v.id, # Añadido por compatibilidad
                "origen": v.dir_origen,
                "dir_origen": v.dir_origen, # Añadido por compatibilidad
                "destino": v.dir_destino,
                "dir_destino": v.dir_destino, # Añadido por compatibilidad
                "distancia_km": float(v.distancia_km),
                "monto": float(v.monto_total),
                "estado_pago": v.estado_pago,
                "estado_logistico": v.estado_logistico,
                "tipo_servicio": v.tipo_servicio,
                "fecha": v.fecha_creacion.strftime("%Y-%m-%d %H:%M"),
                "fecha_limite_pago": v.fecha_limite_pago.isoformat() if v.fecha_limite_pago else None,
                "qr_hash": qr.codigo_hash if qr else None,
                "nombre_chofer": Usuario.query.get(v.chofer_id).nombre if v.chofer_id else None
            })
        return resultado, 200
