from flask import request
from flask_socketio import emit, join_room
from database import db, Viaje, MensajeChat, Usuario

def register_socket_events(socketio):
    @socketio.on('connect')
    def handle_connect():
        print("Nuevo cliente conectado a WebSocket")
        emit('server_message', {'data': 'Conexión WebSocket exitosa con Flask'})

    @socketio.on('disconnect')
    def handle_disconnect():
        print("Cliente desconectado de WebSocket")

    @socketio.on('join')
    def on_join(data):
        role = data.get('role')
        user_id = data.get('user_id')
        
        print(f"[JOIN] role={role} user_id={user_id} sid={request.sid}")
        
        if role == 'admin':
            join_room('admins')
        elif role == 'cliente' and user_id:
            room = f"cliente_{user_id}"
            join_room(room)
        elif role == 'chofer':
            join_room('choferes')
            viajes_pendientes = Viaje.query.filter_by(estado_logistico='buscando_chofer').all()
            for v in viajes_pendientes:
                emit('nuevo_viaje_disponible', {
                    'viaje_id': v.id,
                    'origen': v.dir_origen,
                    'destino': v.dir_destino,
                    'tarifa': float(v.monto_total),
                    'tipo_servicio': v.tipo_servicio
                }, room=request.sid)

    @socketio.on('enviar_mensaje')
    def on_enviar_mensaje(data):
        viaje_id = data.get('viaje_id')
        remitente_id = data.get('remitente_id')
        destinatario_id = data.get('destinatario_id')
        contenido = data.get('contenido')
        
        if not contenido or not remitente_id:
            return
        
        nuevo_mensaje = MensajeChat(
            viaje_id=viaje_id,
            remitente_id=remitente_id,
            destinatario_id=destinatario_id,
            contenido=contenido
        )
        db.session.add(nuevo_mensaje)
        db.session.commit()
        
        mensaje_dict = {
            'id': nuevo_mensaje.id,
            'viaje_id': viaje_id,
            'remitente_id': remitente_id,
            'destinatario_id': destinatario_id,
            'contenido': contenido,
            'timestamp': nuevo_mensaje.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        emit('nuevo_mensaje', mensaje_dict, room='admins')
        
        cliente_id_destino = None
        if viaje_id:
            viaje = Viaje.query.get(viaje_id)
            if viaje:
                cliente_id_destino = viaje.cliente_id
        
        if not cliente_id_destino and destinatario_id:
            cliente_id_destino = destinatario_id
        
        if cliente_id_destino:
            room_destino = f"cliente_{cliente_id_destino}"
            emit('nuevo_mensaje', mensaje_dict, room=room_destino)

    @socketio.on('aceptar_viaje')
    def handle_aceptar_viaje(data):
        viaje_id = data.get('viaje_id')
        chofer_id = data.get('chofer_id')
        
        viaje = Viaje.query.get(viaje_id)
        if not viaje:
            return
        
        if viaje.chofer_id is None:
            viaje.chofer_id = chofer_id
            viaje.estado_logistico = 'en_curso'
            db.session.commit()
            
            emit('viaje_confirmado_chofer', {'viaje_id': viaje_id, 'mensaje': '¡Viaje asignado con éxito!'}, room=request.sid)
            
            room_cliente = f"cliente_{viaje.cliente_id}"
            emit('chofer_asignado', {
                'viaje_id': viaje_id, 
                'chofer_id': chofer_id,
                'nombre_chofer': Usuario.query.get(chofer_id).nombre,
                'estado': 'en_curso'
            }, room=room_cliente)
            
            emit('viaje_actualizado_admin', {'viaje_id': viaje_id, 'estado': 'en_curso'}, room='admins')
        else:
            emit('viaje_ya_tomado', {'mensaje': 'Lo sentimos, este viaje ya fue aceptado por otro chofer.'}, room=request.sid)

    @socketio.on('actualizar_ubicacion_chofer')
    def handle_actualizar_ubicacion(data):
        viaje_id = data.get('viaje_id')
        lat = data.get('lat')
        lng = data.get('lng')
        
        viaje = Viaje.query.get(viaje_id)
        if viaje:
            room_cliente = f"cliente_{viaje.cliente_id}"
            emit('ubicacion_chofer_actualizada', {'lat': lat, 'lng': lng}, room=room_cliente)

    @socketio.on('finalizar_viaje')
    def handle_finalizar_viaje(data):
        viaje_id = data.get('viaje_id')
        viaje = Viaje.query.get(viaje_id)
        if viaje:
            viaje.estado_logistico = 'finalizado'
            db.session.commit()
            
            room_cliente = f"cliente_{viaje.cliente_id}"
            emit('viaje_finalizado', {'viaje_id': viaje_id}, room=room_cliente)
            
            emit('viaje_actualizado_admin', {'viaje_id': viaje_id, 'estado': 'finalizado'}, room='admins')
