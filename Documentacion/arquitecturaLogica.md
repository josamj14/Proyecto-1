# Arquitectura Lógica

En esta sección, describimos como están organizados los contenedores a nivel funcional. 

## Diagrama

![Diagrama Lógico](./arquitecturaLogica.png)

## Componentes

- __backend__: también llamado API, es el microservicio principal para consultas sobre los datos del proyecto. Está implementado en Node.js. Se describe a profundidad en la sección [API](./API.md).
- __search__: este microservicio de búsqueda realiza consultas más complejas que API, se utiliza ElasticSearch para su implementación. Se describe a profundidad en [Elastic](./elastic.md).
- __bases de datos__: se poseen dos bases de datos que trabajan de manera no simultánea: una base relacional simple en PostgreSQL, y un clúster de shardings con réplicación en MongoDB. Se describe a profundidad en la seccion de [bases de datos](./databases.md).
- __caché__: servicio de caché en la base de datos Redis para respuestas de búsquedas frecuentes de ambos microservicios de consulta. Se describe en [caché](./redisCache.md).
- __balanceador__: uso de Traefik como proxy inverso y balanceador de cargas (en caso de escalamiento horizontal). Se describe a profundidad en [balanceador de cargas](./balanceadorCarga.md).
- __pipeline__: se implementa un pipeline CI/CD en GitHub Actions para ejecutar pruebas, construir las imagenes de Docker necesarias y publicarlas en el Container Registry de forma pública en la cuenta `josianamj`. Se describe a profundidad en [pipeline CI/CD](./pipeline.md).
