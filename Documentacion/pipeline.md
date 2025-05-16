# Pipeline CI/CD

Debido a que de previo estabamos utilizando _GitHub_ como servicio de control de versiones Git, fue instintivo utilizar __Github Actions__ como herramienta de integracion despliegue continuo. 

### Configuracion 

La configuracion del pipeline CI/CD se realizo por medio del archivo __.github\workflows\docker-image.yml__, el cual se ejecuta automaticamente en GitHub tras una actualizacion del repositorio en la rama principal (lo que se realiza con el comando `git push origin main`).

### Etapas del pipeline

1. **Instalación de dependencias:** debido a que las pruebas unitarias y de integracion se realizaron con la libreria _Jest_ para _Node.js_, se deben instalar las dependencias necesarias para su correcta ejecucion. Las dependencias que se instalan son las mismas del microservicio __API__.
2. **Ejecución de pruebas (unitarias/integración):** las pruebas se ejecutan por medio del comando `npm test`. Con solo una prueba que esté incorrecta, se interrupte el flujo del pipeline y da un símbolo de error en GitHub.
3. **Construir y subir las imágenes Docker:** se inicia sesion en la cuenta _josianamj_ de Docker para subir las imagenes creadas para este proyecto, con la funcion de que estas puedan ser accedidas desde multiples maquinas sin necesidad de construccion. 

### Posterior al pipeline
Como indicado en el enunciado, el despliegue del sistema se realiza de forma local. Para esto, es necesario seguir los siguientes pasos:

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
O alternativamente para levantar un sistema con escalado horizontal en los microservicios:
```powershell
docker compose up -d --scale backend=3 --scale elastic=2
```

3. __Bajar los contenedores:__ Al finalizar las pruebas, puede "bajar" (detener la ejecucion y eliminar) los contenedores por medio del siguiente comando:

```powershell
docker compose down -v
```
