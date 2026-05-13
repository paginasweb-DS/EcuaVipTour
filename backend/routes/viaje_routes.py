from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import ViajeService

viaje_bp = Blueprint('viaje_bp', __name__)
viaje_service = ViajeService()

@viaje_bp.route('/cotizar', methods=['POST'])
def cotizar():
    resultado, status_code = viaje_service.cotizar(request.json)
    return jsonify(resultado), status_code

@viaje_bp.route('/reservar', methods=['POST'])
@jwt_required()
def reservar_viaje():
    cliente_id = int(get_jwt_identity())
    resultado, status_code = viaje_service.reservar(request.json, cliente_id)
    return jsonify(resultado), status_code

@viaje_bp.route('/mis-viajes', methods=['GET'])
@jwt_required()
def mis_viajes():
    cliente_id = int(get_jwt_identity())
    resultado, status_code = viaje_service.get_viajes_cliente(cliente_id)
    return jsonify(resultado), status_code
