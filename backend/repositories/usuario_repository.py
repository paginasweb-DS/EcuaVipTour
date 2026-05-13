from database import Usuario
from .base_repository import BaseRepository

class UsuarioRepository(BaseRepository):
    def __init__(self):
        super().__init__(Usuario)

    def get_by_email(self, email):
        return self.get_first_by_filters(correo=email)
