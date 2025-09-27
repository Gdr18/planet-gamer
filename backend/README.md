# 🎮 Planet Gamer Backend

Backend de Planet Gamer (e\-commerce de videojuegos). Proyecto final del *Full Stack Course by DevCamp \& Bottega University*.  
API construida con **Flask** y **SQLAlchemy** sobre **SQLite** (en producción base de datos PostgresSQL).  
Estado: en desarrollo.

<a href="https://planet-gamer-backend.fly.dev">Deploy (Fly.io)</a>

---

## 🚀 Tecnologías

- Python 3.11+
- Flask
- Flask-SQLAlchemy
- Flask-Cors (CORS para permitir peticiones desde el frontend)
- Flask-Bcrypt (hash de contraseñas)
- flask-marshmallow (para serialización)
- python-dotenv

---

## ✨ Funcionalidades

- CRUD de juegos, usuarios, pedidos, cestas, roles, direcciones y detalles de pedido.
- Autenticación y autorización de usuarios con roles (admin, usuario).
- Integración con Stripe para pagos.

---

## ⚙️ Instalación local
1. Clona este repositorio:

```
git clone https://github.com/Gdr18/planet-gamer-backend.git
cd planet_gamer_backend
```

2. Crea y activa un entorno virtual:

```
python -m venv venv
venv\Scripts\activate
```

3. Instala las dependencias:

```
pip install -r requirements.txt
```

4. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

```
CONFIG_MODE = config.DevelopmentConfig # o config.ProductionConfig para producción
SECRET_KEY = secretkey
DATABASE_URI = path/to/database.db # o URI de PostgreSQL o SQLite en producción
```

5. Ejecuta la aplicación:

```
python run.py
```

---

## 📓 Prueba la API

Puedes probar todos los endpoints desde la colección de Postman:

🔗 [Colección de Postman Local](https://www.postman.com/maintenance-participant-28116252/workspace/gdor-comparte/collection/26739293-12e6659d-c495-4dfa-86d0-eda808b8d03c?action=share&creator=26739293)
___

👩‍💻 Autor
Gádor García Martínez
GitHub: https://github.com/Gdr18
LinkedIn: https://www.linkedin.com/in/g%C3%A1dor-garc%C3%ADa-mart%C3%ADnez-99a33717b/
