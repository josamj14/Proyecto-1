# Bases de Datos en el Sistema

En esta seccion detallamos la arquitectura de bases de datos híbrida que utiliza nuestro sistema, integrando tanto una base relacional (PostgreSQL) como una base NoSQL distribuida (MongoDB con sharding y replicación).

### Configuracion
Los controladores y modelos en el código se diseñaron con el patrón Repositorio para permitir el intercambio entre __PostgreSQL__ y __MongoDB__ mediante la variable de configuración _DB_TYPE_.

---

## 🐘 PostgreSQL

Esta es la base de datos principal, generada previamente en el Trabajo Corto #1. 

---

## 🍃 MongoDB con Replicación y Sharding

Esta base de datos se implemento como parte del Trabajo Corto #3, con la función de ser reutilizada en este proyecto. 
Se parte de código brindado por el docente, al cuál se le agrega un shard y réplica adicional para cumplir las especificaciones del proyecto. Además, se configuran los datos, particiones y otros. 

#### Arquitectura configurada

- __Conjunto de réplicas:__ cada shard contiene 3 réplicas (1 primario y 2 secundarios) para alta disponibilidad.
-  __Sharding:__ los datos de productos y reservas se distribuyen en múltiples shards para soportar grandes volúmenes y paralelismo. 
   - La coleccion _Usuarios_ se configura con _Hashed Sharding_ con la llave _UserId_.
   - Las colecciones _Publicaciones_ y _Comentarios_ se configuran con _Ranged Sharding_, utilizando las llaves _UserId_ y _PostId_ consecutivamente. 
- __Persistencia:__ Todos los contenedores Mongo usan volúmenes Docker dedicados para almacenar los datos y garantizar la persistencia en reinicios o actualizaciones. Si se iniciar desde 0, es importante eliminar los volumenes.

#### Componentes del clúster MongoDB

- `mongors1n1`, `mongors1n2`, `mongors1n3` → Réplicas del shard 1
- `mongors2n1`, `mongors2n2`, `mongors2n3` → Réplicas del shard 2
- `mongors3n1`, `mongors3n2`, `mongors3n3` → Réplicas del shard 3
- `mongocfg1`, `mongocfg2`, `mongocfg3` → Config servers
- `mongos1` → Enrutador del clúster



