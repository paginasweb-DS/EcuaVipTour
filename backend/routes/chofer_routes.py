from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import ChoferService

chofer_bp = Blueprint('chofer_bp', __name__)
chofer_service = ChoferService()

@chofer_bp.route('/viajes/disponibles', methods=['GET'])
@jwt_required()
def viajes_disponibles():
    resultado, status_code = chofer_service.get_viajes_disponibles()
    return jsonify(resultado), status_code

@chofer_bp.route('/mis-viajes', methods=['GET'])
@jwt_required()
def mis_viajes_chofer():
    chofer_id = int(get_jwt_identity())
    resultado, status_code = chofer_service.get_viajes_chofer(chofer_id)
    return jsonify(resultado), status_code
