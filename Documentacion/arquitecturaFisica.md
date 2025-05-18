# Arquitectura Física

Esta sección describe cómo se implementa físicamente la arquitectura del sistema de microservicios utilizando contenedores Docker, redes virtuales y volúmenes persistentes.

---

## 🧱 Infraestructura de contenedores

Todo el sistema está orquestado mediante `docker-compose`, lo que permite levantar múltiples servicios de forma coordinada. Cada componente del sistema corre como un contenedor independiente y aislado.

### Contenedores principales

| Componente     | Imagen                           | Rol                                                       |
|----------------|----------------------------------|------------------------------------------------------------|
| `backend`      | `josianamj/backend_image`        | API principal que interactúa con bases de datos y clientes |
| `search`       | `josianamj/search_service`       | Servicio para consultas distribuidas en MongoDB            |
| `db`           | `josianamj/postgres_db`          | Base de datos PostgreSQL                                   |
| `redis`        | `josianamj/redis_image`          | Sistema de caché en memoria                                |
| `traefik`      | `traefik:v2.11`                  | Proxy inverso y balanceador de carga                       |
| `mongos1`      | `mongo`                          | Enrutador del clúster MongoDB                              |
| `mongors*`     | `mongo`                          | Réplicas para los shards de MongoDB                        |
| `mongocfg*`    | `mongo`                          | Config servers de MongoDB                                  |
| `setup-mongo`  | `josianamj/setup_mongo`          | Script de configuración inicial del clúster MongoDB        |
| `charge-data`  | `josianamj/charge_data`          | Script de insercion de datos simulados utilizando MML      |
---

## Redes

Se definieron redes personalizadas para aislar el tráfico según los contextos funcionales:

- `backend-network`: conecta `traefik`, `backend` y `db`
- `mongo-replica-sharding`: conecta todos los nodos Mongo, `search`, y `redis`

Estas redes aseguran que los servicios sólo puedan comunicarse con aquellos a los que están destinados.

---

## Puertos expuestos

| Servicio  | Puerto externo | Interno en contenedor |
| --------- | -------------- | --------------------- |
| `traefik` | `80`, `8080`   | `80`, `8080`          |
| `backend` | (interno solo) | `3000`                |
| `search`  | (interno solo) | `4000`                |
| `db`      | `5432`         | `5432`                |
| `redis`   | `6379`         | `6379`                |
| `mongos1` | `27019`        | `27017`               |

A excepcion de Traefik, el resto de servicios no exponen sus puertos publicamente, solo se accede a ellos mediante redes internas de Docker.
A Traefik se accede por medio de http://localhost/

## Escalabilidad

El servicio `backend` se pueden escalar horizontalmente mediante:
```powershell
docker compose up -d --scale backend=3
```
A lo cual Traefik detecta automaticamente las nuevas instancias y balancea la carga de las solicitudes entre ellas.

## Persistencia

El sistema esta diseñado para asegurar la persistencia de datos mediante volúmenes de Docker, en caso de que un contenedor reinicie o entre múltiples ejecuciones.

## 💾 Persistencia de Volúmenes

El sistema está diseñado para asegurar la persistencia de los datos críticos mediante el uso de **volúmenes Docker**. Estos volúmenes permiten que los datos almacenados por los contenedores no se pierdan al reiniciar o eliminar los servicios.

| Servicio            | Volumen asociado     | Ruta interna                     | Propósito principal                                 |
|---------------------|----------------------|----------------------------------|-----------------------------------------------------|
| `db` (PostgreSQL)   | `db-data`            | `/var/lib/postgresql/data`       | Almacena datos estructurados del sistema            |
| `elasticsearch`     | `elastic-data`       | `/usr/share/elasticsearch/data`  | Persistencia del índice de búsqueda                 |
| `mongors*`          | `data1` a `data9`    | `/data/db`                       | Persistencia por réplica y shard                    |
| `mongocfg*`         | `config1` a `config3`| `/data/db`                       | Datos de configuración del clúster MongoDB          |

