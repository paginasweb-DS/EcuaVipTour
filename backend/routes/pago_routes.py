from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from services import PagoService
import os

pago_bp = Blueprint('pago_bp', __name__)
pago_service = PagoService(upload_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), '../uploads/comprobantes'))

@pago_bp.route('/subir_comprobante', methods=['POST'])
@jwt_required()
def subir_comprobante():
    if 'comprobante' not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400
    
    file = request.files['comprobante']
    viaje_id = request.form.get('viaje_id')
    
    if file and viaje_id:
        resultado, status_code = pago_service.subir_comprobante(file, viaje_id)
        
        if status_code == 200:
            from app import socketio
            socketio.emit('nuevo_comprobante', {'viaje_id': viaje_id, 'mensaje': 'Nuevo comprobante subido'}, room='admins')

        return jsonify(resultado), status_code
        
    return jsonify({"error": "Datos incompletos"}), 400
