from neo4j import GraphDatabase
import pandas as pd
import random
import math

# Función para calcular distancia entre coordenadas geográficas (km)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # radio de la Tierra en km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# Coordenadas aleatorias cerca de Cartago
def random_coord():
    lat = round(random.uniform(9.90, 10.02), 6)
    lon = round(random.uniform(-84.05, -83.99), 6)
    return lat, lon

def load_to_neo4j():
    uri = "bolt://neo4j:7687"
    user, password = "neo4j", "password"
    driver = GraphDatabase.driver(uri, auth=(user, password))

    restaurants = pd.read_csv("/opt/airflow/dags/restaurant.csv")
    orders = pd.read_csv("/opt/airflow/dags/order.csv")

    with driver.session() as session:
        # Limpieza total del grafo anterior
        session.run("MATCH (n) DETACH DELETE n")

        # Crear nodos Restaurante
        for _, row in restaurants.iterrows():
            lat, lon = random_coord()
            session.run("""
                CREATE (:Restaurante {
                    restaurant_id: $id,
                    name: $name,
                    address: $address,
                    lat: $lat,
                    lon: $lon
                })
            """, id=int(row["restaurant_id"]), name=row["Name"],
                 address=row["Address"], lat=lat, lon=lon)

        # Crear nodos Orden y conectarlos al restaurante correspondiente
        for _, row in orders.iterrows():
            lat, lon = random_coord()
            session.run("""
                MATCH (r:Restaurante {restaurant_id: $rid})
                CREATE (o:Orden {
                    order_id: $oid,
                    restaurant_id: $rid,
                    address: $address,
                    status: $status,
                    lat: $lat,
                    lon: $lon
                })
                MERGE (o)-[:DELIVERED_BY]->(r)
            """, oid=int(row["order_id"]), rid=int(row["restaurant_id"]),
                 address=row["Address"], status=row["Status"], lat=lat, lon=lon)

        # Crear conexiones de cercanía entre restaurantes con atributo distancia
        print("Creando CERCA_DE...")
        nodes = session.run("""
            MATCH (r:Restaurante) RETURN r.restaurant_id AS id, r.lat AS lat, r.lon AS lon
        """).data()

        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                a, b = nodes[i], nodes[j]
                distancia = haversine(a['lat'], a['lon'], b['lat'], b['lon'])
                if distancia < 1.0:
                    session.run("""
                        MATCH (a:Restaurante {restaurant_id: $id1})
                        MATCH (b:Restaurante {restaurant_id: $id2})
                        MERGE (a)-[r:CERCA_DE]->(b)
                        SET r.distancia = $distancia
                    """, id1=a['id'], id2=b['id'], distancia=round(distancia, 3))

        # Eliminar relaciones RUTA anteriores
        print("Eliminando RUTA antiguas...")
        session.run("MATCH ()-[r:RUTA]->() DELETE r")

        # Crear relaciones RUTA restaurante → orden con distancia
        print("Creando RUTA...")
        entregas = session.run("""
            MATCH (o:Orden), (r:Restaurante)
            WHERE o.restaurant_id = r.restaurant_id
            RETURN o.order_id AS oid, o.lat AS olat, o.lon AS olon,
                   r.restaurant_id AS rid, r.lat AS rlat, r.lon AS rlon
        """).data()

        for e in entregas:
            distancia = haversine(e['olat'], e['olon'], e['rlat'], e['rlon'])
            session.run("""
                MATCH (r:Restaurante {restaurant_id: $rid})
                MATCH (o:Orden {order_id: $oid})
                MERGE (r)-[:RUTA {distancia: $distancia}]->(o)
            """, rid=e['rid'], oid=e['oid'], distancia=round(distancia, 3))

        # Conectar componentes desconectados con relaciones CONECTA
        print("Verificando conexión total...")
        all_ids = [r['id'] for r in nodes]
        connected = set()

        def dfs(id_actual, visitados):
            visitados.add(id_actual)
            vecinos = session.run("""
                MATCH (a:Restaurante {restaurant_id: $id})-[:CERCA_DE]-(b:Restaurante)
                RETURN b.restaurant_id AS id
            """, id=id_actual)
            for record in vecinos:
                vecino_id = record['id']
                if vecino_id not in visitados:
                    dfs(vecino_id, visitados)

        componentes = []
        for rid in all_ids:
            if rid not in connected:
                visitados = set()
                dfs(rid, visitados)
                componentes.append(list(visitados))
                connected.update(visitados)

        if len(componentes) > 1:
            print(f"Grafo no conexo, uniendo {len(componentes)} componentes...")
            base = componentes[0]
            for comp in componentes[1:]:
                nodo_a = base[0]
                nodo_b = comp[0]
                data_a = next(r for r in nodes if r['id'] == nodo_a)
                data_b = next(r for r in nodes if r['id'] == nodo_b)
                distancia = haversine(data_a['lat'], data_a['lon'], data_b['lat'], data_b['lon'])
                session.run("""
                    MATCH (a:Restaurante {restaurant_id: $id1})
                    MATCH (b:Restaurante {restaurant_id: $id2})
                    MERGE (a)-[:CONECTA {distancia: $distancia}]->(b)
                """, id1=nodo_a, id2=nodo_b, distancia=round(distancia, 3))
                base += comp

        print("Grafo final cargado y conectado.")
