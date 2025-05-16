# Uso del Balanceador de Carga

### Función

En nuestra arquitectura, generamos un contenedor con el servicio Traefik para implementar un balanceador de carga y proxy inverso que redirige el tráfico a los servicios correctos según la ruta utilizada en una consulta específica.  

### Configuración

Decidimos utilizar __Traefik__ sobre otros servicios de balanceo de carga como Nginx o Kubernetes debido a su facilidad de configuración mediante _labels_ en el _docker_compose_ y el balanceo de carga automático.

#### Rutas configuradas

- `/api/**` → servicio __Backend__.
- `/search/**` → servicio __Elastic__.

#### Configuración
- __Red:__ para la comunicación de __Traefik__ con los servicios __Backend__ y __Elastic__ se necesitan agregar a una red común, para lo cual se eligió __backend-network__.
- __Puertos:__ el servicio __Traefik__ está escuchando en el puerto _8080_, el cual es el default de _localhost_. Además, los servicios __Backend__ y __Elastic__ se configuraron para escuchar a __Traefik__ en los puertos _3000_ y _4000_ consecutivamente. 
- __Verificacion:__ gracias al argumento `--api.insecure=true` se logra tener acceso al Dashboard propio del servicio en la dirección http://localhost:8080/dashboard/.
- __Balanceo:__ el servicio de balanceo de cargas de __Traefik__ balancea entre consultas en multiples instancias de un servicio, por lo cual si no se escala un microservicio no se activa ni es necesario el balanceo. La estrategia de balanceo utilizada es la predeterminada: RoundRobin que toma en cuenta la carga actual en cada instancia de un servicio. 


### Referencias utilizadas
Para esto, nos basamos de tutoriales en YouTube y la documentación de la página [Traefik & Docker](https://doc.traefik.io/traefik/routing/providers/docker/).