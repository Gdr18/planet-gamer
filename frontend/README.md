# Planet Gamer Frontend

Frontend Planet Gamer, e-commerce de videojuegos. Proyecto final "Full Stack Course by DevCamp & Bottega University".

<img src="https://i.imgur.com/aLjq6Ei.png" alt="Captura Planet Gamer"/>

<a href='https://planet-gamer-frontend.onrender.com'>Demo Planet Gamer</a>

## Tecnologías
- Vite
- React
- SCSS
- SQLAlchemy
- Axios
- React-hook-form
- Stripe

## Funcionalidades
- Gestión de autenticación
- Filtro de productos
- Gestión de productos (CRUD)
- Gestión de carrito de compra
- Gestión de órdenes de compra
- Integración con Stripe 

## Instalación local
Clona el repositorio:
```bash
git clone https://github.com/Gdr18/planet_gamer_frontend.git
cd planet_gamer_frontend
```
Instala las dependencias:
```bash
npm install
```
Configura las variables de entorno creando un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
VITE_BACKEND_URL=https://tu_servidor_backend.dev
VITE_STRIPES=tu_clave_stripes
```

## Comandos disponibles
Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

Para hacer el build de producción:
```bash
npm run build
```
para previsualizar el build de producción:
```bash
npm run preview
```

Actualmente sigue en construcción.
