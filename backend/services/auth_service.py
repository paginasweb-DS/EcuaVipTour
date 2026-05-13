from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from repositories import UsuarioRepository

class AuthService:
    def __init__(self):
        self.usuario_repo = UsuarioRepository()

    def register(self, datos):
        if not datos or not datos.get('correo') or not datos.get('password') or not datos.get('nombre'):
            return {"error": "Faltan datos obligatorios"}, 400

        usuario_existente = self.usuario_repo.get_by_email(datos.get('correo'))
        if usuario_existente:
            return {"error": "El correo ya está registrado"}, 400

        nuevo_usuario = self.usuario_repo.create(
            nombre=datos.get('nombre'),
            correo=datos.get('correo'),
            password_hash=generate_password_hash(datos.get('password')),
            telefono=datos.get('telefono', ''),
            rol=datos.get('rol', 'cliente')
        )
        
        token = create_access_token(identity=str(nuevo_usuario.id))
        return {
            "mensaje": "Usuario registrado", 
            "token": token, 
            "usuario": {"id": nuevo_usuario.id, "nombre": nuevo_usuario.nombre, "correo": nuevo_usuario.correo}
        }, 201

    def login(self, datos):
        if not datos or not datos.get('correo') or not datos.get('password'):
            return {"error": "Faltan datos obligatorios"}, 400

        usuario = self.usuario_repo.get_by_email(datos.get('correo'))
        if not usuario or not check_password_hash(usuario.password_hash, datos.get('password')):
            return {"error": "Credenciales inválidas"}, 401

        token = create_access_token(identity=str(usuario.id))
        return {
            "mensaje": "Login exitoso", 
            "token": token, 
            "usuario": {"id": usuario.id, "nombre": usuario.nombre, "correo": usuario.correo, "rol": usuario.rol}
        }, 200
