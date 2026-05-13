from database import Pago
from .base_repository import BaseRepository

class PagoRepository(BaseRepository):
    def __init__(self):
        super().__init__(Pago)
