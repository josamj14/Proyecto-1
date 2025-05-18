## PY01 Restaurantes e2
__Curso:__ Bases de Datos II 
__Periodo:__ I Sem 2025
__Estudiantes:__ Brandon Badilla y Josi Marin 
__Fecha de entrega:__ 17 de mayo del 2025

### Contenidos

- [Arquitectura Lógica](./Documentacion/arquitecturaLogica.md)
- [Arquitectura Física](./Documentacion/arquitecturaFisica.md)
- [Flujo de Datos](./Documentacion/flujoDatos.md)
- Microservicios
  - [API](./Documentacion/API.md)
  - [Búsqueda](./Documentacion/elastic.md)
- Otros componentes
  - [Caché](./Documentacion/redisCache.md)
  - [Bases de datos simultáneas](./Documentacion/databases.md)
  - [Balanceador de carga/router](./Documentacion/balanceadorCarga.md)
  - [Pipeline CI/CD](./Documentacion/pipeline.md)



### Ejecucion

#### Requisitos Previos
 - Tener instalado Docker. De no cumplirlo, acceder [aqui](https://docs.docker.com/desktop/setup/install/windows-install/) para descargarlo.
 - Tener Docker correctamente configurado para ejecucion de proyectos. De no cumplirlo, acceder [aqui](https://docs.docker.com/get-started/) para realizar los pasos de configuracion.
 - Descargar el codigo fuente del proyecto.
 - (Opcional) Tener instalado Visual Studio Code. De no cumplirlo, puede ser necesario cambiar los comandos de ejecución ligeramente. Puede acceder [aqui](https://code.visualstudio.com/docs/setup/windows)

#### Ejecucion
Los siguientes pasos de ejecucion son para la terminal Powershell Windows dentro del editor de texto Visual Studio Code. 

1. __Descargar imagenes de Docker__
Con los siguientes comandos se descargarán las versiones más recientes de las imagenes creadas para este proyecto. 

```powershell
docker pull josianamj/postgres_db:latest 
docker pull josianamj/backend_image:latest
docker pull josianamj/redis_image:latest
docker pull josianamj/setup_mongo:latest
```



2. __Levantar los contenedores__
Por medio del siguiente comando, se realizará el levantamiento de los contenedores que componen el sistema del proyecto.

```powershell
docker-compose up -d
```

⚠️ __Importante:__ Al ejecutar este comando, el servicio toma un tiempo en levantarse completamente. No realizar consultas hasta que el comando "termine" su ejecucion pues resultara en errores. 

Si desea realizar escalado vertical de los microservicios, puede agregar el argumento `--scale service_name=quantity` al comando previo, por ejemplo, levantar 3 instancias de la API se veria de la siguiente forma:
```powershell
docker compose up -d --scale backend=3 
```

3. __Bajar los contenedores:__ Al finalizar las pruebas, puede "bajar" (detener la ejecucion y eliminar) los contenedores por medio del siguiente comando:

```powershell
docker compose down -v
```
