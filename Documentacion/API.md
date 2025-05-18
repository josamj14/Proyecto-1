# API REST - Sistema de Gestión de Restaurante 

Esta API está diseñada para gestionar un sistema de restaurante, incluyendo menús, pedidos, reservas, restaurantes y usuarios. Está implementada con Node.js, Express, PostgreSQL/MongoDB y Redis para optimización de caché.

---

## **Endpoints**

### Menús
- `GET /api/menus` - Obtener todos los menús
- `GET /api/menus/:id` - Obtener un menú por ID
- `POST /api/menus` - Crear un nuevo menú
- `PUT /api/menus/:id` - Actualizar un menú existente
- `DELETE /api/menus/:id` - Eliminar un menú

---

### Pedidos (Orders)
- `GET /api/orders` - Obtener todos los pedidos
- `GET /api/orders/:id` - Obtener un pedido por ID
- `POST /api/orders` - Crear un nuevo pedido
- `PUT /api/orders/:id` - Actualizar un pedido existente
- `DELETE /api/orders/:id` - Eliminar un pedido

---

### Reservas (Reservations)
- `GET /api/reservations` - Obtener todas las reservas
- `GET /api/reservations/:id` - Obtener una reserva por ID
- `POST /api/reservations` - Crear una nueva reserva
- `PUT /api/reservations/:id` - Actualizar una reserva existente
- `DELETE /api/reservations/:id` - Eliminar una reserva

---

### Restaurantes (Restaurants)
- `GET /api/restaurant` - Obtener todos los restaurantes
- `GET /api/restaurant/:id` - Obtener un restaurante por ID
- `POST /api/restaurant` - Crear un nuevo restaurante
- `PUT /api/restaurant/:id` - Actualizar un restaurante existente
- `DELETE /api/restaurant/:id` - Eliminar un restaurante

---

### Usuarios (Users)
- `GET /api/user` - Obtener todos los usuarios
- `GET /api/user/:id` - Obtener un usuario por ID
- `POST /api/user` - Crear un nuevo usuario
- `PUT /api/user/:id` - Actualizar un usuario existente
- `DELETE /api/user/:id` - Eliminar un usuario

---

### Products (Productos)
- `GET /api/products` - Obtener todos los usuarios
- `GET /api/product/:id` - Obtener un usuario por ID
- `POST /api/product` - Crear un nuevo usuario
- `PUT /api/product/:id` - Actualizar un usuario existente
- `DELETE /api/product/:id` - Eliminar un usuario

---

## **Middleware de Caché**
Se implementa un sistema de caché en Redis para optimizar las operaciones `GET` en cada endpoint. El middleware verifica si los datos ya están en caché:
- Si existe: Se devuelve desde Redis.
- Si no existe: Se consulta en la base de datos y se almacena en Redis para la siguiente petición.

---

