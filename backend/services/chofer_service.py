from repositories import ViajeRepository, UsuarioRepository

class ChoferService:
    def __init__(self):
        self.viaje_repo = ViajeRepository()
        self.usuario_repo = UsuarioRepository()

    def get_viajes_chofer(self, chofer_id):
        viajes = self.viaje_repo.get_by_chofer_id(chofer_id)
        resultado = []
        for v in viajes:
            cliente = self.usuario_repo.get_by_id(v.cliente_id)
            resultado.append({
                "id": v.id,
                "cliente": cliente.nombre,
                "origen": v.dir_origen,
                "destino": v.dir_destino,
                "distancia_km": float(v.distancia_km),
                "monto": float(v.monto_total),
                "estado_logistico": v.estado_logistico,
                "tipo_servicio": v.tipo_servicio,
                "fecha": v.fecha_creacion.strftime("%Y-%m-%d %H:%M")
            })
        return resultado, 200

    def get_viajes_disponibles(self):
        viajes = self.viaje_repo.get_pendientes_para_choferes()
        resultado = []
        for v in viajes:
            resultado.append({
                "id": v.id,
                "origen": v.dir_origen,
                "destino": v.dir_destino,
                "distancia_km": float(v.distancia_km),
                "tarifa": float(v.monto_total),
                "tipo_servicio": v.tipo_servicio,
                "fecha": v.fecha_creacion.strftime("%Y-%m-%d %H:%M")
            })
        return resultado, 200
