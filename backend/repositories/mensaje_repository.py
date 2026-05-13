from database import MensajeChat
from .base_repository import BaseRepository
from sqlalchemy import or_, and_

class MensajeRepository(BaseRepository):
    def __init__(self):
        super().__init__(MensajeChat)

    def get_by_viaje_id(self, viaje_id):
        return self.model.query.filter_by(viaje_id=viaje_id).order_by(self.model.timestamp.asc()).all()

    def get_by_users(self, user_id_1, user_id_2):
        return self.model.query.filter(
            or_(
                and_(self.model.remitente_id == user_id_1, self.model.destinatario_id == user_id_2),
                and_(self.model.remitente_id == user_id_2, self.model.destinatario_id == user_id_1)
            )
        ).order_by(self.model.timestamp.asc()).all()
