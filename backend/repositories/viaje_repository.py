from database import Viaje, db
from .base_repository import BaseRepository
from sqlalchemy import or_

class ViajeRepository(BaseRepository):
    def __init__(self):
        super().__init__(Viaje)

    def get_by_cliente_id(self, cliente_id):
        return self.model.query.filter_by(cliente_id=cliente_id).order_by(self.model.id.desc()).all()

    def get_by_chofer_id(self, chofer_id):
        return self.model.query.filter_by(chofer_id=chofer_id).order_by(self.model.id.desc()).all()

    def get_pendientes_para_choferes(self):
        return self.model.query.filter_by(estado_logistico='buscando_chofer').order_by(self.model.id.desc()).all()
        
    def get_all_ordered(self):
        return self.model.query.order_by(self.model.id.desc()).all()
