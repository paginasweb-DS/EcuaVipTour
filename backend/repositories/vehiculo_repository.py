from database import Vehiculo
from .base_repository import BaseRepository

class VehiculoRepository(BaseRepository):
    def __init__(self):
        super().__init__(Vehiculo)
