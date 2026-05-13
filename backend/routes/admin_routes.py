from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import PagoService, ChatService
import os

admin_bp = Blueprint('admin_bp', __name__)
# The upload folder will be configured when assembling the app
pago_service = PagoService(upload_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), '../uploads/comprobantes'))
chat_service = ChatService()

@admin_bp.route('/pagos', methods=['GET'])
@jwt_required()
def get_pagos():
    estado_filtro = request.args.get('estado', 'pendientes')
    resultado, status_code = pago_service.get_pagos_admin(estado_filtro)
    return jsonify(resultado), status_code

@admin_bp.route('/aprobar_pago', methods=['POST'])
@jwt_required()
def aprobar_pago():
    pago_id = request.json.get('pago_id')
    resultado, status_code = pago_service.aprobar_pago(pago_id)
    return jsonify(resultado), status_code

@admin_bp.route('/inbox', methods=['GET'])
@jwt_required()
def get_inbox():
    resultado, status_code = chat_service.get_inbox_admin()
    return jsonify(resultado), status_code

@admin_bp.route('/chat/<int:cliente_id>', methods=['GET'])
@jwt_required()
def get_chat(cliente_id):
    admin_id = int(get_jwt_identity())
    resultado, status_code = chat_service.get_chat_history(admin_id, cliente_id)
    return jsonify(resultado), status_code
