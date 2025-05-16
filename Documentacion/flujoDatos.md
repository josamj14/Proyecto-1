# Flujo de Datos

En esta sección, describimos cómo fluyen los datos desde que el cliente realiza una consulta hasta que recibe su respuesta.

En las rutas de los ejemplos, se reemplaza la finalizacion de una consulta específica por __*__ para generalizar.

## Flujo de una consulta simple
1. El __cliente__ hace petición a `http://localhost/api/*`
2. __Traefik__ enruta hacia una instancia del __backend__.
3. __Backend__ consulta a __Redis__ si esta respuesta está en caché.
4. Si sí, se considera un _caché hit_ y Redis devuelve la respuesta a __Backend__.
5. Si no, se considera un _caché miss_. __Backend__ consulta a la __Database__ correspondiente, sea este PostgreSQL o MongoDB.
6. __Database__ envía la información a __Backend__.
7. __Backend__ responde al __cliente__. 

## Flujo de búsqueda

1. El __cliente__ hace petición a `http://localhost/search/*`
2. __Traefik__ enruta hacia una instancia de __Elastic__.
3. __Elastic__ consulta a __Redis__ si esta respuesta está en caché.
4. Si sí, se considera un _caché hit_ y Redis devuelve la respuesta a __Elastic__.
5. Si no, se considera un _caché miss_. __Elastic__ consulta a la __Database__ correspondiente, sea este PostgreSQL o MongoDB.
6. __Database__ envía la información a __Elastic__.
7. __Elastic__ responde al __cliente__. 

